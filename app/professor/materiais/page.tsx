"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Plus, BookOpen, Link as LinkIcon, Image, FileText, Calendar, Users, MoreVertical } from "lucide-react";

export default function MateriaisPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMateriais() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: materiaisData } = await supabase
        .from("turma_materiais")
        .select(`
          id,
          titulo,
          descricao,
          tipo,
          link_url,
          file_url,
          created_at,
          turmas (
            nome
          )
        `)
        .eq("professor_user_id", user.id)
        .order("created_at", { ascending: false });

      setMateriais(materiaisData || []);
      setLoading(false);
    }

    loadMateriais();
  }, [supabase, router]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "link":
        return <LinkIcon size={16} className="text-zinc-600" />;
      case "imagem":
        return <Image size={16} className="text-zinc-600" />;
      case "pdf":
        return <FileText size={16} className="text-zinc-600" />;
      default:
        return <BookOpen size={16} className="text-zinc-600" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "link":
        return "Link";
      case "imagem":
        return "Imagem";
      case "pdf":
        return "PDF";
      default:
        return "Texto";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          Carregando materiais...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Materiais</h1>
        <Link
          href="/professor/materiais/novo"
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 cursor-pointer"
        >
          <Plus size={16} />
          Novo material
        </Link>
      </div>

      {materiais.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 shadow-sm text-center">
          <BookOpen size={48} className="mx-auto text-zinc-400 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Nenhum material ainda
          </h3>
          <p className="text-zinc-600 mb-6">
            Crie seu primeiro material para compartilhar recursos com suas turmas.
          </p>
          <Link
            href="/professor/materiais/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 cursor-pointer"
          >
            <Plus size={16} />
            Criar primeiro material
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {materiais.map((material) => (
            <div
              key={material.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {material.titulo}
                    </h3>
                    <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1">
                      {getTipoIcon(material.tipo)}
                      <span className="text-xs font-medium text-zinc-700">
                        {getTipoLabel(material.tipo)}
                      </span>
                    </div>
                  </div>

                  {material.descricao && (
                    <p className="text-zinc-600 mb-3 line-clamp-2">
                      {material.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(material.created_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {material.turmas?.nome || "Turma"}
                    </div>
                  </div>

                  {material.tipo !== "texto" && (
                    <div className="mt-3">
                      {material.tipo === "link" && material.link_url && (
                        <a
                          href={material.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-zinc-900 hover:text-zinc-700"
                        >
                          🔗 {material.link_url}
                        </a>
                      )}
                      {material.tipo === "imagem" && material.file_url && (
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-900">
                          🖼️ Imagem anexada
                        </div>
                      )}
                      {material.tipo === "pdf" && material.file_url && (
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-900">
                          📄 PDF anexado
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="p-2 hover:bg-zinc-100 rounded-lg cursor-pointer">
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
