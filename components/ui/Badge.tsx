type BadgeVariant = "urgente" | "completa" | "en_curso" | "cancelada" | "enviado" | "revisado" | "finalizada";

const variants: Record<BadgeVariant, { cls: string; label: string; icon: React.ReactNode }> = {
  urgente: {
    cls: "bg-red-100 text-red-700",
    label: "Urgente",
    icon: (
      <>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block mr-1" />
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </>
    ),
  },
  en_curso: {
    cls: "bg-blue-100 text-blue-700",
    label: "En curso",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  enviado: {
    cls: "bg-amber-100 text-amber-700",
    label: "Enviado",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  revisado: {
    cls: "bg-green-100 text-green-700",
    label: "Revisado",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  completa: {
    cls: "bg-gray-100 text-gray-600",
    label: "Completa",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  finalizada: {
    cls: "bg-gray-100 text-gray-500",
    label: "Finalizada",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  cancelada: {
    cls: "bg-gray-100 text-gray-400",
    label: "Cancelada",
    icon: (
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

interface BadgeProps {
  variant: BadgeVariant | string;
}

export default function Badge({ variant }: BadgeProps) {
  const v = variant as BadgeVariant;
  const def = variants[v];
  if (!def) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        {variant}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${def.cls}`}>
      {def.icon}
      {def.label}
    </span>
  );
}
