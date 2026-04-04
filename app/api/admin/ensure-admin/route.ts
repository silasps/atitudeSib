import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const seedEmail = process.env.SEED_ADMIN_EMAIL || "silaspereiras@gmail.com";
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || "holyholy";
  const seedToken = process.env.SEED_ADMIN_TOKEN;

  if (!supabaseUrl || !serviceKey) {
    return badRequest("Supabase URL ou service key não configuradas", 500);
  }

  if (seedToken) {
    const headerToken = req.headers.get("x-seed-token");
    if (headerToken !== seedToken) {
      return badRequest("Token inválido", 401);
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Tenta criar o usuário; se já existir, segue em frente.
  const createResult = await supabaseAdmin.auth.admin.createUser({
    email: seedEmail,
    password: seedPassword,
    email_confirm: true,
  });

  const userId =
    createResult.data?.user?.id ?? (await findUserIdByEmail(supabaseAdmin, seedEmail));

  if (!userId) {
    return badRequest("Não foi possível obter o usuário do Auth", 500);
  }

  // 2) Garante registro em admin_users
  const { error: upsertError } = await supabaseAdmin.from("admin_users").upsert(
    {
      id: userId,
      email: seedEmail,
      nome: "Administrador",
      role: "admin",
      ativo: true,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return badRequest(`Erro ao upsert admin_users: ${upsertError.message}`, 500);
  }

  return NextResponse.json({ ok: true, userId });
}

async function findUserIdByEmail(client: ReturnType<typeof createClient>, email: string) {
  // Sem endpoint direto por e-mail; listUsers e filtra.
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return null;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

