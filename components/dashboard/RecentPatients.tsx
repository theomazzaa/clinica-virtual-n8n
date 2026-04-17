"use client";

import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

interface Consulta {
  id: string;
  estado: string;
  alarma: boolean;
  motivo: string | null;
  sistema: string | null;
  created_at: string | null;
  paciente: {
    nombre: string;
    apellido: string | null;
    celular: string | null;
  } | null;
}

interface RecentPatientsProps {
  consultas: Consulta[];
}

function formatFecha(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Buenos_Aires",
  });
}

export default function RecentPatients({ consultas }: RecentPatientsProps) {
  if (consultas.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sin consultas recientes"
        description="Las consultas apareceran aqui"
      />
    );
  }

  return (
    <div className="divide-y divide-border">
      {consultas.map((c) => {
        const nombre = c.paciente
          ? `${c.paciente.nombre} ${c.paciente.apellido ?? ""}`.trim()
          : "Paciente desconocido";
        const badgeVariant =
          c.alarma && c.estado === "en_curso"
            ? "urgente"
            : c.estado === "finalizada"
              ? "completa"
              : c.estado;

        return (
          <Link
            key={c.id}
            href={`/consultas/${c.id}`}
            className={cn(
              "flex items-center gap-3 py-3 px-2 rounded-[var(--radius-sm)] transition-colors group",
              "hover:bg-surface-secondary"
            )}
          >
            <Avatar name={nombre} size="sm" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-text-primary text-sm truncate">
                  {nombre}
                </p>
                {c.alarma && c.estado === "en_curso" && (
                  <AlertTriangle className="w-3.5 h-3.5 text-danger-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                {c.motivo ?? c.paciente?.celular ?? "Sin detalle"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <p className="text-[10px] md:text-[11px] text-text-muted">
                {formatFecha(c.created_at)}
              </p>
              <Badge variant={badgeVariant} />
            </div>

            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-600 transition-colors flex-shrink-0 hidden sm:block" />
          </Link>
        );
      })}
    </div>
  );
}
