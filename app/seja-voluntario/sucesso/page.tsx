import Link from "next/link";

export default function CandidaturaSucessoPage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-4 md: p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Projeto Atitude</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Candidatura enviada com sucesso
        </h1>

        <p className="mt-4 text-zinc-600">
          Sua candidatura foi recebida e entrou como pendente de análise pela
          administração do projeto.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/seja-voluntario"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Voltar para oportunidades
          </Link>

          <Link
            href="/"
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
          >
            Ir para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}