"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { PageTitle } from "@/components/ui/page-title";
import {
  getVoluntariadoParticipantStatusLabel,
  type VoluntariadoParticipantStatus,
} from "@/lib/candidatura-voluntariado-audit";
import {
  type VoluntariadoParticipanteListItem,
} from "@/lib/voluntariado-participantes";

type FilterKey = "todos" | "ativo" | "inativo" | "sem_acesso";

type ParticipantForm = {
  status: VoluntariadoParticipantStatus;
  joinedAt: string;
  leftAt: string;
  internalNotes: string;
};

type ParticipantesResponse = {
  success?: boolean;
  message?: string;
  participantes?: VoluntariadoParticipanteListItem[];
};

const EMPTY_FORM: ParticipantForm = {
  status: "ativo",
  joinedAt: "",
  leftAt: "",
  internalNotes: "",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Não informado";
  }

  const normalizedDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (normalizedDateMatch) {
    const [, year, month, day] = normalizedDateMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Não informado";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR");
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const normalizedDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

  if (normalizedDateMatch) {
    return normalizedDateMatch[1];
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function getParticipantBadge(status: VoluntariadoParticipantStatus) {
  return status === "inativo"
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";
}

function getAccessBadge(participante: VoluntariadoParticipanteListItem) {
  if (!participante.linkedAccess) {
    return {
      label: "Sem acesso",
      className: "bg-zinc-100 text-zinc-700",
      description:
        "Este participante pode seguir ativo no projeto sem ter usuário no sistema.",
    };
  }

  if (participante.linkedAccess.active) {
    return {
      label: "Acesso ativo",
      className: "bg-sky-100 text-sky-700",
      description: "Possui usuário ativo para entrar no sistema.",
    };
  }

  return {
    label: "Acesso bloqueado",
    className: "bg-amber-100 text-amber-700",
    description: "Existe usuário vinculado, mas o acesso está bloqueado.",
  };
}

function buildParticipantForm(
  participante: VoluntariadoParticipanteListItem | null
): ParticipantForm {
  if (!participante) {
    return EMPTY_FORM;
  }

  return {
    status: participante.participant.status,
    joinedAt: toDateInputValue(participante.participant.joinedAt),
    leftAt: toDateInputValue(participante.participant.leftAt),
    internalNotes: participante.participant.internalNotes ?? "",
  };
}

type ParticipantModalProps = {
  participante: VoluntariadoParticipanteListItem | null;
  isOpen: boolean;
  form: ParticipantForm;
  saving: boolean;
  message: string;
  onClose: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ParticipantModal({
  participante,
  isOpen,
  form,
  saving,
  message,
  onClose,
  onChange,
  onSubmit,
}: ParticipantModalProps) {
  if (!isOpen || !participante) {
    return null;
  }

  const accessBadge = getAccessBadge(participante);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-xl md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Participante do projeto
            </p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">
              {participante.nomeCompleto}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Aqui você registra a permanência no projeto mesmo quando não existe
              acesso ao sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-60"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-zinc-200 p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-700">
                <span className="mb-2 block font-medium text-zinc-900">
                  Situação no projeto
                </span>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <label className="text-sm text-zinc-700">
                <span className="mb-2 block font-medium text-zinc-900">
                  Entrada no projeto
                </span>
                <input
                  name="joinedAt"
                  type="date"
                  value={form.joinedAt}
                  onChange={onChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>

              <label className="text-sm text-zinc-700 md:col-span-2">
                <span className="mb-2 block font-medium text-zinc-900">
                  Data de desligamento
                </span>
                <input
                  name="leftAt"
                  type="date"
                  value={form.leftAt}
                  onChange={onChange}
                  disabled={form.status === "ativo"}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 disabled:bg-zinc-100 disabled:text-zinc-500"
                />
                <span className="mt-2 block text-xs text-zinc-500">
                  Preencha quando a pessoa sair do projeto. Se o status estiver como
                  ativo, este campo fica vazio.
                </span>
              </label>
            </div>

            <label className="block text-sm text-zinc-700">
              <span className="mb-2 block font-medium text-zinc-900">
                Observações internas
              </span>
              <textarea
                name="internalNotes"
                value={form.internalNotes}
                onChange={onChange}
                rows={5}
                placeholder="Ex.: atua nas manhãs de terça, pausou por motivos pessoais, retorno previsto para..."
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
              />
            </label>

            {message ? (
              <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                {message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar gestão do participante"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <section className="rounded-2xl border border-zinc-200 p-4 md:p-5">
              <h3 className="text-base font-semibold text-zinc-900">
                Resumo atual
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getParticipantBadge(
                    participante.participant.status
                  )}`}
                >
                  {getVoluntariadoParticipantStatusLabel(
                    participante.participant.status
                  )}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accessBadge.className}`}
                >
                  {accessBadge.label}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-700">
                <p>
                  <span className="font-medium text-zinc-900">Vaga:</span>{" "}
                  {participante.necessidade?.tituloPublico || "Não informada"}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Entrada:</span>{" "}
                  {formatDate(participante.participant.joinedAt)}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">
                    Desligamento:
                  </span>{" "}
                  {formatDate(participante.participant.leftAt)}
                </p>
                <p>
                  <span className="font-medium text-zinc-900">Acesso:</span>{" "}
                  {accessBadge.description}
                </p>
                {participante.linkedAccess?.email ? (
                  <p>
                    <span className="font-medium text-zinc-900">
                      E-mail do acesso:
                    </span>{" "}
                    {participante.linkedAccess.email}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 p-4 md:p-5">
              <h3 className="text-base font-semibold text-zinc-900">
                Histórico da participação
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Cada atualização administrativa fica registrada aqui.
              </p>

              {participante.participantHistory.length ? (
                <div className="mt-4 space-y-3">
                  {participante.participantHistory.map((entry, index) => (
                    <div
                      key={`${entry.changedAt}-${index}`}
                      className="rounded-2xl border border-zinc-200 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getParticipantBadge(
                            entry.nextStatus
                          )}`}
                        >
                          {getVoluntariadoParticipantStatusLabel(entry.nextStatus)}
                        </span>

                        <span className="text-xs text-zinc-500">
                          {formatDateTime(entry.changedAt)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-zinc-700">
                        Entrada:{" "}
                        <span className="font-medium text-zinc-900">
                          {formatDate(entry.nextJoinedAt)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-zinc-700">
                        Desligamento:{" "}
                        <span className="font-medium text-zinc-900">
                          {formatDate(entry.nextLeftAt)}
                        </span>
                      </p>

                      {entry.actorEmail ? (
                        <p className="mt-2 text-xs text-zinc-500">
                          Alterado por {entry.actorEmail}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                  Ainda não há mudanças específicas registradas para a participação
                  deste voluntário.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantesAdminPage() {
  const [participantes, setParticipantes] = useState<
    VoluntariadoParticipanteListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [selectedParticipante, setSelectedParticipante] =
    useState<VoluntariadoParticipanteListItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [form, setForm] = useState<ParticipantForm>(EMPTY_FORM);

  useEffect(() => {
    let active = true;

    async function loadParticipantes() {
      setLoading(true);

      try {
        const response = await fetch("/api/admin/voluntariado/participantes", {
          cache: "no-store",
        });
        const result = (await response.json().catch(() => ({}))) as ParticipantesResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Não foi possível carregar os participantes.");
        }

        if (!active) {
          return;
        }

        setParticipantes(result.participantes ?? []);
        setMessage("");
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);

        if (!active) {
          return;
        }

        setParticipantes([]);
        setMessage("Não foi possível carregar os participantes do projeto.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadParticipantes();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const ativos = participantes.filter(
      (item) => item.participant.status === "ativo"
    ).length;
    const inativos = participantes.filter(
      (item) => item.participant.status === "inativo"
    ).length;
    const comAcesso = participantes.filter((item) => Boolean(item.linkedAccess)).length;

    return {
      total: participantes.length,
      ativos,
      inativos,
      comAcesso,
    };
  }, [participantes]);

  const filteredParticipantes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return participantes.filter((item) => {
      if (filter === "ativo" && item.participant.status !== "ativo") {
        return false;
      }

      if (filter === "inativo" && item.participant.status !== "inativo") {
        return false;
      }

      if (filter === "sem_acesso" && item.linkedAccess) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        item.nomeCompleto,
        item.email,
        item.telefone,
        item.cidade,
        item.estado,
        item.necessidade?.tituloPublico,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [filter, participantes, searchTerm]);

  function openParticipantModal(participante: VoluntariadoParticipanteListItem) {
    setSelectedParticipante(participante);
    setForm(buildParticipantForm(participante));
    setModalMessage("");
    setShowModal(true);
  }

  function closeParticipantModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedParticipante(null);
    setForm(EMPTY_FORM);
    setModalMessage("");
  }

  function handleFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "status" && value === "ativo") {
        return {
          ...prev,
          status: "ativo",
          leftAt: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParticipante) {
      return;
    }

    setSaving(true);
    setModalMessage("");

    try {
      const response = await fetch(
        `/api/admin/voluntariado/participantes/${selectedParticipante.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        updated?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setModalMessage(result.message || "Erro ao salvar participante.");
        return;
      }

      setModalMessage(result.message || "Participante atualizado com sucesso.");

      if (!result.updated) {
        return;
      }

      const reloadResponse = await fetch("/api/admin/voluntariado/participantes", {
        cache: "no-store",
      });
      const reloadResult = (await reloadResponse.json().catch(() => ({}))) as ParticipantesResponse;

      if (!reloadResponse.ok || !reloadResult.success) {
        setModalMessage(
          reloadResult.message || "As alterações foram salvas, mas a lista não pôde ser atualizada."
        );
        return;
      }

      const nextParticipantes = reloadResult.participantes ?? [];
      setParticipantes(nextParticipantes);

      const refreshedParticipante =
        nextParticipantes.find((item) => item.id === selectedParticipante.id) ?? null;

      setSelectedParticipante(refreshedParticipante);
      setForm(buildParticipantForm(refreshedParticipante));
    } catch (error) {
      console.error("Erro ao atualizar participante:", error);
      setModalMessage("Erro ao salvar participante.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <PageTitle
                title="Participantes do projeto"
                subtitle="Gerencie quem entrou no projeto, mesmo sem acesso ao sistema, com registro de entrada, desligamento e observações internas."
              />

              <Link
                href="/admin/candidaturas-voluntariado"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
              >
                Ver candidaturas
              </Link>
            </div>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Total de participantes</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.total}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Voluntários aprovados acompanhados nesta área.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Ativos no projeto</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.ativos}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Pessoas atualmente em atuação.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Inativos</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.inativos}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Participantes com desligamento ou pausa registrada.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Com acesso no sistema</p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900">
                  {stats.comAcesso}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Acesso é opcional e não define participação.
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex-1">
                  <label className="text-sm text-zinc-700">
                    <span className="mb-2 block font-medium text-zinc-900">
                      Buscar participante
                    </span>
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar por nome, e-mail, cidade ou vaga..."
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter("todos")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      filter === "todos"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    Todos
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("ativo")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      filter === "ativo"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    Ativos
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("inativo")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      filter === "inativo"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    Inativos
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilter("sem_acesso")}
                    className={`rounded-xl px-4 py-2 text-sm font-medium ${
                      filter === "sem_acesso"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    Sem acesso
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                Depois da aprovação, o voluntário passa a aparecer aqui. A partir
                desse ponto você acompanha a participação no projeto sem depender do
                cadastro de usuário.
              </div>
            </section>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
                <p className="text-sm text-zinc-600">Carregando participantes...</p>
              </div>
            ) : filteredParticipantes.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
                <p className="text-sm text-zinc-600">
                  Nenhum participante encontrado com os filtros atuais.
                </p>
                {message ? (
                  <p className="mt-3 text-sm text-zinc-500">{message}</p>
                ) : null}
              </div>
            ) : (
              <section className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredParticipantes.map((participante) => {
                  const accessBadge = getAccessBadge(participante);

                  return (
                    <article
                      key={participante.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm text-zinc-500">
                            {participante.necessidade?.tituloPublico ||
                              "Vaga não informada"}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                            {participante.nomeCompleto}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getParticipantBadge(
                              participante.participant.status
                            )}`}
                          >
                            {getVoluntariadoParticipantStatusLabel(
                              participante.participant.status
                            )}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accessBadge.className}`}
                          >
                            {accessBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-zinc-700">
                        <p>
                          <span className="font-medium text-zinc-900">E-mail:</span>{" "}
                          {participante.email || "Não informado"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">
                            Cidade/UF:
                          </span>{" "}
                          {[participante.cidade, participante.estado]
                            .filter(Boolean)
                            .join(" / ") || "Não informado"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">
                            Entrada:
                          </span>{" "}
                          {formatDate(participante.participant.joinedAt)}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">
                            Desligamento:
                          </span>{" "}
                          {formatDate(participante.participant.leftAt)}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">
                            Última atualização:
                          </span>{" "}
                          {formatDateTime(participante.participant.lastUpdatedAt)}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                        <p className="font-medium text-zinc-900">
                          Observações internas
                        </p>
                        <p className="mt-2 leading-6">
                          {participante.participant.internalNotes ||
                            "Nenhuma observação interna registrada."}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-between">
                        <button
                          type="button"
                          onClick={() => openParticipantModal(participante)}
                          className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
                        >
                          Gerenciar participante
                        </button>

                        <Link
                          href={`/admin/candidaturas-voluntariado/${participante.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
                        >
                          Abrir candidatura
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {message && !loading ? (
              <div className="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                {message}
              </div>
            ) : null}

            <ParticipantModal
              participante={selectedParticipante}
              isOpen={showModal}
              form={form}
              saving={saving}
              message={modalMessage}
              onClose={closeParticipantModal}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
