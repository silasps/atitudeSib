import { NextResponse } from "next/server";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";
import { getProfessorTurmaPresencaHistorico } from "@/lib/professor-presencas";

export async function GET(
  _: Request,
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

    const historico = await getProfessorTurmaPresencaHistorico(
      dataSupabase,
      turma as {
        id: number;
        nome: string;
        status?: string | null;
        dias_horarios?: string | null;
        horario_inicio?: string | null;
        horario_fim?: string | null;
        duracao_horas?: number | null;
      }
    );

    return NextResponse.json({
      ...historico,
      contaConectada: user.email ?? user.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
