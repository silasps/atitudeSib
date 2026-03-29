import Link from "next/link";

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 md: p-6">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Acesso não autorizado</h1>
        <p className="mt-3 leading-7 text-zinc-600">
          Seu login foi reconhecido, mas você ainda não possui cadastro liberado
          para acessar o painel. Solicite ao administrador que crie ou ative seu cadastro.
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}