"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Upload, Link as LinkIcon, FileText, Image, Calendar } from "lucide-react";

export default function NovaAtividadePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [tipo, setTipo] = useState<"link" | "imagem" | "pdf" | "texto">("texto");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [instrucoes, setInstrucoes] = useState("");
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
        const filePath = `atividades/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("atividades")
          .upload(filePath, file);

        if (uploadError) {
          setMessage(`Erro ao fazer upload: ${uploadError.message}`);
          setSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("atividades")
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      // Criar registros para cada turma selecionada
      const atividadeData = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        data_entrega: dataEntrega || null,
        tipo,
        link_url: tipo === "link" ? linkUrl.trim() : null,
        file_url: fileUrl,
        instrucoes: instrucoes.trim() || null,
        professor_user_id: user.id,
        status: "ativa",
      };

      for (const turmaId of selectedTurmas) {
        const { error } = await supabase
          .from("atividades_turma")
          .insert({
            ...atividadeData,
            turma_id: turmaId,
          });

        if (error) {
          setMessage(`Erro ao salvar atividade: ${error.message}`);
          setSaving(false);
          return;
        }
      }

      router.push("/professor/atividades");
    } catch (error) {
      setMessage("Erro inesperado ao salvar atividade.");
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
        href="/professor/atividades"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer"
      >
        ← Voltar para atividades
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900">Nova atividade</h1>

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
                placeholder="Digite o título da atividade"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva a atividade"
                rows={3}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </div>

            {/* Data de entrega */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Data de entrega
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="datetime-local"
                  value={dataEntrega}
                  onChange={(e) => setDataEntrega(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 pl-10 pr-4 py-3"
                />
              </div>
            </div>

            {/* Instruções */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Instruções para os alunos
              </label>
              <textarea
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                placeholder="Instruções detalhadas sobre como fazer a atividade"
                rows={4}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </div>

            {/* Tipo de Anexo */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-700">
                Anexar material (opcional)
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
            {saving ? "Criando atividade..." : "Criar atividade"}
          </button>
          <Link
            href="/professor/atividades"
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 cursor-pointer"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
