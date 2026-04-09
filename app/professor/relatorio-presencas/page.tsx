"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TurmaOption = {
  id: number;
  nome: string;
};

type AlunoOption = {
  id: number;
  nome: string;
};

type RelatorioData = {
  turmas: Array<{
    nome: string;
    professorResponsavel?: string;
    encontros: Array<{
      data: string;
      presencas: Array<{
        aluno: string;
        status: string;
      }>;
    }>;
    estatisticas: {
      totalEncontros: number;
      totalHoras: number;
    };
  }>;
};

type ReportType = "turma" | "aluno" | "todas_turmas" | "periodo";

const reportTypeLabels: Record<ReportType, string> = {
  turma: "Relatório da turma completa",
  aluno: "Relatório de um aluno específico",
  todas_turmas: "Todas as turmas do professor",
  periodo: "Período específico (todas as turmas)",
};

function formatStatusLabel(status: string) {
  if (status === "presente") return "Presente";
  if (status === "falta") return "Falta";
  if (status === "justificada") return "Justificada";
  return status;
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split("-");

  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  return value;
}

export default function RelatorioPresencasPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [alunos, setAlunos] = useState<AlunoOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [contaConectada, setContaConectada] = useState("");
  const [filters, setFilters] = useState({
    tipo: "turma" as ReportType,
    turmaId: "",
    alunoId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    async function loadTurmas() {
      try {
        const response = await fetch("/api/professor/relatorio-presencas", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "Erro ao carregar turmas do relatório."
          );
        }

        const payload = await response.json();
        setTurmas((payload.turmas || []) as TurmaOption[]);
        setContaConectada(payload.contaConectada || "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar turmas do relatório."
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadTurmas();
  }, [router]);

  useEffect(() => {
    async function loadAlunosDaTurma() {
      if (filters.tipo !== "aluno" || !filters.turmaId) {
        setAlunos([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/professor/relatorio-presencas?turmaId=${encodeURIComponent(
            filters.turmaId
          )}`,
          {
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "Erro ao carregar alunos da turma."
          );
        }

        const payload = await response.json();
        setAlunos((payload.alunos || []) as AlunoOption[]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar alunos da turma."
        );
      }
    }

    void loadAlunosDaTurma();
  }, [filters.tipo, filters.turmaId, router]);

  function setFilter<K extends keyof typeof filters>(
    field: K,
    value: (typeof filters)[K]
  ) {
    setFilters((current) => {
      const next = { ...current, [field]: value };

      if (field === "tipo" && value !== "aluno") {
        next.alunoId = "";
      }

      if (field === "turmaId") {
        next.alunoId = "";
      }

      return next;
    });
  }

  function canGenerateReport() {
    if (generating || loadingOptions) {
      return false;
    }

    if (filters.tipo === "turma" && !filters.turmaId) {
      return false;
    }

    if (filters.tipo === "aluno" && (!filters.turmaId || !filters.alunoId)) {
      return false;
    }

    return true;
  }

  async function generatePdf(data: RelatorioData) {
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
    const nameColumnWidth = 125;
    const statusColumnWidth = contentWidth - nameColumnWidth;

    let currentY = margin;

    const addPage = () => {
      pdf.addPage();
      currentY = margin;
    };

    const ensureSpace = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        addPage();
      }
    };

    const writeText = (
      text: string,
      options?: {
        color?: [number, number, number];
        fontSize?: number;
        fontStyle?: "normal" | "bold";
        spacingAfter?: number;
        indent?: number;
      }
    ) => {
      const {
        color = [39, 39, 42],
        fontSize = 11,
        fontStyle = "normal",
        spacingAfter = 3,
        indent = 0,
      } = options ?? {};

      pdf.setFont("helvetica", fontStyle);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);

      const lines = pdf.splitTextToSize(text, contentWidth - indent) as string[];
      const blockHeight = lines.length * lineHeight + spacingAfter;

      ensureSpace(blockHeight + 2);
      pdf.text(lines, margin + indent, currentY + 4);
      currentY += blockHeight;
    };

    const drawDivider = () => {
      ensureSpace(6);
      pdf.setDrawColor(228, 228, 231);
      pdf.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
      currentY += 6;
    };

    const drawTableHeader = () => {
      ensureSpace(10);
      pdf.setFillColor(244, 244, 245);
      pdf.rect(margin, currentY, contentWidth, 8, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(39, 39, 42);
      pdf.text("Aluno", margin + 2, currentY + 5);
      pdf.text("Status", margin + nameColumnWidth + 2, currentY + 5);
      currentY += 8;
    };

    const drawRow = (aluno: string, status: string) => {
      const alunoLines = pdf.splitTextToSize(aluno, nameColumnWidth - 4) as string[];
      const statusLines = pdf.splitTextToSize(
        formatStatusLabel(status),
        statusColumnWidth - 4
      ) as string[];
      const textLines = Math.max(alunoLines.length, statusLines.length);
      const rowHeight = Math.max(8, textLines * lineHeight + 4);

      ensureSpace(rowHeight + 1);

      pdf.setDrawColor(228, 228, 231);
      pdf.rect(margin, currentY, nameColumnWidth, rowHeight);
      pdf.rect(margin + nameColumnWidth, currentY, statusColumnWidth, rowHeight);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(63, 63, 70);
      pdf.text(alunoLines, margin + 2, currentY + 5);
      pdf.text(statusLines, margin + nameColumnWidth + 2, currentY + 5);

      currentY += rowHeight;
    };

    const turmaSelecionada = turmas.find(
      (turma) => String(turma.id) === filters.turmaId
    );
    const mostrarCabecalhoDaTurma =
      (filters.tipo === "turma" || filters.tipo === "aluno") && !!turmaSelecionada;

    writeText("Relatório de Presenças", {
      fontSize: 18,
      fontStyle: "bold",
      color: [24, 24, 27],
      spacingAfter: 4,
    });

    writeText(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, {
      fontSize: 10,
      color: [82, 82, 91],
      spacingAfter: 2,
    });

    writeText(`Tipo: ${reportTypeLabels[filters.tipo]}`, {
      fontSize: 10,
      color: [82, 82, 91],
      spacingAfter: 2,
    });

    if (turmaSelecionada) {
      writeText(`Turma: ${turmaSelecionada.nome}`, {
        fontSize: 11,
        fontStyle: "bold",
        color: [24, 24, 27],
        spacingAfter: 3,
      });
    }

    if (filters.startDate || filters.endDate) {
      const periodo = [
        filters.startDate ? `de ${formatDateLabel(filters.startDate)}` : "",
        filters.endDate ? `até ${formatDateLabel(filters.endDate)}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      writeText(`Período: ${periodo}`, {
        fontSize: 10,
        color: [82, 82, 91],
        spacingAfter: 4,
      });
    }

    data.turmas.forEach((turma, turmaIndex) => {
      if (turmaIndex > 0) {
        drawDivider();
      }

      if (!mostrarCabecalhoDaTurma) {
        writeText(turma.nome, {
          fontSize: 14,
          fontStyle: "bold",
          color: [24, 24, 27],
          spacingAfter: 2,
        });
      }

      writeText(
        `Professor responsável: ${turma.professorResponsavel || "Não informado"}`,
        {
          fontSize: 10,
          color: [82, 82, 91],
          spacingAfter: 2,
        }
      );

      writeText(`Encontros no relatório: ${turma.estatisticas.totalEncontros}`, {
        fontSize: 10,
        color: [82, 82, 91],
        spacingAfter: 4,
      });

      if (turma.encontros.length === 0) {
        writeText("Nenhum encontro encontrado para os filtros selecionados.", {
          fontSize: 10,
          color: [113, 113, 122],
          spacingAfter: 4,
        });
        return;
      }

      turma.encontros.forEach((encontro) => {
        writeText(`Encontro: ${formatDateLabel(encontro.data)}`, {
          fontSize: 12,
          fontStyle: "bold",
          color: [39, 39, 42],
          spacingAfter: 2,
        });

        if (encontro.presencas.length === 0) {
          writeText("Nenhum registro de presença neste encontro.", {
            fontSize: 10,
            color: [113, 113, 122],
            spacingAfter: 4,
          });
          return;
        }

        drawTableHeader();
        encontro.presencas.forEach((presenca) => {
          drawRow(presenca.aluno, presenca.status);
        });
        currentY += 4;
      });
    });

    const nomeBase =
      turmaSelecionada?.nome ||
      (filters.tipo === "aluno" ? "relatorio-aluno" : "relatorio-presencas");

    pdf.save(
      `${nomeBase.replace(/\s+/g, "-").toLowerCase()}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`
    );
  }

  async function handleGenerateReport() {
    setGenerating(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/professor/relatorio-presencas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Erro ao gerar os dados do relatório."
        );
      }

      const data = (await response.json()) as RelatorioData;
      const totalEncontros = data.turmas.reduce(
        (sum, turma) => sum + turma.encontros.length,
        0
      );

      if (data.turmas.length === 0 || totalEncontros === 0) {
        setErrorMessage(
          "Nenhum registro de presença foi encontrado para os filtros selecionados."
        );
        return;
      }

      await generatePdf(data);
    } catch (error) {
      console.error("Erro ao gerar relatório de presenças:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao gerar o PDF no navegador. Tente novamente em instantes."
      );
    } finally {
      setGenerating(false);
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          Relatório de Presenças
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Gere relatórios personalizados de presenças em PDF.
        </p>
        {contaConectada ? (
          <p className="mt-2 text-xs text-zinc-500">
            Conta conectada: {contaConectada}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-800">
              Tipo de relatório
            </label>
            <select
              value={filters.tipo}
              onChange={(event) =>
                setFilter("tipo", event.target.value as ReportType)
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="turma">Relatório da turma completa</option>
              <option value="aluno">Relatório de um aluno específico</option>
              <option value="todas_turmas">Todas as turmas do professor</option>
              <option value="periodo">
                Período específico (todas as turmas)
              </option>
            </select>
          </div>

          {(filters.tipo === "turma" || filters.tipo === "aluno") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800">Turma</label>
              <select
                value={filters.turmaId}
                onChange={(event) => setFilter("turmaId", event.target.value)}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              >
                <option value="">Selecionar turma</option>
                {turmas.map((turma) => (
                  <option key={turma.id} value={String(turma.id)}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.tipo === "aluno" && filters.turmaId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-800">Aluno</label>
              <select
                value={filters.alunoId}
                onChange={(event) => setFilter("alunoId", event.target.value)}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              >
                <option value="">Selecionar aluno</option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={String(aluno.id)}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(filters.tipo === "periodo" ||
            filters.tipo === "turma" ||
            filters.tipo === "aluno") && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) =>
                    setFilter("startDate", event.target.value)
                  }
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800">
                  Data final
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilter("endDate", event.target.value)}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={!canGenerateReport()}
              className="cursor-pointer rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Gerando..." : "Gerar Relatório PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
