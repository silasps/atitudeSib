"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function textValue(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed.length ? parsed : null;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createTurmaAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = textValue(formData.get("descricao"));
  const professorUserId = textValue(formData.get("professor_user_id"));
  const diasHorarios = textValue(formData.get("dias_horarios"));
  const status = String(formData.get("status") ?? "ativa").trim();

  if (!nome) {
    throw new Error("Informe o nome da turma.");
  }

  const { data, error } = await supabase
    .from("turmas")
    .insert({
      nome,
      descricao,
      professor_user_id: professorUserId,
      dias_horarios: diasHorarios,
      status,
    })
    .select("id")
    .single();

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
  const diasHorarios = textValue(formData.get("dias_horarios"));
  const status = String(formData.get("status") ?? "ativa").trim();

  if (!id || !nome) {
    throw new Error("Dados da turma inválidos.");
  }

  const { error } = await supabase
    .from("turmas")
    .update({
      nome,
      descricao,
      professor_user_id: professorUserId,
      dias_horarios: diasHorarios,
      status,
    })
    .eq("id", id);

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