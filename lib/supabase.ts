import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente principal do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função helper para criar cliente no browser (compatibilidade)
export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}