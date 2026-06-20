'use client'

import { useState, useRef, useTransition } from 'react'
import { ChevronDown, Shield, Check, Loader2 } from 'lucide-react'
import type { TermosAlunoContent } from '@/lib/termos/content-aluno'
import { requestOtpTermoAction, signTermoAlunoAction } from './actions'

interface Props {
  token: string
  status: string
  signedAt: string | null
  alunoNome: string
  content: TermosAlunoContent
}

function TermoItem({ termo }: { termo: TermosAlunoContent['termos'][0] }) {
  return (
    <details className="group border-b border-gray-100 last:border-0">
      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer select-none list-none hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
            ✓
          </span>
          <span className="text-sm font-semibold text-gray-700 truncate">{termo.titulo}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-1 pl-16">
        {termo.texto.split('\n\n').map((para, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </details>
  )
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').split('').slice(0, 6)

  function handleChange(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    onChange(next.join(''))
    if (d && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      onChange(text)
      inputs.current[5]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white"
        />
      ))}
    </div>
  )
}

export default function SignTermosAluno({
  token, status, signedAt, alunoNome, content,
}: Props) {
  const [agreed, setAgreed] = useState(false)
  const [autorizaImagem, setAutorizaImagem] = useState<boolean | null>(null)
  const [step, setStep] = useState<'read' | 'form' | 'otp' | 'done'>(
    status === 'assinado' ? 'done' : 'read'
  )
  const [name, setName] = useState(alunoNome)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const alreadySigned = status === 'assinado'

  function handleAgree() {
    if (!agreed || autorizaImagem === null) return
    setStep('form')
    setTimeout(() => {
      document.getElementById('assinatura-form')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  function handleRequestOtp() {
    setError('')
    startTransition(async () => {
      const res = await requestOtpTermoAction(token, email)
      if (res.error) { setError(res.error); return }
      setStep('otp')
    })
  }

  function handleSign() {
    setError('')
    startTransition(async () => {
      let geo: { lat: number; lng: number } | null = null
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        geo = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      } catch { /* geolocalização é opcional */ }

      const res = await signTermoAlunoAction(token, otp, name, email, autorizaImagem!, geo)
      if (res.error) { setError(res.error); return }
      setStep('done')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center font-bold text-sm">OS</div>
            <span className="text-sm font-medium text-white/70">Ostrick Social</span>
            <span className="text-white/30">·</span>
            <span className="text-xs bg-white/15 text-white/80 px-2 py-0.5 rounded-full">Assinatura digital</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{content.titulo}</h1>
          <p className="text-sm text-white/70">{content.subtitulo}</p>

          {alreadySigned && signedAt && (
            <div className="mt-5 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-300 shrink-0" />
              <span className="text-sm text-green-200">
                Assinado em {new Date(signedAt).toLocaleString('pt-BR', {
                  timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
                  year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20">
        {/* Termos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Termos que serão assinados
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Toque em cada seção para ler na íntegra</p>
          </div>
          {content.termos.map(t => <TermoItem key={t.id} termo={t} />)}
        </div>

        {/* Bloco de validade legal */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0 h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Validade jurídica desta assinatura</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Esta assinatura eletrônica tem plena validade jurídica nos termos da{' '}
                <strong>Lei 14.063/2020</strong> e é reconhecida pelo Poder Judiciário brasileiro.
                Ao confirmar, sua identidade, data, horário e localização ficam registrados de forma
                imutável, com o mesmo efeito de uma assinatura manuscrita.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de assinatura */}
        {!alreadySigned && (
          <div id="assinatura-form" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-800 mb-1">Assinar os termos</h2>
            <p className="text-xs text-gray-400 mb-5">Confirme sua leitura e assine eletronicamente</p>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { label: 'Concordar', key: 'read' },
                { label: 'Dados', key: 'form' },
                { label: 'Confirmar', key: 'otp' },
              ].map((s, i) => {
                const steps = ['read', 'form', 'otp', 'done']
                const currentIdx = steps.indexOf(step)
                const thisIdx = steps.indexOf(s.key)
                const done = currentIdx > thisIdx
                const active = currentIdx === thisIdx
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    {i > 0 && <div className={`h-px flex-1 min-w-[20px] ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    <div className={`flex items-center gap-1.5 ${active || done ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </div>
                      <span className="text-xs font-medium text-gray-600 hidden sm:block">{s.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {step === 'read' && (
              <div className="space-y-4">
                {/* Autorização de imagem aqui mesmo */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Autorização de uso de imagem</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Autorizo o projeto a captar e usar imagem, voz e nome em materiais institucionais.
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="img" checked={autorizaImagem === true}
                        onChange={() => setAutorizaImagem(true)} className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Autorizo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="img" checked={autorizaImagem === false}
                        onChange={() => setAutorizaImagem(false)} className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Não autorizo</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Li e concordo com todos os{' '}
                    <strong className="text-gray-900">{content.termos.length} termos</strong>{' '}
                    apresentados acima (Matrícula, Participação, Responsabilidade, Imagem e LGPD).
                  </span>
                </label>
                <button
                  onClick={handleAgree}
                  disabled={!agreed || autorizaImagem === null}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continuar para assinar →
                </button>
              </div>
            )}

            {step === 'form' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome completo do signatário</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail para receber o código</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  onClick={handleRequestOtp}
                  disabled={!name.trim() || !email.trim() || isPending}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enviar código de confirmação
                </button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-0.5">
                    Código enviado para <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-400">Válido por 15 minutos. Verifique também o spam.</p>
                </div>
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <button
                  onClick={handleSign}
                  disabled={otp.replace(/\s/g, '').length < 6 || isPending}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Assinando…</>
                  ) : (
                    '✅ Confirmar e assinar'
                  )}
                </button>
                <button
                  onClick={() => { setStep('form'); setOtp(''); setError('') }}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  Não recebi o código — voltar
                </button>
              </div>
            )}

            {step === 'done' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">✅</div>
                <p className="text-base font-bold text-green-800 mb-1">Termos assinados com sucesso!</p>
                <p className="text-sm text-green-600">
                  Uma confirmação foi enviada para <strong>{email}</strong>. Guarde-a para seus registros.
                </p>
              </div>
            )}
          </div>
        )}

        {alreadySigned && step !== 'done' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <p className="text-base font-bold text-green-800 mb-1">Termos já assinados</p>
            <p className="text-sm text-green-600">
              Estes termos foram assinados eletronicamente em{' '}
              {signedAt
                ? new Date(signedAt).toLocaleString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })
                : '—'}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
