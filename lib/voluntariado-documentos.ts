import {
  getConsentLabel,
  type VoluntariadoAuditArtifact,
  type VoluntariadoCandidaturaAudit,
  type VoluntariadoConsentDocument,
} from "@/lib/candidatura-voluntariado-audit";

export const VOLUNTARIADO_DOCUMENTOS_BUCKET = "voluntariado-documentos";

export type VoluntariadoDocumentRecord = {
  candidaturaId: number;
  createdAt: string | null;
  termoAceito: boolean;
  termoAceitoEm: string | null;
  termoVersao: string | null;
  nomeCompleto: string;
  cpf: string;
  rg: string | null;
  dataNascimento: string | null;
  email: string | null;
  telefone: string | null;
  disponibilidade: string | null;
  observacaoLivre: string | null;
  necessidadeTitulo: string | null;
  audit: VoluntariadoCandidaturaAudit | null;
};

export type VoluntariadoGeneratedDocument = {
  artifact: VoluntariadoAuditArtifact;
  body: string;
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function escapeHtml(value?: string | null) {
  return normalizeText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value?: string | null) {
  const normalized = normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "documento";
}

function toFileSafeTimestamp(value?: string | null) {
  const raw = normalizeText(value) || new Date().toISOString();
  return raw.replace(/[:.]/g, "-");
}

function formatDateTime(value?: string | null) {
  if (!value) return "Nao informado";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("pt-BR");
}

function resolveDocuments(
  record: VoluntariadoDocumentRecord
): VoluntariadoConsentDocument[] {
  if (record.audit?.documents.length) {
    return record.audit.documents;
  }

  return [
    {
      key: "termo_adesao",
      title: "Termo de adesao ao servico voluntario",
      version: record.termoVersao || "nao informado",
      required: true,
      decision: record.termoAceito ? "accepted" : "declined",
      decidedAt: record.termoAceitoEm || record.createdAt,
    },
  ];
}

function resolveSignedAt(record: VoluntariadoDocumentRecord) {
  return (
    record.audit?.signature.signedAt ||
    record.termoAceitoEm ||
    record.createdAt ||
    new Date().toISOString()
  );
}

function buildStoragePrefix(record: VoluntariadoDocumentRecord) {
  return `candidaturas/${record.candidaturaId}/${toFileSafeTimestamp(
    resolveSignedAt(record)
  )}`;
}

function buildBaseFileName(record: VoluntariadoDocumentRecord) {
  return `candidatura-${record.candidaturaId}-${slugify(record.nomeCompleto)}`;
}

function buildAuditSnapshot(record: VoluntariadoDocumentRecord) {
  const documents = resolveDocuments(record);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    candidatura: {
      id: record.candidaturaId,
      necessidadeTitulo: record.necessidadeTitulo,
      createdAt: record.createdAt,
      termoAceito: record.termoAceito,
      termoAceitoEm: record.termoAceitoEm,
      termoVersao: record.termoVersao,
      nomeCompleto: record.nomeCompleto,
      cpf: record.cpf,
      rg: record.rg,
      dataNascimento: record.dataNascimento,
      email: record.email,
      telefone: record.telefone,
      disponibilidade: record.disponibilidade,
      observacaoLivre:
        record.audit?.observacaoLivre ?? record.observacaoLivre ?? null,
    },
    documents,
    signature: record.audit?.signature ?? null,
    candidateSnapshot: record.audit?.candidateSnapshot ?? null,
    artifacts: record.audit?.artifacts ?? [],
  };
}

function renderDocumentDecision(document: VoluntariadoConsentDocument) {
  const label = getConsentLabel(document.decision);
  const requirement = document.required ? "Obrigatorio" : "Opcional";

  return `
    <tr>
      <td>${escapeHtml(document.title)}</td>
      <td>${escapeHtml(label)}</td>
      <td>${escapeHtml(document.version)}</td>
      <td>${escapeHtml(requirement)}</td>
      <td>${escapeHtml(formatDateTime(document.decidedAt))}</td>
    </tr>
  `;
}

function renderVoluntariadoDossierHtml(record: VoluntariadoDocumentRecord) {
  const signedAt = resolveSignedAt(record);
  const documents = resolveDocuments(record);
  const signature = record.audit?.signature ?? null;
  const snapshot = record.audit?.candidateSnapshot ?? null;
  const observacaoLivre =
    record.audit?.observacaoLivre ?? record.observacaoLivre ?? null;
  const imageDecision = documents.find((document) => document.key === "uso_imagem");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Dossie de voluntariado ${escapeHtml(record.nomeCompleto)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f4ef;
        --card: #ffffff;
        --line: #d9d6ca;
        --ink: #1f2937;
        --muted: #5b6470;
        --accent: #0f766e;
        --accent-soft: #d7f0ec;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: linear-gradient(180deg, #f6f4ee 0%, #ece8dc 100%);
        color: var(--ink);
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      }
      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 32px 24px 48px;
      }
      .hero {
        background: radial-gradient(circle at top left, #f7f1df 0%, #ffffff 58%);
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 16px 40px rgba(31, 41, 55, 0.08);
      }
      .eyebrow {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        margin: 10px 0 8px;
        font-size: 32px;
        line-height: 1.1;
      }
      p {
        margin: 0;
        line-height: 1.6;
      }
      .hero-grid,
      .details-grid {
        display: grid;
        gap: 16px;
      }
      .hero-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        margin-top: 24px;
      }
      .details-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        margin-top: 18px;
      }
      .metric,
      .panel {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: 18px;
      }
      .metric-label {
        color: var(--muted);
        display: block;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .metric strong {
        display: block;
        margin-top: 8px;
        font-size: 18px;
      }
      .section {
        margin-top: 22px;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 8px 26px rgba(31, 41, 55, 0.05);
      }
      h2 {
        margin: 0 0 14px;
        font-size: 18px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .chip {
        background: var(--accent-soft);
        color: var(--accent);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th,
      td {
        border-bottom: 1px solid #ece7da;
        padding: 12px 8px;
        text-align: left;
        vertical-align: top;
        font-size: 14px;
      }
      th {
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .signature-box {
        margin-top: 16px;
        border: 1px dashed var(--line);
        border-radius: 18px;
        padding: 16px;
        background: #fcfbf8;
      }
      .signature-box img {
        display: block;
        width: 100%;
        max-width: 320px;
        margin-top: 12px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: #ffffff;
      }
      .footer-note {
        margin-top: 18px;
        color: var(--muted);
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">Projeto Atitude · Dossie documental privado</p>
        <h1>Comprovante de assinatura e consentimentos do voluntario</h1>
        <p>
          Este arquivo consolida a candidatura, os consentimentos escolhidos, a
          trilha de auditoria e a assinatura eletronicamente registrada no fluxo
          publico de voluntariado.
        </p>
        <div class="hero-grid">
          <div class="metric">
            <span class="metric-label">Documento interno</span>
            <strong>VOL-${record.candidaturaId}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">Voluntario</span>
            <strong>${escapeHtml(record.nomeCompleto)}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">Data do aceite</span>
            <strong>${escapeHtml(formatDateTime(signedAt))}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">Vaga</span>
            <strong>${escapeHtml(record.necessidadeTitulo || "Nao informada")}</strong>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Identificacao do voluntario</h2>
        <div class="details-grid">
          <div class="panel"><span class="metric-label">CPF</span><strong>${escapeHtml(record.cpf)}</strong></div>
          <div class="panel"><span class="metric-label">RG</span><strong>${escapeHtml(record.rg || "Nao informado")}</strong></div>
          <div class="panel"><span class="metric-label">Nascimento</span><strong>${escapeHtml(record.dataNascimento || "Nao informado")}</strong></div>
          <div class="panel"><span class="metric-label">E-mail</span><strong>${escapeHtml(record.email || "Nao informado")}</strong></div>
          <div class="panel"><span class="metric-label">Telefone</span><strong>${escapeHtml(record.telefone || "Nao informado")}</strong></div>
          <div class="panel"><span class="metric-label">Recebida em</span><strong>${escapeHtml(formatDateTime(record.createdAt))}</strong></div>
        </div>
        ${
          record.disponibilidade
            ? `<div class="signature-box"><span class="metric-label">Disponibilidade declarada</span><p>${escapeHtml(
                record.disponibilidade
              )}</p></div>`
            : ""
        }
      </section>

      <section class="section">
        <h2>Documentos e autorizacoes decididos no ato da assinatura</h2>
        <table>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Decisao</th>
              <th>Versao</th>
              <th>Tipo</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${documents.map(renderDocumentDecision).join("")}
          </tbody>
        </table>
        <div class="chips">
          <span class="chip">LGPD ${
            documents.some(
              (document) =>
                document.key === "lgpd_privacidade" &&
                document.decision === "accepted"
            )
              ? "aceita"
              : "nao registrada"
          }</span>
          <span class="chip">Uso de imagem ${
            imageDecision ? getConsentLabel(imageDecision.decision) : "Nao informado"
          }</span>
          <span class="chip">Versao do termo ${
            escapeHtml(record.termoVersao || "nao informada")
          }</span>
        </div>
      </section>

      <section class="section">
        <h2>Trilha de auditoria</h2>
        <div class="details-grid">
          <div class="panel"><span class="metric-label">Nome digitado na assinatura</span><strong>${escapeHtml(
            signature?.signedName || record.nomeCompleto
          )}</strong></div>
          <div class="panel"><span class="metric-label">CPF digitado na assinatura</span><strong>${escapeHtml(
            signature?.signedCpf || record.cpf
          )}</strong></div>
          <div class="panel"><span class="metric-label">Hash do aceite</span><strong>${escapeHtml(
            signature?.consentHash || "Nao disponivel"
          )}</strong></div>
          <div class="panel"><span class="metric-label">IP registrado</span><strong>${escapeHtml(
            signature?.ipAddress || "Nao disponivel"
          )}</strong></div>
          <div class="panel"><span class="metric-label">Navegador</span><strong>${escapeHtml(
            signature?.userAgent || "Nao disponivel"
          )}</strong></div>
          <div class="panel"><span class="metric-label">Timezone</span><strong>${escapeHtml(
            signature?.timezone || "Nao disponivel"
          )}</strong></div>
        </div>
        ${
          observacaoLivre
            ? `<div class="signature-box"><span class="metric-label">Observacao livre</span><p>${escapeHtml(
                observacaoLivre
              )}</p></div>`
            : ""
        }
      </section>

      ${
        signature?.signatureDataUrl
          ? `<section class="section">
              <h2>Assinatura desenhada</h2>
              <div class="signature-box">
                <p>Rubrica registrada no ato de envio da candidatura.</p>
                <img src="${signature.signatureDataUrl}" alt="Assinatura do voluntario" />
              </div>
            </section>`
          : ""
      }

      ${
        snapshot
          ? `<section class="section">
              <h2>Espelho do cadastro enviado</h2>
              <div class="details-grid">
                <div class="panel"><span class="metric-label">Endereco</span><strong>${escapeHtml(
                  [snapshot.endereco, snapshot.numero]
                    .filter(Boolean)
                    .join(", ") || "Nao informado"
                )}</strong></div>
                <div class="panel"><span class="metric-label">Complemento</span><strong>${escapeHtml(
                  snapshot.complemento || "Nao informado"
                )}</strong></div>
                <div class="panel"><span class="metric-label">Bairro</span><strong>${escapeHtml(
                  snapshot.bairro || "Nao informado"
                )}</strong></div>
                <div class="panel"><span class="metric-label">Cidade / UF</span><strong>${escapeHtml(
                  [snapshot.cidade, snapshot.estado].filter(Boolean).join(" / ") ||
                    "Nao informado"
                )}</strong></div>
                <div class="panel"><span class="metric-label">CEP</span><strong>${escapeHtml(
                  snapshot.cep || "Nao informado"
                )}</strong></div>
                <div class="panel"><span class="metric-label">Oportunidade</span><strong>${escapeHtml(
                  snapshot.necessidadeTitulo || "Nao informada"
                )}</strong></div>
              </div>
            </section>`
          : ""
      }

      <p class="footer-note">
        Arquivo gerado automaticamente pelo fluxo de voluntariado do Projeto
        Atitude. Este dossie deve ser mantido em ambiente administrativo e usado
        como apoio a auditoria interna e conferencias documentais.
      </p>
    </main>
  </body>
</html>`;
}

export function buildVoluntariadoDocumentFiles(
  record: VoluntariadoDocumentRecord
): VoluntariadoGeneratedDocument[] {
  const prefix = buildStoragePrefix(record);
  const baseName = buildBaseFileName(record);
  const artifactCreatedAt = new Date().toISOString();

  const htmlArtifact: VoluntariadoAuditArtifact = {
    key: "dossie_html",
    title: "Dossie assinado da candidatura",
    bucket: VOLUNTARIADO_DOCUMENTOS_BUCKET,
    path: `${prefix}/${baseName}.html`,
    fileName: `${baseName}.html`,
    contentType: "text/html; charset=utf-8",
    createdAt: artifactCreatedAt,
  };

  const jsonArtifact: VoluntariadoAuditArtifact = {
    key: "auditoria_json",
    title: "Auditoria estruturada da candidatura",
    bucket: VOLUNTARIADO_DOCUMENTOS_BUCKET,
    path: `${prefix}/${baseName}.json`,
    fileName: `${baseName}.json`,
    contentType: "application/json; charset=utf-8",
    createdAt: artifactCreatedAt,
  };

  return [
    {
      artifact: htmlArtifact,
      body: renderVoluntariadoDossierHtml(record),
    },
    {
      artifact: jsonArtifact,
      body: JSON.stringify(buildAuditSnapshot(record), null, 2),
    },
  ];
}
