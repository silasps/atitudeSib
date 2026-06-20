'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Email ou senha incorretos. Tente novamente.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  const destinations: Record<string, string> = {
    superadmin: '/superadmin',
    admin: '/admin',
    funcionario: '/admin',
    professor: '/professor',
    aluno: '/aluno',
    responsavel: '/responsavel',
  }

  const destination = destinations[profile?.role ?? ''] ?? '/admin'
  redirect(destination)
}
