"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Plus, Clipboard, Calendar, Users, Clock, MoreVertical, FileText } from "lucide-react";

export default function AtividadesPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAtividades() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: atividadesData } = await supabase
        .from("atividades_turma")
        .select(`
          id,
          titulo,
          descricao,
          instrucoes,
          data_entrega,
          created_at,
          turmas (
            nome
          )
        `)
        .eq("professor_user_id", user.id)
        .order("created_at", { ascending: false });

      setAtividades(atividadesData || []);
      setLoading(false);
    }

    loadAtividades();
  }, [supabase, router]);

  const isOverdue = (dataEntrega: string) => {
    return new Date(dataEntrega) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          Carregando atividades...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Atividades</h1>
        <Link
          href="/professor/atividades/novo"
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 cursor-pointer"
        >
          <Plus size={16} />
          Nova atividade
        </Link>
      </div>

      {atividades.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 shadow-sm text-center">
          <Clipboard size={48} className="mx-auto text-zinc-400 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Nenhuma atividade ainda
          </h3>
          <p className="text-zinc-600 mb-6">
            Crie sua primeira atividade para engajar seus alunos.
          </p>
          <Link
            href="/professor/atividades/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 cursor-pointer"
          >
            <Plus size={16} />
            Criar primeira atividade
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {atividades.map((atividade) => (
            <div
              key={atividade.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {atividade.titulo}
                    </h3>
                    {atividade.data_entrega && (
                      <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        isOverdue(atividade.data_entrega)
                          ? "bg-red-100 text-red-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}>
                        <Clock size={12} />
                        {isOverdue(atividade.data_entrega) ? "Vencida" : "Pendente"}
                      </div>
                    )}
                  </div>

                  {atividade.descricao && (
                    <p className="text-zinc-600 mb-2 line-clamp-2">
                      {atividade.descricao}
                    </p>
                  )}

                  {atividade.instrucoes && (
                    <div className="flex items-start gap-2 mb-3">
                      <FileText size={14} className="text-zinc-500 mt-0.5" />
                      <p className="text-sm text-zinc-600 line-clamp-2">
                        {atividade.instrucoes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      Criada em {formatDate(atividade.created_at)}
                    </div>
                    {atividade.data_entrega && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        Entrega: {formatDate(atividade.data_entrega)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {atividade.turmas?.nome || "Turma"}
                    </div>
                  </div>
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
