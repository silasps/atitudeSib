'use client'

import { useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { Lightbulb, X, Send, Loader2, CheckCircle } from 'lucide-react'

export function MelhoriaFab() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setEnviado(false)
    setErro('')
    setDescricao('')
    setOpen(true)
  }

  function handleClose() {
    if (isPending) return
    setOpen(false)
    setTimeout(() => {
      setEnviado(false)
      setErro('')
      setDescricao('')
    }, 300)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return
    setErro('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/melhorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pagina: pathname, descricao: descricao.trim() }),
        })
        if (res.ok) {
          setEnviado(true)
          setTimeout(handleClose, 2200)
        } else {
          setErro('Não foi possível enviar. Tente novamente.')
        }
      } catch {
        setErro('Erro de conexão. Tente novamente.')
      }
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-900 shadow-lg shadow-amber-400/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Sugerir melhoria"
        aria-label="Sugerir melhoria"
      >
        <Lightbulb size={22} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb size={16} className="text-amber-500" />
                </div>
                <span className="font-semibold text-gray-900">Sugerir melhoria</span>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Página atual */}
            <div className="mx-5 mb-4 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium shrink-0">Página</span>
              <span className="text-xs text-gray-600 font-mono truncate">{pathname}</span>
            </div>

            {enviado ? (
              <div className="flex flex-col items-center gap-3 py-8 px-5">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-800">Sugestão enviada com sucesso!</p>
                <p className="text-xs text-gray-400 text-center">Obrigado pelo feedback. Nossa equipe vai analisar.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva sua sugestão de melhoria para esta página..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  required
                  autoFocus
                  disabled={isPending}
                />
                {erro && <p className="text-xs text-red-500">{erro}</p>}
                <button
                  type="submit"
                  disabled={!descricao.trim() || isPending}
                  className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-semibold text-sm py-2.5 rounded-xl transition active:scale-95"
                >
                  {isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Enviando...</>
                    : <><Send size={15} /> Enviar sugestão</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
