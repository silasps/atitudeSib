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

async function getCurrentActorKey() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return {
    supabase,
    actorKey: user.id,
    user,
  };
}

export async function abrirEncontroAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const turmaId = numberValue(formData.get("turma_id"));
  const dataEncontro = textValue(formData.get("data_encontro"));
  const observacoes = textValue(formData.get("observacoes"));
  const returnPath =
    textValue(formData.get("return_path")) || "/professor/turmas";

  if (!turmaId || !dataEncontro) {
    throw new Error("Turma ou data inválida.");
  }

  const { data: encontroExistente, error: buscaError } = await supabase
    .from("encontros_turma")
    .select("id")
    .eq("turma_id", turmaId)
    .eq("data_encontro", dataEncontro)
    .maybeSingle();

  if (buscaError) {
    throw new Error(`Erro ao verificar encontro: ${buscaError.message}`);
  }

  if (!encontroExistente) {
    const { error: insertError } = await supabase.from("encontros_turma").insert({
      turma_id: turmaId,
      data_encontro: dataEncontro,
      status: "aberto",
      observacoes,
      aberto_por: actorKey,
    });

    if (insertError) {
      throw new Error(`Erro ao abrir encontro: ${insertError.message}`);
    }
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(returnPath);
  redirect(returnPath);
}

export async function salvarPresencasAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const turmaId = numberValue(formData.get("turma_id"));
  const dataEncontro = textValue(formData.get("data_encontro"));
  const returnPath =
    textValue(formData.get("return_path")) || "/professor/turmas";

  if (!turmaId || !dataEncontro) {
    throw new Error("Turma ou data inválida.");
  }

  let { data: encontro, error: encontroError } = await supabase
    .from("encontros_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("data_encontro", dataEncontro)
    .maybeSingle();

  if (encontroError) {
    throw new Error(`Erro ao buscar encontro: ${encontroError.message}`);
  }

  if (!encontro) {
    const { data: novoEncontro, error: insertEncontroError } = await supabase
      .from("encontros_turma")
      .insert({
        turma_id: turmaId,
        data_encontro: dataEncontro,
        status: "aberto",
        aberto_por: actorKey,
      })
      .select("*")
      .single();

    if (insertEncontroError) {
      throw new Error(`Erro ao criar encontro: ${insertEncontroError.message}`);
    }

    encontro = novoEncontro;
  }

  const rows: {
    encontro_turma_id: number;
    matricula_id: number;
    status: string;
    marcado_por: string;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status_")) continue;

    const matriculaId = Number(key.replace("status_", ""));
    const status = String(value ?? "").trim();

    if (!Number.isFinite(matriculaId) || !status) continue;

    rows.push({
      encontro_turma_id: Number(encontro.id),
      matricula_id: matriculaId,
      status,
      marcado_por: actorKey,
    });
  }

  if (!rows.length) {
    throw new Error("Nenhuma presença foi informada.");
  }

  const { error: upsertError } = await supabase.from("presencas").upsert(rows, {
    onConflict: "encontro_turma_id,matricula_id",
  });

  if (upsertError) {
    throw new Error(`Erro ao salvar presenças: ${upsertError.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(returnPath);
  redirect(returnPath);
}

export async function fecharEncontroAction(formData: FormData) {
  const { supabase } = await getCurrentActorKey();

  const encontroId = numberValue(formData.get("encontro_id"));
  const turmaId = numberValue(formData.get("turma_id"));
  const returnPath =
    textValue(formData.get("return_path")) || "/professor/turmas";

  if (!encontroId || !turmaId) {
    throw new Error("Encontro inválido.");
  }

  const { error } = await supabase
    .from("encontros_turma")
    .update({
      status: "fechado",
      fechado_em: new Date().toISOString(),
    })
    .eq("id", encontroId);

  if (error) {
    throw new Error(`Erro ao fechar encontro: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(returnPath);
  redirect(returnPath);
}