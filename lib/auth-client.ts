import type { UserRole } from '@/types'

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
