export type AdminDisplayUser = {
  nome?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  ativo?: boolean | null;
  is_active?: boolean | null;
  user_id?: string | number | null;
  id?: string | number | null;
};

const collator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  usage: "sort",
});

function normalizeWhitespace(value?: string | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function getAdminUserDisplayName(user: AdminDisplayUser | null) {
  return (
    normalizeWhitespace(user?.full_name) ||
    normalizeWhitespace(user?.nome) ||
    normalizeWhitespace(user?.email) ||
    "Sem identificacao"
  );
}

export function getAdminUserAbbreviatedName(user: AdminDisplayUser | null) {
  const baseName = getAdminUserDisplayName(user);

  if (!baseName || baseName.includes("@")) {
    return baseName;
  }

  const parts = baseName.split(" ").filter(Boolean);

  if (parts.length <= 1) {
    return baseName;
  }

  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function sortAdminUsersByName<T extends AdminDisplayUser>(users: T[]) {
  return [...users].sort((left, right) =>
    collator.compare(
      getAdminUserDisplayName(left),
      getAdminUserDisplayName(right)
    )
  );
}

export function isAssignableProfessorUser(user: AdminDisplayUser | null) {
  const active = user?.ativo !== false && user?.is_active !== false;
  const role = String(user?.role ?? "").toLowerCase().trim();

  return active && (role === "professor" || role === "admin");
}

export function getAdminUserIdentifier(user: AdminDisplayUser | null) {
  return String(user?.user_id ?? user?.id ?? "");
}
