import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/auth-utils";
import {
  serializeVoluntariadoAudit,
  VOLUNTARIADO_DOCUMENT_VERSIONS,
  type VoluntariadoConsentDocument,
  type VoluntariadoCandidaturaAudit,
} from "@/lib/candidatura-voluntariado-audit";
import { isNecessidadePublicamenteDisponivel } from "@/lib/voluntariado-necessidades-publicas";
import {
  buildVoluntariadoDocumentFiles,
  VOLUNTARIADO_DOCUMENTOS_BUCKET,
} from "@/lib/voluntariado-documentos";

type SubmissionBody = {
  necessidade_id?: string | number;
  nome_completo?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  disponibilidade?: string;
  observacoes?: string;
  signature?: {
    signedName?: string;
    signedCpf?: string;
    signatureDataUrl?: string;
    timezone?: string;
    acceptedTerms?: boolean;
    acceptedLgpd?: boolean;
    imageConsent?: "accepted" | "declined";
  };
};

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return req.headers.get("x-real-ip")?.trim() || null;
}

function isPngDataUrl(value: string) {
  return /^data:image\/png;base64,[a-z0-9+/=]+$/i.test(value);
}

async function ensureVoluntariadoDocumentsBucket(supabase: ServiceRoleClient) {
  const { data, error } = await supabase.storage.getBucket(
    VOLUNTARIADO_DOCUMENTOS_BUCKET
  );

  if (data) {
    return;
  }

  if (error && !/not found/i.test(error.message)) {
    console.error("voluntariado-docs/getBucket", error);
  }

  const { error: createError } = await supabase.storage.createBucket(
    VOLUNTARIADO_DOCUMENTOS_BUCKET,
    {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    }
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message);
  }
}

async function persistVoluntariadoDocuments(
  supabase: ServiceRoleClient,
  audit: VoluntariadoCandidaturaAudit,
  candidaturaId: number
) {
  await ensureVoluntariadoDocumentsBucket(supabase);

  const generatedDocuments = buildVoluntariadoDocumentFiles({
    candidaturaId,
    createdAt: audit.signature.signedAt,
    termoAceito: true,
    termoAceitoEm: audit.signature.signedAt,
    termoVersao:
      audit.documents.find((document) => document.key === "termo_adesao")?.version ||
      VOLUNTARIADO_DOCUMENT_VERSIONS.termoAdesao,
    nomeCompleto: audit.candidateSnapshot.nomeCompleto,
    cpf: audit.candidateSnapshot.cpf,
    rg: audit.candidateSnapshot.rg,
    dataNascimento: audit.candidateSnapshot.dataNascimento,
    email: audit.candidateSnapshot.email,
    telefone: audit.candidateSnapshot.telefone,
    disponibilidade: audit.candidateSnapshot.disponibilidade,
    observacaoLivre: audit.observacaoLivre,
    necessidadeTitulo: audit.candidateSnapshot.necessidadeTitulo,
    audit,
  });

  const artifacts: Array<(typeof generatedDocuments)[number]["artifact"]> = [];

  for (const document of generatedDocuments) {
    const { error } = await supabase.storage
      .from(VOLUNTARIADO_DOCUMENTOS_BUCKET)
      .upload(
        document.artifact.path,
        new Blob([document.body], { type: document.artifact.contentType }),
        {
          contentType: document.artifact.contentType,
          upsert: true,
        }
      );

    if (error) {
      throw new Error(error.message);
    }

    artifacts.push(document.artifact);
  }

  return artifacts;
}

export async function POST(req: Request) {
  try {
    const supabase = createServiceRoleClient();

    if (!supabase) {
      return NextResponse.json(
        { message: "Configuração do Supabase indisponível." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as SubmissionBody;

    const necessidadeId = Number(body.necessidade_id);
    const nomeCompleto = normalizeText(body.nome_completo);
    const cpf = normalizeText(body.cpf);
    const rg = normalizeText(body.rg);
    const dataNascimento = normalizeText(body.data_nascimento);
    const email = normalizeText(body.email);
    const telefone = normalizeText(body.telefone);
    const cep = normalizeText(body.cep);
    const endereco = normalizeText(body.endereco);
    const numero = normalizeText(body.numero);
    const complemento = normalizeText(body.complemento);
    const bairro = normalizeText(body.bairro);
    const cidade = normalizeText(body.cidade);
    const estado = normalizeText(body.estado);
    const disponibilidade = normalizeText(body.disponibilidade);
    const observacoes = normalizeText(body.observacoes);

    const signedName = normalizeText(body.signature?.signedName);
    const signedCpf = normalizeText(body.signature?.signedCpf);
    const signatureDataUrl = normalizeText(body.signature?.signatureDataUrl);
    const timezone = normalizeText(body.signature?.timezone);
    const acceptedTerms = body.signature?.acceptedTerms === true;
    const acceptedLgpd = body.signature?.acceptedLgpd === true;
    const imageConsent = body.signature?.imageConsent;

    if (!Number.isInteger(necessidadeId) || necessidadeId <= 0) {
      return NextResponse.json(
        { message: "Selecione uma oportunidade válida." },
        { status: 400 }
      );
    }

    if (
      !nomeCompleto ||
      !cpf ||
      !rg ||
      !dataNascimento ||
      !email ||
      !telefone ||
      !cep ||
      !endereco ||
      !numero ||
      !bairro ||
      !cidade ||
      !estado ||
      !disponibilidade
    ) {
      return NextResponse.json(
        { message: "Preencha todos os dados obrigatórios do voluntário." },
        { status: 400 }
      );
    }

    if (!acceptedTerms || !acceptedLgpd) {
      return NextResponse.json(
        { message: "Você precisa aceitar o termo e a seção de privacidade." },
        { status: 400 }
      );
    }

    if (imageConsent !== "accepted" && imageConsent !== "declined") {
      return NextResponse.json(
        { message: "Escolha se autoriza ou não o uso de imagem." },
        { status: 400 }
      );
    }

    if (!signedName || signedName.toLowerCase() !== nomeCompleto.toLowerCase()) {
      return NextResponse.json(
        {
          message:
            "A assinatura digitada deve corresponder exatamente ao nome completo informado.",
        },
        { status: 400 }
      );
    }

    if (!signedCpf || signedCpf !== cpf) {
      return NextResponse.json(
        { message: "O CPF da assinatura deve ser igual ao CPF informado." },
        { status: 400 }
      );
    }

    if (!signatureDataUrl || !isPngDataUrl(signatureDataUrl)) {
      return NextResponse.json(
        { message: "Assine no quadro de assinatura antes de enviar." },
        { status: 400 }
      );
    }

    if (signatureDataUrl.length > 500_000) {
      return NextResponse.json(
        { message: "A imagem da assinatura excedeu o tamanho permitido." },
        { status: 400 }
      );
    }

    const { data: necessidade, error: necessidadeError } = await supabase
      .from("necessidades_voluntariado")
      .select(
        "id, titulo_publico, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
      )
      .eq("id", necessidadeId)
      .maybeSingle();

    if (necessidadeError || !necessidade) {
      return NextResponse.json(
        { message: "A oportunidade selecionada não foi encontrada." },
        { status: 404 }
      );
    }

    if (
      !isNecessidadePublicamenteDisponivel({
        id: Number(necessidade.id),
        titulo_publico: String(necessidade.titulo_publico ?? ""),
        descricao: null,
        quantidade_total: Number(necessidade.quantidade_total ?? 0),
        quantidade_aprovada: Number(necessidade.quantidade_aprovada ?? 0),
        data_limite_inscricao_em: necessidade.data_limite_inscricao_em ?? null,
        status: String(necessidade.status ?? ""),
        exibir_publicamente: necessidade.exibir_publicamente === true,
      })
    ) {
      return NextResponse.json(
        { message: "Esta oportunidade não está mais disponível." },
        { status: 400 }
      );
    }

    const { data: existingApplication, error: existingError } = await supabase
      .from("candidaturas_voluntariado")
      .select("id, status")
      .eq("necessidade_id", necessidadeId)
      .eq("cpf", cpf)
      .neq("status", "rejeitado")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          message: `Não foi possível validar candidaturas anteriores: ${existingError.message}`,
        },
        { status: 500 }
      );
    }

    if (existingApplication) {
      return NextResponse.json(
        {
          message:
            "Já existe uma candidatura ativa para este CPF nesta oportunidade.",
        },
        { status: 409 }
      );
    }

    const signedAt = new Date().toISOString();
    const documents: VoluntariadoConsentDocument[] = [
      {
        key: "termo_adesao",
        title: "Termo de adesão ao serviço voluntário",
        version: VOLUNTARIADO_DOCUMENT_VERSIONS.termoAdesao,
        required: true,
        decision: "accepted",
        decidedAt: signedAt,
      },
      {
        key: "lgpd_privacidade",
        title: "Aviso de privacidade e LGPD",
        version: VOLUNTARIADO_DOCUMENT_VERSIONS.lgpdPrivacidade,
        required: true,
        decision: "accepted",
        decidedAt: signedAt,
      },
      {
        key: "uso_imagem",
        title: "Autorização de uso de imagem",
        version: VOLUNTARIADO_DOCUMENT_VERSIONS.usoImagem,
        required: false,
        decision: imageConsent,
        decidedAt: signedAt,
      },
    ];

    const ipAddress = getClientIp(req);
    const userAgent = normalizeText(req.headers.get("user-agent"));
    const acceptLanguage = normalizeText(req.headers.get("accept-language"));

    const hashPayload = JSON.stringify({
      necessidadeId,
      necessidadeTitulo: necessidade.titulo_publico,
      nomeCompleto,
      cpf,
      signedName,
      signedCpf,
      signedAt,
      documents,
      signatureDataUrl,
      ipAddress,
      userAgent,
      acceptLanguage,
      timezone,
    });

    const consentHash = createHash("sha256")
      .update(hashPayload)
      .digest("hex");

    const auditRecord: VoluntariadoCandidaturaAudit = {
      observacaoLivre: observacoes || null,
      documents,
      signature: {
        signedName,
        signedCpf,
        signedAt,
        signatureMethod: "typed_name_and_drawn_signature",
        signatureDataUrl,
        consentHash,
        ipAddress,
        userAgent: userAgent || null,
        acceptLanguage: acceptLanguage || null,
        timezone: timezone || null,
      },
      candidateSnapshot: {
        necessidadeId,
        necessidadeTitulo: String(necessidade.titulo_publico ?? ""),
        nomeCompleto,
        cpf,
        rg: rg || null,
        dataNascimento: dataNascimento || null,
        email: email || null,
        telefone: telefone || null,
        cep: cep || null,
        endereco: endereco || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        disponibilidade: disponibilidade || null,
      },
    };

    const payload = {
      necessidade_id: necessidadeId,
      nome_completo: nomeCompleto,
      cpf,
      rg: rg || null,
      data_nascimento: dataNascimento || null,
      email: email || null,
      telefone: telefone || null,
      cep: cep || null,
      endereco: endereco || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado || null,
      disponibilidade: disponibilidade || null,
      observacoes: serializeVoluntariadoAudit(auditRecord),
      status: "pendente",
      termo_aceito: true,
      termo_aceito_em: signedAt,
      termo_versao: VOLUNTARIADO_DOCUMENT_VERSIONS.termoAdesao,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("candidaturas_voluntariado")
      .insert([payload])
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { message: `Erro ao enviar candidatura: ${insertError.message}` },
        { status: 500 }
      );
    }

    try {
      const artifacts = await persistVoluntariadoDocuments(
        supabase,
        auditRecord,
        Number(inserted.id)
      );

      if (artifacts.length) {
        const { error: updateAuditError } = await supabase
          .from("candidaturas_voluntariado")
          .update({
            observacoes: serializeVoluntariadoAudit({
              ...auditRecord,
              artifacts,
            }),
          })
          .eq("id", inserted.id);

        if (updateAuditError) {
          console.error(
            "voluntariado-docs/updateAudit",
            updateAuditError.message
          );
        }
      }
    } catch (documentError) {
      console.error("voluntariado-docs/persist", documentError);
    }

    return NextResponse.json({
      success: true,
      candidaturaId: inserted.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
