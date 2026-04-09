import type { SupabaseClient } from "@supabase/supabase-js";

type TurmaBase = {
  id: number;
  nome: string;
  status?: string | null;
  dias_horarios?: string | null;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  duracao_horas?: number | null;
};

type MatriculaRow = {
  id: number;
  turma_id: number;
  aluno_id: number;
};

type AlunoRow = {
  id: number;
  nome: string;
};

type EncontroRow = {
  id: number;
  turma_id: number;
  data_encontro: string;
  status: string;
};

type PresencaRow = {
  id: number;
  encontro_turma_id: number;
  matricula_id: number;
  status: string;
};

export type TurmaPresencaOverview = {
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
  encontros: Array<{
    id: number;
    data_encontro: string;
    status: string;
    totalPresencas: number;
    totalFaltas: number;
    totalJustificadas: number;
  }>;
};

export type TurmaPresencaHistorico = {
  turma: TurmaBase;
  totalAlunos: number;
  totalEncontros: number;
  totalPresencas: number;
  totalFaltas: number;
  totalJustificadas: number;
  encontros: Array<{
    id: number;
    data_encontro: string;
    status: string;
    totalPresencas: number;
    totalFaltas: number;
    totalJustificadas: number;
    registros: Array<{
      matriculaId: number;
      alunoId: number | null;
      alunoNome: string;
      status: string;
    }>;
  }>;
};

function emptyOverview(turma: TurmaBase): TurmaPresencaOverview {
  return {
    id: turma.id,
    nome: turma.nome,
    status: turma.status ?? null,
    dias_horarios: turma.dias_horarios ?? null,
    horario_inicio: turma.horario_inicio ?? null,
    horario_fim: turma.horario_fim ?? null,
    duracao_horas: turma.duracao_horas ?? null,
    totalAlunos: 0,
    totalEncontros: 0,
    totalPresencas: 0,
    totalFaltas: 0,
    totalJustificadas: 0,
    ultimoEncontro: null,
    encontros: [],
  };
}

export async function getProfessorPresencasOverview(
  supabase: SupabaseClient,
  userId: string
): Promise<TurmaPresencaOverview[]> {
  const { data: turmas, error: turmasError } = await supabase
    .from("turmas")
    .select("id, nome, status, dias_horarios")
    .eq("professor_user_id", userId)
    .order("nome");

  if (turmasError) {
    throw new Error(`Erro ao carregar turmas: ${turmasError.message}`);
  }

  const turmaList = (turmas ?? []) as TurmaBase[];

  if (!turmaList.length) {
    return [];
  }

  const turmaIds = turmaList.map((turma) => Number(turma.id));

  const [{ data: matriculas, error: matriculasError }, { data: encontros, error: encontrosError }] =
    await Promise.all([
      supabase
        .from("matriculas")
        .select("id, turma_id, aluno_id")
        .in("turma_id", turmaIds)
        .eq("status", "ativa"),
      supabase
        .from("encontros_turma")
        .select("id, turma_id, data_encontro, status")
        .in("turma_id", turmaIds)
        .order("data_encontro", { ascending: false }),
    ]);

  if (matriculasError) {
    throw new Error(`Erro ao carregar matrículas: ${matriculasError.message}`);
  }

  if (encontrosError) {
    throw new Error(`Erro ao carregar encontros: ${encontrosError.message}`);
  }

  const encontroIds = (encontros ?? []).map((encontro) => Number(encontro.id));

  const { data: presencas, error: presencasError } = encontroIds.length
    ? await supabase
        .from("presencas")
        .select("id, encontro_turma_id, matricula_id, status")
        .in("encontro_turma_id", encontroIds)
    : { data: [] as PresencaRow[], error: null };

  if (presencasError) {
    throw new Error(`Erro ao carregar presenças: ${presencasError.message}`);
  }

  const matriculasList = (matriculas ?? []) as MatriculaRow[];
  const encontrosList = (encontros ?? []) as EncontroRow[];
  const presencasList = (presencas ?? []) as PresencaRow[];

  const alunosCountByTurmaId = new Map<number, number>();
  for (const matricula of matriculasList) {
    alunosCountByTurmaId.set(
      Number(matricula.turma_id),
      (alunosCountByTurmaId.get(Number(matricula.turma_id)) ?? 0) + 1
    );
  }

  const presenceTotalsByEncontroId = new Map<
    number,
    { totalPresencas: number; totalFaltas: number; totalJustificadas: number }
  >();

  for (const presenca of presencasList) {
    const encontroId = Number(presenca.encontro_turma_id);
    const current = presenceTotalsByEncontroId.get(encontroId) ?? {
      totalPresencas: 0,
      totalFaltas: 0,
      totalJustificadas: 0,
    };

    if (presenca.status === "presente") {
      current.totalPresencas += 1;
    } else if (presenca.status === "justificada") {
      current.totalJustificadas += 1;
    } else {
      current.totalFaltas += 1;
    }

    presenceTotalsByEncontroId.set(encontroId, current);
  }

  const overviewByTurmaId = new Map<number, TurmaPresencaOverview>();
  for (const turma of turmaList) {
    overviewByTurmaId.set(Number(turma.id), emptyOverview(turma));
  }

  for (const turma of overviewByTurmaId.values()) {
    turma.totalAlunos = alunosCountByTurmaId.get(Number(turma.id)) ?? 0;
  }

  for (const encontro of encontrosList) {
    const turmaId = Number(encontro.turma_id);
    const turma = overviewByTurmaId.get(turmaId);

    if (!turma) continue;

    const totals = presenceTotalsByEncontroId.get(Number(encontro.id)) ?? {
      totalPresencas: 0,
      totalFaltas: 0,
      totalJustificadas: 0,
    };

    turma.totalEncontros += 1;
    turma.totalPresencas += totals.totalPresencas;
    turma.totalFaltas += totals.totalFaltas;
    turma.totalJustificadas += totals.totalJustificadas;

    if (!turma.ultimoEncontro) {
      turma.ultimoEncontro = encontro.data_encontro;
    }

    turma.encontros.push({
      id: Number(encontro.id),
      data_encontro: encontro.data_encontro,
      status: encontro.status,
      totalPresencas: totals.totalPresencas,
      totalFaltas: totals.totalFaltas,
      totalJustificadas: totals.totalJustificadas,
    });
  }

  return turmaList
    .map((turma) => overviewByTurmaId.get(Number(turma.id)) ?? emptyOverview(turma))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export async function getProfessorTurmaPresencaHistorico(
  supabase: SupabaseClient,
  turma: TurmaBase
): Promise<TurmaPresencaHistorico> {
  const turmaId = Number(turma.id);

  const { data: matriculas, error: matriculasError } = await supabase
    .from("matriculas")
    .select("id, turma_id, aluno_id")
    .eq("turma_id", turmaId)
    .eq("status", "ativa")
    .order("created_at");

  if (matriculasError) {
    throw new Error(`Erro ao carregar matrículas: ${matriculasError.message}`);
  }

  const matriculasList = (matriculas ?? []) as MatriculaRow[];
  const alunoIds = matriculasList.map((matricula) => Number(matricula.aluno_id));

  const { data: alunos, error: alunosError } = alunoIds.length
    ? await supabase
        .from("alunos")
        .select("id, nome")
        .in("id", alunoIds)
        .order("nome")
    : { data: [] as AlunoRow[], error: null };

  if (alunosError) {
    throw new Error(`Erro ao carregar alunos: ${alunosError.message}`);
  }

  const { data: encontros, error: encontrosError } = await supabase
    .from("encontros_turma")
    .select("id, turma_id, data_encontro, status")
    .eq("turma_id", turmaId)
    .order("data_encontro", { ascending: false });

  if (encontrosError) {
    throw new Error(`Erro ao carregar encontros: ${encontrosError.message}`);
  }

  const encontrosList = (encontros ?? []) as EncontroRow[];
  const encontroIds = encontrosList.map((encontro) => Number(encontro.id));

  const { data: presencas, error: presencasError } = encontroIds.length
    ? await supabase
        .from("presencas")
        .select("id, encontro_turma_id, matricula_id, status")
        .in("encontro_turma_id", encontroIds)
    : { data: [] as PresencaRow[], error: null };

  if (presencasError) {
    throw new Error(`Erro ao carregar presenças: ${presencasError.message}`);
  }

  const alunosById = new Map<number, AlunoRow>();
  for (const aluno of (alunos ?? []) as AlunoRow[]) {
    alunosById.set(Number(aluno.id), aluno);
  }

  const matriculasById = new Map<number, MatriculaRow>();
  for (const matricula of matriculasList) {
    matriculasById.set(Number(matricula.id), matricula);
  }

  const registrosByEncontroId = new Map<
    number,
    Array<{
      matriculaId: number;
      alunoId: number | null;
      alunoNome: string;
      status: string;
    }>
  >();

  let totalPresencas = 0;
  let totalFaltas = 0;
  let totalJustificadas = 0;

  for (const presenca of (presencas ?? []) as PresencaRow[]) {
    const matricula = matriculasById.get(Number(presenca.matricula_id));
    const aluno = matricula
      ? alunosById.get(Number(matricula.aluno_id))
      : null;

    const encontroId = Number(presenca.encontro_turma_id);
    const current = registrosByEncontroId.get(encontroId) ?? [];

    current.push({
      matriculaId: Number(presenca.matricula_id),
      alunoId: matricula ? Number(matricula.aluno_id) : null,
      alunoNome: aluno?.nome || "Aluno não encontrado",
      status: presenca.status,
    });

    registrosByEncontroId.set(encontroId, current);

    if (presenca.status === "presente") {
      totalPresencas += 1;
    } else if (presenca.status === "justificada") {
      totalJustificadas += 1;
    } else {
      totalFaltas += 1;
    }
  }

  return {
    turma,
    totalAlunos: matriculasList.length,
    totalEncontros: encontrosList.length,
    totalPresencas,
    totalFaltas,
    totalJustificadas,
    encontros: encontrosList.map((encontro) => {
      const registros = (registrosByEncontroId.get(Number(encontro.id)) ?? []).sort(
        (a, b) => a.alunoNome.localeCompare(b.alunoNome)
      );

      return {
        id: Number(encontro.id),
        data_encontro: encontro.data_encontro,
        status: encontro.status,
        totalPresencas: registros.filter((item) => item.status === "presente").length,
        totalFaltas: registros.filter((item) => item.status === "falta").length,
        totalJustificadas: registros.filter((item) => item.status === "justificada")
          .length,
        registros,
      };
    }),
  };
}
