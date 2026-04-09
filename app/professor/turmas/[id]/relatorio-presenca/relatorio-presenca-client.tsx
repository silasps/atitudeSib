"use client";

import { FileDown } from "lucide-react";
import { useRef, useState } from "react";

interface Encontro {
  id: number;
  data_encontro: string;
  data_formatada: string;
  status: string;
}

interface Aluno {
  id: number;
  nome: string;
}

interface Matricula {
  id: number;
  aluno_id: number;
}

interface RelatorioPresencaClientProps {
  turma: any;
  encontros: Encontro[];
  alunos: Aluno[];
  matriculas: Matricula[];
  alunosById: Map<string, any>;
  matriculasById: Map<string, any>;
  presencasMap: Map<string, any>;
}

export function RelatorioPresencaClient({
  turma,
  encontros,
  alunos,
  matriculas,
  alunosById,
  matriculasById,
  presencasMap,
}: RelatorioPresencaClientProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const statusColors: Record<string, string> = {
    presente: "bg-emerald-50 text-emerald-700",
    falta: "bg-red-50 text-red-700",
    justificada: "bg-yellow-50 text-yellow-700",
  };

  const getStatusDisplay = (status: string) => {
    return {
      presente: "Presente",
      falta: "Falta",
      justificada: "Justificada",
    }[status] || status;
  };

  const downloadPDF = async () => {
    if (!tableRef.current) return;

    setIsGenerating(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 297 - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      const fileName = `Relatorio_Presenca_${turma.nome.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={downloadPDF}
          disabled={isGenerating || encontros.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <FileDown size={18} />
          {isGenerating ? "Gerando PDF..." : "Baixar Relatório (PDF)"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table
          ref={tableRef}
          className="w-full border-collapse"
          style={{ minWidth: "100%" }}
        >
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 sticky left-0 bg-zinc-50">
                Aluno
              </th>
              {encontros.map((encontro) => (
                <th
                  key={encontro.id}
                  className="px-3 py-3 text-center text-xs font-semibold text-zinc-700 whitespace-nowrap"
                >
                  <div className="text-zinc-900">{encontro.data_formatada}</div>
                  <div className="text-zinc-500 text-xs">{encontro.status}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alunos && alunos.length > 0 ? (
              alunos.map((aluno) => {
                const matricula = matriculas?.find(
                  (m: any) => m.aluno_id === aluno.id
                );

                return (
                  <tr key={aluno.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 sticky left-0 bg-white hover:bg-zinc-50">
                      {aluno.nome}
                    </td>
                    {encontros.map((encontro) => {
                      const presencaKey = `${encontro.id}_${matricula?.id}`;
                      const presenca = presencasMap.get(presencaKey);

                      return (
                        <td
                          key={`${aluno.id}_${encontro.id}`}
                          className="px-3 py-3 text-center border-r border-zinc-100"
                        >
                          {presenca ? (
                            <span
                              className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${
                                statusColors[presenca.status] ||
                                "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {getStatusDisplay(presenca.status)}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={encontros.length + 1} className="px-4 py-6 text-center text-sm text-zinc-500">
                  Não há alunos matriculados nesta turma.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {encontros.length === 0 && (
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <p className="text-sm text-zinc-600">
            Nenhum encontro registrado para esta turma. Comece registrando presenças.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Legenda</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              Presente
            </span>
            <span className="text-sm text-zinc-600">Aluno compareceu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
              Falta
            </span>
            <span className="text-sm text-zinc-600">Aluno ausente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-lg bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
              Justificada
            </span>
            <span className="text-sm text-zinc-600">Falta justificada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
