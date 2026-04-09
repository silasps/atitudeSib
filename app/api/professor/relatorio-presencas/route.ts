import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";
import { getProfessorTurmaPresencaHistorico } from "@/lib/professor-presencas";

type TurmaOption = {
  id: number;
  nome: string;
};

type RelatorioFilters = {
  tipo?: string;
  turmaId?: string;
  alunoId?: string;
  startDate?: string;
  endDate?: string;
};

function getProfessorLabel(user: {
  nome?: string | null;
  full_name?: string | null;
  email?: string | null;
} | null) {
  return user?.nome || user?.full_name || user?.email || "Não informado";
}

async function getProfessorResponsavelNome(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string | null
) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data) {
    return getProfessorLabel(data);
  }

  if (userEmail) {
    const { data: byEmail, error: byEmailError } = await supabase
      .from("admin_users")
      .select("*")
      .ilike("email", userEmail)
      .maybeSingle();

    if (!byEmailError && byEmail) {
      return getProfessorLabel(byEmail);
    }
  }

  return userEmail || "Não informado";
}

async function getProfessorTurmasAtivas(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("turmas")
    .select("id, nome")
    .eq("professor_user_id", userId)
    .eq("status", "ativa")
    .order("nome");

  if (error) {
    throw new Error(`Erro ao carregar turmas: ${error.message}`);
  }

  return data as TurmaOption[];
}

export async function GET(req: Request) {
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

    const turmas = await getProfessorTurmasAtivas(dataSupabase, user.id);
    const url = new URL(req.url);
    const turmaIdParam = url.searchParams.get("turmaId")?.trim() ?? "";

    if (!turmaIdParam) {
      return NextResponse.json({
        turmas,
        contaConectada: user.email ?? user.id,
      });
    }

    const turmaId = Number(turmaIdParam);

    if (!Number.isInteger(turmaId) || turmaId <= 0) {
      return NextResponse.json(
        { message: "Turma inválida." },
        { status: 400 }
      );
    }

    const turma = await getProfessorTurma(dataSupabase, turmaId, user.id, "id, nome");

    if (!turma) {
      return NextResponse.json(
        { message: "Turma não encontrada." },
        { status: 404 }
      );
    }

    const { data: matriculas, error: matriculasError } = await dataSupabase
      .from("matriculas")
      .select("aluno:alunos(id, nome)")
      .eq("turma_id", turmaId)
      .eq("status", "ativa");

    if (matriculasError) {
      return NextResponse.json(
        { message: `Erro ao carregar alunos: ${matriculasError.message}` },
        { status: 500 }
      );
    }

    const alunoMap = new Map<string, { id: number; nome: string }>();

    for (const item of matriculas ?? []) {
      const alunoValue = (
        item as { aluno?: { id: number; nome: string } | Array<{ id: number; nome: string }> | null }
      ).aluno;
      const aluno = Array.isArray(alunoValue) ? alunoValue[0] : alunoValue;
      if (!aluno) continue;
      alunoMap.set(String(aluno.id), aluno);
    }

    return NextResponse.json({
      turmas,
      alunos: Array.from(alunoMap.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome)
      ),
      contaConectada: user.email ?? user.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = (await req.json()) as RelatorioFilters;
    const tipo = String(body.tipo ?? "turma").trim();
    const turmaId = String(body.turmaId ?? "").trim();
    const alunoId = String(body.alunoId ?? "").trim();
    const startDate = String(body.startDate ?? "").trim();
    const endDate = String(body.endDate ?? "").trim();

    const turmasAtivas = await getProfessorTurmasAtivas(dataSupabase, user.id);
    const professorResponsavel = await getProfessorResponsavelNome(
      dataSupabase,
      user.id,
      user.email
    );

    let turmasSelecionadas = turmasAtivas;

    if (tipo === "turma" || tipo === "aluno") {
      if (!turmaId) {
        return NextResponse.json(
          { message: "Selecione uma turma para gerar o relatório." },
          { status: 400 }
        );
      }

      turmasSelecionadas = turmasAtivas.filter(
        (turma) => String(turma.id) === turmaId
      );

      if (!turmasSelecionadas.length) {
        return NextResponse.json(
          { message: "Turma não encontrada ou acesso negado." },
          { status: 404 }
        );
      }
    }

    if (tipo === "aluno" && !alunoId) {
      return NextResponse.json(
        { message: "Selecione um aluno para gerar o relatório." },
        { status: 400 }
      );
    }

    const turmas = await Promise.all(
      turmasSelecionadas.map(async (turmaSelecionada) => {
        const turmaCompleta = await getProfessorTurma(
          dataSupabase,
          turmaSelecionada.id,
          user.id,
          "id, nome, status, dias_horarios"
        );

        if (!turmaCompleta) {
          return null;
        }

        const historico = await getProfessorTurmaPresencaHistorico(
          dataSupabase,
          turmaCompleta as {
            id: number;
            nome: string;
            status?: string | null;
            dias_horarios?: string | null;
          }
        );

        const encontrosFiltrados = historico.encontros
          .filter((encontro) => {
            if (startDate && encontro.data_encontro < startDate) {
              return false;
            }

            if (endDate && encontro.data_encontro > endDate) {
              return false;
            }

            return true;
          })
          .map((encontro) => {
            if (tipo !== "aluno") {
              return encontro;
            }

            return {
              ...encontro,
              registros: encontro.registros.filter(
                (registro) => String(registro.alunoId ?? "") === alunoId
              ),
            };
          })
          .filter((encontro) =>
            tipo === "aluno" ? encontro.registros.length > 0 : true
          );

        return {
          nome: turmaSelecionada.nome,
          professorResponsavel,
          encontros: encontrosFiltrados.map((encontro) => ({
            data: encontro.data_encontro,
            presencas: encontro.registros.map((registro) => ({
              aluno: registro.alunoNome,
              status: registro.status,
            })),
          })),
          estatisticas: {
            totalEncontros: encontrosFiltrados.length,
            totalHoras: 0,
          },
        };
      })
    );

    return NextResponse.json({
      turmas: turmas.filter(Boolean),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
