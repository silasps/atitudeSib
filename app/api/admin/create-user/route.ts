import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_SUPABASE_URL não definida." },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "SUPABASE_SERVICE_ROLE_KEY não definida." },
        { status: 500 }
      );
    }

    if (!anonKey) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_SUPABASE_ANON_KEY não definida." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    const supabaseServer = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const {
      data: { user: currentUser },
    } = await supabaseServer.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Usuário atual não autenticado." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { email, password, nome, role, ativo } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "E-mail, senha e perfil são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { app_role: role },
      user_metadata: { nome: nome || null },
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message || "Erro ao criar usuário no Auth.",
        },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("admin_users")
      .upsert(
        {
          id: data.user.id,
          email,
          nome: nome || null,
          role,
          ativo: typeof ativo === "boolean" ? ativo : true,
          created_by_user_id: currentUser.id,
          created_by_user_email: currentUser.email ?? null,
        },
        { onConflict: "id" }
      );

    if (insertError) {
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
