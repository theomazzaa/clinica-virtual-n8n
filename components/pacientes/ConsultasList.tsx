"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

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

export default function ConsultasList({ consultas }: { consultas: Consulta[] }) {
  const [estadosLocales, setEstadosLocales] = useState<Map<string, string>>(new Map());

  function getEstado(c: Consulta) {
    return estadosLocales.get(c.id) ?? c.estado;
  }

  async function toggleFinalizada(c: Consulta, checked: boolean) {
    const nuevoEstado = checked ? "finalizada" : "en_curso";
    // Optimistic update
    setEstadosLocales((prev) => new Map(prev).set(c.id, nuevoEstado));

    try {
      const res = await fetch(`/api/consultas/${c.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
    } catch {
      // Revert on error
      setEstadosLocales((prev) => {
        const next = new Map(prev);
        next.set(c.id, c.estado);
        return next;
      });
    }
  }

  if (consultas.length === 0) {
    return (
      <div className="text-center py-8 text-[#64748B] text-sm">
        No hay consultas registradas
      </div>
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
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
              esFinalizada
                ? "border-[#E2E8F0] bg-[#F8FAFC] opacity-70"
                : c.alarma
                ? "border-red-200 bg-[#FEF2F2]"
                : "border-[#E2E8F0] bg-white"
            }`}
          >
            {/* Checkbox finalizar */}
            <div className="flex-shrink-0 pt-0.5">
              <input
                type="checkbox"
                checked={esFinalizada}
                onChange={(e) => toggleFinalizada(c, e.target.checked)}
                title={esFinalizada ? "Marcar como en curso" : "Marcar como finalizada"}
                className="w-4 h-4 accent-[#22C55E] rounded cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={c.alarma && estado === "en_curso" ? "urgente" : estado} />
                {c.sistema && (
                  <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                    {c.sistema}
                  </span>
                )}
              </div>
              <p
                className={`text-sm text-[#1E293B] transition-all duration-300 ${
                  esFinalizada ? "line-through text-[#94A3B8]" : ""
                }`}
              >
                {c.motivo ?? "Sin motivo registrado"}
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">{formatFecha(c.created_at)}</p>
            </div>

            <Link
              href={`/consultas/${c.id}`}
              className="flex-shrink-0 p-1.5 text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
              title="Ver detalle"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
