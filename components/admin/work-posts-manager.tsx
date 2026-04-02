"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type {
  SiteWorkMediaItem,
  SiteWorkPost,
  WorkPostDescriptionPosition,
  WorkPostMediaType,
} from "@/lib/site-content";
import WorkPostCard from "@/components/public/work-post-card";

type WorkPostsManagerProps = {
  summary: string;
  posts: SiteWorkPost[];
  onSummaryChange: (value: string) => void;
  onPostsChange: (posts: SiteWorkPost[]) => void;
};

type WorkPostDraft = {
  title: string;
  description: string;
  mediaType: WorkPostMediaType;
  descriptionPosition: WorkPostDescriptionPosition;
};

const emptyDraft: WorkPostDraft = {
  title: "",
  description: "",
  mediaType: "image",
  descriptionPosition: "below",
};

const descriptionPositionOptions: {
  value: WorkPostDescriptionPosition;
  label: string;
}[] = [
  { value: "above", label: "Acima da imagem" },
  { value: "below", label: "Abaixo da imagem" },
  { value: "right", label: "Lado direito" },
  { value: "left", label: "Lado esquerdo" },
  { value: "overlay-left", label: "Sobre a imagem a esquerda" },
  { value: "overlay-right", label: "Sobre a imagem a direita" },
  { value: "overlay-top", label: "Acima sobre a imagem" },
  { value: "overlay-bottom", label: "Abaixo sobre a imagem" },
];

export default function WorkPostsManager({
  summary,
  posts,
  onSummaryChange,
  onPostsChange,
}: WorkPostsManagerProps) {
  const supabase = createSupabaseBrowserClient();
  const [draft, setDraft] = useState<WorkPostDraft>(emptyDraft);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [existingMediaItems, setExistingMediaItems] = useState<SiteWorkMediaItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const previewMediaItems =
    previewUrls.length > 0
      ? previewUrls.map((url, index) => ({
          kind: (draft.mediaType === "video" ? "video" : "image") as
            | "image"
            | "video",
          url,
          fileName: selectedFiles[index]?.name,
        }))
      : existingMediaItems;

  async function handleSaveDraft() {
    setMessage("");

    if (!draft.title.trim()) {
      setMessage("Informe o titulo da publicacao.");
      return;
    }

    if (!draft.description.trim()) {
      setMessage("Informe a descricao da publicacao.");
      return;
    }

    let mediaItems = existingMediaItems;

    const validationError = validateMediaSelection(
      draft.mediaType,
      selectedFiles.length > 0
        ? selectedFiles.map((file) => ({
            kind: file.type.startsWith("video/") ? "video" : "image",
          }))
        : mediaItems
    );

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setWorking(true);

    if (selectedFiles.length > 0) {
      const uploadedMedia = await uploadFiles({
        supabase,
        files: selectedFiles,
        mediaType: draft.mediaType,
      });

      if (!uploadedMedia.ok) {
        setMessage(uploadedMedia.message);
        setWorking(false);
        return;
      }

      mediaItems = uploadedMedia.items;
    }

    const now = new Date().toISOString();
    const existingPost = posts.find((post) => post.id === editingPostId);
    const nextPost: SiteWorkPost = {
      id: editingPostId ?? crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      mediaType: draft.mediaType,
      descriptionPosition:
        draft.mediaType === "image" ? draft.descriptionPosition : "below",
      mediaItems,
      createdAt: existingPost?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingPostId) {
      onPostsChange(
        posts.map((post) => (post.id === editingPostId ? nextPost : post))
      );
    } else {
      onPostsChange([nextPost, ...posts]);
    }

    resetDraft();
    setWorking(false);
    setMessage(
      "Publicacao preparada. Clique em Salvar alteracoes desta aba para publicar no site."
    );
  }

  function handleEdit(post: SiteWorkPost) {
    clearPreviewUrls();
    setEditingPostId(post.id);
    setExistingMediaItems(post.mediaItems);
    setSelectedFiles([]);
    setDraft({
      title: post.title,
      description: post.description,
      mediaType: post.mediaType,
      descriptionPosition: post.descriptionPosition,
    });
    setMessage(
      "Edite os campos e depois clique em Atualizar publicacao. Em seguida, salve a aba."
    );
  }

  function handleDelete(postId: string) {
    onPostsChange(posts.filter((post) => post.id !== postId));

    if (editingPostId === postId) {
      resetDraft();
    }

    setMessage(
      "Publicacao removida da lista. Clique em Salvar alteracoes desta aba para atualizar a pagina publica."
    );
  }

  function movePost(postId: string, direction: "up" | "down") {
    const index = posts.findIndex((post) => post.id === postId);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= posts.length) {
      return;
    }

    const reordered = [...posts];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    onPostsChange(reordered);
    setMessage(
      "Ordem das publicacoes atualizada. Clique em Salvar alteracoes desta aba para refletir no site."
    );
  }

  function handleMediaTypeChange(value: WorkPostMediaType) {
    setDraft((prev) => ({
      ...prev,
      mediaType: value,
      descriptionPosition: value === "image" ? prev.descriptionPosition : "below",
    }));
    setMessage("");
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    clearPreviewUrls();
    setSelectedFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setMessage("");
  }

  function resetDraft() {
    clearPreviewUrls();
    setDraft(emptyDraft);
    setEditingPostId(null);
    setExistingMediaItems([]);
    setSelectedFiles([]);
  }

  function clearPreviewUrls() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  }

  const previewPost: SiteWorkPost = {
    id: editingPostId ?? "preview",
    title: draft.title.trim() || "Titulo da publicacao",
    description:
      draft.description.trim() ||
      "A descricao aparecera aqui enquanto voce monta a postagem.",
    mediaType: draft.mediaType,
    descriptionPosition:
      draft.mediaType === "image" ? draft.descriptionPosition : "below",
    mediaItems: previewMediaItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Texto de abertura da pagina
        </label>
        <textarea
          value={summary}
          onChange={(event) => onSummaryChange(event.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
          placeholder="Apresente o que esta sendo feito no projeto e convide o visitante a acompanhar as publicacoes."
        />
        <p className="mt-1 text-xs text-zinc-500">
          Esse texto aparece no topo da pagina publica, acima das postagens.
        </p>
      </div>

      <section className="space-y-5 rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-900">
            {editingPostId ? "Editar publicacao" : "Nova publicacao"}
          </p>
          <p className="text-sm text-zinc-500">
            Preencha os campos, veja a pre-visualizacao e depois adicione a publicacao a lista.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Titulo da publicacao
          </label>
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, title: event.target.value }))
            }
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Descricao
          </label>
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={4}
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Tipo de midia
            </label>
            <select
              value={draft.mediaType}
              onChange={(event) =>
                handleMediaTypeChange(event.target.value as WorkPostMediaType)
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            >
              <option value="image">Imagem</option>
              <option value="carousel">Carrossel</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Posicao da descricao
            </label>
            <select
              value={draft.mediaType === "image" ? draft.descriptionPosition : "below"}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  descriptionPosition: event.target
                    .value as WorkPostDescriptionPosition,
                }))
              }
              disabled={draft.mediaType !== "image"}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-zinc-100"
            >
              {draft.mediaType === "image" ? (
                descriptionPositionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="below">Abaixo da midia</option>
              )}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Em video e carrossel a descricao fica abaixo automaticamente.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Upload da midia
          </label>
          <input
            type="file"
            accept={draft.mediaType === "video" ? "video/*" : "image/*"}
            multiple={draft.mediaType === "carousel"}
            onChange={handleFilesChange}
            className="w-full rounded-2xl border border-dashed border-zinc-300 px-4 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <p className="mt-1 text-xs text-zinc-500">
            {draft.mediaType === "image"
              ? "Envie uma imagem."
              : draft.mediaType === "carousel"
                ? "Envie uma ou mais imagens para o carrossel."
                : "Envie um video."}
          </p>
          {existingMediaItems.length > 0 && previewUrls.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-500">
              Esta edicao esta usando a midia ja salva. Se quiser trocar, envie novos arquivos.
            </p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-zinc-900">Pre-visualizacao</p>
          {previewMediaItems.length > 0 ? (
            <WorkPostCard
              key={`${previewPost.mediaType}-${previewPost.descriptionPosition}-${previewMediaItems
                .map((item) => item.url)
                .join("|")}`}
              post={previewPost}
              compact
              showTimestamp={false}
            />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
              Envie a midia para visualizar como a publicacao vai aparecer.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={working}
            className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {working
              ? "Enviando..."
              : editingPostId
                ? "Atualizar publicacao"
                : "Adicionar publicacao"}
          </button>
          {editingPostId ? (
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700"
            >
              Cancelar edicao
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-900">Publicacoes prontas</p>
          <p className="text-sm text-zinc-500">
            Essa lista sera exibida na pagina publica na mesma ordem em que aparece aqui.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.id} className="space-y-3 rounded-[2rem] border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                      Publicacao {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">{post.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => movePost(post.id, "up")}
                      disabled={index === 0}
                      className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Mover para cima
                    </button>
                    <button
                      type="button"
                      onClick={() => movePost(post.id, "down")}
                      disabled={index === posts.length - 1}
                      className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Mover para baixo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <WorkPostCard post={post} compact />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
            Nenhuma publicacao adicionada ainda.
          </div>
        )}
      </section>

      {message ? <p className="text-sm font-semibold text-zinc-600">{message}</p> : null}
    </div>
  );
}

function validateMediaSelection(
  mediaType: WorkPostMediaType,
  mediaItems: Array<{ kind: "image" | "video" }>
) {
  if (mediaType === "image") {
    if (mediaItems.length !== 1 || mediaItems[0]?.kind !== "image") {
      return "Para imagem estatica, envie exatamente uma imagem.";
    }
  }

  if (mediaType === "carousel") {
    if (mediaItems.length === 0 || mediaItems.some((item) => item.kind !== "image")) {
      return "Para carrossel, envie uma ou mais imagens.";
    }
  }

  if (mediaType === "video") {
    if (mediaItems.length !== 1 || mediaItems[0]?.kind !== "video") {
      return "Para video, envie exatamente um arquivo de video.";
    }
  }

  return null;
}

async function uploadFiles({
  supabase,
  files,
  mediaType,
}: {
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  files: File[];
  mediaType: WorkPostMediaType;
}) {
  const uploadedItems: SiteWorkMediaItem[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() || (mediaType === "video" ? "mp4" : "jpg");
    const fileBaseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const filePath = `work-posts/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${fileBaseName || "midia"}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("site-images")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      return {
        ok: false as const,
        message: `Erro ao enviar midia: ${uploadError.message}`,
        items: [] as SiteWorkMediaItem[],
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    uploadedItems.push({
      kind: file.type.startsWith("video/") ? "video" : "image",
      url: publicUrlData.publicUrl,
      storagePath: filePath,
      fileName: file.name,
    });
  }

  return {
    ok: true as const,
    message: "",
    items: uploadedItems,
  };
}
