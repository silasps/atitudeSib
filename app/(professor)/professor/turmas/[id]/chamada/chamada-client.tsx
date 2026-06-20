'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Check } from 'lucide-react'
import type { Aluno } from '@/types'

interface Props {
  turmaId: string
  alunos: Aluno[]
}

export default function ChamadaClient({ turmaId, alunos }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [data, setData] = useState(today)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [presencas, setPresencas] = useState<Record<string, boolean>>(
    Object.fromEntries(alunos.map(a => [a.id, true]))
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleAll(presente: boolean) {
    setPresencas(Object.fromEntries(alunos.map(a => [a.id, presente])))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/professor/turmas/${turmaId}/chamada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, hora_inicio: horaInicio, hora_fim: horaFim, conteudo, presencas }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          router.push(`/professor/turmas/${turmaId}`)
          router.refresh()
        }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  const presenteCount = Object.values(presencas).filter(Boolean).length

  if (saved) {
    return (
      <div className="bg-white rounded-xl border border-green-200 p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Chamada salva!</h2>
        <p className="text-gray-500 text-sm">{presenteCount} de {alunos.length} presentes</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Data e horário */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data da aula</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
            <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo da aula</label>
          <textarea value={conteudo} onChange={e => setConteudo(e.target.value)}
            placeholder="O que foi trabalhado hoje?" rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      {/* Lista de presença */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Lista de presença</h2>
            <p className="text-xs text-gray-400 mt-0.5">{presenteCount} de {alunos.length} presentes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)}
              className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition">
              Todos presentes
            </button>
            <button onClick={() => toggleAll(false)}
              className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition">
              Todos ausentes
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {alunos.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhum aluno matriculado</p>
          ) : (
            alunos.map(aluno => (
              <div
                key={aluno.id}
                onClick={() => setPresencas(p => ({ ...p, [aluno.id]: !p[aluno.id] }))}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition select-none"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition ${
                  presencas[aluno.id] ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'
                }`}>
                  {aluno.nome.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-medium text-gray-900">{aluno.nome}</p>
                {presencas[aluno.id] ? (
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                ) : (
                  <XCircle size={20} className="text-red-400 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || alunos.length === 0}
        className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Salvando...' : 'Salvar chamada'}
      </button>
    </div>
  )
}
