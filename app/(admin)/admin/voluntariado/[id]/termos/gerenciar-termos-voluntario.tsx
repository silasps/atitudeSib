'use client'

import { useState } from 'react'
import { Loader2, Copy, Check, ExternalLink, Send, Shield } from 'lucide-react'

interface Termo {
  id: string
  tipo: string
  status: string
  signed_at: string | null
  signed_by_name: string | null
  signed_by_email: string | null
  expires_at: string
  created_at: string
  token: string
}

interface Props {
  candidaturaId: string
  nome: string
  email: string
  termos: Termo[]
  siteUrl: string
}

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Aguardando assinatura',
  assinado: 'Assinado',
  expirado: 'Expirado',
}

const STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  assinado: 'bg-green-100 text-green-700',
  expirado: 'bg-gray-100 text-gray-500',
}

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        readOnly value={link}
        className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 min-w-0"
      />
      <button onClick={handleCopy} className="shrink-0 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
      </button>
      <a href={link} target="_blank" rel="noreferrer" className="shrink-0 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <ExternalLink size={14} className="text-gray-500" />
      </a>
    </div>
  )
}

export default function GerenciarTermosVoluntario({ candidaturaId, nome, email, termos, siteUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [novoTermo, setNovoTermo] = useState<{ token: string; link: string } | null>(null)
  const [localTermos, setLocalTermos] = useState<Termo[]>(termos)

  const termoAtivo = localTermos.find(t => t.tipo === 'ficha_voluntario' && t.status === 'pendente')
  const termoAssinado = localTermos.find(t => t.tipo === 'ficha_voluntario' && t.status === 'assinado')

  async function gerarLink() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/voluntariado/${candidaturaId}/termos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_destino: email, nome_destino: nome }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao gerar link'); return }
      setNovoTermo({ token: data.token, link: data.link })
      setLocalTermos(prev => [{
        id: data.token,
        tipo: 'ficha_voluntario',
        status: 'pendente',
        signed_at: null,
        signed_by_name: null,
        signed_by_email: null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        token: data.token,
      }, ...prev])
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Shield size={18} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Termo digital de voluntariado</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Validade jurídica pela Lei 14.063/2020 e Lei 9.608/1998 (Lei do Voluntariado)
            </p>
          </div>
        </div>

        {termoAssinado ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">Termo assinado digitalmente</span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>Assinante: <strong>{termoAssinado.signed_by_name}</strong></p>
              <p>E-mail: <strong>{termoAssinado.signed_by_email}</strong></p>
              <p>Data: <strong>{termoAssinado.signed_at
                ? new Date(termoAssinado.signed_at).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
                    year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })
                : '—'}</strong>
              </p>
            </div>
          </div>
        ) : termoAtivo ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">Link de assinatura ativo</p>
            <p className="text-xs text-yellow-700 mb-2">
              Expira em: {new Date(termoAtivo.expires_at).toLocaleDateString('pt-BR')}
            </p>
            <CopyLink link={`${siteUrl}/voluntario/termos/${termoAtivo.token}`} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Nenhum termo enviado ainda</p>
            <p className="text-xs text-gray-400">
              O link será enviado para <strong>{email}</strong>
            </p>
          </div>
        )}

        {!termoAssinado && (
          <div className="mt-4">
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            {novoTermo && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Link enviado por e-mail e disponível abaixo:</p>
                <CopyLink link={novoTermo.link} />
              </div>
            )}
            <button
              onClick={gerarLink}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {termoAtivo ? 'Gerar novo link' : 'Gerar e enviar termo de voluntariado'}
            </button>
          </div>
        )}
      </div>

      {localTermos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Histórico</h3>
          <div className="space-y-3">
            {localTermos.map(termo => (
              <div key={termo.id} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[termo.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[termo.status] ?? termo.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(termo.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {termo.status === 'assinado' && (
                    <p className="text-xs text-gray-500">
                      Por {termo.signed_by_name} · {termo.signed_by_email}
                    </p>
                  )}
                  {termo.status === 'pendente' && (
                    <p className="text-xs text-gray-400">
                      Expira: {new Date(termo.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                {termo.status === 'pendente' && (
                  <a
                    href={`${siteUrl}/voluntario/termos/${termo.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 p-1.5 text-gray-400 hover:text-green-700 transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
