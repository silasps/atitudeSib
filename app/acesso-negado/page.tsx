import Link from 'next/link'

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h1>
        <p className="text-gray-500 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Link
          href="/entrar"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
