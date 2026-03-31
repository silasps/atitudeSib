export type AdminUserRole = "admin" | "professor";

export type AdminUser = {
  id: string;
  email: string;
  nome: string | null;
  role: AdminUserRole;
  ativo: boolean;
  created_at: string;
  created_by_user_id: string | null;
  created_by_user_email: string | null;
};
