'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getLoginDestination } from '@/lib/auth-client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface LoginFormProps {
  redirectTo?: string
  primaryColor: string
}

export default function LoginForm({ redirectTo, primaryColor }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError || !user) {
        setError('Email ou senha incorretos. Tente novamente.')
        return
      }

      // Busca o perfil para saber o destino
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const destination = redirectTo || (profile ? getLoginDestination(profile.role) : '/admin')
      // Navegação completa para garantir que os cookies de sessão sejam enviados ao servidor
      window.location.href = destination
    } catch {
      setError('Erro ao conectar. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-300 bg-white text-gray-900
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5 border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white
          transition disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
        style={{ backgroundColor: primaryColor }}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
