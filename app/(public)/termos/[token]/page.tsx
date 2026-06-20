import { createServiceClient } from '@/lib/supabase-server'
import { TERMOS_ALUNO_CONTENT } from '@/lib/termos/content-aluno'
import SignTermosAluno from './sign-termos-aluno'

interface Props {
  params: Promise<{ token: string }>
}

export default async function TermosAlunoPage({ params }: Props) {
  const { token } = await params
  const supabase = await createServiceClient()

  const { data: termo } = await supabase
    .from('termos_ficha')
    .select('id, token, tipo, status, signed_at, expires_at, alunos(nome)')
    .eq('token', token)
    .eq('tipo', 'ficha_aluno')
    .single()

  if (!termo) {
    return <ErroPage mensagem="Link não encontrado. Verifique o endereço ou solicite um novo link." />
  }

  if (termo.status !== 'assinado' && new Date(termo.expires_at) < new Date()) {
    return <ErroPage mensagem="Este link expirou. Entre em contato com o projeto para receber um novo link." icone="⏰" />
  }

  const alunoRaw = termo.alunos as unknown as { nome: string } | { nome: string }[] | null
  const alunoNome = Array.isArray(alunoRaw) ? (alunoRaw[0]?.nome ?? '') : (alunoRaw?.nome ?? '')

  return (
    <SignTermosAluno
      token={token}
      status={termo.status}
      signedAt={termo.signed_at}
      alunoNome={alunoNome}
      content={TERMOS_ALUNO_CONTENT}
    />
  )
}

function ErroPage({ mensagem, icone = '🔗' }: { mensagem: string; icone?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">{icone}</div>
        <h1 className="text-lg font-bold text-gray-800 mb-2">Link inválido</h1>
        <p className="text-sm text-gray-500">{mensagem}</p>
      </div>
    </div>
  )
}
