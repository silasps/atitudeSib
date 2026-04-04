"use client";

import { useEffect, useState } from "react";
import WorkPostsManager from "@/components/admin/work-posts-manager";
import { PageTitle } from "@/components/ui/page-title";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  parseHeroMediaConfig,
  parseSiteWorkContent,
  serializeHeroMediaConfig,
  serializeSiteWorkContent,
  type SiteWorkPost,
} from "@/lib/site-content";

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

type GalleryItem = {
  id: number;
  image_url: string;
  legenda: string | null;
};

type TabKey =
  | "home"
  | "quemSomos"
  | "oQueEstamosFazendo"
  | "facaParte"
  | "contato";

const pageTabs: { key: TabKey; label: string }[] = [
  { key: "home", label: "Início" },
  { key: "quemSomos", label: "Quem somos" },
  { key: "oQueEstamosFazendo", label: "O que estamos fazendo" },
  { key: "facaParte", label: "Faça parte" },
  { key: "contato", label: "Contato" },
];

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

function pickSupportedConfigFields<T extends Partial<SiteConfig>>(
  payload: T,
  supportedFields: string[]
) {
  const nextPayload: Partial<SiteConfig> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (supportedFields.includes(key)) {
      nextPayload[key as keyof SiteConfig] = value as never;
    }
  }

  return nextPayload;
}

export default function ConfiguracoesPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [config, setConfig] = useState<SiteConfig>(emptyConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [availableConfigFields, setAvailableConfigFields] = useState<string[]>(
    Object.keys(emptyConfig)
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [selectedHeroImageIds, setSelectedHeroImageIds] = useState<number[]>([]);
  const [workSummary, setWorkSummary] = useState("");
  const [savedWorkSummary, setSavedWorkSummary] = useState("");
  const [workPosts, setWorkPosts] = useState<SiteWorkPost[]>([]);

  const selectedHeroImages = selectedHeroImageIds
    .map((id) => galleryItems.find((item) => item.id === id))
    .filter((item): item is GalleryItem => Boolean(item));

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
        const parsedConfig = {
          ...emptyConfig,
          ...data,
        } as SiteConfig & { hero_gallery_image_ids?: string | null };
        const heroMediaConfig = parseHeroMediaConfig(
          parsedConfig.hero_image_url,
          parsedConfig.hero_gallery_image_ids
        );
        const workContent = parseSiteWorkContent(parsedConfig.work_text);

        setConfig({
          ...emptyConfig,
          ...parsedConfig,
        });
        setAvailableConfigFields(Object.keys(data));
        setSelectedHeroImageIds(heroMediaConfig.galleryImageIds);
        setWorkSummary(workContent.summary);
        setSavedWorkSummary(workContent.summary);
        setWorkPosts(workContent.posts);
      }

      const { data: galleryData, error: galleryError } = await supabase
        .from("site_gallery")
        .select("id,image_url,legenda")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (galleryError) {
        console.error(galleryError);
        setGalleryItems([]);
      } else {
        setGalleryItems((galleryData ?? []) as GalleryItem[]);
      }

      setGalleryLoading(false);
      setLoading(false);
    }

    fetchConfig();
  }, [supabase]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  }

  function toggleHeroGalleryImage(id: number) {
    setSelectedHeroImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function moveHeroGalleryImage(id: number, direction: "left" | "right") {
    setSelectedHeroImageIds((prev) => {
      const currentIndex = prev.indexOf(id);

      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const reordered = [...prev];
      [reordered[currentIndex], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[currentIndex],
      ];

      return reordered;
    });
  }

  async function persistPublishedPosts(nextPosts: SiteWorkPost[]) {
    const payload = pickSupportedConfigFields(
      {
        work_text: serializeSiteWorkContent({
          summary: savedWorkSummary,
          posts: nextPosts,
        }),
      },
      availableConfigFields
    );

    if (!payload.work_text) {
      return {
        ok: false,
        message:
          "Nao foi possivel publicar as alteracoes porque o campo work_text nao existe na configuracao atual do banco.",
      };
    }

    if (config.id) {
      const result = await supabase
        .from("site_config")
        .update(payload)
        .eq("id", config.id);

      if (result.error) {
        return {
          ok: false,
          message: `Erro ao publicar: ${result.error.message}`,
        };
      }
    } else {
      const result = await supabase
        .from("site_config")
        .insert([payload])
        .select("id")
        .single();

      if (result.error) {
        return {
          ok: false,
          message: `Erro ao publicar: ${result.error.message}`,
        };
      }

      if (result.data?.id) {
        setConfig((prev) => ({
          ...prev,
          id: result.data.id as number,
        }));
      }
    }

    setWorkPosts(nextPosts);
    setConfig((prev) => ({
      ...prev,
      work_text: serializeSiteWorkContent({
        summary: savedWorkSummary,
        posts: nextPosts,
      }),
    }));

    return {
      ok: true,
      message: "Publicacoes atualizadas.",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    const phonePattern = /^\\(\\d{2}\\)\\s9\\s\\d{4}-\\d{4}$/;
    const currentHeroMediaConfig = parseHeroMediaConfig(config.hero_image_url);
    const activeTabPayloads: Record<TabKey, Partial<SiteConfig>> = {
      home: {
        project_name: config.project_name,
        project_subtitle: config.project_subtitle,
        hero_title: config.hero_title,
        hero_subtitle: config.hero_subtitle,
        hero_button_primary_text: config.hero_button_primary_text,
        hero_button_primary_link: config.hero_button_primary_link,
        hero_button_secondary_text: config.hero_button_secondary_text,
        hero_button_secondary_link: config.hero_button_secondary_link,
        hero_image_url: serializeHeroMediaConfig({
          galleryImageIds: selectedHeroImageIds,
          legacyImageUrl: currentHeroMediaConfig.legacyImageUrl,
        }),
      },
      quemSomos: {
        about_title: config.about_title,
        about_text: config.about_text,
      },
      oQueEstamosFazendo: {
        work_title: config.work_title,
        work_text: serializeSiteWorkContent({
          summary: workSummary,
          posts: workPosts,
        }),
      },
      facaParte: {
        hero_button_primary_text: config.hero_button_primary_text,
        hero_button_primary_link: config.hero_button_primary_link,
        hero_button_secondary_text: config.hero_button_secondary_text,
        hero_button_secondary_link: config.hero_button_secondary_link,
      },
      contato: {
        contact_email: config.contact_email,
        contact_phone: config.contact_phone,
        contact_whatsapp: config.contact_whatsapp,
        instagram_url: config.instagram_url,
        facebook_url: config.facebook_url,
        youtube_url: config.youtube_url,
      },
    };
    const sharedPayload =
      activeTab === "oQueEstamosFazendo"
        ? pickSupportedConfigFields(
            {
              primary_color: config.primary_color,
              secondary_color: config.secondary_color,
              accent_color: config.accent_color,
            },
            availableConfigFields
          )
        : {};
    const payload = {
      ...sharedPayload,
      ...pickSupportedConfigFields(
        activeTabPayloads[activeTab],
        availableConfigFields
      ),
    };

    if (
      activeTab === "contato" &&
      config.contact_email &&
      !emailPattern.test(config.contact_email)
    ) {
      setMessage("Informe um e-mail válido.");
      setSaving(false);
      return;
    }

    if (
      activeTab === "contato" &&
      config.contact_phone &&
      !phonePattern.test(config.contact_phone)
    ) {
      setMessage("Telefone deve seguir o padrão (41) 9 9999-9999.");
      setSaving(false);
      return;
    }

    if (
      activeTab === "contato" &&
      config.contact_whatsapp &&
      !phonePattern.test(config.contact_whatsapp)
    ) {
      setMessage("WhatsApp deve seguir o padrão (41) 9 9999-9999.");
      setSaving(false);
      return;
    }

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
        .insert([payload])
        .select("id")
        .single();

      error = result.error;

      if (!result.error && result.data?.id) {
        setConfig((prev) => ({
          ...prev,
          id: result.data.id as number,
        }));
      }
    }

    if (error) {
      setMessage(`Erro ao salvar: ${error.message}`);
      setSaving(false);
      return;
    }

    const activeTabLabel =
      pageTabs.find((tab) => tab.key === activeTab)?.label ?? "Aba atual";

    setMessage(`${activeTabLabel} salva com sucesso.`);
    setConfig((prev) => ({
      ...prev,
      ...payload,
    }));
    if (activeTab === "oQueEstamosFazendo") {
      setSavedWorkSummary(workSummary);
    }
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
                <div className="flex flex-wrap gap-2">
                  {pageTabs.map((tab) => {
                    const isActive = tab.key === activeTab;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-6">
                  {activeTab === "home" && (
                    <>
                      <SectionCard
                        title="Identidade"
                        description="Edite nome, subtítulo e comunidades vinculadas ao projeto."
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
                              Nome exibido no header, rodapé e cartões.
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
                              Complementa o nome do projeto com a proposta.
                            </FieldHelp>
                          </div>
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Hero e chamadas"
                        description="Configure título, texto de apoio, botões e as imagens do carrossel principal."
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
                            Frase que destaca o impacto imediato do projeto.
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
                            Amplie a mensagem com contexto para visitantes.
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
                            <FieldHelp>
                              Verbo direto para o envolvimento imediato.
                            </FieldHelp>
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
                            <FieldHelp>Exemplo: /seja-voluntario</FieldHelp>
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
                            <FieldHelp>Apoia a narrativa principal.</FieldHelp>
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
                            <FieldHelp>Exemplo: /quem-somos</FieldHelp>
                          </div>
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Carrossel do hero"
                        description="Escolha entre as imagens já cadastradas na galeria quais devem aparecer no carrossel da página inicial."
                      >
                        {galleryLoading ? (
                          <p className="text-sm text-zinc-500">Carregando galeria...</p>
                        ) : (
                          <>
                            {galleryItems.length === 0 ? (
                              <p className="text-sm text-zinc-500">
                                Nenhuma imagem ativa na galeria ainda.
                              </p>
                            ) : (
                              <div className="space-y-5">
                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                  <p className="text-sm font-semibold text-zinc-900">
                                    Ordem atual do carrossel
                                  </p>
                                  <p className="mt-1 text-sm text-zinc-500">
                                    A sequência abaixo define a ordem em que as imagens passam no hero.
                                  </p>

                                  {selectedHeroImages.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                      {selectedHeroImages.map((item, index) => (
                                        <div
                                          key={item.id}
                                          className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 md:flex-row md:items-center md:justify-between"
                                        >
                                          <div className="flex items-center gap-3">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                                              {index + 1}
                                            </span>
                                            <div
                                              role="img"
                                              aria-label={item.legenda ?? "Imagem selecionada do hero"}
                                              className="h-14 w-20 rounded-xl bg-zinc-100 bg-cover bg-center"
                                              style={{
                                                backgroundImage: `url("${item.image_url}")`,
                                              }}
                                            />
                                            <div className="min-w-0">
                                              <p className="text-sm font-medium text-zinc-900">
                                                {item.legenda ?? "Sem legenda definida"}
                                              </p>
                                              <p className="text-xs text-zinc-500">
                                                Imagem #{item.id} da galeria
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => moveHeroGalleryImage(item.id, "left")}
                                              disabled={index === 0}
                                              className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                              Mover para antes
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => moveHeroGalleryImage(item.id, "right")}
                                              disabled={index === selectedHeroImages.length - 1}
                                              className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                              Mover para depois
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
                                      Nenhuma imagem selecionada ainda. Escolha abaixo quais fotos da galeria devem aparecer no hero.
                                    </div>
                                  )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {galleryItems.map((item) => {
                                    const selected = selectedHeroImageIds.includes(item.id);
                                    const selectedOrder = selected
                                      ? selectedHeroImageIds.indexOf(item.id) + 1
                                      : null;

                                    return (
                                      <label
                                        key={item.id}
                                        className={`group flex cursor-pointer flex-col gap-2 rounded-2xl border px-3 py-3 transition ${
                                          selected
                                            ? "border-emerald-500 bg-emerald-50"
                                            : "border-zinc-200 bg-white"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={() => toggleHeroGalleryImage(item.id)}
                                          className="sr-only"
                                        />
                                        <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                                          <div
                                            role="img"
                                            aria-label={item.legenda ?? "Imagem da galeria"}
                                            className="h-full w-full bg-cover bg-center"
                                            style={{
                                              backgroundImage: `url("${item.image_url}")`,
                                            }}
                                          />
                                          <span
                                            className={`absolute top-2 right-2 inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                                              selected
                                                ? "bg-emerald-600 text-white"
                                                : "bg-black/60 text-white"
                                            }`}
                                          >
                                            {selectedOrder
                                              ? `Selecionada #${selectedOrder}`
                                              : "Selecionar"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2">
                                          {item.legenda ?? "Sem legenda definida"}
                                        </p>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        <FieldHelp>
                          As imagens marcadas irão preencher o slider da página inicial. Se nada for selecionado, a home continua usando as imagens mais recentes da galeria.
                        </FieldHelp>
                      </SectionCard>
                    </>
                  )}

                  {activeTab === "quemSomos" && (
                    <SectionCard
                      title="Quem somos"
                      description="Conte quem é O Atitude e o contexto social atendido."
                    >
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">
                          Título
                        </label>
                        <input
                          name="about_title"
                          value={config.about_title}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                        />
                        <FieldHelp>Título exibido na seção institucional.</FieldHelp>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">
                          Texto
                        </label>
                        <textarea
                          name="about_text"
                          value={config.about_text}
                          onChange={handleChange}
                          rows={4}
                          className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                        />
                        <FieldHelp>
                          Conte a trajetória, missão e público atendido.
                        </FieldHelp>
                      </div>
                    </SectionCard>
                  )}

                  {activeTab === "oQueEstamosFazendo" && (
                    <>
                      <SectionCard
                        title="Textos da pagina"
                        description="Edite o titulo, o texto de abertura e a paleta de cores que ficam no topo da pagina publica."
                      >
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Titulo da pagina
                          </label>
                          <input
                            name="work_title"
                            value={config.work_title}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                          />
                          <FieldHelp>
                            Esse titulo aparece no topo da pagina publica.
                          </FieldHelp>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Texto de abertura da pagina
                          </label>
                          <textarea
                            value={workSummary}
                            onChange={(event) => setWorkSummary(event.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                            placeholder="Apresente o que esta sendo feito no projeto e convide o visitante a acompanhar as publicacoes."
                          />
                          <FieldHelp>
                            Esse texto aparece no topo da pagina publica, acima das publicacoes.
                          </FieldHelp>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <ColorField
                            label="Cor principal"
                            name="primary_color"
                            value={config.primary_color}
                            onChange={handleChange}
                            help="Usada em textos principais e navbar."
                          />
                          <ColorField
                            label="Cor secundaria"
                            name="secondary_color"
                            value={config.secondary_color}
                            onChange={handleChange}
                            help="Fundo de cards e secoes claras."
                          />
                          <ColorField
                            label="Cor de destaque"
                            name="accent_color"
                            value={config.accent_color}
                            onChange={handleChange}
                            help="Botoes e elementos interativos."
                          />
                        </div>

                        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4">
                          <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                          >
                            {saving ? "Salvando..." : "Salvar alteracoes desta aba"}
                          </button>
                          {message ? (
                            <p className="text-sm font-semibold text-zinc-600">
                              {message}
                            </p>
                          ) : null}
                        </div>
                      </SectionCard>

                      <SectionCard
                        title="Gestao de publicacoes"
                        description="Crie, edite, reordene e publique atualizacoes do projeto em tempo real."
                      >
                        <WorkPostsManager
                          posts={workPosts}
                          onPersistPosts={persistPublishedPosts}
                        />
                      </SectionCard>
                    </>
                  )}

                  {activeTab === "facaParte" && (
                    <SectionCard
                      title="Faça parte"
                      description="Defina chamadas direcionadas a voluntários e parceiros."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Texto do botão principal
                          </label>
                          <input
                            name="hero_button_primary_text"
                            value={config.hero_button_primary_text}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                          />
                          <FieldHelp>Verbo que chama para agir.</FieldHelp>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Link do botão principal
                          </label>
                          <input
                            name="hero_button_primary_link"
                            value={config.hero_button_primary_link}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                          />
                          <FieldHelp>
                            Pode ser uma rota interna como /seja-voluntario.
                          </FieldHelp>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Texto do botão secundário
                          </label>
                          <input
                            name="hero_button_secondary_text"
                            value={config.hero_button_secondary_text}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                          />
                          <FieldHelp>Complementa o convite principal.</FieldHelp>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Link do botão secundário
                          </label>
                          <input
                            name="hero_button_secondary_link"
                            value={config.hero_button_secondary_link}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                          />
                          <FieldHelp>
                            Ideal para detalhar programas ou impacto.
                          </FieldHelp>
                        </div>
                      </div>
                    </SectionCard>
                  )}

                  {activeTab === "contato" && (
                    <SectionCard
                      title="Contato e canais"
                      description="Atualize e-mail, telefone e WhatsApp com validação."
                    >
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            E-mail
                          </label>
                          <input
                            type="email"
                            name="contact_email"
                            value={config.contact_email}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                            pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                            title="Informe um e-mail válido."
                          />
                          <FieldHelp>
                            Canal direto exibido no rodapé e formulários.
                          </FieldHelp>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            name="contact_phone"
                            value={config.contact_phone}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                            pattern="^\\(\\d{2}\\)\\s9\\s\\d{4}-\\d{4}$"
                            title="Formato esperado: (41) 9 9999-9999"
                          />
                          <FieldHelp>
                            Clique direciona para conversa no WhatsApp.
                          </FieldHelp>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            name="contact_whatsapp"
                            value={config.contact_whatsapp}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
                            pattern="^\\(\\d{2}\\)\\s9\\s\\d{4}-\\d{4}$"
                            title="Formato esperado: (41) 9 9999-9999"
                          />
                          <FieldHelp>
                            Clique abre https://wa.me/+55 com o número informado.
                          </FieldHelp>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-4 md:grid-cols-3">
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
                        </div>
                      </div>
                    </SectionCard>
                  )}
                </div>

                {activeTab !== "oQueEstamosFazendo" ? (
                  <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                    >
                      {saving ? "Salvando..." : "Salvar alteracoes desta aba"}
                    </button>
                    {message ? (
                      <p className="text-sm font-semibold text-zinc-600">{message}</p>
                    ) : null}
                  </div>
                ) : null}
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
