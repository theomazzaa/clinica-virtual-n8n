import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  Mail,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

type BadgeVariant =
  | "urgent"
  | "success"
  | "info"
  | "warning"
  | "neutral"
  // Legacy variants for backward compatibility
  | "urgente"
  | "en_curso"
  | "enviado"
  | "revisado"
  | "completa"
  | "finalizada"
  | "cancelada";

interface VariantConfig {
  cls: string;
  dotCls: string;
  label: string;
  Icon: LucideIcon | null;
}

const variantConfig: Record<string, VariantConfig> = {
  urgent: {
    cls: "bg-danger-50 text-danger-600",
    dotCls: "bg-danger-500 animate-pulse",
    label: "Urgente",
    Icon: AlertTriangle,
  },
  success: {
    cls: "bg-success-50 text-success-600",
    dotCls: "bg-success-500",
    label: "Revisado",
    Icon: CheckCircle2,
  },
  info: {
    cls: "bg-info-50 text-info-600",
    dotCls: "bg-info-500",
    label: "En curso",
    Icon: Clock,
  },
  warning: {
    cls: "bg-warning-50 text-warning-600",
    dotCls: "bg-warning-500",
    label: "Enviado",
    Icon: Mail,
  },
  neutral: {
    cls: "bg-gray-100 text-gray-500",
    dotCls: "bg-gray-400",
    label: "Finalizada",
    Icon: null,
  },
};

// Map legacy names to new variants
const legacyMap: Record<string, string> = {
  urgente: "urgent",
  en_curso: "info",
  enviado: "warning",
  revisado: "success",
  completa: "neutral",
  finalizada: "neutral",
  cancelada: "neutral",
};

interface BadgeProps {
  variant: BadgeVariant | string;
  label?: string;
  dot?: boolean;
  icon?: boolean;
  className?: string;
}

export default function Badge({
  variant,
  label,
  dot = true,
  icon = true,
  className,
}: BadgeProps) {
  const resolvedKey = legacyMap[variant] ?? variant;
  const config = variantConfig[resolvedKey];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500",
          className
        )}
      >
        {label ?? variant}
      </span>
    );
  }

  // For "cancelada", override the default label
  const displayLabel =
    label ??
    (variant === "cancelada"
      ? "Cancelada"
      : variant === "completa"
        ? "Completa"
        : config.label);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.cls,
        className
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dotCls)}
        />
      )}
      {icon && config.Icon && <config.Icon className="w-3 h-3 flex-shrink-0" />}
      {displayLabel}
    </span>
  );
}
