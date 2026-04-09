"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/public/signature-pad";
import { VOLUNTARIADO_DOCUMENT_VERSIONS } from "@/lib/candidatura-voluntariado-audit";

const STORAGE_KEY = "atitude_candidatura_voluntariado";

type StoredData = {
  necessidade_id: string;
  necessidade_titulo_publico?: string;
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
  observacoes: string;
};

function readStoredData() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredData;
  } catch {
    return null;
  }
}

function ConsentSection({
  eyebrow,
  title,
  version,
  children,
}: {
  eyebrow: string;
  title: string;
  version: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
        {eyebrow}
      </p>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
          Versão {version}
        </span>
      </div>
      <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-700">
        {children}
      </div>
    </section>
  );
}

export default function TermoVoluntariadoPublicoPage() {
  const router = useRouter();
  const storedData = useMemo(() => readStoredData(), []);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [imageConsent, setImageConsent] = useState<"accepted" | "declined" | "">("");
  const [signatureName, setSignatureName] = useState(
    storedData?.nome_completo ?? ""
  );
  const [signatureCpf, setSignatureCpf] = useState(storedData?.cpf ?? "");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!storedData) {
      router.replace("/seja-voluntario/cadastro");
    }
  }, [router, storedData]);

  async function handleSubmit() {
    if (!storedData) {
      setMessage("Os dados do cadastro não foram encontrados. Refaça o cadastro.");
      return;
    }

    setMessage("");

    if (!acceptedTerms) {
      setMessage("Você precisa aceitar o termo de adesão ao serviço voluntário.");
      return;
    }

    if (!acceptedLgpd) {
      setMessage("Você precisa registrar ciência da seção de privacidade e LGPD.");
      return;
    }

    if (!imageConsent) {
      setMessage("Escolha se autoriza ou não o uso de imagem.");
      return;
    }

    if (
      signatureName.trim().toLowerCase() !==
      storedData.nome_completo.trim().toLowerCase()
    ) {
      setMessage(
        "A assinatura digitada deve ser igual ao nome completo informado no cadastro."
      );
      return;
    }

    if (signatureCpf.trim() !== storedData.cpf.trim()) {
      setMessage("O CPF da assinatura deve ser igual ao CPF informado no cadastro.");
      return;
    }

    if (!signatureDataUrl) {
      setMessage("Desenhe sua assinatura no quadro antes de enviar.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/voluntariado/candidaturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...storedData,
          signature: {
            signedName: signatureName,
            signedCpf: signatureCpf,
            signatureDataUrl,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            acceptedTerms,
            acceptedLgpd,
            imageConsent,
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.message || "Não foi possível finalizar a candidatura."
        );
      }

      sessionStorage.removeItem(STORAGE_KEY);
      router.push("/seja-voluntario/sucesso");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível finalizar a candidatura."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!storedData) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">
            Redirecionando para o cadastro...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Etapa formal
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
            Termos, autorizações e assinatura eletrônica
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
            Esta etapa registra os documentos aceitos, a decisão sobre uso de
            imagem e a sua assinatura eletrônica vinculada à candidatura.
          </p>
        </div>

        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-white/65">
            Resumo do candidato
          </p>
          <div className="mt-4 grid gap-3 text-sm text-white/85 md:grid-cols-2">
            <p>
              <span className="font-medium text-white">Nome:</span>{" "}
              {storedData.nome_completo}
            </p>
            <p>
              <span className="font-medium text-white">CPF:</span>{" "}
              {storedData.cpf}
            </p>
            <p>
              <span className="font-medium text-white">RG:</span>{" "}
              {storedData.rg}
            </p>
            <p>
              <span className="font-medium text-white">Vaga:</span>{" "}
              {storedData.necessidade_titulo_publico || `#${storedData.necessidade_id}`}
            </p>
          </div>
        </section>

        <ConsentSection
          eyebrow="Documento 1"
          title="Termo de adesão ao serviço voluntário"
          version={VOLUNTARIADO_DOCUMENT_VERSIONS.termoAdesao}
        >
          <p>
            Ao aderir, você declara ciência de que sua atuação terá natureza
            voluntária, sem vínculo empregatício, salarial, previdenciário ou
            trabalhista, conforme a legislação aplicável ao serviço voluntário.
          </p>
          <p>
            Você se compromete a atuar com zelo, ética, respeito às diretrizes da
            instituição, cuidado com os públicos atendidos e observância das
            orientações da coordenação.
          </p>
          <p>
            A instituição poderá organizar escalas, responsabilidades,
            procedimentos e regras internas para garantir segurança,
            continuidade do projeto e adequada prestação do serviço voluntário.
          </p>

          <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1"
            />
            <span>
              Confirmo que li o termo de adesão ao serviço voluntário e concordo
              com seu conteúdo.
            </span>
          </label>
        </ConsentSection>

        <ConsentSection
          eyebrow="Documento 2"
          title="Privacidade, LGPD e uso dos dados pessoais"
          version={VOLUNTARIADO_DOCUMENT_VERSIONS.lgpdPrivacidade}
        >
          <p>
            Seus dados serão usados para análise da candidatura, contato pela
            equipe, registro administrativo da atuação voluntária, organização
            interna, segurança institucional e eventual exercício regular de
            direitos da instituição.
          </p>
          <p>
            A instituição manterá registro do aceite, da versão dos documentos,
            da data da assinatura e dos metadados mínimos necessários para fins
            de auditoria e comprovação.
          </p>
          <p>
            As informações serão tratadas conforme a finalidade informada, com
            limitação ao necessário e resguardo da confidencialidade. Caso
            precise atualizar ou exercer direitos relacionados aos seus dados,
            você poderá acionar os canais oficiais da instituição.
          </p>

          <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <input
              type="checkbox"
              checked={acceptedLgpd}
              onChange={(event) => setAcceptedLgpd(event.target.checked)}
              className="mt-1"
            />
            <span>
              Declaro ciência sobre o tratamento dos meus dados pessoais e
              concordo com o uso para as finalidades administrativas e
              institucionais descritas acima.
            </span>
          </label>
        </ConsentSection>

        <ConsentSection
          eyebrow="Documento 3"
          title="Autorização de uso de imagem"
          version={VOLUNTARIADO_DOCUMENT_VERSIONS.usoImagem}
        >
          <p>
            Você pode autorizar ou não o uso de sua imagem em materiais
            institucionais, site, relatórios, apresentações e redes sociais da
            instituição, sempre vinculados às atividades do projeto e sem
            finalidade comercial individual.
          </p>
          <p>
            Sua decisão ficará registrada com data, versão do documento e
            assinatura da candidatura.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <input
                type="radio"
                name="image_consent"
                checked={imageConsent === "accepted"}
                onChange={() => setImageConsent("accepted")}
                className="mt-1"
              />
              <span>
                Autorizo o uso de minha imagem em sites, relatórios, redes sociais
                e materiais institucionais do projeto.
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <input
                type="radio"
                name="image_consent"
                checked={imageConsent === "declined"}
                onChange={() => setImageConsent("declined")}
                className="mt-1"
              />
              <span>
                Não autorizo o uso de minha imagem pela instituição.
              </span>
            </label>
          </div>
        </ConsentSection>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Assinatura eletrônica
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900">
            Confirme sua identidade e assine
          </h2>
          <p className="mt-2 text-sm leading-7 text-zinc-600">
            Para concluir, digite novamente seu nome completo e CPF exatamente
            como no cadastro e registre sua assinatura no quadro abaixo.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Nome completo para assinatura
              </label>
              <input
                value={signatureName}
                onChange={(event) => setSignatureName(event.target.value)}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                CPF para assinatura
              </label>
              <input
                value={signatureCpf}
                onChange={(event) => setSignatureCpf(event.target.value)}
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="mt-5">
            <SignaturePad onChange={setSignatureDataUrl} />
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/seja-voluntario/cadastro"
            className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Voltar ao cadastro
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Registrando assinatura..." : "Assinar e enviar candidatura"}
          </button>
        </div>
      </div>
    </main>
  );
}
