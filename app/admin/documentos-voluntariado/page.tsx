import Link from "next/link";
import { createServiceRoleClient } from "@/lib/auth-utils";
import { parseVoluntariadoAudit } from "@/lib/candidatura-voluntariado-audit";
import { PageTitle } from "@/components/ui/page-title";
import {
  DocumentosVoluntariadoClient,
  type DocumentoVoluntariadoListItem,
} from "@/components/admin/documentos-voluntariado-client";

type DocumentosRow = {
  id: number | string | null;
  nome_completo: string | null;
  cpf: string | null;
  status: string | null;
  created_at: string | null;
  termo_aceito_em: string | null;
  observacoes: string | null;
  necessidade:
    | {
        titulo_publico: string | null;
      }
    | Array<{
        titulo_publico: string | null;
      }>
    | null;
};

type NecessidadeOptionRow = {
  titulo_publico: string | null;
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function buildActivityOptions(
  activeNeeds: NecessidadeOptionRow[],
  items: DocumentoVoluntariadoListItem[]
) {
  const ordered = [
    ...activeNeeds.map((item) => normalizeText(item.titulo_publico)),
    ...items.map((item) => normalizeText(item.necessidadeTitulo)),
  ].filter(Boolean);

  return Array.from(new Set(ordered)).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

export default async function AdminDocumentosVoluntariadoPage() {
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Nao foi possivel acessar o service role do Supabase para montar a central
        de documentos.
      </div>
    );
  }

  const [{ data, error }, { data: activeNeedsData }] = await Promise.all([
    supabase
      .from("candidaturas_voluntariado")
      .select(
        `
          id,
          nome_completo,
          cpf,
          status,
          created_at,
          termo_aceito_em,
          observacoes,
          necessidade:necessidade_id (
            titulo_publico
          )
        `
      )
      .eq("termo_aceito", true)
      .order("termo_aceito_em", { ascending: false }),
    supabase
      .from("necessidades_voluntariado")
      .select("titulo_publico")
      .eq("status", "aberta")
      .order("titulo_publico", { ascending: true }),
  ]);

  const items: DocumentoVoluntariadoListItem[] = ((data ?? []) as DocumentosRow[]).map(
    (item) => {
      const necessidadeValue = Array.isArray(item.necessidade)
        ? item.necessidade[0]
        : item.necessidade;
      const parsed = parseVoluntariadoAudit(item.observacoes);
      const imageDecision = parsed.audit?.documents.find(
        (document) => document.key === "uso_imagem"
      );
      const lgpdAccepted =
        parsed.audit?.documents.some(
          (document) =>
            document.key === "lgpd_privacidade" &&
            document.decision === "accepted"
        ) ?? false;

      return {
        id: Number(item.id),
        nomeCompleto: item.nome_completo ?? "Nao informado",
        cpf: item.cpf ?? "Nao informado",
        status: item.status ?? "pendente",
        createdAt: item.created_at ?? null,
        signedAt: item.termo_aceito_em ?? item.created_at ?? null,
        necessidadeTitulo:
          necessidadeValue?.titulo_publico ?? "Vaga nao informada",
        observacaoLivre: parsed.observacaoLivre,
        lgpdAccepted,
        imageDecision: imageDecision?.decision ?? null,
        storedArtifactsCount: parsed.audit?.artifacts?.length ?? 0,
        hasAudit: Boolean(parsed.audit),
      };
    }
  );

  const activityOptions = buildActivityOptions(
    (activeNeedsData ?? []) as NecessidadeOptionRow[],
    items
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm text-zinc-500">Governanca documental</p>
          <PageTitle
            title="Documentos assinados"
            subtitle="Consulte dossies, auditorias e consentimentos de cada candidatura."
          />
        </div>

        <Link
          href="/admin/candidaturas-voluntariado"
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
        >
          Ir para candidaturas
        </Link>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Erro ao carregar os documentos: {error.message}
        </div>
      ) : (
        <DocumentosVoluntariadoClient
          items={items}
          activityOptions={activityOptions}
        />
      )}
    </div>
  );
}
