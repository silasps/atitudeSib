import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const envError = (field: string) =>
  NextResponse.json(
    { success: false, message: `${field} não definida.` },
    { status: 500 }
  );

async function getSupabaseAdmin() {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id?: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID da função não informado." },
      { status: 400 }
    );
  }

  const context = await getSupabaseAdmin();

  if (context instanceof NextResponse) {
    return context;
  }

  const { supabaseAdmin } = context;
  const { nome, descricao, ativo } = await req.json();

  if (!nome || typeof ativo !== "boolean") {
    return NextResponse.json(
      {
        success: false,
        message: "Preencha nome e status corretamente.",
      },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("funcoes_voluntariado")
    .update({
      nome,
      descricao: descricao || null,
      ativo,
    })
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
