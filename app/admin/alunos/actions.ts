"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/auth-utils";
import {
  ALUNO_DOCUMENTOS_BUCKET,
  ALUNO_MAX_FILE_SIZE,
  buildAlunoCadastroRecord,
  digitsOnly,
  getDocumentLabel,
  parseAlunoCadastro,
  serializeAlunoCadastro,
  updateAlunoCadastroCore,
  validateAlunoCadastroForm,
  type AlunoCadastroFileState,
  type AlunoCadastroFormValues,
  type AlunoFileKey,
  type UploadedAlunoDocument,
} from "@/lib/aluno-cadastro";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ServiceRoleClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;
type UploadedStorageArtifact = UploadedAlunoDocument;
type FileMap = Record<AlunoFileKey, File | null>;

const FILE_KEYS: AlunoFileKey[] = [
  "comprovante_residencia",
  "atestado_medico",
  "documento_vinculo_responsavel",
  "documento_identidade_aluno",
  "cpf_aluno",
  "foto_aluno",
  "termos_assinados",
];

function textValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function nullableTextValue(value: FormDataEntryValue | null) {
  const parsed = textValue(value);
  return parsed.length ? parsed : null;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function fileValue(formData: FormData, key: AlunoFileKey) {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  return value;
}

function toFileDescriptor(file: File | null) {
  if (!file) {
    return null;
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

function buildAlunoFormValues(formData: FormData): AlunoCadastroFormValues {
  return {
    nome: textValue(formData.get("nome")),
    data_nascimento: textValue(formData.get("data_nascimento")),
    cpf: textValue(formData.get("cpf")),
    documento_tipo: textValue(formData.get("documento_tipo")) as AlunoCadastroFormValues["documento_tipo"],
    documento_numero: textValue(formData.get("documento_numero")),
    sexo: textValue(formData.get("sexo")) as AlunoCadastroFormValues["sexo"],
    telefone: textValue(formData.get("telefone")),
    email: textValue(formData.get("email")),
    cep: textValue(formData.get("cep")),
    rua: textValue(formData.get("rua")),
    numero: textValue(formData.get("numero")),
    complemento: textValue(formData.get("complemento")),
    bairro: textValue(formData.get("bairro")),
    cidade: textValue(formData.get("cidade")),
    estado: textValue(formData.get("estado")),
    renda_familiar: textValue(formData.get("renda_familiar")),
    moradores_casa: textValue(formData.get("moradores_casa")),
    situacao_moradia: textValue(formData.get("situacao_moradia")) as AlunoCadastroFormValues["situacao_moradia"],
    beneficiario_programa_social: textValue(
      formData.get("beneficiario_programa_social")
    ) as AlunoCadastroFormValues["beneficiario_programa_social"],
    programas_sociais: formData
      .getAll("programas_sociais")
      .map((value) => textValue(value))
      .filter(Boolean),
    responsavel_trabalha: textValue(
      formData.get("responsavel_trabalha")
    ) as AlunoCadastroFormValues["responsavel_trabalha"],
    estudando: textValue(formData.get("estudando")) as AlunoCadastroFormValues["estudando"],
    escola_nome: textValue(formData.get("escola_nome")),
    serie_ano: textValue(formData.get("serie_ano")),
    periodo_escolar: textValue(
      formData.get("periodo_escolar")
    ) as AlunoCadastroFormValues["periodo_escolar"],
    possui_doenca: textValue(formData.get("possui_doenca")) as AlunoCadastroFormValues["possui_doenca"],
    descricao_doenca: textValue(formData.get("descricao_doenca")),
    usa_medicacao_continua: textValue(
      formData.get("usa_medicacao_continua")
    ) as AlunoCadastroFormValues["usa_medicacao_continua"],
    descricao_medicacao: textValue(formData.get("descricao_medicacao")),
    possui_alergias: textValue(formData.get("possui_alergias")) as AlunoCadastroFormValues["possui_alergias"],
    descricao_alergias: textValue(formData.get("descricao_alergias")),
    possui_limitacao_fisica: textValue(
      formData.get("possui_limitacao_fisica")
    ) as AlunoCadastroFormValues["possui_limitacao_fisica"],
    descricao_limitacao_fisica: textValue(formData.get("descricao_limitacao_fisica")),
    pode_praticar_atividades_fisicas: textValue(
      formData.get("pode_praticar_atividades_fisicas")
    ) as AlunoCadastroFormValues["pode_praticar_atividades_fisicas"],
    nome_responsavel_legal: textValue(formData.get("nome_responsavel_legal")),
    cpf_responsavel_legal: textValue(formData.get("cpf_responsavel_legal")),
    rg_responsavel_legal: textValue(formData.get("rg_responsavel_legal")),
    telefone_responsavel_legal: textValue(formData.get("telefone_responsavel_legal")),
    email_responsavel_legal: textValue(formData.get("email_responsavel_legal")),
    parentesco_responsavel_legal: textValue(formData.get("parentesco_responsavel_legal")),
    turma_desejada: textValue(formData.get("turma_desejada")),
    modalidade: textValue(formData.get("modalidade")),
    como_conheceu_projeto: textValue(
      formData.get("como_conheceu_projeto")
    ) as AlunoCadastroFormValues["como_conheceu_projeto"],
    como_conheceu_detalhe: textValue(formData.get("como_conheceu_detalhe")),
    ja_participou_antes: textValue(
      formData.get("ja_participou_antes")
    ) as AlunoCadastroFormValues["ja_participou_antes"],
    observacoes: textValue(formData.get("observacoes")),
    termo_uso_imagem: textValue(formData.get("termo_uso_imagem")) as AlunoCadastroFormValues["termo_uso_imagem"],
    status: (textValue(formData.get("status")) || "ativo") as AlunoCadastroFormValues["status"],
  };
}

function buildAlunoFileState(formData: FormData): AlunoCadastroFileState {
  return {
    comprovante_residencia: toFileDescriptor(fileValue(formData, "comprovante_residencia")),
    atestado_medico: toFileDescriptor(fileValue(formData, "atestado_medico")),
    documento_vinculo_responsavel: toFileDescriptor(
      fileValue(formData, "documento_vinculo_responsavel")
    ),
    documento_identidade_aluno: toFileDescriptor(
      fileValue(formData, "documento_identidade_aluno")
    ),
    cpf_aluno: toFileDescriptor(fileValue(formData, "cpf_aluno")),
    foto_aluno: toFileDescriptor(fileValue(formData, "foto_aluno")),
    termos_assinados: toFileDescriptor(fileValue(formData, "termos_assinados")),
  };
}

function buildAlunoFileMap(formData: FormData): FileMap {
  return {
    comprovante_residencia: fileValue(formData, "comprovante_residencia"),
    atestado_medico: fileValue(formData, "atestado_medico"),
    documento_vinculo_responsavel: fileValue(
      formData,
      "documento_vinculo_responsavel"
    ),
    documento_identidade_aluno: fileValue(formData, "documento_identidade_aluno"),
    cpf_aluno: fileValue(formData, "cpf_aluno"),
    foto_aluno: fileValue(formData, "foto_aluno"),
    termos_assinados: fileValue(formData, "termos_assinados"),
  };
}

function isMenorDeIdade(dataNascimento: string) {
  const birth = new Date(`${dataNascimento}T00:00:00`);
  if (Number.isNaN(birth.getTime())) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age < 18;
}

function buildLegacyAlunoPayload(
  values: AlunoCadastroFormValues,
  observacoes: string
) {
  const menorDeIdade = isMenorDeIdade(values.data_nascimento);
  const nomeResponsavel = menorDeIdade ? values.nome_responsavel_legal : values.nome;
  const telefoneResponsavel = menorDeIdade
    ? digitsOnly(values.telefone_responsavel_legal)
    : digitsOnly(values.telefone);

  return {
    nome: values.nome,
    data_nascimento: nullableTextValue(values.data_nascimento),
    nome_responsavel: nomeResponsavel,
    telefone_responsavel: telefoneResponsavel,
    observacoes,
    status: values.status || "ativo",
  };
}

function slugify(value?: string | null) {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "aluno";
}

function inferFileExtension(file: File) {
  const byName = file.name.split(".").pop()?.trim().toLowerCase();
  if (byName) {
    return byName;
  }

  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function ensureAlunoDocumentsBucket(supabase: ServiceRoleClient) {
  const { data, error } = await supabase.storage.getBucket(ALUNO_DOCUMENTOS_BUCKET);

  if (data) {
    return;
  }

  if (error && !/not found/i.test(error.message)) {
    console.error("alunos-documentos/getBucket", error);
  }

  const { error: createError } = await supabase.storage.createBucket(
    ALUNO_DOCUMENTOS_BUCKET,
    {
      public: false,
      fileSizeLimit: ALUNO_MAX_FILE_SIZE,
    }
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message);
  }
}

async function persistAlunoDocuments(
  supabase: ServiceRoleClient,
  alunoId: number,
  alunoNome: string,
  fileMap: FileMap
) {
  await ensureAlunoDocumentsBucket(supabase);

  const uploadedDocuments: UploadedStorageArtifact[] = [];

  for (const key of FILE_KEYS) {
    const file = fileMap[key];

    if (!file) {
      continue;
    }

    const ext = inferFileExtension(file);
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 10);
    const filePath = `alunos/${alunoId}/${timestamp}-${key}-${slugify(alunoNome)}-${randomPart}.${ext}`;

    const { error } = await supabase.storage
      .from(ALUNO_DOCUMENTOS_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro ao enviar ${getDocumentLabel(key).toLowerCase()}: ${error.message}`);
    }

    uploadedDocuments.push({
      key,
      label: getDocumentLabel(key),
      fileName: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
      storagePath: filePath,
      uploadedAt: new Date().toISOString(),
    });
  }

  return uploadedDocuments;
}

async function cleanupAlunoArtifacts(
  supabase: ServiceRoleClient | null,
  alunoId: number | null,
  storageArtifacts: UploadedStorageArtifact[]
) {
  if (supabase && storageArtifacts.length) {
    const storagePaths = storageArtifacts.map((item) => item.storagePath);
    const { error } = await supabase.storage
      .from(ALUNO_DOCUMENTOS_BUCKET)
      .remove(storagePaths);

    if (error) {
      console.error("alunos-documentos/remove", error);
    }
  }

  if (alunoId) {
    const serverSupabase = await createSupabaseServerClient();
    const { error } = await serverSupabase.from("alunos").delete().eq("id", alunoId);

    if (error) {
      console.error("alunos/delete-on-cleanup", error);
    }
  }
}

export async function createAlunoAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const values = buildAlunoFormValues(formData);
  const fileState = buildAlunoFileState(formData);
  const validationErrors = validateAlunoCadastroForm(values, fileState);

  if (validationErrors.length) {
    throw new Error(validationErrors[0].message);
  }

  const cadastroBase = buildAlunoCadastroRecord(values, []);
  const initialObservacoes = serializeAlunoCadastro(cadastroBase);
  const payload = buildLegacyAlunoPayload(values, initialObservacoes);

  const { data, error } = await supabase
    .from("alunos")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Erro ao criar aluno: ${error.message}`);
  }

  const serviceRole = createServiceRoleClient();
  const storageArtifacts: UploadedStorageArtifact[] = [];

  try {
    if (!serviceRole) {
      throw new Error(
        "Configuração de documentos indisponível. Verifique a service role do Supabase."
      );
    }

    const fileMap = buildAlunoFileMap(formData);
    const uploadedDocuments = await persistAlunoDocuments(
      serviceRole,
      Number(data.id),
      values.nome,
      fileMap
    );

    storageArtifacts.push(...uploadedDocuments);

    const cadastroFinal = buildAlunoCadastroRecord(
      values,
      uploadedDocuments,
      cadastroBase.termos.aceitoEm
    );

    const { error: updateError } = await supabase
      .from("alunos")
      .update({
        observacoes: serializeAlunoCadastro(cadastroFinal),
      })
      .eq("id", data.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } catch (error) {
    await cleanupAlunoArtifacts(serviceRole, Number(data.id), storageArtifacts);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Nao foi possivel concluir o cadastro do aluno.");
  }

  revalidatePath("/admin/alunos");
  redirect(`/admin/alunos/${data.id}`);
}

export async function updateAlunoAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = numberValue(formData.get("id"));
  const nome = textValue(formData.get("nome"));
  const dataNascimento = textValue(formData.get("data_nascimento"));
  const nomeResponsavel = textValue(formData.get("nome_responsavel"));
  const telefoneResponsavel = digitsOnly(textValue(formData.get("telefone_responsavel")));
  const observacoes = textValue(formData.get("observacoes"));
  const status = textValue(formData.get("status")) || "ativo";

  if (!id || !nome || !nomeResponsavel || !telefoneResponsavel) {
    throw new Error("Dados do aluno invalidos.");
  }

  const { data: currentAluno, error: currentAlunoError } = await supabase
    .from("alunos")
    .select("observacoes")
    .eq("id", id)
    .maybeSingle();

  if (currentAlunoError) {
    throw new Error(`Erro ao carregar cadastro atual: ${currentAlunoError.message}`);
  }

  const parsedCadastro = parseAlunoCadastro(currentAluno?.observacoes);
  const nextObservacoes = parsedCadastro.cadastro
    ? serializeAlunoCadastro(
        updateAlunoCadastroCore(parsedCadastro.cadastro, {
          nome,
          data_nascimento: dataNascimento,
          observacoes,
        })
      )
    : nullableTextValue(observacoes);

  const { error } = await supabase
    .from("alunos")
    .update({
      nome,
      data_nascimento: nullableTextValue(dataNascimento),
      nome_responsavel: nomeResponsavel,
      telefone_responsavel: telefoneResponsavel,
      observacoes: nextObservacoes,
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao atualizar aluno: ${error.message}`);
  }

  revalidatePath("/admin/alunos");
  revalidatePath(`/admin/alunos/${id}`);
}
