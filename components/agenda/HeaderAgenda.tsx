import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aFechaParam,
  formatearDiaMes,
  formatearDiaSemanaLargo,
  inicioDeSemanaArgentina,
  finDeSemanaArgentina,
} from "@/lib/agenda-helpers";

type Vista = "hoy" | "semana";

interface HeaderAgendaProps {
  vista: Vista;
  fecha: Date;
}

const MS_PER_DAY = 86_400_000;

export default function HeaderAgenda({ vista, fecha }: HeaderAgendaProps) {
  const fechaParam = aFechaParam(fecha);
  const hoyParam = aFechaParam(new Date());
  const esHoy = fechaParam === hoyParam;

  const delta = vista === "semana" ? 7 * MS_PER_DAY : MS_PER_DAY;
  const prevParam = aFechaParam(new Date(fecha.getTime() - delta));
  const nextParam = aFechaParam(new Date(fecha.getTime() + delta));

  let textoFecha: string;
  if (vista === "semana") {
    const inicioSemana = inicioDeSemanaArgentina(fecha);
    const finSemana = finDeSemanaArgentina(fecha);
    textoFecha = `Semana del ${formatearDiaMes(inicioSemana)} al ${formatearDiaMes(finSemana)}`;
  } else {
    // Hoy: "Hoy, 28 de abril" — otros días: "Lunes 28 de abril"
    textoFecha = esHoy
      ? `Hoy, ${formatearDiaMes(fecha)}`
      : formatearDiaSemanaLargo(fecha);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>

      <div className="flex items-center justify-between gap-4">
        {/* Tabs como Links — Tabs.tsx es "use client", no sirve para nav por URL */}
        <div className="flex border-b border-slate-200">
          <Link
            href={`/agenda?vista=hoy&fecha=${fechaParam}`}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              vista === "hoy"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Hoy
            {vista === "hoy" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </Link>
          <Link
            href={`/agenda?vista=semana&fecha=${fechaParam}`}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              vista === "semana"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Esta semana
            {vista === "semana" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </Link>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center gap-1">
          <Link
            href={`/agenda?vista=${vista}&fecha=${prevParam}`}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Período anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Link
            href={`/agenda?vista=${vista}`}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
              esHoy
                ? "text-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            )}
          >
            Hoy
          </Link>
          <Link
            href={`/agenda?vista=${vista}&fecha=${nextParam}`}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Período siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <p className="text-slate-600 text-sm font-medium">{textoFecha}</p>
    </div>
  );
}
