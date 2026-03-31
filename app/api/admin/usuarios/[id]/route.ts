import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const envError = (field: string) =>
  NextResponse.json(
    { success: false, message: `${field} não definida.` },
    { status: 500 }
  );

async function getSupabaseContext() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) return envError("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) return envError("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceRoleKey) return envError("SUPABASE_SERVICE_ROLE_KEY");

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
      { success: false, message: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  return { currentUser, supabaseAdmin };
}

async function assertAdminUser(supabaseAdmin: ReturnType<typeof createClient>, userId: string) {
  const { data: adminUser, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { error };
  }

  if (!adminUser) {
    return { notFound: true };
  }

  return { adminUser };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { supabaseAdmin } = context;
    const validation = await assertAdminUser(supabaseAdmin, params.id);

    if ("error" in validation && validation.error) {
      return NextResponse.json(
        { success: false, message: validation.error.message },
        { status: 500 }
      );
    }

    if ("notFound" in validation && validation.notFound) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { email, nome, role, ativo, password } = body;

    if (!email || !role || typeof ativo !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "E-mail, perfil e status precisam ser informados.",
        },
        { status: 400 }
      );
    }

    if (!["admin", "professor"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Perfil inválido." },
        { status: 400 }
      );
    }

    const authPayload: Record<string, string> = { email };

    if (typeof password === "string" && password.trim()) {
      authPayload.password = password;
    }

    if (Object.keys(authPayload).length) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        params.id,
        authPayload
      );

      if (authError) {
        return NextResponse.json(
          { success: false, message: authError.message },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        email,
        nome: nome || null,
        role,
        ativo,
      })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const context = await getSupabaseContext();

    if (context instanceof NextResponse) {
      return context;
    }

    const { supabaseAdmin } = context;

    await supabaseAdmin.auth.admin.deleteUser(params.id);

    const { error: deleteError } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
