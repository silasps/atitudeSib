import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return "—";

  const normalized = String(value).trim();
  if (!normalized) return "—";

  const safeValue = normalized.includes("T")
    ? normalized
    : `${normalized}T00:00:00`;

  const date = new Date(safeValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}