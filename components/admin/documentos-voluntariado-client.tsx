"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  getConsentLabel,
  type ConsentDecision,
} from "@/lib/candidatura-voluntariado-audit";

export type DocumentoVoluntariadoListItem = {
  id: number;
  nomeCompleto: string;
  cpf: string;
  status: string;
  createdAt: string | null;
  signedAt: string | null;
  necessidadeTitulo: string;
  observacaoLivre: string | null;
  lgpdAccepted: boolean;
  imageDecision: ConsentDecision | null;
  storedArtifactsCount: number;
  hasAudit: boolean;
};

type DocumentosVoluntariadoClientProps = {
  items: DocumentoVoluntariadoListItem[];
  activityOptions: string[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "Nao informado";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR");
}

function normalizeText(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

export function DocumentosVoluntariadoClient({
  items,
  activityOptions,
}: DocumentosVoluntariadoClientProps) {
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroAtividade, setFiltroAtividade] = useState("");
  const [filtroTopico, setFiltroTopico] = useState("todos");
  const deferredNome = useDeferredValue(filtroNome);

  const totalDocuments = items.length;
  const storedPrivately = items.filter(
    (item) => item.storedArtifactsCount > 0
  ).length;
  const imageAuthorized = items.filter(
    (item) => item.imageDecision === "accepted"
  ).length;
  const pendingReview = items.filter((item) => item.status === "pendente").length;

  const filteredItems = items.filter((item) => {
    if (
      deferredNome &&
      !normalizeText(item.nomeCompleto).includes(normalizeText(deferredNome))
    ) {
      return false;
    }

    if (
      filtroAtividade &&
      normalizeText(item.necessidadeTitulo) !== normalizeText(filtroAtividade)
    ) {
      return false;
    }

    if (filtroTopico === "privados_salvos" && item.storedArtifactsCount <= 0) {
      return false;
    }

    if (
      filtroTopico === "uso_imagem_autorizado" &&
      item.imageDecision !== "accepted"
    ) {
      return false;
    }

    if (filtroTopico === "lgpd_aceita" && !item.lgpdAccepted) {
      return false;
    }

    if (filtroTopico === "com_aceite" && !item.hasAudit) {
      return false;
    }

    return true;
  });

  const hasActiveFilters = Boolean(
    filtroNome || filtroAtividade || filtroTopico !== "todos"
  );

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Com aceite
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            {totalDocuments}
          </h2>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Privados salvos
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            {storedPrivately}
          </h2>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Uso de imagem
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            {imageAuthorized}
          </h2>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Pendentes
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900">
            {pendingReview}
          </h2>
        </article>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Filtros de documentos
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Procure por nome do voluntario e filtre pelo topico do documento ou
              pela atividade vinculada.
            </p>
          </div>

          <p className="text-sm text-zinc-500">
            {filteredItems.length} resultado
            {filteredItems.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_0.9fr_auto]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">Nome</span>
            <input
              type="text"
              value={filtroNome}
              onChange={(event) => setFiltroNome(event.target.value)}
              placeholder="Ex.: Maria Souza"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">
              Cargo ou atividade
            </span>
            <select
              value={filtroAtividade}
              onChange={(event) => setFiltroAtividade(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
            >
              <option value="">Todas as atividades</option>
              {activityOptions.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">Topico</span>
            <select
              value={filtroTopico}
              onChange={(event) => setFiltroTopico(event.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
            >
              <option value="todos">Todos os documentos</option>
              <option value="com_aceite">Com aceite</option>
              <option value="privados_salvos">Privados salvos</option>
              <option value="uso_imagem_autorizado">
                Uso de imagem autorizado
              </option>
              <option value="lgpd_aceita">LGPD aceita</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setFiltroNome("");
              setFiltroAtividade("");
              setFiltroTopico("todos");
            }}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
          >
            Limpar
          </button>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {filtroTopico !== "todos" ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                Topico:{" "}
                {filtroTopico === "com_aceite"
                  ? "Com aceite"
                  : filtroTopico === "privados_salvos"
                  ? "Privados salvos"
                  : filtroTopico === "uso_imagem_autorizado"
                  ? "Uso de imagem autorizado"
                  : "LGPD aceita"}
              </span>
            ) : null}

            {filtroNome ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                Nome: {filtroNome}
              </span>
            ) : null}

            {filtroAtividade ? (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                Atividade: {filtroAtividade}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhum documento assinado encontrado
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Assim que um voluntario concluir a assinatura do termo, o dossie dele
            aparecera aqui.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Nenhum documento encontrado para este filtro
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Ajuste os filtros acima para ampliar a busca na central de documentos.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const imageLabel = item.imageDecision
              ? getConsentLabel(item.imageDecision)
              : "Nao informado";

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">
                      {item.necessidadeTitulo}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                      {item.nomeCompleto}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "aprovado"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.status === "rejeitado"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
                  <p>
                    <span className="font-medium text-zinc-900">CPF:</span>{" "}
                    {item.cpf}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Assinado em:</span>{" "}
                    {formatDateTime(item.signedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Recebida em:</span>{" "}
                    {formatDateTime(item.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Uso de imagem:</span>{" "}
                    {imageLabel}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">LGPD:</span>{" "}
                    {item.lgpdAccepted ? "Aceita" : "Nao registrada"}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-900">Fonte:</span>{" "}
                    {item.storedArtifactsCount > 0
                      ? "Storage privado"
                      : item.hasAudit
                      ? "Gerado sob demanda"
                      : "Cadastro legado"}
                  </p>
                </div>

                {item.observacaoLivre ? (
                  <p className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                    {item.observacaoLivre}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={`/api/admin/voluntariado/candidaturas/${item.id}/documento?kind=dossie_html&download=0`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Abrir dossie
                  </a>

                  <a
                    href={`/api/admin/voluntariado/candidaturas/${item.id}/documento?kind=dossie_html&download=1`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
                  >
                    Baixar HTML
                  </a>

                  <a
                    href={`/api/admin/voluntariado/candidaturas/${item.id}/documento?kind=auditoria_json&download=0`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
                  >
                    Abrir auditoria tecnica
                  </a>

                  <Link
                    href={`/admin/candidaturas-voluntariado/${item.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900"
                  >
                    Abrir candidatura
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
