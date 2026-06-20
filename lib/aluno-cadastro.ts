export const ALUNO_CADASTRO_MARKER = "__ATITUDE_ALUNO_CADASTRO_V2__";
const ALUNO_CADASTRO_MARKER_LEGACY = "__ATITUDE_ALUNO_CADASTRO_V1__";
export const ALUNO_DOCUMENTOS_BUCKET = "alunos-documentos";
export const ALUNO_MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALUNO_SECTION_LABELS = {
  dados_pessoais: "Dados pessoais do aluno",
  endereco: "Endereço",
  socioeconomico: "Dados socioeconômicos",
  escolar: "Informações escolares",
  saude: "Saúde do aluno",
  responsavel_legal: "Responsável legal",
  documentos: "Documentação digital do cadastro",
  projeto: "Informações do projeto",
  termos: "Termos e autorizações",
} as const;

export type AlunoSectionKey = keyof typeof ALUNO_SECTION_LABELS;
export type YesNoValue = "" | "sim" | "nao";
export type DocumentoAlunoTipo = "" | "rg" | "certidao_nascimento";
export type SexoAlunoValue =
  | ""
  | "feminino"
  | "masculino"
  | "outro"
  | "prefiro_nao_informar";
export type MoradiaValue = "" | "propria" | "alugada" | "cedida" | "outra";
export type PeriodoEscolarValue = "" | "manha" | "tarde" | "noite" | "integral";
export type StatusAlunoValue = "ativo" | "inativo";
export type UsoImagemValue = "" | "sim" | "nao";
export type ComoConheceuValue =
  | ""
  | "indicacao"
  | "escola"
  | "instagram"
  | "facebook"
  | "site"
  | "evento"
  | "outro";

export type AlunoFileKey =
  | "comprovante_residencia"
  | "atestado_medico"
  | "documento_vinculo_responsavel"
  | "documento_identidade_aluno"
  | "cpf_aluno"
  | "foto_aluno"
  | "termos_assinados";

export type AlunoFileDescriptor = {
  name: string;
  size: number;
  type: string;
};

export type UploadedAlunoDocument = {
  key: AlunoFileKey;
  label: string;
  fileName: string;
  size: number;
  contentType: string;
  storagePath: string;
  uploadedAt: string;
};

export type AlunoCadastroFormValues = {
  nome: string;
  data_nascimento: string;
  cpf: string;
  documento_tipo: DocumentoAlunoTipo;
  documento_numero: string;
  sexo: SexoAlunoValue;
  telefone: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  renda_familiar: string;
  moradores_casa: string;
  situacao_moradia: MoradiaValue;
  beneficiario_programa_social: YesNoValue;
  programas_sociais: string[];
  responsavel_trabalha: YesNoValue;
  estudando: YesNoValue;
  escola_nome: string;
  serie_ano: string;
  periodo_escolar: PeriodoEscolarValue;
  possui_doenca: YesNoValue;
  descricao_doenca: string;
  usa_medicacao_continua: YesNoValue;
  descricao_medicacao: string;
  possui_alergias: YesNoValue;
  descricao_alergias: string;
  possui_limitacao_fisica: YesNoValue;
  descricao_limitacao_fisica: string;
  pode_praticar_atividades_fisicas: YesNoValue;
  nome_responsavel_legal: string;
  cpf_responsavel_legal: string;
  rg_responsavel_legal: string;
  telefone_responsavel_legal: string;
  email_responsavel_legal: string;
  parentesco_responsavel_legal: string;
  turma_desejada: string;
  modalidade: string;
  como_conheceu_projeto: ComoConheceuValue;
  como_conheceu_detalhe: string;
  ja_participou_antes: YesNoValue;
  observacoes: string;
  termo_uso_imagem: UsoImagemValue;
  status: StatusAlunoValue;
};

export type AlunoCadastroFileState = Record<AlunoFileKey, AlunoFileDescriptor | null>;

export type AlunoCadastroValidationError = {
  section: AlunoSectionKey;
  field: string;
  message: string;
};

export type ParsedAlunoCadastro = {
  cadastro: AlunoCadastroRecord | null;
  observacoesLivres: string | null;
};

export type AlunoCadastroRecord = {
  schemaVersion: 2;
  aluno: {
    nomeCompleto: string;
    dataNascimento: string | null;
    cpf: string;
    documentoTipo: Exclude<DocumentoAlunoTipo, "">;
    documentoNumero: string;
    sexo: Exclude<SexoAlunoValue, "">;
    telefone: string | null;
    email: string | null;
    menorDeIdade: boolean;
  };
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
  };
  socioeconomico: {
    rendaFamiliar: string;
    moradoresCasa: number;
    situacaoMoradia: Exclude<MoradiaValue, "">;
    beneficiarioProgramaSocial: boolean;
    programasSociais: string[] | null;
    responsavelTrabalha: boolean;
  };
  escolar: {
    estudando: boolean;
    escolaNome: string | null;
    serieAno: string | null;
    periodoEscolar: Exclude<PeriodoEscolarValue, ""> | null;
  } | null;
  saude: {
    possuiDoenca: boolean;
    descricaoDoenca: string | null;
    usaMedicacaoContinua: boolean;
    descricaoMedicacao: string | null;
    possuiAlergias: boolean;
    descricaoAlergias: string | null;
    possuiLimitacaoFisica: boolean;
    descricaoLimitacaoFisica: string | null;
    podePraticarAtividadesFisicas: boolean;
  };
  responsavelLegal: {
    nomeCompleto: string;
    cpf: string;
    rg: string;
    telefone: string;
    email: string | null;
    parentesco: string;
  } | null;
  projeto: {
    turmaDesejada: string;
    modalidade: string;
    comoConheceuProjeto: string;
    jaParticipouAntes: boolean;
  };
  termos: {
    autorizaUsoImagem: Exclude<UsoImagemValue, "">;
    documentoAssinadoEnviado: boolean;
    aceitoEm: string;
  };
  documentos: UploadedAlunoDocument[];
  observacoesLivres: string | null;
};

const DOCUMENT_LABELS: Record<AlunoFileKey, string> = {
  comprovante_residencia: "Comprovante de residência",
  atestado_medico: "Atestado médico de aptidão física",
  documento_vinculo_responsavel: "Documento que comprove vínculo com o responsável",
  documento_identidade_aluno: "Documento de identidade do aluno",
  cpf_aluno: "Documento de CPF do aluno",
  foto_aluno: "Foto do aluno",
  termos_assinados: "Ficha e termos assinados",
};

const DOCUMENT_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PHOTO_ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeText(value?: string | null) {
  const parsed = String(value ?? "").trim();
  return parsed.length ? parsed : "";
}

function normalizeOptional(value?: string | null) {
  const parsed = normalizeText(value);
  return parsed || null;
}

function normalizeYesNo(value?: string | null) {
  return normalizeText(value) === "sim";
}

function normalizeProgramasSociais(values: string[]) {
  return values.map((value) => normalizeText(value)).filter(Boolean);
}

function isEmailValid(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function pushError(
  errors: AlunoCadastroValidationError[],
  section: AlunoSectionKey,
  field: string,
  message: string
) {
  errors.push({ section, field, message });
}

export function digitsOnly(value?: string | null) {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeDocumentNumber(value?: string | null) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9./-]/g, "")
    .slice(0, 20);
}

export function normalizeHouseNumber(value?: string | null) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9/-]/g, "")
    .slice(0, 10);
}

export function normalizeStateInput(value?: string | null) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function formatPhoneInput(value?: string | null) {
  const digits = digitsOnly(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length < 3) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);

  if (!local) return `(${ddd}) `;

  const isMobile = local.startsWith("9");

  if (isMobile) {
    const prefix = local.slice(0, 1);
    const middle = local.slice(1, 5);
    const suffix = local.slice(5, 9);

    if (!middle) return `(${ddd}) ${prefix}`;
    if (!suffix && local.length <= 5) return `(${ddd}) ${prefix} ${middle}`;
    return `(${ddd}) ${prefix} ${middle}${local.length > 5 ? "-" : ""}${suffix}`;
  }

  const middle = local.slice(0, 4);
  const suffix = local.slice(4, 8);

  if (!suffix && local.length <= 4) return `(${ddd}) ${middle}`;
  return `(${ddd}) ${middle}${local.length > 4 ? "-" : ""}${suffix}`;
}

export function formatCepInput(value?: string | null) {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function parseCurrencyNumber(value?: string | null) {
  const raw = normalizeText(value);
  if (!raw) return null;

  if (raw.includes(",") || raw.includes(".") || raw.includes("R$")) {
    const normalized = raw
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const digits = digitsOnly(raw);
  if (!digits) return null;
  return Number(digits);
}

export function formatCurrencyInput(value?: string | null) {
  const numericValue = parseCurrencyNumber(value);
  if (numericValue === null) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function parseInteger(value?: string | null) {
  const digits = digitsOnly(value);
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isInteger(parsed) ? parsed : null;
}

export function getDocumentLabel(key: AlunoFileKey) {
  return DOCUMENT_LABELS[key];
}

export function createEmptyAlunoCadastroForm(): AlunoCadastroFormValues {
  return {
    nome: "",
    data_nascimento: "",
    cpf: "",
    documento_tipo: "rg",
    documento_numero: "",
    sexo: "",
    telefone: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    renda_familiar: "",
    moradores_casa: "",
    situacao_moradia: "",
    beneficiario_programa_social: "",
    programas_sociais: [""],
    responsavel_trabalha: "",
    estudando: "",
    escola_nome: "",
    serie_ano: "",
    periodo_escolar: "",
    possui_doenca: "",
    descricao_doenca: "",
    usa_medicacao_continua: "",
    descricao_medicacao: "",
    possui_alergias: "",
    descricao_alergias: "",
    possui_limitacao_fisica: "",
    descricao_limitacao_fisica: "",
    pode_praticar_atividades_fisicas: "",
    nome_responsavel_legal: "",
    cpf_responsavel_legal: "",
    rg_responsavel_legal: "",
    telefone_responsavel_legal: "",
    email_responsavel_legal: "",
    parentesco_responsavel_legal: "",
    turma_desejada: "",
    modalidade: "",
    como_conheceu_projeto: "",
    como_conheceu_detalhe: "",
    ja_participou_antes: "",
    observacoes: "",
    termo_uso_imagem: "",
    status: "ativo",
  };
}

export function createEmptyAlunoFileState(): AlunoCadastroFileState {
  return {
    comprovante_residencia: null,
    atestado_medico: null,
    documento_vinculo_responsavel: null,
    documento_identidade_aluno: null,
    cpf_aluno: null,
    foto_aluno: null,
    termos_assinados: null,
  };
}

export function getAlunoAge(value?: string | null) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const birthDate = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function isAlunoMenorDeIdade(value?: string | null) {
  const age = getAlunoAge(value);
  return age !== null && age < 18;
}

function validateDocumentFile(
  errors: AlunoCadastroValidationError[],
  section: AlunoSectionKey,
  key: AlunoFileKey,
  file: AlunoFileDescriptor | null,
  required: boolean
) {
  const label = getDocumentLabel(key);

  if (!file) {
    if (required) {
      pushError(errors, section, key, `Envie o arquivo: ${label}.`);
    }
    return;
  }

  if (file.size > ALUNO_MAX_FILE_SIZE) {
      pushError(errors, section, key, `${label} ultrapassa o limite de 10 MB.`);
  }

  const mimeTypeAllowed =
    key === "foto_aluno"
      ? PHOTO_ALLOWED_MIME_TYPES.has(file.type)
      : DOCUMENT_ALLOWED_MIME_TYPES.has(file.type);

  if (!mimeTypeAllowed) {
    pushError(
      errors,
      section,
      key,
      `${label} deve estar em PDF, JPG, PNG ou WEBP.`
    );
  }
}

export function validateAlunoCadastroForm(
  values: AlunoCadastroFormValues,
  files: AlunoCadastroFileState
) {
  const errors: AlunoCadastroValidationError[] = [];
  const age = getAlunoAge(values.data_nascimento);
  const isMinor = isAlunoMenorDeIdade(values.data_nascimento);
  const cpf = digitsOnly(values.cpf);
  const phone = digitsOnly(values.telefone);
  const guardianCpf = digitsOnly(values.cpf_responsavel_legal);
  const guardianPhone = digitsOnly(values.telefone_responsavel_legal);
  const cep = digitsOnly(values.cep);
  const documentNumber = normalizeDocumentNumber(values.documento_numero);
  const guardianRg = normalizeDocumentNumber(values.rg_responsavel_legal);
  const programasSociais = normalizeProgramasSociais(values.programas_sociais);

  if (normalizeText(values.nome).length < 5) {
    pushError(errors, "dados_pessoais", "nome", "Informe o nome completo do aluno.");
  }

  if (!values.data_nascimento) {
    pushError(
      errors,
      "dados_pessoais",
      "data_nascimento",
      "Informe a data de nascimento do aluno."
    );
  } else if (age === null || age < 0 || age > 120) {
    pushError(
      errors,
      "dados_pessoais",
      "data_nascimento",
      "Informe uma data de nascimento válida."
    );
  }

  if (!/^\d{11}$/.test(cpf)) {
    pushError(errors, "dados_pessoais", "cpf", "CPF do aluno deve conter 11 dígitos.");
  }

  if (!documentNumber || documentNumber.length < 4) {
    pushError(
      errors,
      "dados_pessoais",
      "documento_numero",
      isMinor
        ? "Informe o RG ou número da certidão do aluno."
        : "Informe o RG do aluno."
    );
  }

  if (!isMinor && values.documento_tipo !== "rg") {
    pushError(
      errors,
      "dados_pessoais",
      "documento_tipo",
      "Para maiores de idade, o documento principal deve ser RG."
    );
  }

  if (!values.sexo) {
    pushError(errors, "dados_pessoais", "sexo", "Selecione o sexo do aluno.");
  }

  if (phone && !/^\d{10,11}$/.test(phone)) {
    pushError(
      errors,
      "dados_pessoais",
      "telefone",
      "Telefone do aluno deve conter 10 ou 11 dígitos."
    );
  }

  if (!isMinor && !phone) {
    pushError(
      errors,
      "dados_pessoais",
      "telefone",
      "Para maiores de 18 anos, informe o telefone do aluno."
    );
  }

  if (!isEmailValid(normalizeText(values.email))) {
    pushError(errors, "dados_pessoais", "email", "Informe um e-mail válido para o aluno.");
  }

  if (!/^\d{8}$/.test(cep)) {
    pushError(errors, "endereco", "cep", "CEP deve conter 8 dígitos.");
  }

  if (normalizeText(values.rua).length < 3) {
    pushError(errors, "endereco", "rua", "Informe a rua do endereço.");
  }

  if (!normalizeHouseNumber(values.numero)) {
    pushError(errors, "endereco", "numero", "Informe o número do endereço.");
  }

  if (normalizeText(values.bairro).length < 2) {
    pushError(errors, "endereco", "bairro", "Informe o bairro.");
  }

  if (normalizeText(values.cidade).length < 2) {
    pushError(errors, "endereco", "cidade", "Informe a cidade.");
  }

  if (normalizeText(values.estado).length < 2) {
    pushError(errors, "endereco", "estado", "Informe o estado, UF ou província.");
  }

  validateDocumentFile(
    errors,
    "documentos",
    "comprovante_residencia",
    files.comprovante_residencia,
    true
  );

  if (parseCurrencyNumber(values.renda_familiar) === null) {
    pushError(errors, "socioeconomico", "renda_familiar", "Informe a renda familiar.");
  }

  const moradores = parseInteger(values.moradores_casa);
  if (moradores === null || moradores < 1 || moradores > 30) {
    pushError(
      errors,
      "socioeconomico",
      "moradores_casa",
      "Informe quantas pessoas moram na casa."
    );
  }

  if (!values.situacao_moradia) {
    pushError(
      errors,
      "socioeconomico",
      "situacao_moradia",
      "Selecione a situação de moradia."
    );
  }

  if (!values.beneficiario_programa_social) {
    pushError(
      errors,
      "socioeconomico",
      "beneficiario_programa_social",
      "Informe se a família recebe programa social."
    );
  }

  if (values.beneficiario_programa_social === "sim" && !programasSociais.length) {
    pushError(
      errors,
      "socioeconomico",
      "programas_sociais",
      "Informe pelo menos um programa social."
    );
  }

  if (!values.responsavel_trabalha) {
    pushError(
      errors,
      "socioeconomico",
      "responsavel_trabalha",
      "Informe se o responsável ou provedor trabalha."
    );
  }

  if (isMinor) {
    if (!values.estudando) {
      pushError(errors, "escolar", "estudando", "Informe se o aluno está estudando.");
    }

    if (values.estudando === "sim") {
      if (normalizeText(values.escola_nome).length < 3) {
        pushError(errors, "escolar", "escola_nome", "Informe o nome da escola.");
      }

      if (normalizeText(values.serie_ano).length < 1) {
        pushError(errors, "escolar", "serie_ano", "Informe a série ou o ano escolar.");
      }

      if (!values.periodo_escolar) {
        pushError(errors, "escolar", "periodo_escolar", "Selecione o período escolar.");
      }
    }
  }

  if (!values.possui_doenca) {
    pushError(errors, "saude", "possui_doenca", "Informe se o aluno possui alguma doença.");
  }

  if (
    values.possui_doenca === "sim" &&
    normalizeText(values.descricao_doenca).length < 3
  ) {
    pushError(errors, "saude", "descricao_doenca", "Descreva a doença informada.");
  }

  if (!values.usa_medicacao_continua) {
    pushError(
      errors,
      "saude",
      "usa_medicacao_continua",
      "Informe se o aluno usa medicação contínua."
    );
  }

  if (
    values.usa_medicacao_continua === "sim" &&
    normalizeText(values.descricao_medicacao).length < 3
  ) {
    pushError(
      errors,
      "saude",
      "descricao_medicacao",
      "Descreva a medicação contínua utilizada."
    );
  }

  if (!values.possui_alergias) {
    pushError(errors, "saude", "possui_alergias", "Informe se o aluno possui alergias.");
  }

  if (
    values.possui_alergias === "sim" &&
    normalizeText(values.descricao_alergias).length < 3
  ) {
    pushError(errors, "saude", "descricao_alergias", "Descreva as alergias informadas.");
  }

  if (!values.possui_limitacao_fisica) {
    pushError(
      errors,
      "saude",
      "possui_limitacao_fisica",
      "Informe se o aluno possui limitação física."
    );
  }

  if (
    values.possui_limitacao_fisica === "sim" &&
    normalizeText(values.descricao_limitacao_fisica).length < 3
  ) {
    pushError(
      errors,
      "saude",
      "descricao_limitacao_fisica",
      "Descreva a limitação física informada."
    );
  }

  if (!values.pode_praticar_atividades_fisicas) {
    pushError(
      errors,
      "saude",
      "pode_praticar_atividades_fisicas",
      "Informe se o aluno pode praticar atividades físicas."
    );
  }

  validateDocumentFile(
    errors,
    "documentos",
    "atestado_medico",
    files.atestado_medico,
    true
  );

  if (isMinor) {
    if (normalizeText(values.nome_responsavel_legal).length < 5) {
      pushError(
        errors,
        "responsavel_legal",
        "nome_responsavel_legal",
        "Informe o nome completo do responsável legal."
      );
    }

    if (!/^\d{11}$/.test(guardianCpf)) {
      pushError(
        errors,
        "responsavel_legal",
        "cpf_responsavel_legal",
        "CPF do responsável deve conter 11 dígitos."
      );
    }

    if (!guardianRg || guardianRg.length < 4) {
      pushError(
        errors,
        "responsavel_legal",
        "rg_responsavel_legal",
        "Informe o RG do responsável legal."
      );
    }

    if (!/^\d{10,11}$/.test(guardianPhone)) {
      pushError(
        errors,
        "responsavel_legal",
        "telefone_responsavel_legal",
        "Telefone do responsável deve conter 10 ou 11 dígitos."
      );
    }

    if (
      normalizeText(values.email_responsavel_legal) &&
      !isEmailValid(normalizeText(values.email_responsavel_legal))
    ) {
      pushError(
        errors,
        "responsavel_legal",
        "email_responsavel_legal",
        "Informe um e-mail válido para o responsável."
      );
    }

    if (normalizeText(values.parentesco_responsavel_legal).length < 2) {
      pushError(
        errors,
        "responsavel_legal",
        "parentesco_responsavel_legal",
        "Informe o grau de parentesco do responsável."
      );
    }

    validateDocumentFile(
      errors,
      "documentos",
      "documento_vinculo_responsavel",
      files.documento_vinculo_responsavel,
      true
    );
  }

  validateDocumentFile(
    errors,
    "documentos",
    "documento_identidade_aluno",
    files.documento_identidade_aluno,
    true
  );
  validateDocumentFile(errors, "documentos", "cpf_aluno", files.cpf_aluno, true);
  validateDocumentFile(errors, "documentos", "foto_aluno", files.foto_aluno, false);

  if (!normalizeText(values.turma_desejada)) {
    pushError(
      errors,
      "projeto",
      "turma_desejada",
      "Selecione ou informe a turma desejada."
    );
  }

  if (normalizeText(values.modalidade).length < 2) {
    pushError(errors, "projeto", "modalidade", "Informe a modalidade desejada.");
  }

  if (!values.como_conheceu_projeto) {
    pushError(
      errors,
      "projeto",
      "como_conheceu_projeto",
      "Informe como conheceu o projeto."
    );
  }

  if (
    values.como_conheceu_projeto === "outro" &&
    normalizeText(values.como_conheceu_detalhe).length < 3
  ) {
    pushError(
      errors,
      "projeto",
      "como_conheceu_detalhe",
      "Detalhe como conheceu o projeto."
    );
  }

  if (!values.ja_participou_antes) {
    pushError(
      errors,
      "projeto",
      "ja_participou_antes",
      "Informe se o aluno já participou antes."
    );
  }

  if (!values.termo_uso_imagem) {
    pushError(
      errors,
      "termos",
      "termo_uso_imagem",
      "Registre a decisão sobre o uso de imagem."
    );
  }

  validateDocumentFile(
    errors,
    "documentos",
    "termos_assinados",
    files.termos_assinados,
    true
  );

  return errors;
}

export function buildAlunoCadastroRecord(
  values: AlunoCadastroFormValues,
  documents: UploadedAlunoDocument[],
  acceptedAt = new Date().toISOString()
): AlunoCadastroRecord {
  const isMinor = isAlunoMenorDeIdade(values.data_nascimento);
  const programasSociais = normalizeProgramasSociais(values.programas_sociais);
  const documentType: Exclude<DocumentoAlunoTipo, ""> = isMinor
    ? (values.documento_tipo || "rg")
    : "rg";
  const howProjectWasKnown =
    values.como_conheceu_projeto === "outro"
      ? normalizeText(values.como_conheceu_detalhe)
      : normalizeText(values.como_conheceu_projeto);

  return {
    schemaVersion: 2,
    aluno: {
      nomeCompleto: normalizeText(values.nome),
      dataNascimento: normalizeOptional(values.data_nascimento),
      cpf: digitsOnly(values.cpf),
      documentoTipo: documentType,
      documentoNumero: normalizeDocumentNumber(values.documento_numero),
      sexo: (normalizeText(values.sexo) as Exclude<SexoAlunoValue, "">) || "outro",
      telefone: normalizeOptional(digitsOnly(values.telefone)),
      email: normalizeOptional(values.email),
      menorDeIdade: isMinor,
    },
    endereco: {
      cep: digitsOnly(values.cep),
      rua: normalizeText(values.rua),
      numero: normalizeHouseNumber(values.numero),
      complemento: normalizeOptional(values.complemento),
      bairro: normalizeText(values.bairro),
      cidade: normalizeText(values.cidade),
      estado: normalizeText(values.estado),
    },
    socioeconomico: {
      rendaFamiliar: formatCurrencyInput(values.renda_familiar) || normalizeText(values.renda_familiar),
      moradoresCasa: parseInteger(values.moradores_casa) ?? 0,
      situacaoMoradia:
        (normalizeText(values.situacao_moradia) as Exclude<MoradiaValue, "">) || "outra",
      beneficiarioProgramaSocial: normalizeYesNo(values.beneficiario_programa_social),
      programasSociais: values.beneficiario_programa_social === "sim" ? programasSociais : null,
      responsavelTrabalha: normalizeYesNo(values.responsavel_trabalha),
    },
    escolar: isMinor
      ? {
          estudando: normalizeYesNo(values.estudando),
          escolaNome:
            values.estudando === "sim" ? normalizeOptional(values.escola_nome) : null,
          serieAno:
            values.estudando === "sim" ? normalizeOptional(values.serie_ano) : null,
          periodoEscolar:
            values.estudando === "sim"
              ? ((normalizeText(values.periodo_escolar) as Exclude<
                  PeriodoEscolarValue,
                  ""
                >) || null)
              : null,
        }
      : null,
    saude: {
      possuiDoenca: normalizeYesNo(values.possui_doenca),
      descricaoDoenca:
        values.possui_doenca === "sim" ? normalizeOptional(values.descricao_doenca) : null,
      usaMedicacaoContinua: normalizeYesNo(values.usa_medicacao_continua),
      descricaoMedicacao:
        values.usa_medicacao_continua === "sim"
          ? normalizeOptional(values.descricao_medicacao)
          : null,
      possuiAlergias: normalizeYesNo(values.possui_alergias),
      descricaoAlergias:
        values.possui_alergias === "sim"
          ? normalizeOptional(values.descricao_alergias)
          : null,
      possuiLimitacaoFisica: normalizeYesNo(values.possui_limitacao_fisica),
      descricaoLimitacaoFisica:
        values.possui_limitacao_fisica === "sim"
          ? normalizeOptional(values.descricao_limitacao_fisica)
          : null,
      podePraticarAtividadesFisicas: normalizeYesNo(
        values.pode_praticar_atividades_fisicas
      ),
    },
    responsavelLegal: isMinor
      ? {
          nomeCompleto: normalizeText(values.nome_responsavel_legal),
          cpf: digitsOnly(values.cpf_responsavel_legal),
          rg: normalizeDocumentNumber(values.rg_responsavel_legal),
          telefone: digitsOnly(values.telefone_responsavel_legal),
          email: normalizeOptional(values.email_responsavel_legal),
          parentesco: normalizeText(values.parentesco_responsavel_legal),
        }
      : null,
    projeto: {
      turmaDesejada: normalizeText(values.turma_desejada),
      modalidade: normalizeText(values.modalidade),
      comoConheceuProjeto: howProjectWasKnown,
      jaParticipouAntes: normalizeYesNo(values.ja_participou_antes),
    },
    termos: {
      autorizaUsoImagem:
        (normalizeText(values.termo_uso_imagem) as Exclude<UsoImagemValue, "">) || "nao",
      documentoAssinadoEnviado: documents.some((document) => document.key === "termos_assinados"),
      aceitoEm: acceptedAt,
    },
    documentos: documents,
    observacoesLivres: normalizeOptional(values.observacoes),
  };
}

export function updateAlunoCadastroCore(
  existing: AlunoCadastroRecord,
  values: Pick<AlunoCadastroFormValues, "nome" | "data_nascimento" | "observacoes">
) {
  return {
    ...existing,
    aluno: {
      ...existing.aluno,
      nomeCompleto: normalizeText(values.nome),
      dataNascimento: normalizeOptional(values.data_nascimento),
      menorDeIdade: isAlunoMenorDeIdade(values.data_nascimento),
    },
    observacoesLivres: normalizeOptional(values.observacoes),
  } satisfies AlunoCadastroRecord;
}

export function serializeAlunoCadastro(record: AlunoCadastroRecord) {
  return `${ALUNO_CADASTRO_MARKER}${JSON.stringify(record)}`;
}

export function parseAlunoCadastro(rawValue?: string | null): ParsedAlunoCadastro {
  const raw = String(rawValue ?? "").trim();

  if (!raw) {
    return {
      cadastro: null,
      observacoesLivres: null,
    };
  }

  const marker = raw.startsWith(ALUNO_CADASTRO_MARKER)
    ? ALUNO_CADASTRO_MARKER
    : raw.startsWith(ALUNO_CADASTRO_MARKER_LEGACY)
    ? ALUNO_CADASTRO_MARKER_LEGACY
    : null;

  if (!marker) {
    return {
      cadastro: null,
      observacoesLivres: raw,
    };
  }

  try {
    const cadastro = JSON.parse(raw.slice(marker.length)) as AlunoCadastroRecord;

    return {
      cadastro,
      observacoesLivres: cadastro.observacoesLivres ?? null,
    };
  } catch {
    return {
      cadastro: null,
      observacoesLivres: raw,
    };
  }
}
