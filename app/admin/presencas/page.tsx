"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface Encontro {
  id: number;
  data_encontro: string;
  status: string;
  turma: {
    id: number;
    nome: string;
    professor: {
      id: string;
      nome: string;
    };
  };
  presencas: {
    id: number;
    status: string;
    matricula: {
      aluno: {
        nome: string;
      };
    };
  }[];
}

export default function AdminPresencasPage() {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedProfessor, setSelectedProfessor] = useState<string>("");
  const [turmas, setTurmas] = useState<{ id: number; nome: string }[]>([]);
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([]);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar turmas
      const { data: turmasData } = await supabase
        .from("turmas")
        .select("id, nome")
        .order("nome");

      setTurmas(turmasData || []);

      // Carregar professores
      const { data: professoresData } = await supabase
        .from("profiles")
        .select("id, nome")
        .eq("role", "professor")
        .order("nome");

      setProfessores(professoresData || []);

      // Carregar encontros com presenças
      const { data: encontrosData } = await supabase
        .from("encontros_turma")
        .select(`
          id,
          data_encontro,
          status,
          turma:turmas(
            id,
            nome,
            professor:profiles(id, nome)
          ),
          presencas(
            id,
            status,
            matricula:matriculas(
              aluno:alunos(nome)
            )
          )
        `)
        .order("data_encontro", { ascending: false });

      setEncontros((encontrosData || []) as unknown as Encontro[]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEncontros = encontros.filter((encontro) => {
    const matchesSearch =
      encontro.turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(encontro.data_encontro).toLowerCase().includes(searchTerm.toLowerCase()) ||
      encontro.turma.professor?.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTurma = !selectedTurma || String(encontro.turma.id) === selectedTurma;
    const matchesProfessor = !selectedProfessor || encontro.turma.professor?.id === selectedProfessor;

    return matchesSearch && matchesTurma && matchesProfessor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-zinc-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Gerenciar Presenças</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Visualize e gerencie todas as presenças de todas as turmas.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-zinc-800">
              Pesquisar
            </label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por turma, professor ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="turma" className="text-sm font-medium text-zinc-800">
              Filtrar por turma
            </label>
            <select
              id="turma"
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={String(turma.id)}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="professor" className="text-sm font-medium text-zinc-800">
              Filtrar por professor
            </label>
            <select
              id="professor"
              value={selectedProfessor}
              onChange={(e) => setSelectedProfessor(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="">Todos os professores</option>
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEncontros.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500">
              {searchTerm || selectedTurma || selectedProfessor
                ? "Nenhum encontro encontrado com os filtros aplicados."
                : "Nenhum encontro registrado ainda."}
            </p>
          </div>
        ) : (
          filteredEncontros.map((encontro) => (
            <div
              key={encontro.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {encontro.turma.nome}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Professor: {encontro.turma.professor?.nome || "—"} · Data: {formatDate(encontro.data_encontro)} · Status: {encontro.status}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-900 mb-3">
                  Presenças ({encontro.presencas.length})
                </h4>
                <div className="space-y-2">
                  {encontro.presencas.map((presenca) => (
                    <div
                      key={presenca.id}
                      className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {presenca.matricula.aluno.nome}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          presenca.status === "presente"
                            ? "bg-emerald-100 text-emerald-700"
                            : presenca.status === "falta"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {presenca.status === "presente"
                          ? "Presente"
                          : presenca.status === "falta"
                          ? "Falta"
                          : "Justificada"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}