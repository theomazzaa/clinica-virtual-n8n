import { CalendarOff } from "lucide-react";
import { TurnoConPaciente } from "@/lib/agenda-queries";
import EmptyState from "@/components/ui/EmptyState";
import TurnoCard from "@/components/agenda/TurnoCard";

interface Props {
  turnos: TurnoConPaciente[];
  fecha: Date;
}

export default function AgendaDelDia({ turnos }: Props) {
  if (turnos.length === 0) {
    return (
      <EmptyState
        icon={CalendarOff}
        title="No hay turnos para este día."
        description="Los turnos confirmados desde WhatsApp aparecerán acá."
      />
    );
  }

  return (
    <div className="space-y-3">
      {turnos.map((turno) => (
        <TurnoCard key={turno.id} turno={turno} />
      ))}
    </div>
  );
}
