'use client'

import { useState, useTransition } from 'react'
import { Lightbulb, Clock, Loader2, CircleDot, CheckCircle2, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'pendente' | 'em_andamento' | 'resolvido'

interface Sugestao {
  id: string
  pagina: string
  descricao: string
  status: Status
  solucao: string | null
  created_at: string
  profiles: { nome: string; email: string } | null
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  pendente:     { label: 'Pendente',     color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', icon: Clock },
  em_andamento: { label: 'Em andamento', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',      icon: CircleDot },
  resolvido:    { label: 'Resolvido',    color: 'bg-green-500/15 text-green-300 border-green-500/30',    icon: CheckCircle2 },
}

const STATUSES: Status[] = ['pendente', 'em_andamento', 'resolvido']

function SugestaoCard({ item, onUpdate, onDelete }: {
  item: Sugestao
  onUpdate: (id: string, changes: { status?: Status; solucao?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [status, setStatus] = useState<Status>(item.status)
  const [solucao, setSolucao] = useState(item.solucao ?? '')
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [statusOpen, setStatusOpen] = useState(false)

  const cfg = STATUS_CONFIG[status]

  function handleStatusChange(next: Status) {
    setStatusOpen(false)
    if (next === status) return
    setStatus(next)
    startTransition(() => onUpdate(item.id, { status: next }))
  }

  function handleSaveSolucao() {
    startTransition(() => onUpdate(item.id, { solucao }))
  }

  function handleDelete() {
    if (!confirm('Remover esta sugestão?')) return
    startDelete(() => onDelete(item.id))
  }

  const date = new Date(item.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={cn('bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-4 transition-opacity', isDeleting && 'opacity-40 pointer-events-none')}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Página */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Página</span>
          </div>
          <code className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 font-mono">
            {item.pagina}
          </code>
        </div>

        {/* Status badge + dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setStatusOpen(v => !v)}
            className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-opacity', cfg.color, isPending && 'opacity-50')}
          >
            <cfg.icon size={12} />
            {cfg.label}
            <ChevronDown size={11} className={cn('transition-transform', statusOpen && 'rotate-180')} />
          </button>

          {statusOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                {STATUSES.map(s => {
                  const c = STATUS_CONFIG[s]
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/5',
                        s === status ? 'text-white bg-white/5' : 'text-gray-400',
                      )}
                    >
                      <c.icon size={12} />
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Usuário + data */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-semibold text-gray-300 shrink-0">
          {item.profiles?.nome?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <span className="truncate">{item.profiles?.nome ?? 'Desconhecido'}</span>
        <span className="text-gray-600">·</span>
        <span className="shrink-0">{date}</span>
      </div>

      {/* Descrição */}
      <p className="text-sm text-gray-200 leading-relaxed">{item.descricao}</p>

      {/* Solução */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">Solução / resposta</label>
        <textarea
          value={solucao}
          onChange={e => setSolucao(e.target.value)}
          placeholder="Descreva a solução ou andamento..."
          rows={3}
          className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition"
          >
            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Remover
          </button>
          <button
            onClick={handleSaveSolucao}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export function MelhoriasClient({ initialData }: { initialData: Sugestao[] }) {
  const [items, setItems] = useState<Sugestao[]>(initialData)
  const [filtro, setFiltro] = useState<Status | 'todos'>('todos')

  async function handleUpdate(id: string, changes: { status?: Status; solucao?: string }) {
    await fetch(`/api/superadmin/melhorias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/superadmin/melhorias/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const counts = {
    todos:       items.length,
    pendente:    items.filter(i => i.status === 'pendente').length,
    em_andamento: items.filter(i => i.status === 'em_andamento').length,
    resolvido:   items.filter(i => i.status === 'resolvido').length,
  }

  const filtered = filtro === 'todos' ? items : items.filter(i => i.status === filtro)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center">
          <Lightbulb size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Sugestões de Melhoria</h1>
          <p className="text-xs text-gray-500">{counts.todos} sugestão{counts.todos !== 1 ? 'ões' : ''} recebida{counts.todos !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {([
          ['todos',        'Todas',        counts.todos],
          ['pendente',     'Pendente',     counts.pendente],
          ['em_andamento', 'Em andamento', counts.em_andamento],
          ['resolvido',    'Resolvido',    counts.resolvido],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              filtro === key
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                : 'text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300',
            )}
          >
            {label}
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', filtro === key ? 'bg-blue-500/30' : 'bg-white/10')}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-600">
          <Lightbulb size={36} />
          <p className="text-sm">Nenhuma sugestão {filtro !== 'todos' ? 'com este status ' : ''}ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(item => (
            <SugestaoCard
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
