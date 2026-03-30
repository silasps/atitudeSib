"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTitle } from "@/components/ui/page-title";
import { supabase } from "@/lib/supabase";

type SiteConfig = {
  id: number;
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
  id: 0,
  project_name: "",
  project_subtitle: "",
  hero_title: "",
  hero_subtitle: "",
  hero_button_primary_text: "",
  hero_button_primary_link: "",
  hero_button_secondary_text: "",
  hero_button_secondary_link: "",
  hero_image_url: "",
  primary_color: "#18181b",
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

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-zinc-200 pb-4">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      ) : null}
    </div>
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
          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
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
      <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
          Carregando...
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <PageTitle
                title="Configurações do site"
                subtitle="Edite a aparência e os textos da área pública do projeto"
              />

              <form
                onSubmit={handleSubmit}
                className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm"
              >
                <SectionTitle
                  title="Identidade do projeto"
                  subtitle="Essas informações aparecem no topo do site e ajudam a identificar o projeto."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Nome do projeto
                    </label>
                    <input
                      name="project_name"
                      value={config.project_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Este nome aparece no topo do site, no menu e no rodapé.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Subtítulo do projeto
                    </label>
                    <input
                      name="project_subtitle"
                      value={config.project_subtitle}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Pequena descrição que aparece abaixo do nome do projeto.
                    </FieldHelp>
                  </div>
                </div>

                <SectionTitle
                  title="Primeira tela da página inicial"
                  subtitle="Essa é a parte principal da home, onde a pessoa bate o olho quando entra no site."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Título principal da home
                    </label>
                    <input
                      name="hero_title"
                      value={config.hero_title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Texto grande que aparece sobre a imagem principal da página inicial.
                    </FieldHelp>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto de apoio da home
                    </label>
                    <textarea
                      name="hero_subtitle"
                      value={config.hero_subtitle}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Texto menor que aparece logo abaixo do título principal.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto do botão principal
                    </label>
                    <input
                      name="hero_button_primary_text"
                      value={config.hero_button_primary_text}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Exemplo: “Seja voluntário”. Este botão aparece na primeira tela.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Link do botão principal
                    </label>
                    <input
                      name="hero_button_primary_link"
                      value={config.hero_button_primary_link}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Exemplo: /seja-voluntario
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto do botão secundário
                    </label>
                    <input
                      name="hero_button_secondary_text"
                      value={config.hero_button_secondary_text}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Exemplo: “Quem somos”. Aparece ao lado do botão principal.
                    </FieldHelp>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Link do botão secundário
                    </label>
                    <input
                      name="hero_button_secondary_link"
                      value={config.hero_button_secondary_link}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Exemplo: /quem-somos
                    </FieldHelp>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      URL da imagem principal
                    </label>
                    <input
                      name="hero_image_url"
                      value={config.hero_image_url}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Cole aqui o link da imagem que será usada no topo da página inicial.
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
                          Se a imagem não aparecer, verifique se o link é direto e público.
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-4 md: p-6 text-sm text-zinc-500">
                        Nenhuma imagem principal informada.
                      </div>
                    )}
                  </div>
                </div>

                <SectionTitle
                  title="Cores do site"
                  subtitle="Essas cores definem a aparência geral da área pública."
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <ColorField
                    label="Cor principal"
                    name="primary_color"
                    value={config.primary_color}
                    onChange={handleChange}
                    help="Usada em blocos escuros, títulos e áreas institucionais."
                  />

                  <ColorField
                    label="Cor secundária"
                    name="secondary_color"
                    value={config.secondary_color}
                    onChange={handleChange}
                    help="Usada em fundos suaves e áreas de apoio."
                  />

                  <ColorField
                    label="Cor de destaque"
                    name="accent_color"
                    value={config.accent_color}
                    onChange={handleChange}
                    help="Usada nos botões principais e destaques."
                  />
                </div>

                <div className="rounded-3xl border border-zinc-200 p-4 md: p-6">
                  <p className="text-sm font-medium text-zinc-900">
                    Prévia rápida das cores
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div
                      className="rounded-2xl p-4 md: p-6 text-white"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      Cor principal
                    </div>

                    <div
                      className="rounded-2xl p-4 md: p-6 text-zinc-900"
                      style={{ backgroundColor: config.secondary_color }}
                    >
                      Cor secundária
                    </div>

                    <div
                      className="rounded-2xl p-4 md: p-6 text-white"
                      style={{ backgroundColor: config.accent_color }}
                    >
                      Cor de destaque
                    </div>
                  </div>
                </div>

                <SectionTitle
                  title="Conteúdo institucional"
                  subtitle="Esses textos alimentam as páginas públicas do projeto."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Título da seção “Quem somos”
                    </label>
                    <input
                      name="about_title"
                      value={config.about_title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Aparece na home e na página “Quem somos”.
                    </FieldHelp>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto da seção “Quem somos”
                    </label>
                    <textarea
                      name="about_text"
                      value={config.about_text}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Texto institucional sobre o projeto.
                    </FieldHelp>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Título da seção “O que estamos fazendo”
                    </label>
                    <input
                      name="work_title"
                      value={config.work_title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Aparece na home e na página “O que estamos fazendo”.
                    </FieldHelp>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Texto da seção “O que estamos fazendo”
                    </label>
                    <textarea
                      name="work_text"
                      value={config.work_text}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                    <FieldHelp>
                      Explique brevemente as ações e frentes do projeto.
                    </FieldHelp>
                  </div>
                </div>

                <SectionTitle
                  title="Contato e redes"
                  subtitle="Essas informações aparecem na página de contato e no rodapé do site."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      E-mail
                    </label>
                    <input
                      name="contact_email"
                      value={config.contact_email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Telefone
                    </label>
                    <input
                      name="contact_phone"
                      value={config.contact_phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      WhatsApp
                    </label>
                    <input
                      name="contact_whatsapp"
                      value={config.contact_whatsapp}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Instagram
                    </label>
                    <input
                      name="instagram_url"
                      value={config.instagram_url}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      Facebook
                    </label>
                    <input
                      name="facebook_url"
                      value={config.facebook_url}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                      YouTube
                    </label>
                    <input
                      name="youtube_url"
                      value={config.youtube_url}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                    />
                  </div>
                </div>

                {message ? (
                  <div className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : "Salvar configurações"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}