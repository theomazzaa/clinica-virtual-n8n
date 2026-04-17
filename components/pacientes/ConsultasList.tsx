"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import EmptyState from "@/components/ui/EmptyState";

type Consulta = {
  id: string;
  sistema: string | null;
  motivo: string | null;
  estado: string;
  alarma: boolean;
  created_at: string | null;
  finalizada_at: string | null;
};

function formatFecha(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default function ConsultasList({
  consultas,
}: {
  consultas: Consulta[];
}) {
  const [estadosLocales, setEstadosLocales] = useState<Map<string, string>>(
    new Map()
  );

  function getEstado(c: Consulta) {
    return estadosLocales.get(c.id) ?? c.estado;
  }

  async function toggleFinalizada(c: Consulta, checked: boolean) {
    const nuevoEstado = checked ? "finalizada" : "en_curso";
    setEstadosLocales((prev) => new Map(prev).set(c.id, nuevoEstado));

    try {
      const res = await fetch(`/api/consultas/${c.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setEstadosLocales((prev) => {
        const next = new Map(prev);
        next.set(c.id, c.estado);
        return next;
      });
    }
  }

  if (consultas.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sin consultas"
        description="No hay consultas registradas para este paciente"
      />
    );
  }

  return (
    <div className="space-y-2">
      {consultas.map((c) => {
        const estado = getEstado(c);
        const esFinalizada = estado === "finalizada";
        return (
          <div
            key={c.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-[var(--radius-md)] border transition-all duration-200",
              esFinalizada
                ? "border-border bg-surface-secondary opacity-70"
                : c.alarma
                  ? "border-danger-500/20 bg-danger-50/30"
                  : "border-border bg-surface"
            )}
          >
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-0.5">
              <input
                type="checkbox"
                checked={esFinalizada}
                onChange={(e) => toggleFinalizada(c, e.target.checked)}
                title={
                  esFinalizada
                    ? "Marcar como en curso"
                    : "Marcar como finalizada"
                }
                className="w-4 h-4 rounded border-border text-success-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge
                  variant={
                    c.alarma && estado === "en_curso" ? "urgente" : estado
                  }
                />
                {c.sistema && (
                  <span className="text-[11px] text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded border border-border">
                    {c.sistema}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-sm text-text-primary transition-all duration-200",
                  esFinalizada && "line-through text-text-muted"
                )}
              >
                {c.motivo ?? "Sin motivo registrado"}
              </p>
              <p className="text-[11px] text-text-muted mt-1">
                {formatFecha(c.created_at)}
              </p>
            </div>

            <Tooltip content="Ver detalle">
              <Link
                href={`/consultas/${c.id}`}
                className="flex-shrink-0 p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-[var(--radius-sm)] transition-colors focus-ring"
                aria-label="Ver detalle"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
