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

export async function createAlunoAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const nome = String(formData.get("nome") ?? "").trim();
  const dataNascimento = textValue(formData.get("data_nascimento"));
  const nomeResponsavel = String(formData.get("nome_responsavel") ?? "").trim();
  const telefoneResponsavel = String(
    formData.get("telefone_responsavel") ?? ""
  ).trim();
  const observacoes = textValue(formData.get("observacoes"));
  const status = String(formData.get("status") ?? "ativo").trim();

  if (!nome || !nomeResponsavel || !telefoneResponsavel) {
    throw new Error("Preencha nome, responsável e telefone.");
  }

  const { data, error } = await supabase
    .from("alunos")
    .insert({
      nome,
      data_nascimento: dataNascimento,
      nome_responsavel: nomeResponsavel,
      telefone_responsavel: telefoneResponsavel,
      observacoes,
      status,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Erro ao criar aluno: ${error.message}`);
  }

  revalidatePath("/admin/alunos");
  redirect(`/admin/alunos/${data.id}`);
}

export async function updateAlunoAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = numberValue(formData.get("id"));
  const nome = String(formData.get("nome") ?? "").trim();
  const dataNascimento = textValue(formData.get("data_nascimento"));
  const nomeResponsavel = String(formData.get("nome_responsavel") ?? "").trim();
  const telefoneResponsavel = String(
    formData.get("telefone_responsavel") ?? ""
  ).trim();
  const observacoes = textValue(formData.get("observacoes"));
  const status = String(formData.get("status") ?? "ativo").trim();

  if (!id || !nome || !nomeResponsavel || !telefoneResponsavel) {
    throw new Error("Dados do aluno inválidos.");
  }

  const { error } = await supabase
    .from("alunos")
    .update({
      nome,
      data_nascimento: dataNascimento,
      nome_responsavel: nomeResponsavel,
      telefone_responsavel: telefoneResponsavel,
      observacoes,
      status,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao atualizar aluno: ${error.message}`);
  }

  revalidatePath("/admin/alunos");
  revalidatePath(`/admin/alunos/${id}`);
}