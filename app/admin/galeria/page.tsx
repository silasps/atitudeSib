"use client";

import { useEffect, useRef, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type GalleryItem = {
  id: number;
  image_url: string;
  file_name: string | null;
  legenda: string | null;
  ativo: boolean;
  created_at: string;
  created_by_user_id: string | null;
  created_by_user_email: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function FieldHelp({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-zinc-500">{children}</p>;
}

export default function GaleriaPage() {
  const supabase = createSupabaseBrowserClient();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [legenda, setLegenda] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingLegenda, setEditingLegenda] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function fetchGallery() {
    const { data, error } = await supabase
      .from("site_gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as GalleryItem[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    async function fetchCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);
      setCurrentUserEmail(user?.email ?? null);
    }

    fetchCurrentUser();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("site-images")
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) {
      setMessage(`Erro ao enviar imagem: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase
      .from("site_gallery")
      .insert([
          {
          image_url: imageUrl,
          file_name: file.name,
          legenda: legenda || null,
          ativo: true,
          created_by_user_id: currentUserId,
          created_by_user_email: currentUserEmail,
          },
      ]);

    if (insertError) {
      setMessage(`Imagem enviada, mas houve erro ao salvar no banco: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setLegenda("");
    setMessage("Imagem enviada com sucesso.");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    await fetchGallery();
    setUploading(false);
  }

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  async function toggleAtivo(item: GalleryItem) {
    const { error } = await supabase
      .from("site_gallery")
      .update({ ativo: !item.ativo })
      .eq("id", item.id);

    if (error) {
      setMessage(`Erro ao atualizar imagem: ${error.message}`);
      return;
    }

    await fetchGallery();
  }

  async function handleSaveEdit() {
    if (!editingItem) return;

    setModalLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("site_gallery")
      .update({ legenda: editingLegenda || null })
      .eq("id", editingItem.id);

    if (error) {
      setMessage(`Erro ao atualizar imagem: ${error.message}`);
      setModalLoading(false);
      return;
    }

    setEditingItem(null);
    setEditingLegenda("");
    await fetchGallery();
    setModalLoading(false);
  }

  async function handleDeleteImage() {
    if (!editingItem) return;

    setModalLoading(true);
    setMessage("");

    try {
      const url = new URL(editingItem.image_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/site-images/");
      const storagePath = pathParts[1];

      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("site-images")
          .remove([storagePath]);

        if (storageError) {
          setMessage(`Erro ao excluir do storage: ${storageError.message}`);
          setModalLoading(false);
          return;
        }
      }

      const { error: deleteError } = await supabase
        .from("site_gallery")
        .delete()
        .eq("id", editingItem.id);

      if (deleteError) {
        setMessage(`Erro ao excluir imagem: ${deleteError.message}`);
        setModalLoading(false);
        return;
      }

      setEditingItem(null);
      setEditingLegenda("");
      await fetchGallery();
      setModalLoading(false);
    } catch {
      setMessage("Não foi possível interpretar a URL da imagem.");
      setModalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 md:p-4 md: p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              <PageTitle
                title="Galeria"
                subtitle="Envie imagens para usar nas páginas públicas do projeto"
              />

              <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
                    Upload rápido
                  </p>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Enviar nova imagem
                  </h2>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1.1fr]">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-700">
                      Legenda (opcional)
                    </label>
                    <textarea
                      placeholder="Descreva em uma frase o que a imagem mostra."
                      value={legenda}
                      onChange={(e) => setLegenda(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-700"
                    />
                    <FieldHelp>Essa legenda vira o texto dos slides.</FieldHelp>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-dashed border-zinc-200 p-4 text-center">
                    <p className="text-sm text-zinc-500">
                      Envie JPG ou PNG com até 5 MB.
                    </p>
                    <button
                      type="button"
                      onClick={openFileDialog}
                      disabled={uploading}
                      className="w-full rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {uploading ? "Enviando..." : "Selecionar imagem"}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <p className="text-xs text-zinc-500">
                      Mantenha as imagens atualizadas para contar novas histórias.
                    </p>
                  </div>
                </div>

                {message ? (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    {message}
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-4 md: p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Imagens enviadas
                </h2>

                {loading ? (
                  <p className="mt-4 text-sm text-zinc-600">Carregando galeria...</p>
                ) : items.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-600">
                    Nenhuma imagem enviada ainda.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-zinc-200"
                      >
                        <img
                          src={item.image_url}
                          alt={item.legenda || item.file_name || "Imagem da galeria"}
                          className="h-56 w-full object-cover"
                        />

                        <div className="space-y-3 p-4">
                          <p className="text-sm font-semibold text-zinc-900">
                            {item.legenda || "Sem legenda registrada"}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Arquivo: {item.file_name || "Link direto enviado"}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Enviado em {formatDateTime(item.created_at)}
                          </p>

                          <p className="text-xs text-zinc-500">
                            Por: {item.created_by_user_email || "Não informado"}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                item.ativo
                                    ? "bg-green-100 text-green-700"
                                    : "bg-zinc-200 text-zinc-700"
                                }`}
                            >
                                {item.ativo ? "Ativa" : "Inativa"}
                            </span>

                            <div className="flex flex-wrap gap-2">
                                <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(item);
                                    setEditingLegenda(item.legenda || "");
                                }}
                                className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                                >
                                Editar
                                </button>

                                <button
                                type="button"
                                onClick={() => toggleAtivo(item)}
                                className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                                >
                                {item.ativo ? "Desativar" : "Ativar"}
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                )}
                {editingItem ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                      <div className="w-full max-w-lg rounded-2xl bg-white p-4 md: p-6 shadow-xl">
                      <h2 className="text-lg font-semibold text-zinc-900">
                          Editar imagem
                      </h2>
  
                      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
                          <img
                          src={editingItem.image_url}
                          alt={editingItem.legenda || "Imagem da galeria"}
                          className="h-56 w-full object-cover"
                          />
                      </div>
  
                      <div className="mt-4">
                          <label className="mb-1 block text-sm font-medium text-zinc-700">
                          Descrição / legenda
                          </label>
                          <input
                          type="text"
                          value={editingLegenda}
                          onChange={(e) => setEditingLegenda(e.target.value)}
                          className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                          />
                      </div>
  
                      <div className="mt-6 flex items-center justify-between gap-3">
                          <button
                          type="button"
                          onClick={handleDeleteImage}
                          disabled={modalLoading}
                          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                          >
                          {modalLoading ? "Processando..." : "Excluir"}
                          </button>
  
                          <div className="flex gap-3">
                          <button
                              type="button"
                              onClick={() => {
                              setEditingItem(null);
                              setEditingLegenda("");
                              }}
                              className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
                          >
                              Cancelar
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={modalLoading}
                            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                          >
                            {modalLoading ? "Salvando..." : "Salvar"}
                          </button>
                        </div>
                    </div>
                    </div>
                </div>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
