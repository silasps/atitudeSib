import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { Profile, UserRole } from '@/types'

// Retorna a sessão e o perfil do usuário autenticado, ou null
export async function getSession(): Promise<{
  profile: Profile
  userId: string
} | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) return null

  return { profile: profile as Profile, userId: user.id }
}

// Exige autenticação — redireciona para /entrar se não autenticado
export async function requireAuth(): Promise<{ profile: Profile; userId: string }> {
  const session = await getSession()
  if (!session) redirect('/entrar')
  return session
}

// Exige role específica — redireciona para /acesso-negado se não autorizado
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<{ profile: Profile; userId: string }> {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.profile.role)) {
    redirect('/acesso-negado')
  }
  return session
}

// Helpers de verificação de role
export const isAdmin = (role: UserRole) => role === 'admin' || role === 'superadmin'
export const isProfessor = (role: UserRole) => role === 'professor'
export const isAdminOrProfessor = (role: UserRole) => isAdmin(role) || isProfessor(role)

// Retorna o destino de login baseado na role
export function getLoginDestination(role: UserRole): string {
  switch (role) {
    case 'superadmin': return '/superadmin'
    case 'admin':
    case 'funcionario': return '/admin'
    case 'professor': return '/professor'
    case 'aluno': return '/aluno'
    case 'responsavel': return '/responsavel'
    default: return '/entrar'
  }
}
