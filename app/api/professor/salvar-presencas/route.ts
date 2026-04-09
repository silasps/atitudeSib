import { NextResponse } from "next/server";
import { getProfessorServerContext, getProfessorTurma } from "@/lib/professor-server";
import {
  parsePresencaJustificativa,
  serializePresencaJustificativa,
} from "@/lib/presenca-justificativa";

function textValue(value: FormDataEntryValue | null) {
  const parsed = String(value ?? "").trim();
  return parsed.length ? parsed : null;
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const { dataSupabase, user, allowed } = await getProfessorServerContext();

    if (!user) {
      return NextResponse.json({ message: "Usuário não autenticado" }, { status: 401 });
    }

    if (!allowed) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    if (!dataSupabase) {
      return NextResponse.json(
        { message: "Configuração do Supabase indisponível." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const turmaId = numberValue(formData.get("turma_id"));
    const dataEncontro = textValue(formData.get("data_encontro"));

    if (!turmaId || !dataEncontro) {
      return NextResponse.json({ message: "Turma ou data inválida" }, { status: 400 });
    }

    // Verificar se o usuário tem acesso à turma
    const turma = await getProfessorTurma(dataSupabase, turmaId, user.id, "id");

    if (!turma) {
      return NextResponse.json({ message: "Turma não encontrada ou acesso negado" }, { status: 403 });
    }

    // Buscar ou criar encontro
    const { data: encontroInicial, error: encontroError } = await dataSupabase
      .from("encontros_turma")
      .select("*")
      .eq("turma_id", turmaId)
      .eq("data_encontro", dataEncontro)
      .maybeSingle();

    let encontro = encontroInicial;

    if (encontroError) {
      return NextResponse.json({ message: `Erro ao buscar encontro: ${encontroError.message}` }, { status: 500 });
    }

    if (!encontro) {
      const { data: novoEncontro, error: insertEncontroError } = await dataSupabase
        .from("encontros_turma")
        .insert({
          turma_id: turmaId,
          data_encontro: dataEncontro,
          status: "aberto",
          aberto_por: user.id,
        })
        .select("*")
        .single();

      if (insertEncontroError) {
        return NextResponse.json({ message: `Erro ao criar encontro: ${insertEncontroError.message}` }, { status: 500 });
      }

      encontro = novoEncontro;
    }

    const existingPresencasByMatriculaId = new Map<number, string | null>();

    if (encontro) {
      const { data: existingPresencas, error: existingPresencasError } =
        await dataSupabase
          .from("presencas")
          .select("matricula_id, observacoes")
          .eq("encontro_turma_id", Number(encontro.id));

      if (existingPresencasError) {
        return NextResponse.json(
          {
            message: `Erro ao carregar presenças existentes: ${existingPresencasError.message}`,
          },
          { status: 500 }
        );
      }

      for (const item of existingPresencas ?? []) {
        existingPresencasByMatriculaId.set(
          Number(item.matricula_id),
          item.observacoes ?? null
        );
      }
    }

    // Preparar dados das presenças
    const rows: {
      encontro_turma_id: number;
      matricula_id: number;
      status: string;
      marcado_por: string;
      observacoes: string | null;
    }[] = [];

    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("status_")) continue;

      const matriculaId = Number(key.replace("status_", ""));
      const status = String(value ?? "").trim();

      if (!Number.isFinite(matriculaId) || !status) continue;

      let observacoes: string | null = null;

      if (status === "justificada") {
        const descricao = textValue(
          formData.get(`justificativa_descricao_${matriculaId}`)
        );

        if (!descricao) {
          return NextResponse.json(
            {
              message:
                "Preencha a descrição da justificativa para todas as faltas justificadas.",
            },
            { status: 400 }
          );
        }

        const existingJustificativa = parsePresencaJustificativa(
          existingPresencasByMatriculaId.get(matriculaId)
        );

        let documentoUrl =
          textValue(formData.get(`justificativa_documento_url_${matriculaId}`)) ??
          existingJustificativa?.documentoUrl ??
          null;
        let documentoNome =
          textValue(formData.get(`justificativa_documento_nome_${matriculaId}`)) ??
          existingJustificativa?.documentoNome ??
          null;
        let storagePath =
          textValue(formData.get(`justificativa_storage_path_${matriculaId}`)) ??
          existingJustificativa?.storagePath ??
          null;

        const fileEntry = formData.get(`justificativa_documento_${matriculaId}`);

        if (fileEntry instanceof File && fileEntry.size > 0) {
          const safeName = sanitizeFileName(fileEntry.name || "documento");
          const filePath = [
            "presencas-justificativas",
            user.id,
            String(encontro.id),
            `${matriculaId}-${Date.now()}-${safeName}`,
          ].join("/");

          const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());

          const { error: uploadError } = await dataSupabase.storage
            .from("site-images")
            .upload(filePath, fileBuffer, {
              contentType: fileEntry.type || "application/octet-stream",
              upsert: false,
            });

          if (uploadError) {
            return NextResponse.json(
              {
                message: `Erro ao fazer upload do documento: ${uploadError.message}`,
              },
              { status: 500 }
            );
          }

          const {
            data: { publicUrl },
          } = dataSupabase.storage.from("site-images").getPublicUrl(filePath);

          documentoUrl = publicUrl;
          documentoNome = fileEntry.name;
          storagePath = filePath;
        }

        observacoes = serializePresencaJustificativa({
          descricao,
          documentoUrl,
          documentoNome,
          storagePath,
        });
      }

      rows.push({
        encontro_turma_id: Number(encontro.id),
        matricula_id: matriculaId,
        status,
        marcado_por: user.id,
        observacoes,
      });
    }

    if (!rows.length) {
      return NextResponse.json({ message: "Nenhuma presença foi informada" }, { status: 400 });
    }

    const { data: matriculas, error: matriculasError } = await dataSupabase
      .from("matriculas")
      .select("id")
      .eq("turma_id", turmaId)
      .in(
        "id",
        rows.map((row) => row.matricula_id)
      );

    if (matriculasError) {
      return NextResponse.json(
        { message: `Erro ao validar matrículas: ${matriculasError.message}` },
        { status: 500 }
      );
    }

    const allowedIds = new Set(
      (matriculas ?? []).map((item: { id: number | string }) => Number(item.id))
    );

    if (rows.some((row) => !allowedIds.has(row.matricula_id))) {
      return NextResponse.json(
        { message: "Foram informadas matrículas inválidas para esta turma." },
        { status: 403 }
      );
    }

    // Salvar presenças
    const { error: upsertError } = await dataSupabase.from("presencas").upsert(rows, {
      onConflict: "encontro_turma_id,matricula_id",
    });

    if (upsertError) {
      return NextResponse.json({ message: `Erro ao salvar presenças: ${upsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "Presenças salvas com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar presenças:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
