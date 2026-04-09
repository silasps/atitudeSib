import { NextResponse } from "next/server";
import { getProfessorServerContext } from "@/lib/professor-server";
import { getProfessorPresencasOverview } from "@/lib/professor-presencas";

export async function GET() {
  try {
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

    const turmas = await getProfessorPresencasOverview(dataSupabase, user.id);

    return NextResponse.json({
      turmas,
      contaConectada: user.email ?? user.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
