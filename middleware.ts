import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ONLY_PREFIX = ["/admin"];
const PROFESSOR_PREFIX = ["/professor"];
const FAMILIA_PREFIX = ["/familia"];
const ALUNO_PREFIX = ["/aluno"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Apenas exige autenticação para áreas protegidas; a checagem de role fica nos layouts.
  if (
    !user &&
    startsWithAny(pathname, [
      ...ADMIN_ONLY_PREFIX,
      ...PROFESSOR_PREFIX,
      ...FAMILIA_PREFIX,
      ...ALUNO_PREFIX,
    ])
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/professor/:path*",
    "/familia/:path*",
    "/aluno/:path*",
  ],
};
