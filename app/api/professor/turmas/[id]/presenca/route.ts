import { NextResponse } from "next/server";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";
import { parsePresencaJustificativa } from "@/lib/presenca-justificativa";

function normalizeDate(value: string | null) {
  const parsed = String(value ?? "").trim();
  return parsed || new Date().toISOString().slice(0, 10);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const turmaId = Number(id);

    if (!Number.isFinite(turmaId)) {
      return NextResponse.json({ message: "Turma inválida." }, { status: 400 });
    }

    const { dataSupabase, user, allowed } = await getProfessorServerContext();

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    if (!allowed) {
      return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
    }

    if (!dataSupabase) {
      return NextResponse.json(
        { message: "Configuração do Supabase indisponível." },
        { status: 500 }
      );
    }

    const turma = await getProfessorTurma(dataSupabase, turmaId, user.id);

    if (!turma) {
      return NextResponse.json(
        { message: "Turma não encontrada." },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const dataEncontro = normalizeDate(url.searchParams.get("data"));

    const { data: matriculas, error: matriculasError } = await dataSupabase
      .from("matriculas")
      .select("id, aluno_id")
      .eq("turma_id", turmaId)
      .eq("status", "ativa")
      .order("created_at");

    if (matriculasError) {
      return NextResponse.json(
        { message: `Erro ao carregar matrículas: ${matriculasError.message}` },
        { status: 500 }
      );
    }

    const alunoIds = (matriculas ?? []).map((item) => Number(item.aluno_id));

    const { data: alunos, error: alunosError } = alunoIds.length
      ? await dataSupabase
          .from("alunos")
          .select("id, nome, nome_responsavel")
          .in("id", alunoIds)
          .order("nome")
      : { data: [], error: null };

    if (alunosError) {
      return NextResponse.json(
        { message: `Erro ao carregar alunos: ${alunosError.message}` },
        { status: 500 }
      );
    }

    const { data: encontro, error: encontroError } = await dataSupabase
      .from("encontros_turma")
      .select("id, status")
      .eq("turma_id", turmaId)
      .eq("data_encontro", dataEncontro)
      .maybeSingle();

    if (encontroError) {
      return NextResponse.json(
        { message: `Erro ao carregar encontro: ${encontroError.message}` },
        { status: 500 }
      );
    }

    const { data: presencas, error: presencasError } = encontro
      ? await dataSupabase
          .from("presencas")
          .select("matricula_id, status, observacoes")
          .eq("encontro_turma_id", Number(encontro.id))
      : { data: [], error: null };

    if (presencasError) {
      return NextResponse.json(
        { message: `Erro ao carregar presenças: ${presencasError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      turma,
      matriculas: matriculas ?? [],
      alunos: alunos ?? [],
      encontro,
      presencas: (presencas ?? []).map((presenca) => {
        const justificativa = parsePresencaJustificativa(presenca.observacoes);

        return {
          matricula_id: presenca.matricula_id,
          status: presenca.status,
          justificativa_descricao: justificativa?.descricao ?? "",
          justificativa_documento_url: justificativa?.documentoUrl ?? null,
          justificativa_documento_nome: justificativa?.documentoNome ?? null,
          justificativa_storage_path: justificativa?.storagePath ?? null,
        };
      }),
      contaConectada: user.email ?? user.id,
      dataEncontro,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
