import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Genera un color determinístico basado en un string (nombre).
 * Retorna un par [bg, text] de clases Tailwind.
 */
const avatarColors = [
  ["bg-blue-100", "text-blue-700"],
  ["bg-emerald-100", "text-emerald-700"],
  ["bg-amber-100", "text-amber-700"],
  ["bg-rose-100", "text-rose-700"],
  ["bg-purple-100", "text-purple-700"],
  ["bg-cyan-100", "text-cyan-700"],
  ["bg-orange-100", "text-orange-700"],
  ["bg-indigo-100", "text-indigo-700"],
] as const;

export function getAvatarColor(name: string): readonly [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
}
