'use client'

import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'

interface Props {
  emailContato: string | null
  telefone: string | null
}

export function ContatoForm({ emailContato, telefone }: Props) {
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState(emailContato ?? '')
  const [tel, setTel] = useState(telefone ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setLoading(true)
    await fetch('/api/admin/configuracoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_contato: email || null, telefone: tel || null }),
    })
    setLoading(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function cancel() {
    setEmail(emailContato ?? '')
    setTel(telefone ?? '')
    setEditing(false)
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">Dados de contato</p>
          <p className="text-xs text-gray-400 mt-0.5">Exibidos no site público da organização</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <Pencil size={13} />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancel}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              <X size={13} />
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Salvar
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        <div className="px-6 py-4 flex items-center gap-4">
          <span className="text-sm text-gray-500 w-32 shrink-0">Email</span>
          {editing ? (
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contato@suaorg.com.br"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 transition"
            />
          ) : (
            <span className="text-sm text-gray-900">{emailContato || <span className="text-gray-400 italic">não informado</span>}</span>
          )}
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <span className="text-sm text-gray-500 w-32 shrink-0">Telefone</span>
          {editing ? (
            <input
              type="tel"
              value={tel}
              onChange={e => setTel(e.target.value)}
              placeholder="(11) 99999-9999"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 transition"
            />
          ) : (
            <span className="text-sm text-gray-900">{telefone || <span className="text-gray-400 italic">não informado</span>}</span>
          )}
        </div>
      </div>

      {saved && (
        <div className="px-6 py-3 bg-green-50 border-t border-green-100 text-xs text-green-700 flex items-center gap-1.5">
          <Check size={13} />
          Dados de contato salvos com sucesso
        </div>
      )}
    </div>
  )
}
