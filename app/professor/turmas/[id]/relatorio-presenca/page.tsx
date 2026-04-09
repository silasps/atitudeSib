import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";
import { RelatorioPresencaClient } from "./relatorio-presenca-client";

type TurmaRecord = {
  id: number;
  nome: string;
};

type EncontroRecord = {
  id: number;
  data_encontro?: string | null;
  status?: string | null;
  [key: string]: unknown;
};

type PresencaRecord = {
  encontro_turma_id: number;
  matricula_id: number;
  [key: string]: unknown;
};

type MatriculaRecord = {
  id: number;
  aluno_id: number;
  [key: string]: unknown;
};

type AlunoRecord = {
  id: number;
  [key: string]: unknown;
};

function parseDate(value?: string | null) {
  if (!value) return null;

  const normalized = String(value).trim();
  if (!normalized) return null;

  const safeValue = normalized.includes("T")
    ? normalized
    : `${normalized}T00:00:00`;

  const date = new Date(safeValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function RelatorioPresencaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const turmaId = Number(id);

  if (!Number.isFinite(turmaId)) {
    notFound();
  }

  const { dataSupabase, user, allowed } = await getProfessorServerContext();

  if (!user) {
    redirect("/login");
  }

  if (!allowed) {
    redirect("/acesso-negado");
  }

  if (!dataSupabase) {
    throw new Error("Configuração do Supabase indisponível para leitura da turma.");
  }

  const turma = (await getProfessorTurma(
    dataSupabase,
    turmaId,
    user.id
  )) as TurmaRecord | null;

  if (!turma) {
    notFound();
  }

  // Buscar todos os encontros da turma
  const { data: encontros, error: encontrosError } = await dataSupabase
    .from("encontros_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .order("data_encontro", { ascending: false });

  if (encontrosError) {
    throw new Error(`Erro ao carregar encontros: ${encontrosError.message}`);
  }

  const encontroIds = ((encontros ?? []) as EncontroRecord[]).map((encontro) =>
    Number(encontro.id)
  );

  // Buscar todas as presenças
  const { data: presencas, error: presencasError } = encontroIds.length
    ? await dataSupabase.from("presencas").select("*").in("encontro_turma_id", encontroIds)
    : { data: [] as PresencaRecord[], error: null };

  if (presencasError) {
    throw new Error(`Erro ao carregar presenças: ${presencasError.message}`);
  }

  // Buscar matrículas e alunos
  const { data: matriculas } = await dataSupabase
    .from("matriculas")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("status", "ativa");

  const alunoIds = ((matriculas ?? []) as MatriculaRecord[]).map((matricula) =>
    Number(matricula.aluno_id)
  );

  const { data: alunos } = alunoIds.length
    ? await dataSupabase.from("alunos").select("*").in("id", alunoIds).order("nome")
    : { data: [] as AlunoRecord[] };

  const alunosList = alunos ?? [];
  const matriculasList = matriculas ?? [];
  const presencasList = presencas ?? [];

  // Estruturar dados para relatório
  const alunosById = new Map<string, AlunoRecord>();
  const matriculasById = new Map<string, MatriculaRecord>();

  for (const aluno of alunosList as AlunoRecord[]) {
    alunosById.set(String(aluno.id), aluno);
  }

  for (const matricula of matriculasList as MatriculaRecord[]) {
    matriculasById.set(String(matricula.id), matricula);
  }

  const encontrosFormatted = ((encontros ?? []) as EncontroRecord[]).map((enc) => ({
    ...enc,
    data_encontro: String(enc.data_encontro ?? ""),
    data_formatada: formatDate(enc.data_encontro),
    status: String(enc.status ?? ""),
  }));

  const presencasMap = new Map<string, PresencaRecord>();
  for (const presenca of presencasList as PresencaRecord[]) {
    const key = `${presenca.encontro_turma_id}_${presenca.matricula_id}`;
    presencasMap.set(key, presenca);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/professor/turmas/${turma.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer"
        >
          ← Voltar para turma
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">
          Relatório de Presença · {turma.nome}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Visualize e baixe o histórico de presença dos alunos.
        </p>
      </div>

      <RelatorioPresencaClient
        turma={turma}
        encontros={encontrosFormatted}
        alunos={alunosList}
        matriculas={matriculasList}
        alunosById={alunosById}
        matriculasById={matriculasById}
        presencasMap={presencasMap}
      />
    </div>
  );
}
