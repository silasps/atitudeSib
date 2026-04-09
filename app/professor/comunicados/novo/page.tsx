"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Upload, Link as LinkIcon, FileText, Image, Users, Eye } from "lucide-react";

export default function NovoComunicadoPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [publico, setPublico] = useState<"todos" | "responsaveis" | "alunos">("todos");
  const [tipo, setTipo] = useState<"texto" | "link" | "imagem" | "pdf">("texto");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [selectedTurmas, setSelectedTurmas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTurmas() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: turmasData } = await supabase
        .from("turmas")
        .select("id, nome")
        .eq("professor_user_id", user.id)
        .eq("status", "ativa")
        .order("nome");

      setTurmas(turmasData || []);
      setLoading(false);
    }

    loadTurmas();
  }, [supabase, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      if (tipo === "imagem" && !selectedFile.type.startsWith("image/")) {
        setMessage("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      if (tipo === "pdf" && selectedFile.type !== "application/pdf") {
        setMessage("Por favor, selecione um arquivo PDF válido.");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const toggleTurma = (turmaId: number) => {
    setSelectedTurmas(prev =>
      prev.includes(turmaId)
        ? prev.filter(id => id !== turmaId)
        : [...prev, turmaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (!titulo.trim()) {
      setMessage("Título é obrigatório.");
      setSaving(false);
      return;
    }

    if (!corpo.trim()) {
      setMessage("Conteúdo do comunicado é obrigatório.");
      setSaving(false);
      return;
    }

    if (selectedTurmas.length === 0) {
      setMessage("Selecione pelo menos uma turma.");
      setSaving(false);
      return;
    }

    if (tipo === "link" && !linkUrl.trim()) {
      setMessage("URL do link é obrigatória.");
      setSaving(false);
      return;
    }

    if ((tipo === "imagem" || tipo === "pdf") && !file) {
      setMessage(`Selecione um arquivo ${tipo === "imagem" ? "de imagem" : "PDF"}.`);
      setSaving(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Usuário não autenticado.");
        setSaving(false);
        return;
      }

      let fileUrl = null;

      // Upload do arquivo se necessário
      if (file && (tipo === "imagem" || tipo === "pdf")) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `comunicados/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("comunicados")
          .upload(filePath, file);

        if (uploadError) {
          setMessage(`Erro ao fazer upload: ${uploadError.message}`);
          setSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("comunicados")
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      // Criar registros para cada turma selecionada
      const comunicadoData = {
        titulo: titulo.trim(),
        corpo: corpo.trim(),
        publico,
        tipo,
        link_url: tipo === "link" ? linkUrl.trim() : null,
        file_url: fileUrl,
        professor_user_id: user.id,
        publicado_em: new Date().toISOString(),
      };

      for (const turmaId of selectedTurmas) {
        const { error } = await supabase
          .from("comunicados_turma")
          .insert({
            ...comunicadoData,
            turma_id: turmaId,
          });

        if (error) {
          setMessage(`Erro ao salvar comunicado: ${error.message}`);
          setSaving(false);
          return;
        }
      }

      router.push("/professor/comunicados");
    } catch (error) {
      setMessage("Erro inesperado ao salvar comunicado.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/professor/comunicados"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer"
      >
        ← Voltar para comunicados
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">Novo comunicado</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título do comunicado"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                required
              />
            </div>

            {/* Corpo do comunicado */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Mensagem *
              </label>
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                placeholder="Digite o conteúdo do comunicado"
                rows={6}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                required
              />
            </div>

            {/* Público */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                Destinatários *
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPublico("todos")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    publico === "todos"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <Users size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Todos</p>
                    <p className="text-xs text-zinc-500">Alunos e responsáveis</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPublico("alunos")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    publico === "alunos"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <Eye size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Apenas alunos</p>
                    <p className="text-xs text-zinc-500">Visível só para alunos</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPublico("responsaveis")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    publico === "responsaveis"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <Users size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Responsáveis</p>
                    <p className="text-xs text-zinc-500">Apenas responsáveis</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Tipo de Anexo */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                Anexar arquivo (opcional)
              </label>
              <div className="grid gap-3 md:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setTipo("texto")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    tipo === "texto"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <FileText size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Texto</p>
                    <p className="text-xs text-zinc-500">Apenas texto</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo("link")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    tipo === "link"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <LinkIcon size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Link</p>
                    <p className="text-xs text-zinc-500">Compartilhar URL</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo("imagem")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    tipo === "imagem"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <Image size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">Imagem</p>
                    <p className="text-xs text-zinc-500">Upload de imagem</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo("pdf")}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
                    tipo === "pdf"
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <FileText size={20} className="text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-900">PDF</p>
                    <p className="text-xs text-zinc-500">Upload de documento</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Campo dinâmico baseado no tipo */}
            {tipo === "link" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  URL do link *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                  required
                />
              </div>
            )}

            {(tipo === "imagem" || tipo === "pdf") && (
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Arquivo {tipo === "imagem" ? "de imagem" : "PDF"} *
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept={tipo === "imagem" ? "image/*" : ".pdf"}
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                  />
                  {file && (
                    <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                      <Upload size={16} className="text-zinc-600" />
                      <span className="text-sm text-zinc-700">{file.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seleção de Turmas */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-3 block text-sm font-medium text-zinc-700">
              Para quais turmas? *
            </label>
            {turmas.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {turmas.map((turma) => (
                  <label
                    key={turma.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-300 p-4 cursor-pointer hover:bg-zinc-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTurmas.includes(turma.id)}
                      onChange={() => toggleTurma(turma.id)}
                      className="h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-500"
                    />
                    <span className="text-sm font-medium text-zinc-900">
                      {turma.nome}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Você não tem turmas ativas. Crie uma turma primeiro.
              </p>
            )}
          </div>
        </div>

        {/* Mensagem de erro */}
        {message && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || turmas.length === 0}
            className="flex-1 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Publicando comunicado..." : "Publicar comunicado"}
          </button>
          <Link
            href="/professor/comunicados"
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 cursor-pointer"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
