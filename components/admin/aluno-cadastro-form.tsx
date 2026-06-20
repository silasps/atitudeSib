"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createAlunoAction } from "@/app/admin/alunos/actions";
import {
  ALUNO_SECTION_LABELS,
  createEmptyAlunoCadastroForm,
  createEmptyAlunoFileState,
  digitsOnly,
  formatCepInput,
  formatCurrencyInput,
  formatPhoneInput,
  getAlunoAge,
  normalizeStateInput,
  normalizeDocumentNumber,
  normalizeHouseNumber,
  validateAlunoCadastroForm,
  type AlunoCadastroFormValues,
  type AlunoCadastroValidationError,
  type AlunoFileDescriptor,
  type AlunoFileKey,
} from "@/lib/aluno-cadastro";

type TurmaOption = {
  id: number;
  nome: string;
};

type AlunoCadastroFormProps = {
  turmas: TurmaOption[];
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const MODALIDADE_SUGGESTIONS = [
  "Bale",
  "Jiu-jitsu",
  "Capoeira",
  "Futebol",
  "Volei",
  "Violao",
  "Teoria musical",
  "Reforco escolar",
];

const FIELD_MAX_LENGTHS: Partial<Record<keyof AlunoCadastroFormValues, number>> = {
  nome: 120,
  documento_numero: 20,
  email: 120,
  rua: 120,
  numero: 10,
  complemento: 80,
  bairro: 80,
  cidade: 80,
  estado: 60,
  escola_nome: 120,
  serie_ano: 30,
  descricao_doenca: 180,
  descricao_medicacao: 180,
  descricao_alergias: 180,
  descricao_limitacao_fisica: 180,
  nome_responsavel_legal: 120,
  rg_responsavel_legal: 20,
  email_responsavel_legal: 120,
  parentesco_responsavel_legal: 40,
  turma_desejada: 120,
  modalidade: 60,
  como_conheceu_detalhe: 120,
  observacoes: 500,
};

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">{eyebrow}</p>
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-600">{subtitle}</p>
    </div>
  );
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-zinc-500">{children}</p>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      {children}
    </section>
  );
}

function FieldShell({
  label,
  htmlFor,
  required = false,
  children,
  help,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-800">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {help ? <FieldHelp>{help}</FieldHelp> : null}
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-zinc-900 ${
    hasError ? "border-red-300 bg-red-50/40" : "border-zinc-300"
  }`;
}

function getErrorByField(
  errors: AlunoCadastroValidationError[],
  field: string
) {
  return errors.find((item) => item.field === field)?.message ?? null;
}

function formatFileLabel(file: AlunoFileDescriptor | null) {
  if (!file) return "Nenhum arquivo selecionado.";
  return `${file.name} (${Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB)`;
}

function printableValue(value?: string | null, fallback = "________________________________") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export function AlunoCadastroForm({ turmas }: AlunoCadastroFormProps) {
  const [formData, setFormData] = useState<AlunoCadastroFormValues>(
    createEmptyAlunoCadastroForm()
  );
  const [files, setFiles] = useState(createEmptyAlunoFileState());
  const [message, setMessage] = useState("");
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [cepLookupMessage, setCepLookupMessage] = useState("");

  const lastLookupCepRef = useRef("");
  const activeLookupIdRef = useRef(0);

  const idade = useMemo(() => getAlunoAge(formData.data_nascimento), [formData.data_nascimento]);
  const isMinor = idade !== null && idade < 18;
  const allValidationErrors = useMemo(
    () => validateAlunoCadastroForm(formData, files),
    [files, formData]
  );
  const validationErrors = hasTriedSubmit ? allValidationErrors : [];
  const documentValidationErrors = hasTriedSubmit
    ? allValidationErrors.filter((error) => error.section === "documentos")
    : [];
  const pendingSections = useMemo(
    () =>
      Array.from(new Set(allValidationErrors.map((error) => error.section))).map(
        (section) => ALUNO_SECTION_LABELS[section]
      ),
    [allValidationErrors]
  );

  function sanitizeFieldValue(name: keyof AlunoCadastroFormValues, value: string) {
    if (name === "cpf" || name === "cpf_responsavel_legal") {
      return digitsOnly(value).slice(0, 11);
    }

    if (name === "telefone" || name === "telefone_responsavel_legal") {
      return digitsOnly(value).slice(0, 11);
    }

    if (name === "cep") {
      return digitsOnly(value).slice(0, 8);
    }

    if (name === "moradores_casa") {
      return digitsOnly(value).slice(0, 2);
    }

    if (name === "renda_familiar") {
      return digitsOnly(value).slice(0, 12);
    }

    if (name === "documento_numero" || name === "rg_responsavel_legal") {
      return normalizeDocumentNumber(value);
    }

    if (name === "numero") {
      return normalizeHouseNumber(value);
    }

    const maxLength = FIELD_MAX_LENGTHS[name];
    if (name === "estado") {
      return normalizeStateInput(value);
    }

    return maxLength ? value.slice(0, maxLength) : value;
  }

  async function lookupCep(cepDigits: string) {
    if (cepDigits.length !== 8) {
      return;
    }

    if (lastLookupCepRef.current === cepDigits) {
      return;
    }

    const lookupId = ++activeLookupIdRef.current;
    lastLookupCepRef.current = cepDigits;
    setIsLookingUpCep(true);
    setCepLookupMessage("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      if (!response.ok) {
        throw new Error("CEP não encontrado");
      }

      const data = (await response.json()) as ViaCepResponse;

      if (activeLookupIdRef.current !== lookupId) {
        return;
      }

      if (data.erro) {
      setCepLookupMessage("CEP não encontrado na base do ViaCEP.");
        return;
      }

      setFormData((current) => ({
        ...current,
        rua: data.logradouro?.trim() || current.rua,
        bairro: data.bairro?.trim() || current.bairro,
        cidade: data.localidade?.trim() || current.cidade,
        estado: normalizeStateInput(data.uf || current.estado),
      }));
      setCepLookupMessage("Endereço preenchido automaticamente via ViaCEP.");
    } catch {
      if (activeLookupIdRef.current === lookupId) {
        setCepLookupMessage("Não foi possível consultar o CEP agora.");
      }
    } finally {
      if (activeLookupIdRef.current === lookupId) {
        setIsLookingUpCep(false);
      }
    }
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    const fieldName = name as keyof AlunoCadastroFormValues;
    const sanitizedValue = sanitizeFieldValue(fieldName, value);

    setFormData((current) => {
      const nextValue = {
        ...current,
        [fieldName]: sanitizedValue,
      };

      if (fieldName === "beneficiario_programa_social" && sanitizedValue !== "sim") {
        nextValue.programas_sociais = [""];
      }

      return nextValue;
    });

    if (fieldName === "cep") {
      if (sanitizedValue.length < 8) {
        lastLookupCepRef.current = "";
        setCepLookupMessage("");
      }

      if (sanitizedValue.length === 8) {
        void lookupCep(sanitizedValue);
      }
    }

    if (message) {
      setMessage("");
    }
  }

  function handleProgramaSocialChange(index: number, value: string) {
    setFormData((current) => {
      const nextProgramas = [...current.programas_sociais];
      nextProgramas[index] = value.slice(0, 80);
      return {
        ...current,
        programas_sociais: nextProgramas,
      };
    });

    if (message) {
      setMessage("");
    }
  }

  function addProgramaSocial() {
    setFormData((current) => ({
      ...current,
      programas_sociais: [...current.programas_sociais, ""],
    }));
  }

  function removeProgramaSocial(index: number) {
    setFormData((current) => {
      const nextProgramas = current.programas_sociais.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        programas_sociais: nextProgramas.length ? nextProgramas : [""],
      };
    });
  }

  function handleFileChange(key: AlunoFileKey, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setFiles((current) => ({
      ...current,
      [key]: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : null,
    }));

    if (message) {
      setMessage("");
    }
  }

  async function handleGeneratePdf() {
    setIsGeneratingPdf(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 5;
      let currentY = margin;

      const checkboxText = (label: string, checked = false) =>
        `[${checked ? "x" : " "}] ${label}`;

      const ensureSpace = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };

      const startNewPage = () => {
        pdf.addPage();
        currentY = margin;
      };

      const writeText = (
        text: string,
        options?: {
          fontSize?: number;
          fontStyle?: "normal" | "bold";
          fontFamily?: "helvetica" | "courier";
          color?: [number, number, number];
          spacingAfter?: number;
        }
      ) => {
        const {
          fontSize = 11,
          fontStyle = "normal",
          fontFamily = "helvetica",
          color = [39, 39, 42],
          spacingAfter = 3,
        } = options ?? {};

        pdf.setFont(fontFamily, fontStyle);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, contentWidth) as string[];
        const height = lines.length * lineHeight + spacingAfter;

        ensureSpace(height + 2);
        pdf.text(lines, margin, currentY + 4);
        currentY += height;
      };

      const fillMask = (value: string, length: number) => {
        const normalized = value.trim();
        if (!normalized) {
          return "_".repeat(length);
        }

        const clipped = normalized.slice(0, length);
        const remaining = Math.max(length - clipped.length - 1, 6);
        return `${clipped} ${"_".repeat(remaining)}`;
      };

      const splitTextForLines = (value: string, lineLengths: number[]) => {
        const normalized = value.trim();

        if (!normalized) {
          return lineLengths.map(() => "");
        }

        const parts: string[] = [];
        let remaining = normalized;

        for (const length of lineLengths) {
          if (!remaining) {
            parts.push("");
            continue;
          }

          if (remaining.length <= length) {
            parts.push(remaining);
            remaining = "";
            continue;
          }

          const chunk = remaining.slice(0, length);
          const lastSpace = chunk.lastIndexOf(" ");

          if (lastSpace > Math.floor(length * 0.55)) {
            parts.push(chunk.slice(0, lastSpace));
            remaining = remaining.slice(lastSpace + 1).trim();
            continue;
          }

          parts.push(chunk);
          remaining = remaining.slice(length).trim();
        }

        return parts;
      };

      const writeSection = (title: string, subtitle?: string) => {
        writeText(title, {
          fontSize: 13,
          fontStyle: "bold",
          color: [24, 24, 27],
          spacingAfter: 2,
        });

        if (subtitle) {
          writeText(subtitle, {
            fontSize: 10,
            color: [82, 82, 91],
            spacingAfter: 3,
          });
        }
      };

      const writeLinedField = (
        label: string,
        length: number,
        value = "",
        spacingAfter = 3,
        options?: {
          fontSize?: number;
        }
      ) => {
        writeText(`${label}: ${fillMask(value, length)}`, {
          fontFamily: "courier",
          fontSize: options?.fontSize ?? 10,
          spacingAfter,
        });
      };

      const writeDateField = (label: string, spacingAfter = 3) => {
        writeText(`${label}: ____ / ____ / ______`, {
          fontFamily: "courier",
          fontSize: 10,
          spacingAfter,
        });
      };

      const writeFieldArea = (
        label: string,
        lineLengths: number[],
        value = "",
        options?: {
          fontSize?: number;
        }
      ) => {
        writeText(`${label}:`, {
          fontStyle: "bold",
          spacingAfter: 1,
        });

        const lines = splitTextForLines(value, lineLengths);

        lineLengths.forEach((length, index) => {
          writeText(fillMask(lines[index] || "", length), {
            fontFamily: "courier",
            fontSize: options?.fontSize ?? 10,
            spacingAfter: index === lineLengths.length - 1 ? 3 : 1,
          });
        });
      };

      const writeCheckboxRows = (
        label: string,
        rows: Array<Array<{ label: string; checked?: boolean }>>,
        spacingAfter = 3
      ) => {
        writeText(`${label}:`, {
          fontStyle: "bold",
          spacingAfter: 1,
        });

        rows.forEach((row, rowIndex) => {
          writeText(
            row.map((option) => checkboxText(option.label, Boolean(option.checked))).join("   "),
            {
              fontFamily: "courier",
              fontSize: 10,
              spacingAfter: rowIndex === rows.length - 1 ? spacingAfter : 1,
            }
          );
        });
      };

      const writeBulletList = (title: string, items: string[], subtitle?: string) => {
        writeSection(title, subtitle);
        items.forEach((item) => {
          writeText(`- ${item}`, {
            fontFamily: "helvetica",
            fontSize: 10,
            spacingAfter: 2,
          });
        });
        currentY += 2;
      };

      const drawDivider = (spacingAfter = 4) => {
        ensureSpace(5);
        pdf.setDrawColor(212, 212, 216);
        pdf.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
        currentY += spacingAfter;
      };

      const writeSignatureBlock = (
        primaryLabel: string,
        options?: {
          secondaryLabel?: string;
          includeAdministrativeLine?: boolean;
        }
      ) => {
        const estimatedHeight =
          18 +
          (options?.secondaryLabel ? 10 : 0) +
          (options?.includeAdministrativeLine ? 10 : 0);

        ensureSpace(estimatedHeight);

        writeText(`${primaryLabel}:`, { spacingAfter: 1 });
        writeText("____________________________________________________________", {
          fontFamily: "courier",
          fontSize: 10,
          spacingAfter: 3,
        });

        if (options?.secondaryLabel) {
          writeText(`${options.secondaryLabel}:`, { spacingAfter: 1 });
          writeText("____________________________________________________________", {
            fontFamily: "courier",
            fontSize: 10,
            spacingAfter: 3,
          });
        }

        writeText("Data:", { spacingAfter: 1 });
        writeText("____ / ____ / ______", {
          fontFamily: "courier",
          fontSize: 10,
          spacingAfter: 3,
        });

        if (options?.includeAdministrativeLine) {
          writeText("Recebido pelo administrativo:", { spacingAfter: 1 });
          writeText("____________________________________________________________", {
            fontFamily: "courier",
            fontSize: 10,
            spacingAfter: 2,
          });
        }
      };

      const writeTermPage = (title: string, paragraphs: string[], extraContent?: () => void) => {
        startNewPage();
        writeText(title, {
          fontSize: 17,
          fontStyle: "bold",
          color: [24, 24, 27],
          spacingAfter: 3,
        });
        writeText(
          "Leia com atenção, confira os dados e assine ao final desta página.",
          {
            fontSize: 10,
            color: [82, 82, 91],
            spacingAfter: 3,
          }
        );

        writeLinedField("Aluno", 52, "", 2, { fontSize: 10 });
        writeLinedField(
          "Responsável legal (somente se o aluno for menor de 18 anos)",
          28,
          "",
          2,
          { fontSize: 10 }
        );
        writeLinedField("Turma desejada / modalidade", 38, "", 3, {
          fontSize: 10,
        });

        drawDivider(3);

        paragraphs.forEach((paragraph) => {
          writeText(paragraph, {
            fontSize: 10.5,
            spacingAfter: 3,
          });
        });

        if (extraContent) {
          extraContent();
        }

        currentY += 2;
        writeSignatureBlock("Assinatura do aluno", {
          secondaryLabel:
            "Assinatura do responsável legal (somente se o aluno for menor de 18 anos)",
        });
      };

      writeText("Ficha de cadastro de aluno - Projeto Atitude", {
        fontSize: 18,
        fontStyle: "bold",
        color: [24, 24, 27],
        spacingAfter: 4,
      });
      writeText(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, {
        fontSize: 10,
        color: [82, 82, 91],
        spacingAfter: 3,
      });
      writeText(
        "Imprima esta ficha, preencha manualmente os campos em branco e entregue juntamente com toda a documentação obrigatória.",
        { spacingAfter: 3 }
      );
      writeText(
        "Todas as caixas de seleção abaixo devem ser marcadas manualmente. Este PDF é um modelo em branco para preenchimento e assinatura.",
        {
          fontSize: 10,
          color: [82, 82, 91],
          spacingAfter: 5,
        }
      );

      writeSection("1. Dados pessoais do aluno");
      writeFieldArea("Nome completo", [64, 64], "");
      writeDateField("Data de nascimento");
      writeLinedField("CPF", 18, "");
      writeCheckboxRows("Documento principal", [
        [
          { label: "RG" },
          { label: "Certidão de nascimento" },
        ],
      ]);
      writeLinedField("Número do documento", 30, "");
      writeCheckboxRows("Sexo", [
        [
          { label: "Feminino" },
          { label: "Masculino" },
        ],
        [
          { label: "Outro" },
          { label: "Prefiro não informar" },
        ],
      ]);
      writeLinedField("Telefone", 24, "");
      writeLinedField("E-mail", 48, "", 3, { fontSize: 9.5 });

      writeSection("2. Endereço");
      writeLinedField("CEP", 12, "");
      writeFieldArea("Rua", [64, 64], "");
      writeLinedField("Número", 12, "");
      writeLinedField("Complemento", 38, "");
      writeLinedField("Bairro", 36, "");
      writeLinedField("Cidade", 36, "");
      writeLinedField("Estado / UF / província", 18, "");

      writeSection("3. Dados socioeconômicos");
      writeLinedField("Renda familiar", 20, "");
      writeLinedField("Quantas pessoas moram na casa", 8, "");
      writeCheckboxRows("Situação de moradia", [
        [
          { label: "Própria" },
          { label: "Alugada" },
        ],
        [
          { label: "Cedida" },
          { label: "Outra" },
        ],
      ]);
      writeCheckboxRows("Beneficiário de programa social", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Qual(is) programa(s)", [64, 64], "");
      writeCheckboxRows("Responsável ou provedor trabalha", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);

      writeSection(
        "4. Informações escolares",
        "Preencher somente se o aluno for criança ou adolescente."
      );
      writeCheckboxRows("Está estudando", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Nome da escola", [64, 64], "");
      writeLinedField("Série/ano", 24, "");
      writeCheckboxRows("Período", [
        [
          { label: "Manhã" },
          { label: "Tarde" },
        ],
        [
          { label: "Noite" },
          { label: "Integral" },
        ],
      ]);

      writeSection("5. Saúde do aluno");
      writeCheckboxRows("Possui alguma doença", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Se sim, qual", [64], "");
      writeCheckboxRows("Usa medicação contínua", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Se sim, qual medicação", [64], "");
      writeCheckboxRows("Possui alergias", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Se sim, quais", [64], "");
      writeCheckboxRows("Tem alguma limitação física", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);
      writeFieldArea("Se sim, qual limitação", [64], "");
      writeCheckboxRows("Pode praticar atividades físicas", [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
      ]);

      writeSection(
        "6. Responsável legal",
        "Preencher somente se o aluno for menor de 18 anos."
      );
      writeLinedField("Nome completo", 44, "");
      writeLinedField("CPF", 18, "");
      writeLinedField("RG", 22, "");
      writeLinedField("Telefone", 24, "");
      writeLinedField("E-mail", 48, "", 3, {
        fontSize: 9.5,
      });
      writeLinedField("Grau de parentesco", 28, "");

      writeSection("7. Informações do projeto");
      writeFieldArea("Turma desejada / modalidade", [64], "");
      writeCheckboxRows("Como conheceu o projeto", [
        [
          { label: "Indicação" },
          { label: "Escola" },
          { label: "Instagram" },
        ],
        [
          { label: "Facebook" },
          { label: "Site" },
          { label: "Evento" },
          { label: "Outro" },
        ],
      ]);
      writeFieldArea(
        "Detalhamento (por exemplo: nome da pessoa, escola, evento ou canal)",
        [64],
        ""
      );
      writeCheckboxRows(
        "Já participou antes deste projeto ou de outro projeto social",
        [
        [
          { label: "Sim" },
          { label: "Não" },
        ],
        ]
      );
      writeFieldArea("Observações adicionais", [64, 64], "");

      writeBulletList(
        "8. Documentação obrigatória para concluir o cadastro",
        [
          "Comprovante de residência",
          "Atestado médico de aptidão física",
          "RG do aluno ou certidão de nascimento (para menores de 18 anos)",
          "CPF do aluno",
          "Foto do aluno (opcional, mas recomendada)",
          "Documento que comprove vínculo com o responsável legal (somente se o aluno for menor de 18 anos)",
          "Ficha e termos assinados",
        ],
        "O cadastro do aluno somente será concluído após o envio de todos os documentos obrigatórios listados abaixo."
      );

      startNewPage();
      writeSection(
        "9. Assinaturas da ficha principal",
        "Preencha esta página somente após conferir toda a ficha. Os termos de uso de imagem, responsabilidade, LGPD e participação seguem nas páginas seguintes, cada um com espaço próprio para assinatura e data."
      );
      writeSignatureBlock("Assinatura do aluno", {
        secondaryLabel:
          "Assinatura do responsável legal (somente se o aluno for menor de 18 anos)",
        includeAdministrativeLine: true,
      });

      writeTermPage(
        "Termo de uso de imagem",
        [
          "Autorizo o projeto a captar e utilizar a imagem, a voz e o nome do aluno em fotos, vídeos e materiais institucionais, educativos e de divulgação relacionados às atividades desenvolvidas.",
          "Estou ciente de que essa utilização não gera pagamento, será feita com respeito à dignidade do participante e poderá ocorrer em meios impressos, digitais e redes sociais institucionais.",
          "Posso solicitar revisão desta autorização por escrito ao setor administrativo, ciente de que materiais regularmente produzidos antes do pedido podem permanecer em circulação institucional.",
        ],
        () => {
          writeCheckboxRows("Decisão registrada", [
            [
              { label: "Autoriza" },
              { label: "Não autoriza" },
            ],
          ]);
        }
      );

      writeTermPage("Termo de responsabilidade", [
        "Declaro que as informações de saúde, alergias, medicações e limitações físicas prestadas nesta ficha são verdadeiras e completas até a data da assinatura.",
        "Comprometo-me a informar imediatamente qualquer alteração no quadro de saúde do aluno, bem como entregar laudos, receitas ou orientações médicas sempre que necessário.",
        "Estou ciente de que a participação em atividades físicas depende do respeito às orientações da equipe e às restrições médicas informadas nesta ficha e nos documentos anexados.",
        "Em situação de urgência, autorizo o acionamento do contato responsável e o encaminhamento do aluno para atendimento adequado.",
      ]);

      writeTermPage("Termo LGPD", [
        "Autorizo o tratamento dos dados pessoais do aluno e do responsável, inclusive dados de saúde estritamente necessários, para finalidades de cadastro, matrícula, controle de frequência, acompanhamento pedagógico ou social, comunicados e cumprimento de obrigações legais.",
        "Os dados serão acessados apenas por profissionais autorizados e poderão ser compartilhados com parceiros operacionais ou órgãos competentes quando houver necessidade legítima, obrigação legal ou proteção da vida e da integridade do aluno.",
        "Fica assegurado o exercício dos direitos de confirmação, acesso, correção, atualização e demais direitos previstos na Lei Geral de Proteção de Dados, mediante solicitação ao setor administrativo.",
        "Os dados serão armazenados pelo período necessário ao atendimento das finalidades do projeto e aos prazos legais aplicáveis.",
      ]);

      writeTermPage("Termo de participação", [
        "Declaro ciência das regras de participação do projeto, incluindo frequência mínima, respeito aos horários, convívio adequado, preservação do espaço e dos materiais, e tratamento respeitoso com a equipe e os demais participantes.",
        "Comprometo-me a comunicar faltas prolongadas, alterações cadastrais e situações que possam afetar a permanência do aluno nas atividades.",
        "Estou ciente de que faltas sem justificativa, descumprimento reiterado das regras ou comportamento inadequado podem gerar advertência, reavaliação da vaga ou desligamento, conforme critérios administrativos e pedagógicos do projeto.",
      ]);

      const fileNameBase =
        printableValue(formData.nome, "ficha-aluno")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase() || "ficha-aluno";

      pdf.save(`${fileNameBase}-cadastro-atitude.pdf`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível gerar o PDF."
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTriedSubmit(true);

    if (allValidationErrors.length) {
      setMessage(allValidationErrors[0].message);
      return;
    }

    const htmlForm = event.currentTarget;
    const submission = new FormData(htmlForm);

    startTransition(async () => {
      try {
        setMessage("");
        await createAlunoAction(submission);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Não foi possível salvar o aluno."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">
              Cadastro completo
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Ficha de inscrição do aluno
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              O envio só é liberado quando todos os itens obrigatórios forem
              concluídos. Para menores de 18 anos, escolaridade e responsável
              legal passam a ser obrigatórios automaticamente.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
              <p className="font-medium text-zinc-900">
                {idade === null
                  ? "Informe a data de nascimento para ativar as regras condicionais."
                  : isMinor
                  ? `Aluno menor de idade (${idade} anos).`
                  : `Aluno maior de idade (${idade} anos).`}
              </p>
              <p className="mt-1">
                {hasTriedSubmit
                  ? pendingSections.length
                  ? `${pendingSections.length} bloco(s) ainda precisam ser concluídos.`
                  : "Todas as seções obrigatórias estão prontas para envio."
                  : "Os campos só serão destacados como pendentes depois da tentativa de salvar."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-60"
            >
              {isGeneratingPdf ? "Gerando PDF..." : "Gerar PDF da ficha"}
            </button>
          </div>
        </div>

        {hasTriedSubmit && pendingSections.length ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Conclua estes blocos antes de salvar: {pendingSections.join(", ")}.
          </div>
        ) : null}

        {message ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        ) : null}
      </section>

      <SectionCard>
        <SectionHeader
          eyebrow="1. Identificacao"
          title="Dados pessoais do aluno"
          subtitle="Informações básicas de identificação, contato e situação cadastral."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldShell
              label="Nome completo"
              htmlFor="nome"
              required
              help="Use o nome civil completo do aluno, sem abreviações."
            >
              <input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                maxLength={120}
                pattern="^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{4,119}$"
                className={inputClassName(Boolean(getErrorByField(validationErrors, "nome")))}
                placeholder="Nome completo do aluno"
                required
              />
            </FieldShell>
          </div>

          <FieldShell label="Data de nascimento" htmlFor="data_nascimento" required>
            <input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "data_nascimento"))
              )}
              required
            />
          </FieldShell>

          <FieldShell label="Status inicial" htmlFor="status" required>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={inputClassName(false)}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </FieldShell>

          <FieldShell label="CPF" htmlFor="cpf" required>
            <input
              id="cpf"
              name="cpf"
              inputMode="numeric"
              value={formData.cpf}
              onChange={handleInputChange}
              maxLength={11}
              pattern="^\d{11}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "cpf")))}
              placeholder="00000000000"
              required
            />
          </FieldShell>

          {isMinor ? (
            <FieldShell
              label="Documento principal"
              htmlFor="documento_tipo"
              required
              help="Para menores, pode ser RG ou certidão de nascimento."
            >
              <select
                id="documento_tipo"
                name="documento_tipo"
                value={formData.documento_tipo}
                onChange={handleInputChange}
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "documento_tipo"))
                )}
                required
              >
                <option value="rg">RG</option>
                <option value="certidao_nascimento">Certidão de nascimento</option>
              </select>
            </FieldShell>
          ) : (
            <FieldShell
              label="Documento principal"
              htmlFor="documento_tipo_visual"
              required
              help="Para maiores de idade, o documento principal exigido é o RG."
            >
              <input id="documento_tipo_visual" value="RG" disabled className={inputClassName(false)} />
              <input type="hidden" name="documento_tipo" value="rg" />
            </FieldShell>
          )}

          <FieldShell
            label={isMinor ? "Número do RG ou certidão" : "RG"}
            htmlFor="documento_numero"
            required
          >
            <input
              id="documento_numero"
              name="documento_numero"
              value={formData.documento_numero}
              onChange={handleInputChange}
              maxLength={20}
              pattern="^[A-Za-z0-9./-]{4,20}$"
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "documento_numero"))
              )}
              placeholder={isMinor ? "RG ou certidão" : "Número do RG"}
              required
            />
          </FieldShell>

          <FieldShell label="Sexo" htmlFor="sexo" required>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleInputChange}
              className={inputClassName(Boolean(getErrorByField(validationErrors, "sexo")))}
              required
            >
              <option value="">Selecione</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
              <option value="prefiro_nao_informar">Prefiro não informar</option>
            </select>
          </FieldShell>

          <FieldShell
            label="Telefone do aluno"
            htmlFor="telefone"
            required={!isMinor}
            help={
              isMinor
                ? "Opcional para menores, mas útil para recados e emergências."
                : "Obrigatório para maiores de 18 anos."
            }
          >
            <input
              id="telefone"
              name="telefone"
              inputMode="numeric"
              value={formatPhoneInput(formData.telefone)}
              onChange={handleInputChange}
              maxLength={16}
              pattern="^\(\d{2}\)\s(?:\d\s)?\d{4}-\d{4}$"
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "telefone"))
              )}
              placeholder="(31) 9 7527-8653"
              required={!isMinor}
            />
          </FieldShell>

          <FieldShell
            label="E-mail"
            htmlFor="email"
            help="Opcional. Informe apenas se o aluno usar com frequência."
          >
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              maxLength={120}
              className={inputClassName(Boolean(getErrorByField(validationErrors, "email")))}
              placeholder="aluno@exemplo.com"
            />
          </FieldShell>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          eyebrow="2. Localização"
          title="Endereço"
          subtitle="CEP com formatação automática e preenchimento via ViaCEP."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="CEP" htmlFor="cep" required>
            <input
              id="cep"
              name="cep"
              inputMode="numeric"
              value={formatCepInput(formData.cep)}
              onChange={handleInputChange}
              maxLength={9}
              pattern="^\d{5}-\d{3}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "cep")))}
              placeholder="83511-000"
              required
            />
            {cepLookupMessage ? <FieldHelp>{cepLookupMessage}</FieldHelp> : null}
            {isLookingUpCep ? <FieldHelp>Consultando CEP...</FieldHelp> : null}
          </FieldShell>

          <FieldShell label="Rua" htmlFor="rua" required>
            <input
              id="rua"
              name="rua"
              value={formData.rua}
              onChange={handleInputChange}
              maxLength={120}
              pattern="^.{3,120}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "rua")))}
              placeholder="Rua, avenida ou travessa"
              required
            />
          </FieldShell>

          <FieldShell label="Número" htmlFor="numero" required>
            <input
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              maxLength={10}
              pattern="^[A-Za-z0-9/-]{1,10}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "numero")))}
              placeholder="123"
              required
            />
          </FieldShell>

          <FieldShell label="Complemento" htmlFor="complemento">
            <input
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleInputChange}
              maxLength={80}
              className={inputClassName(false)}
              placeholder="Casa, bloco, apto, referência"
            />
          </FieldShell>

          <FieldShell label="Bairro" htmlFor="bairro" required>
            <input
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              maxLength={80}
              pattern="^.{2,80}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "bairro")))}
              placeholder="Bairro"
              required
            />
          </FieldShell>

          <FieldShell label="Cidade" htmlFor="cidade" required>
            <input
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              maxLength={80}
              pattern="^.{2,80}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "cidade")))}
              placeholder="Cidade"
              required
            />
          </FieldShell>

          <FieldShell
            label="Estado / UF / província"
            htmlFor="estado"
            required
            help="Preenchido automaticamente pelo CEP quando disponível, mas pode ser ajustado manualmente."
          >
            <input
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              maxLength={60}
              pattern="^.{2,60}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "estado")))}
              placeholder="Ex.: MG, Paraná, Província Central"
              required
            />
          </FieldShell>

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
              O comprovante de residência será anexado na seção de documentação digital do cadastro.
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          eyebrow="3. Contexto"
          title="Dados socioeconômicos"
          subtitle="Renda com máscara monetária e cadastro de múltiplos programas sociais."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell
            label="Renda familiar"
            htmlFor="renda_familiar"
            required
            help="Digite apenas números. O valor será formatado automaticamente em reais."
          >
            <input
              id="renda_familiar"
              name="renda_familiar"
              inputMode="numeric"
              value={formatCurrencyInput(formData.renda_familiar)}
              onChange={handleInputChange}
              maxLength={18}
              pattern="^R\$\s\d{1,3}(\.\d{3})*,\d{2}$"
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "renda_familiar"))
              )}
              placeholder="R$ 1.000,00"
              required
            />
          </FieldShell>

          <FieldShell
            label="Quantas pessoas moram na casa"
            htmlFor="moradores_casa"
            required
          >
            <input
              id="moradores_casa"
              name="moradores_casa"
              inputMode="numeric"
              value={formData.moradores_casa}
              onChange={handleInputChange}
              maxLength={2}
              pattern="^\d{1,2}$"
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "moradores_casa"))
              )}
              placeholder="4"
              required
            />
          </FieldShell>

          <FieldShell label="Situação de moradia" htmlFor="situacao_moradia" required>
            <select
              id="situacao_moradia"
              name="situacao_moradia"
              value={formData.situacao_moradia}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "situacao_moradia"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="propria">Própria</option>
              <option value="alugada">Alugada</option>
              <option value="cedida">Cedida</option>
              <option value="outra">Outra</option>
            </select>
          </FieldShell>

          <FieldShell
            label="Beneficiário de programa social"
            htmlFor="beneficiario_programa_social"
            required
          >
            <select
              id="beneficiario_programa_social"
              name="beneficiario_programa_social"
              value={formData.beneficiario_programa_social}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "beneficiario_programa_social"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.beneficiario_programa_social === "sim" ? (
            <div className="md:col-span-2 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Programas sociais</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Adicione todos os programas sociais recebidos pela família.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addProgramaSocial}
                  className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-900"
                >
                  Adicionar outro
                </button>
              </div>

              <div className="space-y-3">
                {formData.programas_sociais.map((programa, index) => (
                  <div key={`programa-social-${index}`} className="flex gap-3">
                    <input
                      name="programas_sociais"
                      value={programa}
                      onChange={(event) => handleProgramaSocialChange(index, event.target.value)}
                      maxLength={80}
                      className={inputClassName(
                        Boolean(
                          index === 0 && getErrorByField(validationErrors, "programas_sociais")
                        )
                      )}
                      placeholder={`Programa social ${index + 1}`}
                    />

                    {formData.programas_sociais.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeProgramaSocial(index)}
                        className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-900"
                      >
                        Remover
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <FieldShell
            label="Responsável ou provedor trabalha?"
            htmlFor="responsavel_trabalha"
            required
          >
            <select
              id="responsavel_trabalha"
              name="responsavel_trabalha"
              value={formData.responsavel_trabalha}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "responsavel_trabalha"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>
        </div>
      </SectionCard>

      {isMinor ? (
        <SectionCard>
          <SectionHeader
            eyebrow="4. Acompanhamento"
            title="Informações escolares"
            subtitle="Bloco obrigatório para crianças e adolescentes."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell label="Está estudando?" htmlFor="estudando" required>
              <select
                id="estudando"
                name="estudando"
                value={formData.estudando}
                onChange={handleInputChange}
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "estudando"))
                )}
                required
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </FieldShell>

            {formData.estudando === "sim" ? (
              <>
                <FieldShell label="Nome da escola" htmlFor="escola_nome" required>
                  <input
                    id="escola_nome"
                    name="escola_nome"
                    value={formData.escola_nome}
                    onChange={handleInputChange}
                    maxLength={120}
                    pattern="^.{3,120}$"
                    className={inputClassName(
                      Boolean(getErrorByField(validationErrors, "escola_nome"))
                    )}
                    required
                  />
                </FieldShell>

                <FieldShell label="Série ou ano" htmlFor="serie_ano" required>
                  <input
                    id="serie_ano"
                    name="serie_ano"
                    value={formData.serie_ano}
                    onChange={handleInputChange}
                    maxLength={30}
                    pattern="^.{1,30}$"
                    className={inputClassName(
                      Boolean(getErrorByField(validationErrors, "serie_ano"))
                    )}
                    required
                  />
                </FieldShell>

                <FieldShell label="Período" htmlFor="periodo_escolar" required>
                  <select
                    id="periodo_escolar"
                    name="periodo_escolar"
                    value={formData.periodo_escolar}
                    onChange={handleInputChange}
                    className={inputClassName(
                      Boolean(getErrorByField(validationErrors, "periodo_escolar"))
                    )}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="integral">Integral</option>
                  </select>
                </FieldShell>
              </>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        <SectionHeader
          eyebrow="5. Cuidados"
          title="Saúde do aluno"
          subtitle="Esse bloco é crítico para a segurança e a tomada de decisão da equipe."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="Possui alguma doença?" htmlFor="possui_doenca" required>
            <select
              id="possui_doenca"
              name="possui_doenca"
              value={formData.possui_doenca}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "possui_doenca"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.possui_doenca === "sim" ? (
            <FieldShell label="Qual doença?" htmlFor="descricao_doenca" required>
              <input
                id="descricao_doenca"
                name="descricao_doenca"
                value={formData.descricao_doenca}
                onChange={handleInputChange}
                maxLength={180}
                pattern="^.{3,180}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "descricao_doenca"))
                )}
                required
              />
            </FieldShell>
          ) : null}

          <FieldShell
            label="Usa medicação contínua?"
            htmlFor="usa_medicacao_continua"
            required
          >
            <select
              id="usa_medicacao_continua"
              name="usa_medicacao_continua"
              value={formData.usa_medicacao_continua}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "usa_medicacao_continua"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.usa_medicacao_continua === "sim" ? (
            <FieldShell label="Qual medicação?" htmlFor="descricao_medicacao" required>
              <input
                id="descricao_medicacao"
                name="descricao_medicacao"
                value={formData.descricao_medicacao}
                onChange={handleInputChange}
                maxLength={180}
                pattern="^.{3,180}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "descricao_medicacao"))
                )}
                required
              />
            </FieldShell>
          ) : null}

          <FieldShell label="Possui alergias?" htmlFor="possui_alergias" required>
            <select
              id="possui_alergias"
              name="possui_alergias"
              value={formData.possui_alergias}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "possui_alergias"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.possui_alergias === "sim" ? (
            <FieldShell label="Quais alergias?" htmlFor="descricao_alergias" required>
              <input
                id="descricao_alergias"
                name="descricao_alergias"
                value={formData.descricao_alergias}
                onChange={handleInputChange}
                maxLength={180}
                pattern="^.{3,180}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "descricao_alergias"))
                )}
                required
              />
            </FieldShell>
          ) : null}

          <FieldShell
            label="Tem alguma limitação física?"
            htmlFor="possui_limitacao_fisica"
            required
          >
            <select
              id="possui_limitacao_fisica"
              name="possui_limitacao_fisica"
              value={formData.possui_limitacao_fisica}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "possui_limitacao_fisica"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.possui_limitacao_fisica === "sim" ? (
            <FieldShell
              label="Descreva a limitação"
              htmlFor="descricao_limitacao_fisica"
              required
            >
              <input
                id="descricao_limitacao_fisica"
                name="descricao_limitacao_fisica"
                value={formData.descricao_limitacao_fisica}
                onChange={handleInputChange}
                maxLength={180}
                pattern="^.{3,180}$"
                className={inputClassName(
                  Boolean(
                    getErrorByField(validationErrors, "descricao_limitacao_fisica")
                  )
                )}
                required
              />
            </FieldShell>
          ) : null}

          <FieldShell
            label="Pode praticar atividades físicas?"
            htmlFor="pode_praticar_atividades_fisicas"
            required
          >
            <select
              id="pode_praticar_atividades_fisicas"
              name="pode_praticar_atividades_fisicas"
              value={formData.pode_praticar_atividades_fisicas}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(
                  getErrorByField(validationErrors, "pode_praticar_atividades_fisicas")
                )
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
            O atestado médico de aptidão física será enviado mais abaixo, na seção de documentação digital do cadastro.
          </div>
        </div>
      </SectionCard>

      {isMinor ? (
        <SectionCard>
          <SectionHeader
            eyebrow="6. Responsabilidade"
            title="Responsável legal"
            subtitle="Obrigatório para menores de 18 anos, com comprovação de vínculo."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FieldShell label="Nome completo" htmlFor="nome_responsavel_legal" required>
              <input
                id="nome_responsavel_legal"
                name="nome_responsavel_legal"
                value={formData.nome_responsavel_legal}
                onChange={handleInputChange}
                maxLength={120}
                pattern="^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' -]{4,119}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "nome_responsavel_legal"))
                )}
                required
              />
            </FieldShell>

            <FieldShell label="CPF" htmlFor="cpf_responsavel_legal" required>
              <input
                id="cpf_responsavel_legal"
                name="cpf_responsavel_legal"
                inputMode="numeric"
                value={formData.cpf_responsavel_legal}
                onChange={handleInputChange}
                maxLength={11}
                pattern="^\d{11}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "cpf_responsavel_legal"))
                )}
                required
              />
            </FieldShell>

            <FieldShell label="RG" htmlFor="rg_responsavel_legal" required>
              <input
                id="rg_responsavel_legal"
                name="rg_responsavel_legal"
                value={formData.rg_responsavel_legal}
                onChange={handleInputChange}
                maxLength={20}
                pattern="^[A-Za-z0-9./-]{4,20}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "rg_responsavel_legal"))
                )}
                required
              />
            </FieldShell>

            <FieldShell label="Telefone" htmlFor="telefone_responsavel_legal" required>
              <input
                id="telefone_responsavel_legal"
                name="telefone_responsavel_legal"
                inputMode="numeric"
                value={formatPhoneInput(formData.telefone_responsavel_legal)}
                onChange={handleInputChange}
                maxLength={16}
                pattern="^\(\d{2}\)\s(?:\d\s)?\d{4}-\d{4}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "telefone_responsavel_legal"))
                )}
                placeholder="(31) 3333-3333"
                required
              />
            </FieldShell>

            <FieldShell
              label="E-mail"
              htmlFor="email_responsavel_legal"
              help="Opcional, mas recomendado para comunicação formal."
            >
              <input
                id="email_responsavel_legal"
                name="email_responsavel_legal"
                type="email"
                value={formData.email_responsavel_legal}
                onChange={handleInputChange}
                maxLength={120}
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "email_responsavel_legal"))
                )}
              />
            </FieldShell>

            <FieldShell label="Grau de parentesco" htmlFor="parentesco_responsavel_legal" required>
              <input
                id="parentesco_responsavel_legal"
                name="parentesco_responsavel_legal"
                value={formData.parentesco_responsavel_legal}
                onChange={handleInputChange}
                maxLength={40}
                pattern="^.{2,40}$"
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "parentesco_responsavel_legal"))
                )}
                placeholder="Mãe, pai, avô, tutor..."
                required
              />
            </FieldShell>

            <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
              O documento que comprove o vínculo do responsável será anexado na seção de documentação digital do cadastro.
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard>
        <SectionHeader
          eyebrow="7. Arquivos"
          title="Documentação digital do cadastro"
          subtitle="Centralize aqui todos os anexos do cadastro, inclusive termos assinados, para manter o processo 100% digital."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
            O PDF gerado já inclui a ficha e os termos em páginas separadas para assinatura. O cadastro digital não será concluído sem o envio de toda a documentação obrigatória abaixo.
          </div>

          {documentValidationErrors.length ? (
            <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              O cadastro permanece bloqueado até que todos os documentos obrigatórios sejam anexados.
              <div className="mt-2 font-medium">{documentValidationErrors[0]?.message}</div>
            </div>
          ) : null}

          <FieldShell
            label="Comprovante de residência"
            htmlFor="comprovante_residencia"
            required
          >
            <input
              id="comprovante_residencia"
              name="comprovante_residencia"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("comprovante_residencia", event)}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "comprovante_residencia"))
              )}
              required
            />
            <FieldHelp>{formatFileLabel(files.comprovante_residencia)}</FieldHelp>
          </FieldShell>

          <FieldShell
            label="Atestado médico de aptidão física"
            htmlFor="atestado_medico"
            required
          >
            <input
              id="atestado_medico"
              name="atestado_medico"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("atestado_medico", event)}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "atestado_medico"))
              )}
              required
            />
            <FieldHelp>{formatFileLabel(files.atestado_medico)}</FieldHelp>
          </FieldShell>

          <FieldShell
            label={isMinor ? "RG ou certidão do aluno" : "RG do aluno"}
            htmlFor="documento_identidade_aluno"
            required
          >
            <input
              id="documento_identidade_aluno"
              name="documento_identidade_aluno"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("documento_identidade_aluno", event)}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "documento_identidade_aluno"))
              )}
              required
            />
            <FieldHelp>{formatFileLabel(files.documento_identidade_aluno)}</FieldHelp>
          </FieldShell>

          <FieldShell label="Documento do CPF do aluno" htmlFor="cpf_aluno" required>
            <input
              id="cpf_aluno"
              name="cpf_aluno"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("cpf_aluno", event)}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "cpf_aluno"))
              )}
              required
            />
            <FieldHelp>{formatFileLabel(files.cpf_aluno)}</FieldHelp>
          </FieldShell>

          {isMinor ? (
            <FieldShell
              label="Documento que comprove o vínculo com o responsável"
              htmlFor="documento_vinculo_responsavel"
              required
            >
              <input
                id="documento_vinculo_responsavel"
                name="documento_vinculo_responsavel"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(event) => handleFileChange("documento_vinculo_responsavel", event)}
                className={inputClassName(
                  Boolean(
                    getErrorByField(validationErrors, "documento_vinculo_responsavel")
                  )
                )}
                required
              />
              <FieldHelp>{formatFileLabel(files.documento_vinculo_responsavel)}</FieldHelp>
            </FieldShell>
          ) : null}

          <FieldShell
            label="Foto do aluno"
            htmlFor="foto_aluno"
            help="Opcional, mas útil para identificação interna no sistema."
          >
            <input
              id="foto_aluno"
              name="foto_aluno"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("foto_aluno", event)}
              className={inputClassName(Boolean(getErrorByField(validationErrors, "foto_aluno")))}
            />
            <FieldHelp>{formatFileLabel(files.foto_aluno)}</FieldHelp>
          </FieldShell>

          <div className="md:col-span-2">
            <FieldShell
              label="Ficha e termos assinados"
              htmlFor="termos_assinados"
              required
              help="Envie um arquivo único com a ficha principal e os termos assinados em PDF, JPG, PNG ou WEBP."
            >
              <input
                id="termos_assinados"
                name="termos_assinados"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(event) => handleFileChange("termos_assinados", event)}
                className={inputClassName(
                  Boolean(getErrorByField(validationErrors, "termos_assinados"))
                )}
                required
              />
              <FieldHelp>{formatFileLabel(files.termos_assinados)}</FieldHelp>
            </FieldShell>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          eyebrow="8. Projeto"
          title="Informações do projeto"
          subtitle="Preferências de turma e contexto de entrada no projeto."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell label="Turma desejada" htmlFor="turma_desejada" required>
            <input
              id="turma_desejada"
              name="turma_desejada"
              list="turmas-disponiveis"
              value={formData.turma_desejada}
              onChange={handleInputChange}
              maxLength={120}
              pattern="^.{1,120}$"
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "turma_desejada"))
              )}
              placeholder="Escolha ou digite uma turma"
              required
            />
            <datalist id="turmas-disponiveis">
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.nome} />
              ))}
            </datalist>
          </FieldShell>

          <FieldShell label="Modalidade" htmlFor="modalidade" required>
            <input
              id="modalidade"
              name="modalidade"
              list="modalidades-disponiveis"
              value={formData.modalidade}
              onChange={handleInputChange}
              maxLength={60}
              pattern="^.{2,60}$"
              className={inputClassName(Boolean(getErrorByField(validationErrors, "modalidade")))}
              placeholder="Ex.: Balé, jiu-jitsu, violão"
              required
            />
            <datalist id="modalidades-disponiveis">
              {MODALIDADE_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </FieldShell>

          <FieldShell
            label="Como conheceu o projeto"
            htmlFor="como_conheceu_projeto"
            required
          >
            <select
              id="como_conheceu_projeto"
              name="como_conheceu_projeto"
              value={formData.como_conheceu_projeto}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "como_conheceu_projeto"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="indicacao">Indicação</option>
              <option value="escola">Escola</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="site">Site</option>
              <option value="evento">Evento</option>
              <option value="outro">Outro</option>
            </select>
          </FieldShell>

          <FieldShell
            label="Já participou antes deste projeto ou de outro projeto social?"
            htmlFor="ja_participou_antes"
            required
            help="Considere participações anteriores neste projeto ou em outros projetos sociais."
          >
            <select
              id="ja_participou_antes"
              name="ja_participou_antes"
              value={formData.ja_participou_antes}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "ja_participou_antes"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </FieldShell>

          {formData.como_conheceu_projeto === "outro" ? (
            <div className="md:col-span-2">
              <FieldShell
                label="Detalhamento"
                htmlFor="como_conheceu_detalhe"
                required
                help="Descreva brevemente como conheceu o projeto: nome da pessoa, escola, evento, rede social ou outro canal."
              >
                <input
                  id="como_conheceu_detalhe"
                  name="como_conheceu_detalhe"
                  value={formData.como_conheceu_detalhe}
                  onChange={handleInputChange}
                  maxLength={120}
                  pattern="^.{3,120}$"
                  className={inputClassName(
                    Boolean(getErrorByField(validationErrors, "como_conheceu_detalhe"))
                  )}
                  required
                />
              </FieldShell>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <FieldShell
              label="Observações complementares"
              htmlFor="observacoes"
              help="Campo opcional para recados livres da equipe ou da família."
            >
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className={inputClassName(false)}
                placeholder="Informações adicionais importantes para o cadastro."
              />
            </FieldShell>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          eyebrow="9. Termos"
          title="Termos e autorizações"
          subtitle="Os termos completos já saem no PDF gerado, cada um em uma página para assinatura e datação separadas."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell
            label="Autorização de uso de imagem"
            htmlFor="termo_uso_imagem"
            required
          >
            <select
              id="termo_uso_imagem"
              name="termo_uso_imagem"
              value={formData.termo_uso_imagem}
              onChange={handleInputChange}
              className={inputClassName(
                Boolean(getErrorByField(validationErrors, "termo_uso_imagem"))
              )}
              required
            >
              <option value="">Selecione</option>
              <option value="sim">Sim, autoriza fotos/vídeos</option>
              <option value="nao">Não autoriza fotos/vídeos</option>
            </select>
          </FieldShell>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-900">O que vai no PDF</p>
            <p className="mt-2">
              1. Ficha principal com espaço para assinatura.
            </p>
            <p className="mt-1">
              2. Termo de uso de imagem.
            </p>
            <p className="mt-1">
              3. Termo de responsabilidade.
            </p>
            <p className="mt-1">
              4. Termo LGPD.
            </p>
            <p className="mt-1">
              5. Termo de participação.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Depois das assinaturas, envie os arquivos na seção de documentação digital do cadastro.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:p-6">
        <div className="space-y-1 text-sm text-zinc-600">
          <p className="font-medium text-zinc-900">
            {pendingSections.length
              ? "Envio bloqueado até concluir todos os itens obrigatórios."
              : "Formulário pronto para envio."}
          </p>
          <p>
            Referência de CEP: ViaCEP, webservice gratuito de consulta por CEP.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Salvando cadastro..." : "Salvar aluno"}
        </button>
      </div>
    </form>
  );
}
