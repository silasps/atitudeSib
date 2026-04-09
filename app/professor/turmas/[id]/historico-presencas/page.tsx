"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { formatDate } from "@/lib/utils";

type RegistroPresenca = {
  matriculaId: number;
  alunoNome: string;
  status: string;
};

type EncontroHistorico = {
  id: number;
  data_encontro: string;
  status: string;
  totalPresencas: number;
  totalFaltas: number;
  totalJustificadas: number;
  registros: RegistroPresenca[];
};

type TurmaHistorico = {
  id: number;
  nome: string;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  duracao_horas?: number | null;
};

export default function HistoricoPresencasPage() {
  const params = useParams();
  const router = useRouter();
  const [turma, setTurma] = useState<TurmaHistorico | null>(null);
  const [encontros, setEncontros] = useState<EncontroHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalPresencas, setTotalPresencas] = useState(0);
  const [totalFaltas, setTotalFaltas] = useState(0);
  const [totalJustificadas, setTotalJustificadas] = useState(0);
  const [contaConectada, setContaConectada] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const turmaId = Number(params.id);

        if (!Number.isFinite(turmaId)) {
          setErrorMessage("Turma inválida.");
          return;
        }

        const response = await fetch(
          `/api/professor/turmas/${turmaId}/historico-presencas`,
          {
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          setErrorMessage("Turma não encontrada.");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || "Não foi possível carregar o histórico."
          );
        }

        const payload = await response.json();

        setTurma(payload.turma || null);
        setEncontros((payload.encontros || []) as EncontroHistorico[]);
        setTotalAlunos(Number(payload.totalAlunos || 0));
        setTotalPresencas(Number(payload.totalPresencas || 0));
        setTotalFaltas(Number(payload.totalFaltas || 0));
        setTotalJustificadas(Number(payload.totalJustificadas || 0));
        setContaConectada(payload.contaConectada || "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar o histórico de presenças."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [params.id, router]);

  const filteredEncontros = useMemo(() => {
    return encontros.filter((encontro) => {
      const matchesSearch =
        !searchTerm ||
        encontro.registros.some((registro) =>
          registro.alunoNome.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        formatDate(encontro.data_encontro)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const encontroDate = new Date(encontro.data_encontro);
      const matchesStartDate = !startDate || encontroDate >= new Date(startDate);
      const matchesEndDate = !endDate || encontroDate <= new Date(endDate);

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [encontros, searchTerm, startDate, endDate]);

  const totalHoras = filteredEncontros.length * Number(turma?.duracao_horas || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Carregando...</div>
      </div>
    );
  }

  if (errorMessage || !turma) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-zinc-500">
          {errorMessage || "Turma não encontrada."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Histórico de Presenças
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {turma.nome} · Total de encontros: {encontros.length} · Horas totais:{" "}
            {totalHoras}h
          </p>
          {contaConectada ? (
            <p className="mt-2 text-xs text-zinc-500">
              Conta conectada: {contaConectada}
            </p>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/professor/turmas/${turma.id}/presenca`}
            className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 cursor-pointer"
          >
            Marcar presença
          </Link>
          <Link
            href="/professor/presencas"
            className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white cursor-pointer"
          >
            Voltar
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Alunos ativos
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{totalAlunos}</p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Encontros
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {encontros.length}
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Presenças
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">
            {totalPresencas}
          </p>
        </div>
        <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700">
            Faltas
          </p>
          <p className="mt-2 text-3xl font-bold text-red-800">{totalFaltas}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Justificadas
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-800">
            {totalJustificadas}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-zinc-800">
              Pesquisar aluno
            </label>
            <input
              id="search"
              type="text"
              placeholder="Nome do aluno..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium text-zinc-800">
              Data inicial
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium text-zinc-800">
              Data final
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEncontros.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-500">
              {searchTerm || startDate || endDate
                ? "Nenhum encontro encontrado com os filtros aplicados."
                : "Nenhum encontro registrado ainda."}
            </p>
          </div>
        ) : (
          filteredEncontros.map((encontro) => (
            <div
              key={encontro.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {formatDate(encontro.data_encontro)}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Status: {encontro.status} · Presenças: {encontro.totalPresencas}
                    {" · "}Faltas: {encontro.totalFaltas}
                    {" · "}Justificadas: {encontro.totalJustificadas}
                  </p>
                </div>

                <Link
                  href={`/professor/turmas/${turma.id}/presenca?data=${encontro.data_encontro}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white cursor-pointer"
                >
                  <PencilLine size={16} />
                  Editar chamada
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {encontro.registros.map((registro) => (
                  <div
                    key={`${encontro.id}-${registro.matriculaId}`}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-zinc-900">
                      {registro.alunoNome}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        registro.status === "presente"
                          ? "bg-emerald-100 text-emerald-700"
                          : registro.status === "falta"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {registro.status === "presente"
                        ? "Presente"
                        : registro.status === "falta"
                        ? "Falta"
                        : "Justificada"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
