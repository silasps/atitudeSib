import Link from "next/link";
import { createAlunoAction } from "../actions";

export default function NovoAlunoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Gestão acadêmica</p>
          <h1 className="text-2xl font-bold text-zinc-900">Novo aluno</h1>
        </div>

        <Link
          href="/admin/alunos"
          className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Voltar
        </Link>
      </div>

      <form
        action={createAlunoAction}
        className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-zinc-800">
            Nome do aluno
          </label>
          <input
            id="nome"
            name="nome"
            required
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Nome completo"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="data_nascimento"
              className="text-sm font-medium text-zinc-800"
            >
              Data de nascimento
            </label>
            <input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-zinc-800">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="ativo"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="nome_responsavel"
              className="text-sm font-medium text-zinc-800"
            >
              Nome do responsável
            </label>
            <input
              id="nome_responsavel"
              name="nome_responsavel"
              required
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="telefone_responsavel"
              className="text-sm font-medium text-zinc-800"
            >
              Telefone do responsável
            </label>
            <input
              id="telefone_responsavel"
              name="telefone_responsavel"
              required
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              placeholder="Ex.: 41999999999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="observacoes"
            className="text-sm font-medium text-zinc-800"
          >
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={4}
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
            placeholder="Informações importantes para a equipe"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Salvar aluno
          </button>
        </div>
      </form>
    </div>
  );
}