"use client";

import { useState } from "react";
import {
  getConsentLabel,
  type VoluntariadoCandidaturaAudit,
} from "@/lib/candidatura-voluntariado-audit";

type CandidaturaReportProps = {
  candidatura: {
    id: number;
    nome_completo: string;
    cpf: string;
    rg: string | null;
    data_nascimento: string | null;
    email: string | null;
    telefone: string | null;
    created_at: string;
    termo_aceito: boolean;
    termo_aceito_em: string | null;
    termo_versao: string | null;
    necessidade: {
      titulo_publico: string;
    } | null;
  };
  audit: VoluntariadoCandidaturaAudit | null;
  observacaoLivre: string | null;
  documentCenterHref?: string;
  documentEndpointBase?: string;
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informado";
  return new Date(dateString).toLocaleString("pt-BR");
}

export function VoluntariadoConsentReport({
  candidatura,
  audit,
  observacaoLivre,
  documentCenterHref,
  documentEndpointBase,
}: CandidaturaReportProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    try {
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 5;
      let currentY = margin;

      const ensureSpace = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };

      const writeText = (
        text: string,
        options?: {
          fontSize?: number;
          fontStyle?: "normal" | "bold";
          color?: [number, number, number];
          spacingAfter?: number;
        }
      ) => {
        const {
          fontSize = 11,
          fontStyle = "normal",
          color = [39, 39, 42],
          spacingAfter = 3,
        } = options ?? {};

        pdf.setFont("helvetica", fontStyle);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, contentWidth) as string[];
        const height = lines.length * lineHeight + spacingAfter;

        ensureSpace(height + 2);
        pdf.text(lines, margin, currentY + 4);
        currentY += height;
      };

      writeText("Comprovante de candidatura e aceite documental", {
        fontSize: 18,
        fontStyle: "bold",
        color: [24, 24, 27],
        spacingAfter: 4,
      });

      writeText(`Documento interno: VOL-${candidatura.id}`, {
        fontSize: 10,
        color: [82, 82, 91],
        spacingAfter: 2,
      });
      writeText(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, {
        fontSize: 10,
        color: [82, 82, 91],
        spacingAfter: 5,
      });

      writeText("Dados do voluntário", {
        fontSize: 13,
        fontStyle: "bold",
        spacingAfter: 2,
      });
      writeText(`Nome: ${candidatura.nome_completo}`);
      writeText(`CPF: ${candidatura.cpf}`);
      writeText(`RG: ${candidatura.rg || "Não informado"}`);
      writeText(
        `Nascimento: ${
          candidatura.data_nascimento || "Não informado"
        }`
      );
      writeText(`E-mail: ${candidatura.email || "Não informado"}`);
      writeText(`Telefone: ${candidatura.telefone || "Não informado"}`);
      writeText(
        `Vaga: ${candidatura.necessidade?.titulo_publico || "Não informada"}`
      );
      writeText(`Recebida em: ${formatDateTime(candidatura.created_at)}`, {
        spacingAfter: 5,
      });

      writeText("Documentos e autorizações", {
        fontSize: 13,
        fontStyle: "bold",
        spacingAfter: 2,
      });

      if (audit?.documents.length) {
        audit.documents.forEach((document) => {
          writeText(
            `${document.title}: ${getConsentLabel(document.decision)} | versão ${document.version} | data ${formatDateTime(document.decidedAt)}`
          );
        });
      } else {
        writeText(
          `Termo aceito: ${candidatura.termo_aceito ? "Sim" : "Não"} | versão ${
            candidatura.termo_versao || "Não informada"
          } | data ${formatDateTime(candidatura.termo_aceito_em)}`
        );
      }

      if (observacaoLivre) {
        writeText(`Observação enviada pelo voluntário: ${observacaoLivre}`, {
          spacingAfter: 5,
        });
      } else {
        currentY += 2;
      }

      writeText("Trilha de auditoria", {
        fontSize: 13,
        fontStyle: "bold",
        spacingAfter: 2,
      });
      writeText(
        `Assinado por: ${audit?.signature.signedName || candidatura.nome_completo}`
      );
      writeText(`CPF informado na assinatura: ${audit?.signature.signedCpf || candidatura.cpf}`);
      writeText(
        `Assinatura registrada em: ${formatDateTime(
          audit?.signature.signedAt || candidatura.termo_aceito_em
        )}`
      );
      writeText(`Hash do aceite: ${audit?.signature.consentHash || "Não disponível"}`);
      writeText(`IP registrado: ${audit?.signature.ipAddress || "Não disponível"}`);
      writeText(
        `Navegador registrado: ${audit?.signature.userAgent || "Não disponível"}`
      );
      writeText(
        `Timezone informada: ${audit?.signature.timezone || "Não disponível"}`,
        { spacingAfter: 5 }
      );

      if (audit?.signature.signatureDataUrl) {
        ensureSpace(55);
        writeText("Rubrica/assinatura desenhada", {
          fontSize: 13,
          fontStyle: "bold",
          spacingAfter: 2,
        });
        pdf.addImage(
          audit.signature.signatureDataUrl,
          "PNG",
          margin,
          currentY,
          90,
          35
        );
        currentY += 40;
      }

      pdf.save(`candidatura-voluntario-${candidatura.id}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Documentos e autorizações
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Consulte os aceites registrados, a trilha de auditoria e o comprovante
            da assinatura.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-60"
        >
          {downloading ? "Gerando documento..." : "Baixar comprovante"}
        </button>
      </div>

      {documentEndpointBase || documentCenterHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {documentEndpointBase ? (
            <a
              href={`${documentEndpointBase}?kind=dossie_html&download=0`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Abrir dossie
            </a>
          ) : null}

          {documentEndpointBase ? (
            <a
              href={`${documentEndpointBase}?kind=auditoria_json&download=1`}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
            >
              Baixar auditoria
            </a>
          ) : null}

          {documentCenterHref ? (
            <a
              href={documentCenterHref}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
            >
              Central de documentos
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-900">
            Documentos decididos pelo voluntário
          </p>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            {audit?.documents.length ? (
              audit.documents.map((document) => (
                <p key={document.key}>
                  <span className="font-medium text-zinc-900">
                    {document.title}:
                  </span>{" "}
                  {getConsentLabel(document.decision)} · versão {document.version}
                  {" · "}
                  {formatDateTime(document.decidedAt)}
                </p>
              ))
            ) : (
              <p>
                <span className="font-medium text-zinc-900">Termo aceito:</span>{" "}
                {candidatura.termo_aceito ? "Sim" : "Não"} ·{" "}
                {formatDateTime(candidatura.termo_aceito_em)}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-900">
            Auditoria da assinatura eletrônica
          </p>
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-medium text-zinc-900">Assinado por:</span>{" "}
              {audit?.signature.signedName || candidatura.nome_completo}
            </p>
            <p>
              <span className="font-medium text-zinc-900">CPF na assinatura:</span>{" "}
              {audit?.signature.signedCpf || candidatura.cpf}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Data do aceite:</span>{" "}
              {formatDateTime(audit?.signature.signedAt || candidatura.termo_aceito_em)}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Hash de auditoria:</span>{" "}
              {audit?.signature.consentHash || "Não disponível"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">IP:</span>{" "}
              {audit?.signature.ipAddress || "Não disponível"}
            </p>
            <p>
              <span className="font-medium text-zinc-900">Navegador:</span>{" "}
              {audit?.signature.userAgent || "Não disponível"}
            </p>
          </div>

          {audit?.signature.signatureDataUrl ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3">
              <p className="mb-3 text-sm font-medium text-zinc-900">
                Assinatura desenhada
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={audit.signature.signatureDataUrl}
                alt={`Assinatura de ${audit.signature.signedName}`}
                className="h-28 w-full rounded-xl border border-zinc-200 object-contain"
              />
            </div>
          ) : null}
        </div>

        {observacaoLivre ? (
          <div className="rounded-2xl bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-900">
              Observações enviadas pelo voluntário
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-700">
              {observacaoLivre}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
