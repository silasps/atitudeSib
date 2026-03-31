"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type SiteConfig = {
  id?: number;
  project_name: string;
  project_subtitle: string;
  hero_title: string;
  hero_subtitle: string;
  hero_button_primary_text: string;
  hero_button_primary_link: string;
  hero_button_secondary_text: string;
  hero_button_secondary_link: string;
  hero_image_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  about_title: string;
  about_text: string;
  work_title: string;
  work_text: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
};

const emptyConfig: SiteConfig = {
  project_name: "",
  project_subtitle: "",
  hero_title: "",
  hero_subtitle: "",
  hero_button_primary_text: "",
  hero_button_primary_link: "",
  hero_button_secondary_text: "",
  hero_button_secondary_link: "",
  hero_image_url: "",
  primary_color: "#111827",
  secondary_color: "#f4f4f5",
  accent_color: "#0f766e",
  about_title: "",
  about_text: "",
  work_title: "",
  work_text: "",
  contact_email: "",
  contact_phone: "",
  contact_whatsapp: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
        {description ? (
          <p className="text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-zinc-500">{children}</p>;
}

function ColorField({
  label,
  name,
  value,
  onChange,
  help,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  help: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="color"
          name={name}
          value={value || "#000000"}
          onChange={onChange}
          className="h-12 w-16 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
        />

        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
        />
      </div>

      <FieldHelp>{help}</FieldHelp>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<SiteConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        setConfig({
          ...emptyConfig,
          ...data,
        });
      }

      setLoading(false);
    }

    fetchConfig();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = { ...config };
    delete (payload as { id?: number }).id;

    let error = null;

    if (config.id) {
      const result = await supabase
        .from("site_config")
        .update(payload)
        .eq("id", config.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("site_config")
        .insert([payload]);

      error = result.error;
    }

    if (error) {
      setMessage(`Erro ao salvar: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Configurações salvas com sucesso.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          Carregando...
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <PageTitle
                title="Configurações do site"
                subtitle="Atualize títulos, histórias e canais para tornar o site ainda mais convidativo."
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <SectionCard
                  title="Identidade"
                  description="Edite nome, subtítulo e redes sociais em um único bloco enxuto."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Nome do projeto
                      </label>
                      <input
                        name="project_name"
                        value={config.project_name}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Nome usado no header e no rodapé.
                      </FieldHelp>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Subtítulo curto
                      </label>
                      <input
                        name="project_subtitle"
                        value={config.project_subtitle}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Frase curta que reforça a personalidade do projeto.
                      </FieldHelp>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Instagram
                      </label>
                      <input
                        name="instagram_url"
                        value={config.instagram_url}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Link direto ao perfil público.</FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Facebook
                      </label>
                      <input
                        name="facebook_url"
                        value={config.facebook_url}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Compartilhe o endereço oficial.</FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Youtube
                      </label>
                      <input
                        name="youtube_url"
                        value={config.youtube_url}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Canal oficial com vídeos e histórias.</FieldHelp>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Hero e chamadas"
                  description="Configure título, botões e imagem principal da home."
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Título principal
                    </label>
                    <input
                      name="hero_title"
                      value={config.hero_title}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Frase de impacto que aparece sobre a imagem.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto de apoio
                    </label>
                    <textarea
                      name="hero_subtitle"
                      value={config.hero_subtitle}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Expanda o que os visitantes acabam de ler.
                    </FieldHelp>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Botão principal
                      </label>
                      <input
                        name="hero_button_primary_text"
                        value={config.hero_button_primary_text}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Use verbos de ação.</FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Link do botão
                      </label>
                      <input
                        name="hero_button_primary_link"
                        value={config.hero_button_primary_link}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Ex: /seja-voluntario</FieldHelp>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Botão secundário
                      </label>
                      <input
                        name="hero_button_secondary_text"
                        value={config.hero_button_secondary_text}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Complementa a ação principal.</FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Link secundário
                      </label>
                      <input
                        name="hero_button_secondary_link"
                        value={config.hero_button_secondary_link}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>Ex: /quem-somos</FieldHelp>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Imagem principal
                    </label>
                    <input
                      name="hero_image_url"
                      value={config.hero_image_url}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Utilize um link público e com boa resolução.
                    </FieldHelp>
                    {config.hero_image_url ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
                        <img
                          src={config.hero_image_url.trim()}
                          alt="Prévia da imagem principal"
                          className="h-64 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="p-3 text-sm text-zinc-500">
                          Verifique se o link está livre para uso público.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
                        Nenhuma imagem cadastrada.
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Storytelling"
                  description="Ajuste os textos que explicam missão e impacto."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Título da missão
                      </label>
                      <input
                        name="about_title"
                        value={config.about_title}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Cabeçalho da seção “Quem somos”.
                      </FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Título da atuação
                      </label>
                      <input
                        name="work_title"
                        value={config.work_title}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Título usado junto com estatísticas e relatos.
                      </FieldHelp>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto da missão
                    </label>
                    <textarea
                      name="about_text"
                      value={config.about_text}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Conte quem somos em poucas frases.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto da atuação
                    </label>
                    <textarea
                      name="work_text"
                      value={config.work_text}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Use dados e relatos para contar o impacto.
                    </FieldHelp>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Contatos e canais"
                  description="Atualize os principais meios de contato."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        E-mail
                      </label>
                      <input
                        name="contact_email"
                        value={config.contact_email}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Canal oficial exibido no rodapé.
                      </FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Telefone
                      </label>
                      <input
                        name="contact_phone"
                        value={config.contact_phone}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Número disponível para investidores e famílias.
                      </FieldHelp>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">
                        WhatsApp
                      </label>
                      <input
                        name="contact_whatsapp"
                        value={config.contact_whatsapp}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                      />
                      <FieldHelp>
                        Link direto para mensagens instantâneas.
                      </FieldHelp>
                    </div>
                  </div>
                </SectionCard>

                <details className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                  <summary className="cursor-pointer text-sm font-semibold text-zinc-900">
                    Tema e cores (opcional)
                  </summary>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <ColorField
                      label="Cor principal"
                      name="primary_color"
                      value={config.primary_color}
                      onChange={handleChange}
                      help="Texto do header e seções escuras."
                    />
                    <ColorField
                      label="Cor secundária"
                      name="secondary_color"
                      value={config.secondary_color}
                      onChange={handleChange}
                      help="Fundos de cards e seções claras."
                    />
                    <ColorField
                      label="Cor de destaque"
                      name="accent_color"
                      value={config.accent_color}
                      onChange={handleChange}
                      help="Botões e elementos interativos."
                    />
                  </div>
                </details>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : "Salvar configurações"}
                  </button>
                  {message ? (
                    <p className="text-sm font-semibold text-emerald-700">
                      {message}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
