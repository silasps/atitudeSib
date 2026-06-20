"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  buildTurmaScheduleFields,
  parseTurmaSchedulePayload,
} from "@/lib/turma-schedule";

const TURMA_OPTIONAL_COLUMNS = new Set([
  "descricao",
  "professor_user_id",
  "status",
  "dias_horarios",
  "horario_inicio",
  "horario_fim",
  "duracao_horas",
]);

function textValue(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed.length ? parsed : null;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function scheduleTouched(formData: FormData) {
  return String(formData.get("schedule_touched") ?? "0").trim() === "1";
}

function getMissingTurmasColumn(error: { message?: string | null } | null) {
  const match = String(error?.message ?? "").match(
    /Could not find the '([^']+)' column of '([^']+)' in the schema cache/i
  );

  if (!match || match[2] !== "turmas") {
    return null;
  }

  return match[1];
}

function canDropTurmaColumn(payload: Record<string, unknown>, column: string) {
  return (
    TURMA_OPTIONAL_COLUMNS.has(column) &&
    Object.prototype.hasOwnProperty.call(payload, column)
  );
}

function omitTurmaColumn(payload: Record<string, unknown>, column: string) {
  const nextPayload = { ...payload };
  delete nextPayload[column];
  return nextPayload;
}

async function insertTurmaWithSchemaFallback(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  payload: Record<string, unknown>
) {
  let currentPayload = { ...payload };

  while (true) {
    const result = await supabase
      .from("turmas")
      .insert(currentPayload)
      .select("id")
      .single();

    if (!result.error) {
      return result;
    }

    const missingColumn = getMissingTurmasColumn(result.error);

    if (!missingColumn || !canDropTurmaColumn(currentPayload, missingColumn)) {
      return result;
    }

    currentPayload = omitTurmaColumn(currentPayload, missingColumn);
  }
}

async function updateTurmaWithSchemaFallback(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  id: number,
  payload: Record<string, unknown>
) {
  let currentPayload = { ...payload };

  while (true) {
    const result = await supabase
      .from("turmas")
      .update(currentPayload)
      .eq("id", id);

    if (!result.error) {
      return result;
    }

    const missingColumn = getMissingTurmasColumn(result.error);

    if (!missingColumn || !canDropTurmaColumn(currentPayload, missingColumn)) {
      return result;
    }

    currentPayload = omitTurmaColumn(currentPayload, missingColumn);
  }
}

export async function createTurmaAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = textValue(formData.get("descricao"));
  const professorUserId = textValue(formData.get("professor_user_id"));
  const schedulePayload = textValue(formData.get("schedule_payload"));
  const touchedSchedule = scheduleTouched(formData);
  const status = String(formData.get("status") ?? "ativa").trim();

  if (!nome) {
    throw new Error("Informe o nome da turma.");
  }

  const parsedSessions =
    touchedSchedule || schedulePayload
      ? parseTurmaSchedulePayload(schedulePayload)
      : [];
  const scheduleFields = buildTurmaScheduleFields(parsedSessions);
  const payload: Record<string, unknown> = {
    nome,
    descricao,
    professor_user_id: professorUserId,
    status,
  };

  if (scheduleFields.diasHorarios !== null) {
    payload.dias_horarios = scheduleFields.diasHorarios;
  }

  if (scheduleFields.horarioInicio !== null) {
    payload.horario_inicio = scheduleFields.horarioInicio;
  }

  if (scheduleFields.horarioFim !== null) {
    payload.horario_fim = scheduleFields.horarioFim;
  }

  const { data, error } = await insertTurmaWithSchemaFallback(supabase, payload);

  if (error) {
    throw new Error(`Erro ao criar turma: ${error.message}`);
  }

  revalidatePath("/admin/turmas");
  redirect(`/admin/turmas/${data.id}`);
}

export async function updateTurmaAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = numberValue(formData.get("id"));
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = textValue(formData.get("descricao"));
  const professorUserId = textValue(formData.get("professor_user_id"));
  const schedulePayload = textValue(formData.get("schedule_payload"));
  const touchedSchedule = scheduleTouched(formData);
  const status = String(formData.get("status") ?? "ativa").trim();

  if (!id || !nome) {
    throw new Error("Dados da turma inválidos.");
  }

  const payload: Record<string, unknown> = {
    nome,
    descricao,
    professor_user_id: professorUserId,
    status,
  };

  if (touchedSchedule) {
    const scheduleFields = buildTurmaScheduleFields(
      parseTurmaSchedulePayload(schedulePayload)
    );

    payload.dias_horarios = scheduleFields.diasHorarios;
    payload.horario_inicio = scheduleFields.horarioInicio;
    payload.horario_fim = scheduleFields.horarioFim;
  }

  const { error } = await updateTurmaWithSchemaFallback(supabase, id, payload);

  if (error) {
    throw new Error(`Erro ao atualizar turma: ${error.message}`);
  }

  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/turmas/${id}`);
}

export async function createMatriculaAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const turmaId = numberValue(formData.get("turma_id"));
  const alunoId = numberValue(formData.get("aluno_id"));
  const observacoes = textValue(formData.get("observacoes"));

  if (!turmaId || !alunoId) {
    throw new Error("Selecione um aluno para matricular.");
  }

  const { error } = await supabase.from("matriculas").insert({
    turma_id: turmaId,
    aluno_id: alunoId,
    status: "ativa",
    observacoes,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("Esse aluno já está vinculado a esta turma.");
    }

    throw new Error(`Erro ao matricular aluno: ${error.message}`);
  }

  revalidatePath(`/admin/turmas/${turmaId}`);
  revalidatePath("/admin/alunos");
}

export async function encerrarMatriculaAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const matriculaId = numberValue(formData.get("matricula_id"));
  const turmaId = numberValue(formData.get("turma_id"));

  if (!matriculaId || !turmaId) {
    throw new Error("Matrícula inválida.");
  }

  const { error } = await supabase
    .from("matriculas")
    .update({ status: "encerrada" })
    .eq("id", matriculaId);

  if (error) {
    throw new Error(`Erro ao encerrar matrícula: ${error.message}`);
  }

  revalidatePath(`/admin/turmas/${turmaId}`);
  revalidatePath("/admin/alunos");
}
