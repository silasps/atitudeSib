"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/ui/page-title";
import { VoluntariadoConsentReport } from "@/components/admin/voluntariado-consent-report";
import {
  getVoluntariadoCandidaturaStatusLabel,
  normalizeVoluntariadoCandidaturaStatus,
  parseVoluntariadoAudit,
  type VoluntariadoCandidaturaStatus,
} from "@/lib/candidatura-voluntariado-audit";

type NecessidadeRow =
  | {
      id: number | string | null;
      titulo_publico: string | null;
      quantidade_total: number | string | null;
      quantidade_aprovada: number | string | null;
      status: string | null;
      exibir_publicamente?: boolean | null;
    }
  | Array<{
      id: number | string | null;
      titulo_publico: string | null;
      quantidade_total: number | string | null;
      quantidade_aprovada: number | string | null;
      status: string | null;
      exibir_publicamente?: boolean | null;
    }>
  | null;

type CandidaturaRow = {
  id: number | string | null;
  necessidade_id: number | string | null;
  nome_completo: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  status: string | null;
  termo_aceito: boolean | null;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string | null;
  necessidade: NecessidadeRow;
};

type LinkedAccessInfo = {
  userId: string;
  email: string | null;
  nome: string | null;
  role: string | null;
  active: boolean;
} | null;

type CandidaturaDetalhe = {
  id: number;
  necessidade_id: number;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  disponibilidade: string | null;
  observacoes: string | null;
  status: VoluntariadoCandidaturaStatus;
  termo_aceito: boolean;
  termo_aceito_em: string | null;
  termo_versao: string | null;
  created_at: string;
  necessidade: {
    id: number;
    titulo_publico: string;
    quantidade_total: number;
    quantidade_aprovada: number;
    status: string;
  } | null;
};

type EditForm = {
  nome_completo: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  disponibilidade: string;
};

type StatusActionKind = "approve" | "approve_with_access" | "reject";

type StatusModalProps = {
  candidatura: CandidaturaDetalhe;
  linkedAccess: LinkedAccessInfo;
  isOpen: boolean;
  loading: boolean;
  selectedAction: StatusActionKind;
  onSelectAction: (action: StatusActionKind) => void;
  onClose: () => void;
  onConfirm: () => void;
  userForm: {
    email: string;
    password: string;
    role: string;
  };
  onUserFormChange: (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

const EMPTY_EDIT_FORM: EditForm = {
  nome_completo: "",
  cpf: "",
  rg: "",
  data_nascimento: "",
  email: "",
  telefone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  disponibilidade: "",
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informado";
  return new Date(dateString).toLocaleString("pt-BR");
}

function getStatusBadgeClass(status: VoluntariadoCandidaturaStatus) {
  if (status === "aprovado") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejeitado") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getAccessBadge(linkedAccess: LinkedAccessInfo) {
  if (!linkedAccess) {
    return {
      label: "Sem acesso criado",
      className: "bg-zinc-100 text-zinc-700",
      description:
        "Nenhum usuário do sistema está vinculado a esta candidatura até o momento.",
    };
  }

  if (linkedAccess.active) {
    return {
      label: "Acesso ativo",
      className: "bg-emerald-100 text-emerald-700",
      description:
        "Este voluntário possui um usuário ativo e pode entrar no sistema com este acesso.",
    };
  }

  return {
    label: "Acesso bloqueado",
    className: "bg-red-100 text-red-700",
    description:
      "Existe um usuário vinculado, mas ele está impedido de acessar o sistema no momento.",
  };
}

function buildTemporaryPassword(candidatura: CandidaturaDetalhe | null) {
  if (!candidatura) {
    return "";
  }

  const cpfDigits = candidatura.cpf.replace(/\D/g, "").slice(0, 3);
  const firstName = candidatura.nome_completo.trim().split(/\s+/)[0] ?? "";
  const normalizedFirstName = firstName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "");

  return `${normalizedFirstName}${cpfDigits}`;
}

function normalizeCandidatura(data: CandidaturaRow): CandidaturaDetalhe {
  const necessidadeValue = Array.isArray(data.necessidade)
    ? data.necessidade[0]
    : data.necessidade;

  return {
    id: Number(data.id),
    necessidade_id: Number(data.necessidade_id),
    nome_completo: data.nome_completo ?? "",
    cpf: data.cpf ?? "",
    rg: data.rg ?? null,
    data_nascimento: data.data_nascimento ?? null,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    cep: data.cep ?? null,
    endereco: data.endereco ?? null,
    numero: data.numero ?? null,
    complemento: data.complemento ?? null,
    bairro: data.bairro ?? null,
    cidade: data.cidade ?? null,
    estado: data.estado ?? null,
    disponibilidade: data.disponibilidade ?? null,
    observacoes: data.observacoes ?? null,
    status: normalizeVoluntariadoCandidaturaStatus(data.status),
    termo_aceito: data.termo_aceito === true,
    termo_aceito_em: data.termo_aceito_em ?? null,
    termo_versao: data.termo_versao ?? null,
    created_at: data.created_at ?? "",
    necessidade: necessidadeValue
      ? {
          id: Number(necessidadeValue.id),
          titulo_publico: necessidadeValue.titulo_publico ?? "",
          quantidade_total: Number(necessidadeValue.quantidade_total ?? 0),
          quantidade_aprovada: Number(necessidadeValue.quantidade_aprovada ?? 0),
          status: necessidadeValue.status ?? "aberta",
        }
      : null,
  };
}

function buildEditForm(candidatura: CandidaturaDetalhe | null): EditForm {
  if (!candidatura) {
    return EMPTY_EDIT_FORM;
  }

  return {
    nome_completo: candidatura.nome_completo,
    cpf: candidatura.cpf,
    rg: candidatura.rg ?? "",
    data_nascimento: candidatura.data_nascimento ?? "",
    email: candidatura.email ?? "",
    telefone: candidatura.telefone ?? "",
    cep: candidatura.cep ?? "",
    endereco: candidatura.endereco ?? "",
    numero: candidatura.numero ?? "",
    complemento: candidatura.complemento ?? "",
    bairro: candidatura.bairro ?? "",
    cidade: candidatura.cidade ?? "",
    estado: candidatura.estado ?? "",
    disponibilidade: candidatura.disponibilidade ?? "",
  };
}

async function fetchCandidaturaById(id: string) {
  const response = await fetch(`/api/admin/voluntariado/candidaturas/${id}`, {
    cache: "no-store",
  });

  const result = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    candidatura?: CandidaturaRow;
    linkedAccess?: LinkedAccessInfo;
  };

  if (!response.ok || !result.success || !result.candidatura) {
    throw new Error(result.message || "Não foi possível carregar a candidatura.");
  }

  return {
    candidatura: normalizeCandidatura(result.candidatura),
    linkedAccess: result.linkedAccess ?? null,
  };
}

function getDefaultStatusAction(
  candidatura: CandidaturaDetalhe | null,
  linkedAccess: LinkedAccessInfo
): StatusActionKind {
  if (!candidatura) {
    return "approve";
  }

  if (!linkedAccess && candidatura.status === "aprovado") {
    return "approve_with_access";
  }

  if (linkedAccess?.active === false) {
    return "approve";
  }

  if (candidatura.status === "rejeitado") {
    return "approve";
  }

  if (linkedAccess?.active) {
    return "reject";
  }

  return "approve";
}

function StatusActionModal({
  candidatura,
  linkedAccess,
  isOpen,
  loading,
  selectedAction,
  onSelectAction,
  onClose,
  onConfirm,
  userForm,
  onUserFormChange,
}: StatusModalProps) {
  if (!isOpen) {
    return null;
  }

  const currentStatusLabel = getVoluntariadoCandidaturaStatusLabel(candidatura.status);
  const accessBadge = getAccessBadge(linkedAccess);
  const options = [
    {
      key: "approve" as const,
      title:
        linkedAccess?.active === false
          ? "Aprovar e reativar acesso"
          : "Aprovar candidatura",
      description:
        linkedAccess?.active === false
          ? "Mantém ou volta a candidatura para aprovada e libera novamente a entrada no sistema."
          : "Define esta candidatura como aprovada. Se já houver acesso vinculado inativo, ele será reativado.",
      visible: candidatura.status !== "aprovado" || linkedAccess?.active === false,
    },
    {
      key: "approve_with_access" as const,
      title:
        candidatura.status === "aprovado"
          ? "Criar acesso do voluntário"
          : "Aprovar e criar acesso",
      description:
        candidatura.status === "aprovado"
          ? "Mantém a candidatura aprovada e cria um usuário para este voluntário entrar no sistema."
          : "Aprova a candidatura e já cria o usuário de acesso em um único fluxo.",
      visible: !linkedAccess,
    },
    {
      key: "reject" as const,
      title:
        linkedAccess?.active === true
          ? "Rejeitar e bloquear acesso"
          : "Rejeitar candidatura",
      description:
        linkedAccess?.active === true
          ? "Marca a candidatura como rejeitada e bloqueia imediatamente o acesso vinculado."
          : "Marca a candidatura como rejeitada. Se houver um usuário ativo vinculado, ele será bloqueado.",
      visible: candidatura.status !== "rejeitado" || linkedAccess?.active === true,
    },
  ].filter((option) => option.visible);

  const selectedOption =
    options.find((option) => option.key === selectedAction) ?? options[0];

  const confirmationText =
    selectedOption?.key === "approve_with_access"
      ? candidatura.status === "aprovado"
        ? "Você está prestes a criar um acesso para um voluntário que já está aprovado."
        : "Você está prestes a aprovar esta candidatura e criar um acesso para o voluntário."
      : selectedOption?.key === "reject"
      ? "Você está prestes a rejeitar esta candidatura. Se existir acesso vinculado, ele será bloqueado."
      : linkedAccess?.active === false
      ? "Você está prestes a aprovar esta candidatura e reativar o acesso já existente."
      : "Você está prestes a aprovar esta candidatura.";

  const confirmLabel =
    selectedOption?.key === "approve_with_access"
      ? candidatura.status === "aprovado"
        ? "Confirmar criação de acesso"
        : "Confirmar aprovação e acesso"
      : selectedOption?.key === "reject"
      ? "Confirmar rejeição"
      : "Confirmar aprovação";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-xl md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Mudar status da candidatura
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Revise o que vai acontecer antes de confirmar. Esta ação impacta
              o processo da candidatura e, quando existir, o acesso do
              voluntário ao sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="self-start rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-60"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Situação atual
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                  candidatura.status
                )}`}
              >
                {currentStatusLabel}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accessBadge.className}`}
              >
                {accessBadge.label}
              </span>
            </div>
          </div>

          <div className="text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">Voluntário:</span>{" "}
              {candidatura.nome_completo}
            </p>
            <p className="mt-1">
              <span className="font-medium text-zinc-900">Vaga:</span>{" "}
              {candidatura.necessidade?.titulo_publico || "Não encontrada"}
            </p>
            <p className="mt-1">{accessBadge.description}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelectAction(option.key)}
              disabled={loading}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedOption?.key === option.key
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
              } disabled:opacity-60`}
            >
              <p className="text-sm font-semibold">{option.title}</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  selectedOption?.key === option.key
                    ? "text-zinc-200"
                    : "text-zinc-600"
                }`}
              >
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {selectedOption?.key === "approve_with_access" ? (
          <div className="mt-5 rounded-2xl border border-zinc-200 p-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Dados do novo acesso
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              O e-mail já vem preenchido com o cadastro informado na
              candidatura, mas você pode ajustar antes de confirmar.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-zinc-700">
                <span className="mb-2 block font-medium text-zinc-900">
                  E-mail de acesso
                </span>
                <input
                  name="email"
                  value={userForm.email}
                  onChange={onUserFormChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>

              <label className="text-sm text-zinc-700">
                <span className="mb-2 block font-medium text-zinc-900">
                  Perfil do usuário
                </span>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={onUserFormChange}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                >
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <label className="mt-3 block text-sm text-zinc-700">
              <span className="mb-2 block font-medium text-zinc-900">
                Senha provisória
              </span>
              <input
                name="password"
                type="text"
                value={userForm.password}
                onChange={onUserFormChange}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
              <span className="mt-2 block text-xs text-zinc-500">
                Preenchemos com o primeiro nome e os 3 primeiros números do CPF.
                Você pode trocar essa senha provisória antes de confirmar.
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-900">Confirmação</p>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            {confirmationText}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidaturaDetalhePage() {
  const params = useParams();
  const id = String(params.id);

  const [candidatura, setCandidatura] = useState<CandidaturaDetalhe | null>(null);
  const [linkedAccess, setLinkedAccess] = useState<LinkedAccessInfo>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusAction, setSelectedStatusAction] =
    useState<StatusActionKind>("approve");
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "professor",
  });

  useEffect(() => {
    let active = true;

    async function loadCandidatura() {
      setLoading(true);

      try {
        const loaded = await fetchCandidaturaById(id);

        if (!active) {
          return;
        }

        setCandidatura(loaded.candidatura);
        setLinkedAccess(loaded.linkedAccess);
        setMessage("");
      } catch (error) {
        console.error("Erro ao buscar candidatura:", error);

        if (!active) {
          return;
        }

        setCandidatura(null);
        setLinkedAccess(null);
        setMessage("Não foi possível carregar a candidatura.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCandidatura();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    setEditForm(buildEditForm(candidatura));
  }, [candidatura]);

  const auditInfo = useMemo(() => {
    return parseVoluntariadoAudit(candidatura?.observacoes);
  }, [candidatura?.observacoes]);

  const accessBadge = useMemo(() => getAccessBadge(linkedAccess), [linkedAccess]);

  const statusHistory = useMemo(() => {
    return [...(auditInfo.audit?.statusHistory ?? [])].reverse();
  }, [auditInfo.audit?.statusHistory]);

  async function refreshCandidatura() {
    const loaded = await fetchCandidaturaById(id);
    setCandidatura(loaded.candidatura);
    setLinkedAccess(loaded.linkedAccess);
    return loaded;
  }

  function prepareStatusModal() {
    setUserForm({
      email: candidatura?.email ?? linkedAccess?.email ?? "",
      password: buildTemporaryPassword(candidatura),
      role: linkedAccess?.role ?? "professor",
    });
    setSelectedStatusAction(getDefaultStatusAction(candidatura, linkedAccess));
    setShowStatusModal(true);
  }

  function handleUserFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleStartEdit() {
    setEditing(true);
    setEditMessage("");
    setEditForm(buildEditForm(candidatura));
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditMessage("");
    setEditForm(buildEditForm(candidatura));
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!candidatura) return;

    setSavingEdit(true);
    setEditMessage("");

    try {
      const response = await fetch(
        `/api/admin/voluntariado/candidaturas/${candidatura.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        updated?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setEditMessage(result.message || "Erro ao salvar alterações.");
        return;
      }

      if (result.updated) {
        await refreshCandidatura();
        setEditing(false);
      }

      setEditMessage(
        result.message || "Informações atualizadas com histórico registrado."
      );
    } catch (error) {
      console.error("Erro ao atualizar candidatura:", error);
      setEditMessage("Erro ao salvar alterações.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleConfirmStatusAction() {
    if (!candidatura) return;

    setActionLoading(true);
    setMessage("");

    try {
      const payload =
        selectedStatusAction === "approve_with_access"
          ? {
              action: selectedStatusAction,
              email: userForm.email,
              password: userForm.password,
              role: userForm.role,
            }
          : {
              action: selectedStatusAction,
            };

      const response = await fetch(
        `/api/admin/voluntariado/candidaturas/${candidatura.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        updated?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setMessage(result.message || "Erro ao atualizar o status da candidatura.");
        return;
      }

      await refreshCandidatura();
      setShowStatusModal(false);
      setMessage(result.message || "Status atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao alterar status da candidatura:", error);
      setMessage("Erro ao atualizar o status da candidatura.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm text-zinc-600">Carregando candidatura...</p>
        </div>
      </div>
    );
  }

  if (!candidatura) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm text-zinc-600">Candidatura não encontrada.</p>
          {message ? (
            <p className="mt-3 text-sm text-zinc-500">{message}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <PageTitle
                title="Analisar candidatura"
                subtitle="Revise os dados, acompanhe o processo e confirme a decisão com segurança."
              />

              <Link
                href="/admin/candidaturas-voluntariado"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
              >
                Voltar
              </Link>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6 xl:col-span-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Dados do candidato
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Corrija os dados quando identificar algum erro e deixe o
                      registro da alteração no histórico.
                    </p>
                  </div>

                  {!editing ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          candidatura.status
                        )}`}
                      >
                        {getVoluntariadoCandidaturaStatusLabel(candidatura.status)}
                      </span>

                      <button
                        type="button"
                        onClick={prepareStatusModal}
                        disabled={actionLoading || savingEdit}
                        className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
                      >
                        Mudar status
                      </button>

                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
                      >
                        Editar informações
                      </button>
                    </div>
                  ) : null}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveEdit} className="mt-5 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Nome completo
                        </span>
                        <input
                          name="nome_completo"
                          value={editForm.nome_completo}
                          onChange={handleEditInputChange}
                          required
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          CPF
                        </span>
                        <input
                          name="cpf"
                          value={editForm.cpf}
                          onChange={handleEditInputChange}
                          required
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          RG
                        </span>
                        <input
                          name="rg"
                          value={editForm.rg}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Data de nascimento
                        </span>
                        <input
                          name="data_nascimento"
                          type="date"
                          value={editForm.data_nascimento}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          E-mail
                        </span>
                        <input
                          name="email"
                          type="email"
                          value={editForm.email}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Telefone
                        </span>
                        <input
                          name="telefone"
                          value={editForm.telefone}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          CEP
                        </span>
                        <input
                          name="cep"
                          value={editForm.cep}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Endereço
                        </span>
                        <input
                          name="endereco"
                          value={editForm.endereco}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Número
                        </span>
                        <input
                          name="numero"
                          value={editForm.numero}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Complemento
                        </span>
                        <input
                          name="complemento"
                          value={editForm.complemento}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Bairro
                        </span>
                        <input
                          name="bairro"
                          value={editForm.bairro}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Cidade
                        </span>
                        <input
                          name="cidade"
                          value={editForm.cidade}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>

                      <label className="text-sm text-zinc-700">
                        <span className="mb-2 block font-medium text-zinc-900">
                          Estado
                        </span>
                        <input
                          name="estado"
                          value={editForm.estado}
                          onChange={handleEditInputChange}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>
                    </div>

                    <label className="block text-sm text-zinc-700">
                      <span className="mb-2 block font-medium text-zinc-900">
                        Disponibilidade
                      </span>
                      <textarea
                        name="disponibilidade"
                        value={editForm.disponibilidade}
                        onChange={handleEditInputChange}
                        rows={5}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                    </label>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <p className="text-sm font-medium text-zinc-900">
                        Observações enviadas pelo voluntário
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">
                        {auditInfo.observacaoLivre || "Nenhuma observação enviada."}
                      </p>
                    </div>

                    {editMessage ? (
                      <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                        {editMessage}
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingEdit}
                        className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 disabled:opacity-60"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {savingEdit ? "Salvando..." : "Salvar e registrar histórico"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mt-5 grid gap-4 text-sm text-zinc-700 md:grid-cols-2">
                      <p>
                        <span className="font-medium text-zinc-900">Nome:</span>{" "}
                        {candidatura.nome_completo}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">CPF:</span>{" "}
                        {candidatura.cpf}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">RG:</span>{" "}
                        {candidatura.rg || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">
                          Nascimento:
                        </span>{" "}
                        {candidatura.data_nascimento || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">E-mail:</span>{" "}
                        {candidatura.email || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">
                          Telefone:
                        </span>{" "}
                        {candidatura.telefone || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">CEP:</span>{" "}
                        {candidatura.cep || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">
                          Endereço:
                        </span>{" "}
                        {candidatura.endereco || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Número:</span>{" "}
                        {candidatura.numero || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">
                          Complemento:
                        </span>{" "}
                        {candidatura.complemento || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">Bairro:</span>{" "}
                        {candidatura.bairro || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-900">
                          Cidade/UF:
                        </span>{" "}
                        {[candidatura.cidade, candidatura.estado]
                          .filter(Boolean)
                          .join(" / ") || "Não informado"}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-semibold text-zinc-900">
                        Disponibilidade
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">
                        {candidatura.disponibilidade || "Não informada"}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-semibold text-zinc-900">
                        Observações
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">
                        {auditInfo.observacaoLivre ||
                          "Nenhuma observação enviada."}
                      </p>
                    </div>

                    {editMessage ? (
                      <div className="mt-6 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                        {editMessage}
                      </div>
                    ) : null}
                  </>
                )}
              </section>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Processo da candidatura
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-zinc-900">
                        Situação atual do voluntário
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          candidatura.status
                        )}`}
                      >
                        {getVoluntariadoCandidaturaStatusLabel(candidatura.status)}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accessBadge.className}`}
                      >
                        {accessBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">Vaga:</span>{" "}
                      {candidatura.necessidade?.titulo_publico || "Não encontrada"}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">
                        Recebida em:
                      </span>{" "}
                      {formatDateTime(candidatura.created_at)}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">
                        Termo aceito:
                      </span>{" "}
                      {candidatura.termo_aceito ? "Sim" : "Não"}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">Aceite em:</span>{" "}
                      {formatDateTime(candidatura.termo_aceito_em)}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">
                        Versão do termo:
                      </span>{" "}
                      {candidatura.termo_versao || "Não informada"}
                    </p>
                    {linkedAccess ? (
                      <>
                        <p>
                          <span className="font-medium text-zinc-900">
                            E-mail de acesso:
                          </span>{" "}
                          {linkedAccess.email || "Não informado"}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-900">
                            Perfil do acesso:
                          </span>{" "}
                          {linkedAccess.role || "Não informado"}
                        </p>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                    Depois da aprovação, a gestão da permanência no projeto fica em
                    <span className="font-medium text-zinc-900">
                      {" "}
                      Participantes
                    </span>
                    , onde você pode registrar ativo, inativo, entrada,
                    desligamento e observações internas sem depender do acesso ao
                    sistema.
                    <div className="mt-3">
                      <Link
                        href="/admin/participantes"
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
                      >
                        Abrir participantes
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Histórico da decisão
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Aqui aparece o andamento do processo de candidatura deste
                    voluntário sempre que o status for alterado.
                  </p>

                  {statusHistory.length ? (
                    <div className="mt-4 space-y-3">
                      {statusHistory.map((entry, index) => (
                        <div
                          key={`${entry.changedAt}-${index}`}
                          className="rounded-2xl border border-zinc-200 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                entry.nextStatus
                              )}`}
                            >
                              {getVoluntariadoCandidaturaStatusLabel(
                                entry.nextStatus
                              )}
                            </span>

                            <span className="text-xs text-zinc-500">
                              {formatDateTime(entry.changedAt)}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-zinc-700">
                            De{" "}
                            <span className="font-medium text-zinc-900">
                              {getVoluntariadoCandidaturaStatusLabel(
                                entry.previousStatus
                              )}
                            </span>{" "}
                            para{" "}
                            <span className="font-medium text-zinc-900">
                              {getVoluntariadoCandidaturaStatusLabel(
                                entry.nextStatus
                              )}
                            </span>
                            .
                          </p>

                          {entry.note ? (
                            <p className="mt-2 text-sm text-zinc-600">
                              {entry.note}
                            </p>
                          ) : null}

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
                      Ainda não há mudanças de status registradas para esta
                      candidatura.
                    </div>
                  )}
                </section>

                {message ? (
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}
              </aside>
            </div>

            <VoluntariadoConsentReport
              candidatura={candidatura}
              audit={auditInfo.audit}
              observacaoLivre={auditInfo.observacaoLivre}
              documentCenterHref="/admin/documentos-voluntariado"
              documentEndpointBase={`/api/admin/voluntariado/candidaturas/${candidatura.id}/documento`}
            />

            <StatusActionModal
              candidatura={candidatura}
              linkedAccess={linkedAccess}
              isOpen={showStatusModal}
              loading={actionLoading}
              selectedAction={selectedStatusAction}
              onSelectAction={setSelectedStatusAction}
              onClose={() => setShowStatusModal(false)}
              onConfirm={handleConfirmStatusAction}
              userForm={userForm}
              onUserFormChange={handleUserFormChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
