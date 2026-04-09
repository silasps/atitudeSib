"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  isNecessidadePublicamenteDisponivel,
  toNecessidadePublicaView,
} from "@/lib/voluntariado-necessidades-publicas";
import { VOLUNTARIADO_DOCUMENT_VERSIONS } from "@/lib/candidatura-voluntariado-audit";

type NecessidadeOption = {
  id: number;
  titulo_publico: string;
  descricao: string | null;
  quantidade_total: number;
  quantidade_aprovada: number;
  data_limite_inscricao_em: string | null;
  status: string;
  exibir_publicamente: boolean;
};

type FormDataType = {
  necessidade_id: string;
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

const STORAGE_KEY = "atitude_candidatura_voluntariado";

function formatDateTime(dateString: string | null) {
  if (!dateString) return "Não informada";
  return new Date(dateString).toLocaleString("pt-BR");
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-zinc-500">{children}</p>;
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
        {eyebrow}
      </p>
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-600">{subtitle}</p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
      />
    </div>
  );
}

export default function CadastroVoluntarioClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const necessidadePreSelecionada = searchParams.get("necessidade") ?? "";

  const [necessidades, setNecessidades] = useState<NecessidadeOption[]>([]);
  const [loadingNecessidades, setLoadingNecessidades] = useState(true);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<FormDataType>({
    necessidade_id: necessidadePreSelecionada,
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
    estado: "PR",
    disponibilidade: "",
    observacoes: "",
  });

  useEffect(() => {
    async function fetchNecessidades() {
      const { data, error } = await supabase
        .from("necessidades_voluntariado")
        .select(
          "id, titulo_publico, descricao, quantidade_total, quantidade_aprovada, data_limite_inscricao_em, status, exibir_publicamente"
        )
        .eq("status", "aberta")
        .eq("exibir_publicamente", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar necessidades:", error);
        setLoadingNecessidades(false);
        return;
      }

      const abertas = ((data ?? []) as NecessidadeOption[]).filter((item) =>
        isNecessidadePublicamenteDisponivel(item, new Date())
      );

      setNecessidades(abertas);
      setLoadingNecessidades(false);
    }

    void fetchNecessidades();
  }, []);

  const necessidadeSelecionada = useMemo(() => {
    return necessidades.find(
      (item) => String(item.id) === formData.necessidade_id
    );
  }, [necessidades, formData.necessidade_id]);

  const necessidadeSelecionadaView = useMemo(() => {
    return necessidadeSelecionada
      ? toNecessidadePublicaView(necessidadeSelecionada)
      : null;
  }, [necessidadeSelecionada]);

  const candidaturaBloqueada = useMemo(() => {
    if (!necessidadeSelecionada) return false;

    return !isNecessidadePublicamenteDisponivel(
      necessidadeSelecionada,
      new Date()
    );
  }, [necessidadeSelecionada]);

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!formData.necessidade_id) {
      setMessage("Selecione uma oportunidade.");
      return;
    }

    if (!necessidadeSelecionada) {
      setMessage("Esta oportunidade não está mais disponível.");
      return;
    }

    if (candidaturaBloqueada) {
      setMessage("Esta oportunidade não está mais disponível para candidatura.");
      return;
    }

    if (
      !formData.nome_completo ||
      !formData.cpf ||
      !formData.rg ||
      !formData.data_nascimento ||
      !formData.email ||
      !formData.telefone ||
      !formData.cep ||
      !formData.endereco ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado ||
      !formData.disponibilidade
    ) {
      setMessage("Preencha todos os campos obrigatórios antes de continuar.");
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...formData,
        necessidade_titulo_publico: necessidadeSelecionada.titulo_publico,
        document_versions: VOLUNTARIADO_DOCUMENT_VERSIONS,
      })
    );

    router.push("/seja-voluntario/termo");
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
            Cadastro formal
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
            Candidatura de voluntário
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
            Este cadastro foi estruturado para registrar sua identificação, seus
            dados de contato e os consentimentos necessários para a atuação
            voluntária junto à instituição.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
        >
          <section className="space-y-4">
            <SectionTitle
              eyebrow="Oportunidade"
              title="Vaga escolhida"
              subtitle="Selecione a oportunidade que deseja assumir formalmente."
            />

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Área de atuação
                </label>
                <select
                  name="necessidade_id"
                  value={formData.necessidade_id}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                >
                  <option value="">
                    {loadingNecessidades ? "Carregando..." : "Selecione"}
                  </option>

                  {necessidades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.titulo_publico}
                    </option>
                  ))}
                </select>
              </div>

              {necessidadeSelecionada && necessidadeSelecionadaView ? (
                <div className="rounded-3xl bg-zinc-100 p-4 text-sm">
                  <p className="font-semibold text-zinc-900">
                    {necessidadeSelecionadaView.titulo_publico}
                  </p>
                  <p className="mt-2 leading-7 text-zinc-700">
                    {necessidadeSelecionadaView.content.resumoCurto ||
                      "Sem descrição disponível."}
                  </p>

                  <div className="mt-3 space-y-1 text-zinc-700">
                    <p>
                      <span className="font-medium text-zinc-900">
                        Vagas restantes:
                      </span>{" "}
                      {necessidadeSelecionadaView.vagasRestantes}
                    </p>
                    <p>
                      <span className="font-medium text-zinc-900">
                        Prazo final:
                      </span>{" "}
                      {formatDateTime(
                        necessidadeSelecionadaView.data_limite_inscricao_em
                      )}
                    </p>
                    <Link
                      href={`/seja-voluntario/${necessidadeSelecionadaView.id}`}
                      className="inline-flex pt-2 font-medium text-zinc-900 underline underline-offset-4"
                    >
                      Ver página completa da vaga
                    </Link>
                  </div>

                  {candidaturaBloqueada ? (
                    <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      Esta oportunidade não está mais disponível para candidatura.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              eyebrow="Identificação"
              title="Dados pessoais do voluntário"
              subtitle="Essas informações ajudam a formalizar a candidatura e a assinatura eletrônica."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputField
                  label="Nome completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                />
              </div>

              <InputField
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <InputField
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
              <InputField
                label="Data de nascimento"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              eyebrow="Contato"
              title="Como a instituição pode falar com você"
              subtitle="Use canais realmente ativos para convocações, alinhamentos e retornos."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
              <InputField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
                autoComplete="tel"
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              eyebrow="Endereço"
              title="Localização do voluntário"
              subtitle="Esses dados ajudam na identificação e no registro administrativo da candidatura."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                required
                autoComplete="postal-code"
              />
              <InputField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
                autoComplete="street-address"
              />
              <InputField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
              />
              <InputField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                required
              />
              <InputField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              eyebrow="Compromisso"
              title="Disponibilidade e observações"
              subtitle="Descreva sua disponibilidade real para a instituição avaliar aderência e compromisso."
            />

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Disponibilidade
                </label>
                <textarea
                  name="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  placeholder="Ex: segundas e quartas à tarde, com disponibilidade para reunião inicial presencial."
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Observações adicionais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ex: experiência prévia, restrições de horário ou alguma informação importante."
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
            <SectionTitle
              eyebrow="Próxima etapa"
              title="Termos, LGPD e assinatura eletrônica"
              subtitle="Na próxima tela você verá os documentos da candidatura, fará as autorizações necessárias e registrará sua assinatura eletrônica."
            />

            <div className="mt-4 space-y-2 text-sm text-zinc-700">
              <p>1. Termo de adesão ao serviço voluntário.</p>
              <p>2. Aviso de privacidade e tratamento de dados pessoais.</p>
              <p>3. Autorização ou negativa de uso de imagem.</p>
              <p>4. Assinatura digital visível com nome, CPF, data e rubrica desenhada.</p>
            </div>

            <FieldHelp>
              O envio da candidatura passa a registrar data, versão dos documentos,
              assinatura informada, navegador e outros metadados de auditoria.
            </FieldHelp>
          </section>

          {message ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Link
              href="/seja-voluntario"
              className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
            >
              Voltar
            </Link>

            <button
              type="submit"
              disabled={candidaturaBloqueada}
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continuar para assinatura
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
