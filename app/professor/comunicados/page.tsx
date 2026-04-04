"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Plus, MessageSquare, Users, Eye, Calendar, MoreVertical } from "lucide-react";

export default function ComunicadosPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [comunicados, setComunicados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComunicados() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: comunicadosData } = await supabase
        .from("comunicados_turma")
        .select(`
          id,
          titulo,
          corpo,
          publico,
          tipo,
          link_url,
          file_url,
          publicado_em,
          turmas (
            nome
          )
        `)
        .eq("professor_user_id", user.id)
        .order("publicado_em", { ascending: false });

      setComunicados(comunicadosData || []);
      setLoading(false);
    }

    loadComunicados();
  }, [supabase, router]);

  const getPublicoLabel = (publico: string) => {
    switch (publico) {
      case "todos":
        return "Todos";
      case "alunos":
        return "Apenas alunos";
      case "responsaveis":
        return "Responsáveis";
      default:
        return publico;
    }
  };

  const getPublicoIcon = (publico: string) => {
    switch (publico) {
      case "todos":
        return <Users size={16} className="text-zinc-600" />;
      case "alunos":
        return <Eye size={16} className="text-zinc-600" />;
      case "responsaveis":
        return <Users size={16} className="text-zinc-600" />;
      default:
        return <Users size={16} className="text-zinc-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          Carregando comunicados...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Comunicados</h1>
        <Link
          href="/professor/comunicados/novo"
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          <Plus size={16} />
          Novo comunicado
        </Link>
      </div>

      {comunicados.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 shadow-sm text-center">
          <MessageSquare size={48} className="mx-auto text-zinc-400 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Nenhum comunicado ainda
          </h3>
          <p className="text-zinc-600 mb-6">
            Crie seu primeiro comunicado para se comunicar com alunos e responsáveis.
          </p>
          <Link
            href="/professor/comunicados/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Plus size={16} />
            Criar primeiro comunicado
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {comunicados.map((comunicado) => (
            <div
              key={comunicado.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {comunicado.titulo}
                    </h3>
                    <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1">
                      {getPublicoIcon(comunicado.publico)}
                      <span className="text-xs font-medium text-zinc-700">
                        {getPublicoLabel(comunicado.publico)}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-600 mb-3 line-clamp-2">
                    {comunicado.corpo}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(comunicado.publicado_em).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {comunicado.turmas?.nome || "Turma"}
                    </div>
                  </div>

                  {comunicado.tipo !== "texto" && (
                    <div className="mt-3">
                      {comunicado.tipo === "link" && comunicado.link_url && (
                        <a
                          href={comunicado.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-zinc-900 hover:text-zinc-700"
                        >
                          🔗 Link anexado
                        </a>
                      )}
                      {comunicado.tipo === "imagem" && comunicado.file_url && (
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-900">
                          🖼️ Imagem anexada
                        </div>
                      )}
                      {comunicado.tipo === "pdf" && comunicado.file_url && (
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-900">
                          📄 PDF anexado
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="p-2 hover:bg-zinc-100 rounded-lg">
                  <MoreVertical size={16} className="text-zinc-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
