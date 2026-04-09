import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  createServiceRoleClient,
  isAdminRole,
  resolveUserRole,
} from "@/lib/auth-utils";
import { parseVoluntariadoAudit } from "@/lib/candidatura-voluntariado-audit";
import { buildVoluntariadoDocumentFiles } from "@/lib/voluntariado-documentos";

export const dynamic = "force-dynamic";

type CandidaturaDocumentRow = {
  id: number | string | null;
  nome_completo: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  termo_aceito: boolean | null;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string | null;
  necessidade:
    | {
        titulo_publico: string | null;
      }
    | Array<{
        titulo_publico: string | null;
      }>
    | null;
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function getDocumentKind(searchParam: string | null) {
  return searchParam === "auditoria_json" ? "auditoria_json" : "dossie_html";
}

function getContentDisposition(
  download: boolean,
  fileName: string
) {
  const disposition = download ? "attachment" : "inline";

  return `${disposition}; filename="${fileName}"`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidaturaId = Number(id);

  if (!Number.isInteger(candidaturaId) || candidaturaId <= 0) {
    return NextResponse.json(
      { success: false, message: "Candidatura invalida." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { success: false, message: "Configuracao do Supabase indisponivel." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const supabaseServer = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Usuario nao autenticado." },
      { status: 401 }
    );
  }

  const { role, isActive } = await resolveUserRole(user);

  if (!isActive || !isAdminRole(role)) {
    return NextResponse.json(
      { success: false, message: "Acesso negado." },
      { status: 403 }
    );
  }

  const supabaseAdmin = createServiceRoleClient();

  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, message: "Service role indisponivel." },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("candidaturas_voluntariado")
    .select(
      `
        id,
        nome_completo,
        cpf,
        rg,
        data_nascimento,
        email,
        telefone,
        disponibilidade,
        observacoes,
        termo_aceito,
        termo_aceito_em,
        termo_versao,
        created_at,
        necessidade:necessidade_id (
          titulo_publico
        )
      `
    )
    .eq("id", candidaturaId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, message: "Candidatura nao encontrada." },
      { status: 404 }
    );
  }

  const candidatura = data as CandidaturaDocumentRow;
  const necessidadeValue = Array.isArray(candidatura.necessidade)
    ? candidatura.necessidade[0]
    : candidatura.necessidade;
  const parsedAudit = parseVoluntariadoAudit(candidatura.observacoes);
  const generatedDocuments = buildVoluntariadoDocumentFiles({
    candidaturaId,
    createdAt: candidatura.created_at,
    termoAceito: candidatura.termo_aceito === true,
    termoAceitoEm: candidatura.termo_aceito_em,
    termoVersao: candidatura.termo_versao,
    nomeCompleto: normalizeText(candidatura.nome_completo) || "Nao informado",
    cpf: normalizeText(candidatura.cpf) || "Nao informado",
    rg: candidatura.rg ?? null,
    dataNascimento: candidatura.data_nascimento ?? null,
    email: candidatura.email ?? null,
    telefone: candidatura.telefone ?? null,
    disponibilidade: candidatura.disponibilidade ?? null,
    observacaoLivre: parsedAudit.observacaoLivre,
    necessidadeTitulo: necessidadeValue?.titulo_publico ?? null,
    audit: parsedAudit.audit,
  });

  const kind = getDocumentKind(req.nextUrl.searchParams.get("kind"));
  const download = req.nextUrl.searchParams.get("download") !== "0";
  const generatedDocument =
    generatedDocuments.find((document) => document.artifact.key === kind) ||
    generatedDocuments[0];
  const storedArtifact = parsedAudit.audit?.artifacts?.find(
    (artifact) => artifact.key === kind
  );

  if (storedArtifact) {
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(storedArtifact.bucket)
      .download(storedArtifact.path);

    if (!downloadError && fileData) {
      const bytes = await fileData.arrayBuffer();

      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": storedArtifact.contentType,
          "Content-Disposition": getContentDisposition(
            download,
            storedArtifact.fileName
          ),
          "Cache-Control": "no-store",
        },
      });
    }
  }

  return new Response(generatedDocument.body, {
    status: 200,
    headers: {
      "Content-Type": generatedDocument.artifact.contentType,
      "Content-Disposition": getContentDisposition(
        download,
        generatedDocument.artifact.fileName
      ),
      "Cache-Control": "no-store",
    },
  });
}
