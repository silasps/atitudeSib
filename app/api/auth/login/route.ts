import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getLoginDestination } from "@/lib/auth-utils";

function badRequest(message: string) {
  const response = NextResponse.redirect("/login");
  response.headers.set("location", `/login?error=${encodeURIComponent(message)}`);
  return response;
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return badRequest("Configuração de Supabase ausente.");
  }

  const formData = await req.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = String(formData.get("redirect") || "");

  if (typeof email !== "string" || typeof password !== "string") {
    return badRequest("E-mail e senha são obrigatórios.");
  }

  const loginResponse = NextResponse.redirect(new URL("/login", req.url));
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          loginResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session || !data.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", error?.message || "Credenciais inválidas.");
    if (redirectTo) {
      loginUrl.searchParams.set("redirect", redirectTo);
    }
    loginResponse.headers.set("location", loginUrl.toString());
    return loginResponse;
  }

  const destination =
    redirectTo && redirectTo.startsWith("/")
      ? redirectTo
      : await getLoginDestination(data.user, supabase);

  const successUrl = new URL(destination, req.url);
  loginResponse.headers.set("location", successUrl.toString());
  return loginResponse;
}
