type BadgeVariant = "urgente" | "completa" | "en_curso" | "cancelada";

const variants: Record<BadgeVariant, string> = {
  urgente: "bg-red-100 text-red-600",
  completa: "bg-green-100 text-green-600",
  en_curso: "bg-blue-100 text-blue-600",
  cancelada: "bg-gray-100 text-gray-500",
};

const labels: Record<BadgeVariant, string> = {
  urgente: "Urgente",
  completa: "Completa",
  en_curso: "En curso",
  cancelada: "Cancelada",
};

interface BadgeProps {
  variant: BadgeVariant | string;
}

export default function Badge({ variant }: BadgeProps) {
  const v = variant as BadgeVariant;
  const cls = variants[v] ?? "bg-gray-100 text-gray-500";
  const label = labels[v] ?? variant;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
