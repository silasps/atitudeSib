"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const normalized = String(value).trim();
  if (!normalized) return null;

  const safeValue = normalized.includes("T")
    ? normalized
    : `${normalized}T00:00:00`;

  const date = new Date(safeValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function Modal({ isOpen, onClose, title, description }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

interface Turma {
  id: number;
  nome: string;
}

interface Matricula {
  id: number;
  aluno_id: number;
}

interface Aluno {
  id: number;
  nome: string;
  nome_responsavel: string;
}

interface Encontro {
  id: number;
  status: string;
}

interface Presenca {
  matricula_id: number;
  status: string;
  justificativa_descricao: string;
  justificativa_documento_url: string | null;
  justificativa_documento_nome: string | null;
  justificativa_storage_path: string | null;
}

export default function ProfessorPresencaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [encontro, setEncontro] = useState<Encontro | null>(null);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", description: "" });
  const [contaConectada, setContaConectada] = useState("");
  const [statusByMatriculaId, setStatusByMatriculaId] = useState<Record<number, string>>(
    {}
  );
  const [justificativaByMatriculaId, setJustificativaByMatriculaId] = useState<
    Record<number, string>
  >({});

  const dataSelecionada = searchParams.get('data') || getTodayISO();
  const returnPath = `/professor/turmas/${params.id}/presenca?data=${dataSelecionada}`;

  const loadData = async () => {
    try {
      const turmaId = Number(params.id);
      if (!Number.isFinite(turmaId)) {
        setNotFoundState(true);
        return;
      }

      setNotFoundState(false);

      const response = await fetch(
        `/api/professor/turmas/${turmaId}/presenca?data=${encodeURIComponent(
          dataSelecionada
        )}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 404) {
        setNotFoundState(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Erro ao carregar dados da presença."
        );
      }

      const payload = await response.json();

      setTurma(payload.turma || null);
      setMatriculas(payload.matriculas || []);
      setAlunos(payload.alunos || []);
      setEncontro(payload.encontro || null);
      setPresencas(payload.presencas || []);
      setContaConectada(payload.contaConectada || "");

      const nextStatusByMatriculaId: Record<number, string> = {};
      const nextJustificativaByMatriculaId: Record<number, string> = {};

      for (const matricula of payload.matriculas || []) {
        const presenca = (payload.presencas || []).find(
          (item: Presenca) => item.matricula_id === matricula.id
        );

        nextStatusByMatriculaId[matricula.id] = presenca?.status || "presente";
        nextJustificativaByMatriculaId[matricula.id] =
          presenca?.justificativa_descricao || "";
      }

      setStatusByMatriculaId(nextStatusByMatriculaId);
      setJustificativaByMatriculaId(nextJustificativaByMatriculaId);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setModalMessage({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a página de presença.",
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, dataSelecionada]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/professor/salvar-presencas', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setModalMessage({
          title: "Presença Salva!",
          description: "As presenças foram registradas com sucesso."
        });
        setShowModal(true);
        // Recarregar dados após salvar
        await loadData();
      } else {
        const errorData = await response.json();
        setModalMessage({
          title: "Erro",
          description: errorData.message || "Ocorreu um erro ao salvar as presenças."
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Erro ao salvar presença:", error);
      setModalMessage({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as presenças."
      });
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Carregando...</div>
      </div>
    );
  }

  if (notFoundState || !turma) {
    notFound();
    return null;
  }

  const alunosById = new Map(alunos.map(aluno => [aluno.id, aluno]));
  const presencasByMatriculaId = new Map(presencas.map(presenca => [presenca.matricula_id, presenca]));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/professor/turmas/${turma.id}`}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer"
        >
          ← Voltar para turma
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">
          Presença · {turma.nome}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Controle por encontro/data.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Conta conectada: {contaConectada || "não identificada"}
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <form
          method="GET"
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="space-y-2">
            <label
              htmlFor="data"
              className="text-sm font-medium text-zinc-800"
            >
              Data do encontro
            </label>
            <input
              id="data"
              name="data"
              type="date"
              defaultValue={dataSelecionada}
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 cursor-pointer"
          >
            Carregar data
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          <p>
            <span className="font-medium text-zinc-900">Data:</span>{" "}
            {formatDate(dataSelecionada)}
          </p>
          <p className="mt-1">
            <span className="font-medium text-zinc-900">Status:</span>{" "}
            {encontro ? "Presenças registradas" : "Aguardando registro"}
          </p>
        </div>
      </div>

      {matriculas.length > 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Lista de presença · {formatDate(dataSelecionada)}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Marque a situação de cada aluno neste encontro.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input type="hidden" name="turma_id" value={String(turma.id)} />
            <input type="hidden" name="data_encontro" value={dataSelecionada} />
            <input type="hidden" name="return_path" value={returnPath} />

            {matriculas.map((matricula) => {
              const aluno = alunosById.get(matricula.aluno_id);
              const presenca = presencasByMatriculaId.get(matricula.id);
              const statusSelecionado =
                statusByMatriculaId[matricula.id] || presenca?.status || "presente";
              const justificativaAtual =
                justificativaByMatriculaId[matricula.id] ||
                presenca?.justificativa_descricao ||
                "";
              const documentoAtualUrl =
                presenca?.justificativa_documento_url || null;
              const documentoAtualNome =
                presenca?.justificativa_documento_nome || null;
              const documentoAtualStoragePath =
                presenca?.justificativa_storage_path || null;

              return (
                <div
                  key={matricula.id}
                  className="rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {aluno?.nome || "Aluno não encontrado"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Responsável: {aluno?.nome_responsavel || "—"}
                      </p>
                    </div>

                    <select
                      name={`status_${matricula.id}`}
                      value={statusSelecionado}
                      onChange={(event) =>
                        setStatusByMatriculaId((current) => ({
                          ...current,
                          [matricula.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900 md:w-52"
                    >
                      <option value="presente">Presente</option>
                      <option value="falta">Falta</option>
                      <option value="justificada">Justificada</option>
                    </select>
                  </div>

                  {statusSelecionado === "justificada" ? (
                    <div className="mt-4 space-y-4 rounded-2xl bg-zinc-50 p-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`justificativa_descricao_${matricula.id}`}
                          className="text-sm font-medium text-zinc-800"
                        >
                          Descrição da justificativa
                        </label>
                        <textarea
                          id={`justificativa_descricao_${matricula.id}`}
                          name={`justificativa_descricao_${matricula.id}`}
                          value={justificativaAtual}
                          onChange={(event) =>
                            setJustificativaByMatriculaId((current) => ({
                              ...current,
                              [matricula.id]: event.target.value,
                            }))
                          }
                          required
                          rows={3}
                          placeholder="Descreva o motivo da falta justificada"
                          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`justificativa_documento_${matricula.id}`}
                          className="text-sm font-medium text-zinc-800"
                        >
                          Documento de justificativa
                        </label>
                        <input
                          id={`justificativa_documento_${matricula.id}`}
                          name={`justificativa_documento_${matricula.id}`}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                        />
                        <p className="text-xs text-zinc-500">
                          Upload opcional. Aceita PDF, imagem ou documento.
                        </p>

                        {documentoAtualUrl ? (
                          <p className="text-sm text-zinc-600">
                            Documento atual:{" "}
                            <a
                              href={documentoAtualUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-zinc-900 underline"
                            >
                              {documentoAtualNome || "Abrir documento"}
                            </a>
                          </p>
                        ) : null}

                        <input
                          type="hidden"
                          name={`justificativa_documento_url_${matricula.id}`}
                          value={documentoAtualUrl || ""}
                        />
                        <input
                          type="hidden"
                          name={`justificativa_documento_nome_${matricula.id}`}
                          value={documentoAtualNome || ""}
                        />
                        <input
                          type="hidden"
                          name={`justificativa_storage_path_${matricula.id}`}
                          value={documentoAtualStoragePath || ""}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="submit"
                className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                Salvar presença
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            Não há alunos ativos matriculados nesta turma.
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMessage.title}
        description={modalMessage.description}
      />
    </div>
  );
}
