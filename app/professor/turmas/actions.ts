"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";

function textValue(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed.length ? parsed : null;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function getCurrentActorKey() {
  const { dataSupabase, user, allowed, role } = await getProfessorServerContext();

  if (!user) {
    redirect("/login");
  }

  if (!allowed) {
    redirect("/acesso-negado");
  }

  if (!dataSupabase) {
    throw new Error("Configuração do Supabase indisponível para ações do professor.");
  }

  return {
    supabase: dataSupabase,
    actorKey: user.id,
    user,
    role,
  };
}

async function ensureProfessorTurmaAccess(
  supabase: Awaited<ReturnType<typeof getCurrentActorKey>>["supabase"],
  turmaId: number,
  userId: string
) {
  const turma = await getProfessorTurma(supabase, turmaId, userId, "id");

  if (!turma) {
    throw new Error("Turma não encontrada ou acesso negado.");
  }
}

async function ensureMatriculasDaTurma(
  supabase: Awaited<ReturnType<typeof getCurrentActorKey>>["supabase"],
  turmaId: number,
  matriculaIds: number[]
) {
  if (!matriculaIds.length) {
    return;
  }

  const { data, error } = await supabase
    .from("matriculas")
    .select("id")
    .eq("turma_id", turmaId)
    .in("id", matriculaIds);

  if (error) {
    throw new Error(`Erro ao validar matrículas: ${error.message}`);
  }

  const allowedIds = new Set(
    (data ?? []).map((item: { id: number | string }) => Number(item.id))
  );

  if (matriculaIds.some((id) => !allowedIds.has(id))) {
    throw new Error("Foram informadas matrículas inválidas para esta turma.");
  }
}

async function ensureAlunoDaTurma(
  supabase: Awaited<ReturnType<typeof getCurrentActorKey>>["supabase"],
  turmaId: number,
  alunoId: number
) {
  const { data, error } = await supabase
    .from("matriculas")
    .select("id")
    .eq("turma_id", turmaId)
    .eq("aluno_id", alunoId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao validar aluno da turma: ${error.message}`);
  }

  if (!data) {
    throw new Error("Aluno não vinculado à turma informada.");
  }
}

async function ensureAtividadeDaTurma(
  supabase: Awaited<ReturnType<typeof getCurrentActorKey>>["supabase"],
  turmaId: number,
  atividadeId: number
) {
  const { data, error } = await supabase
    .from("atividades_turma")
    .select("id")
    .eq("id", atividadeId)
    .eq("turma_id", turmaId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao validar atividade da turma: ${error.message}`);
  }

  if (!data) {
    throw new Error("Atividade não encontrada para a turma informada.");
  }
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

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

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

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

  const { data: encontroInicial, error: encontroError } = await supabase
    .from("encontros_turma")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("data_encontro", dataEncontro)
    .maybeSingle();

  let encontro = encontroInicial;

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

  await ensureMatriculasDaTurma(
    supabase,
    turmaId,
    rows.map((row) => row.matricula_id)
  );

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
  const { supabase, actorKey } = await getCurrentActorKey();

  const encontroId = numberValue(formData.get("encontro_id"));
  const turmaId = numberValue(formData.get("turma_id"));
  const returnPath =
    textValue(formData.get("return_path")) || "/professor/turmas";

  if (!encontroId || !turmaId) {
    throw new Error("Encontro inválido.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

  const { error } = await supabase
    .from("encontros_turma")
    .update({
      status: "fechado",
      fechado_em: new Date().toISOString(),
    })
    .eq("id", encontroId)
    .eq("turma_id", turmaId);

  if (error) {
    throw new Error(`Erro ao fechar encontro: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(returnPath);
  redirect(returnPath);
}

// --- Materiais, atividades, comunicados e avaliações ---

export async function createMaterialAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const turmaId = numberValue(formData.get("turma_id"));
  const titulo = textValue(formData.get("titulo"));
  const descricao = textValue(formData.get("descricao"));
  const tipo = textValue(formData.get("tipo")) || "documento";
  const visibilidade = textValue(formData.get("visibilidade")) || "todos";
  const fileUrl = textValue(formData.get("file_url"));
  const storagePath = textValue(formData.get("storage_path"));

  if (!turmaId || !titulo) {
    throw new Error("Turma ou titulo inválidos.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

  const { error } = await supabase.from("turma_materiais").insert({
    turma_id: turmaId,
    titulo,
    descricao,
    tipo,
    visibilidade,
    file_url: fileUrl,
    storage_path: storagePath,
    criado_por: actorKey,
  });

  if (error) {
    throw new Error(`Erro ao criar material: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(`/professor/turmas/${turmaId}/materiais`);
  return { ok: true };
}

export async function createAtividadeAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const turmaId = numberValue(formData.get("turma_id"));
  const titulo = textValue(formData.get("titulo"));
  const descricao = textValue(formData.get("descricao"));
  const dataEntrega = textValue(formData.get("data_entrega"));
  const anexosJson = textValue(formData.get("anexos_json"));
  const status = textValue(formData.get("status")) || "ativa";

  if (!turmaId || !titulo) {
    throw new Error("Turma ou titulo inválidos.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

  const { error } = await supabase.from("atividades_turma").insert({
    turma_id: turmaId,
    titulo,
    descricao,
    data_entrega: dataEntrega,
    status,
    anexos_json: anexosJson,
    criado_por: actorKey,
  });

  if (error) {
    throw new Error(`Erro ao criar atividade: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(`/professor/turmas/${turmaId}/atividades`);
  return { ok: true };
}

export async function createComunicadoAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const turmaId = numberValue(formData.get("turma_id"));
  const titulo = textValue(formData.get("titulo"));
  const corpo = textValue(formData.get("corpo"));
  const publico = textValue(formData.get("publico")) || "todos";
  const anexosJson = textValue(formData.get("anexos_json"));

  if (!turmaId || !titulo || !corpo) {
    throw new Error("Dados do comunicado inválidos.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);

  const { error } = await supabase.from("comunicados_turma").insert({
    turma_id: turmaId,
    titulo,
    corpo,
    publico,
    anexos_json: anexosJson,
    criado_por: actorKey,
    publicado_em: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Erro ao criar comunicado: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(`/professor/turmas/${turmaId}/comunicados`);
  return { ok: true };
}

export async function createAvaliacaoAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const alunoId = numberValue(formData.get("aluno_id"));
  const turmaId = numberValue(formData.get("turma_id"));
  const tipo = textValue(formData.get("tipo")) || "observacao";
  const observacao = textValue(formData.get("observacao"));

  if (!turmaId || !alunoId || !observacao) {
    throw new Error("Dados da avaliação inválidos.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);
  await ensureAlunoDaTurma(supabase, turmaId, alunoId);

  const { error } = await supabase.from("avaliacoes_aluno").insert({
    aluno_id: alunoId,
    turma_id: turmaId,
    tipo,
    observacao,
    criado_por: actorKey,
  });

  if (error) {
    throw new Error(`Erro ao registrar avaliação: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(`/professor/turmas/${turmaId}/avaliacoes`);
  return { ok: true };
}

export async function registrarEntregaAction(formData: FormData) {
  const { supabase, actorKey } = await getCurrentActorKey();

  const atividadeId = numberValue(formData.get("atividade_id"));
  const alunoId = numberValue(formData.get("aluno_id"));
  const turmaId = numberValue(formData.get("turma_id"));
  const status = textValue(formData.get("status")) || "entregue";
  const nota = numberValue(formData.get("nota"));
  const feedback = textValue(formData.get("feedback"));
  const fileUrl = textValue(formData.get("file_url"));
  const storagePath = textValue(formData.get("storage_path"));

  if (!atividadeId || !alunoId || !turmaId) {
    throw new Error("Dados da entrega inválidos.");
  }

  await ensureProfessorTurmaAccess(supabase, turmaId, actorKey);
  await ensureAtividadeDaTurma(supabase, turmaId, atividadeId);
  await ensureAlunoDaTurma(supabase, turmaId, alunoId);

  const { error } = await supabase.from("entregas_aluno").upsert(
    {
      atividade_id: atividadeId,
      aluno_id: alunoId,
      status,
      nota,
      feedback,
      file_url: fileUrl,
      storage_path: storagePath,
      entregue_em: new Date().toISOString(),
      enviado_por_user_id: actorKey,
    },
    {
      onConflict: "atividade_id,aluno_id",
    }
  );

  if (error) {
    throw new Error(`Erro ao registrar entrega: ${error.message}`);
  }

  revalidatePath(`/professor/turmas/${turmaId}`);
  revalidatePath(`/professor/turmas/${turmaId}/atividades`);
  return { ok: true };
}
