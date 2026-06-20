import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSlugFromHost } from '@/lib/tenant'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || 'localhost'

  // Resolve tenant pelo host e injeta como header para Server Components
  const slug = getSlugFromHost(host)
  const requestHeaders = new Headers(request.headers)
  if (slug) {
    requestHeaders.set('x-tenant-slug', slug)
  }

  // Cria resposta base com headers do tenant
  let response = NextResponse.next({ request: { headers: requestHeaders } })

  // Cria cliente Supabase para refresh de sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Lê a sessão dos cookies (sem chamada de rede — suficiente para redirect no middleware)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Rotas protegidas que exigem autenticação
  const protectedPrefixes = ['/admin', '/professor', '/aluno', '/responsavel', '/superadmin']
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = new URL('/entrar', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redireciona usuário logado que acessa /entrar para o seu painel
  if (pathname === '/entrar' && user) {
    // O destino correto é determinado no Server Component do /entrar
    // Apenas deixa passar — o page.tsx decide o redirect
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
