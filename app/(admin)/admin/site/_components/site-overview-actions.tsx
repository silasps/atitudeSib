'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Globe, Loader2, Eye } from 'lucide-react'

interface Props {
  subdomain: string
  pathUrl: string
  verifiedDomains: string[]
  publicado: boolean
  hasSiteConfig: boolean
}

export default function SiteOverviewActions({ subdomain, pathUrl, verifiedDomains, publicado: initialPublicado, hasSiteConfig }: Props) {
  const [copied, setCopied] = useState(false)
  const [publicado, setPublicado] = useState(initialPublicado)
  const [loading, setLoading] = useState(false)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function togglePublicado() {
    setLoading(true)
    try {
      await fetch('/api/admin/site/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicado: !publicado }),
      })
      setPublicado(v => !v)
    } finally {
      setLoading(false)
    }
  }

  const primaryUrl = verifiedDomains.length > 0
    ? `https://${verifiedDomains[0]}`
    : pathUrl

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {/* Linha 1: ícone + label + URL */}
      <div className="flex items-center gap-2 min-w-0">
        <Globe size={15} className="text-gray-400 shrink-0" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
          Seu site público
        </span>
        <span className="text-gray-300 shrink-0">·</span>
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-mono text-blue-600 hover:underline truncate min-w-0"
        >
          {primaryUrl}
        </a>
      </div>

      {/* Hint de domínio */}
      {verifiedDomains.length === 0 ? (
        <p className="text-xs text-gray-400 mt-1.5 ml-[23px]">
          Subdomínio automático ·{' '}
          <a href="/admin/site/dominio" className="underline hover:text-gray-600">
            adicionar domínio próprio
          </a>
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-1.5 ml-[23px]">
          Domínio próprio verificado ·{' '}
          <span className="font-mono">{subdomain}</span> (subdomínio padrão)
        </p>
      )}

      {/* Linha 2: botões de ação */}
      <div className="flex items-center gap-2 mt-3 ml-[23px]">
        <button
          onClick={() => copy(primaryUrl)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition"
        >
          {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition"
        >
          <Eye size={13} />
          Pré-visualizar
        </a>
      </div>

      {/* Linha 3: status + toggle publicação */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full shrink-0 ${publicado ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-700">
            {publicado ? 'Site publicado — visitantes podem ver' : 'Site não publicado — apenas você vê'}
          </span>
        </div>
        <button
          onClick={togglePublicado}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60 shrink-0 ${
            publicado
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading && <Loader2 size={12} className="animate-spin" />}
          {publicado ? 'Despublicar' : 'Publicar agora'}
        </button>
      </div>

      {!hasSiteConfig && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Configure a aparência do site antes de publicar.{' '}
          <a href="/admin/site/aparencia" className="font-semibold underline">Configurar →</a>
        </p>
      )}
    </div>
  )
}
