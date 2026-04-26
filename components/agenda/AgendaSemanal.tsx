import { CalendarOff } from "lucide-react";
import { TurnoConPaciente } from "@/lib/agenda-queries";
import EmptyState from "@/components/ui/EmptyState";
import TurnoCard from "@/components/agenda/TurnoCard";
import {
  inicioDeSemanaArgentina,
  inicioDelDiaArgentina,
  finDelDiaArgentina,
  formatearDiaSemanaLargo,
  aFechaParam,
} from "@/lib/agenda-helpers";

interface Props {
  turnos: TurnoConPaciente[];
  fecha: Date;
}

const MS_PER_DAY = 86_400_000;

export default function AgendaSemanal({ turnos, fecha }: Props) {
  if (turnos.length === 0) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="No hay turnos esta semana."
        description="Los turnos confirmados desde WhatsApp aparecerán acá."
      />
    );
  }

  const lunes = inicioDeSemanaArgentina(fecha);
  const dias = Array.from(
    { length: 7 },
    (_, i) => new Date(lunes.getTime() + i * MS_PER_DAY)
  );
  const hoyParam = aFechaParam(new Date());

  return (
    <div className="space-y-8">
      {dias.map((dia) => {
        const diaParam = aFechaParam(dia);
        const esHoy = diaParam === hoyParam;
        const desde = inicioDelDiaArgentina(dia);
        const hasta = finDelDiaArgentina(dia);
        const turnosDia = turnos.filter(
          (t) => t.slot_datetime >= desde && t.slot_datetime <= hasta
        );

        return (
          <div key={diaParam}>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">
                {formatearDiaSemanaLargo(dia)}
              </h2>
              {esHoy && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  Hoy
                </span>
              )}
            </div>

            {turnosDia.length > 0 ? (
              <div className="space-y-3">
                {turnosDia.map((turno) => (
                  <TurnoCard key={turno.id} turno={turno} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin turnos</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
