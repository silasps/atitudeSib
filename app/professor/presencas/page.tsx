"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

type EncontroResumo = {
  id: number;
  data_encontro: string;
  status: string;
  totalPresencas: number;
  totalFaltas: number;
  totalJustificadas: number;
};

type TurmaPresencaOverview = {
  id: number;
  nome: string;
  status: string | null;
  dias_horarios: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  duracao_horas: number | null;
  totalAlunos: number;
  totalEncontros: number;
  totalPresencas: number;
  totalFaltas: number;
  totalJustificadas: number;
  ultimoEncontro: string | null;
  encontros: EncontroResumo[];
};

export default function ProfessorPresencasPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<TurmaPresencaOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTurmaId, setExpandedTurmaId] = useState<number | null>(null);
  const [contaConectada, setContaConectada] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/professor/presencas", {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "Não foi possível carregar as presenças."
          );
        }

        const payload = await response.json();
        const turmasData = (payload.turmas || []) as TurmaPresencaOverview[];

        setTurmas(turmasData);
        setContaConectada(payload.contaConectada || "");

        if (turmasData.length > 0) {
          setExpandedTurmaId((current) => current ?? turmasData[0].id);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar as presenças."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  const filteredTurmas = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return turmas;
    }

    return turmas.filter((turma) => {
      return (
        turma.nome.toLowerCase().includes(normalizedSearch) ||
        String(turma.totalAlunos).includes(normalizedSearch) ||
        String(turma.totalEncontros).includes(normalizedSearch)
      );
    });
  }, [searchTerm, turmas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-2xl font-bold text-zinc-900">Presenças</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Acompanhe o panorama das suas turmas e abra rapidamente qualquer chamada
          para editar quando necessário.
        </p>
        {contaConectada ? (
          <p className="mt-2 text-xs text-zinc-500">
            Conta conectada: {contaConectada}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-zinc-800">
            Pesquisar turma
          </label>
          <input
            id="search"
            type="text"
            placeholder="Buscar por nome da turma..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredTurmas.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-500">
              {searchTerm
                ? "Nenhuma turma encontrada com os filtros aplicados."
                : "Nenhuma turma vinculada encontrada."}
            </p>
          </div>
        ) : (
          filteredTurmas.map((turma) => {
            const isExpanded = expandedTurmaId === turma.id;

            return (
              <div
                key={turma.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTurmaId((current) =>
                      current === turma.id ? null : turma.id
                    )
                  }
                  className="w-full cursor-pointer p-5 text-left md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-zinc-900">
                          {turma.nome}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            turma.status === "ativa"
                              ? "bg-emerald-100 text-emerald-700"
                              : turma.status === "encerrada"
                              ? "bg-zinc-200 text-zinc-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {turma.status || "sem status"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">
                        {turma.dias_horarios || "Dias e horários não informados"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Último encontro:{" "}
                        {turma.ultimoEncontro
                          ? formatDate(turma.ultimoEncontro)
                          : "nenhum encontro registrado"}
                      </p>
                    </div>

                    <span className="rounded-2xl border border-zinc-200 p-2 text-zinc-600">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Alunos
                      </p>
                      <p className="mt-1 text-2xl font-bold text-zinc-900">
                        {turma.totalAlunos}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Encontros
                      </p>
                      <p className="mt-1 text-2xl font-bold text-zinc-900">
                        {turma.totalEncontros}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                        Presenças
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-800">
                        {turma.totalPresencas}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-red-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                        Faltas
                      </p>
                      <p className="mt-1 text-2xl font-bold text-red-800">
                        {turma.totalFaltas}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                        Justificadas
                      </p>
                      <p className="mt-1 text-2xl font-bold text-amber-800">
                        {turma.totalJustificadas}
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-zinc-200 bg-zinc-50/70 p-5 md:p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          Registros da turma
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          Clique em um dia para revisar ou ajustar a chamada registrada.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/professor/turmas/${turma.id}/presenca`}
                          className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white cursor-pointer"
                        >
                          Nova chamada
                        </Link>
                        <Link
                          href={`/professor/turmas/${turma.id}/historico-presencas`}
                          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900 cursor-pointer"
                        >
                          Ver histórico detalhado
                        </Link>
                      </div>
                    </div>

                    {turma.encontros.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        {turma.encontros.map((encontro) => (
                          <div
                            key={encontro.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-lg font-semibold text-zinc-900">
                                  {formatDate(encontro.data_encontro)}
                                </p>
                                <p className="mt-1 text-sm text-zinc-600">
                                  Status do encontro: {encontro.status}
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center md:min-w-[280px]">
                                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                                  <p className="text-xs text-emerald-700">Presenças</p>
                                  <p className="text-lg font-bold text-emerald-800">
                                    {encontro.totalPresencas}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-red-50 px-3 py-2">
                                  <p className="text-xs text-red-700">Faltas</p>
                                  <p className="text-lg font-bold text-red-800">
                                    {encontro.totalFaltas}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-amber-50 px-3 py-2">
                                  <p className="text-xs text-amber-700">Justificadas</p>
                                  <p className="text-lg font-bold text-amber-800">
                                    {encontro.totalJustificadas}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              <Link
                                href={`/professor/turmas/${turma.id}/presenca?data=${encontro.data_encontro}`}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white cursor-pointer"
                              >
                                <PencilLine size={16} />
                                Editar chamada do dia
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
                        <p className="text-sm text-zinc-500">
                          Nenhuma chamada registrada ainda para esta turma.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
