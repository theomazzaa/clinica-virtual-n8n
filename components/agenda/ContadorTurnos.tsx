import { TurnoConPaciente } from "@/lib/agenda-queries";

interface Props {
  turnos: TurnoConPaciente[];
  vista: "hoy" | "semana";
}

export default function ContadorTurnos({ turnos, vista }: Props) {
  const total = turnos.length;
  if (total === 0) return null;

  const confirmados = turnos.filter((t) => t.estado === "confirmado").length;
  const pendientes = turnos.filter((t) => t.estado === "activo").length;

  const labelPeriodo = vista === "hoy" ? "hoy" : "esta semana";

  const partes: string[] = [
    `${total} ${total === 1 ? "turno" : "turnos"} ${labelPeriodo}`,
  ];

  if (confirmados > 0) {
    partes.push(
      `${confirmados} ${confirmados === 1 ? "confirmado" : "confirmados"}`
    );
  }

  if (pendientes > 0) {
    partes.push(
      `${pendientes} ${pendientes === 1 ? "pendiente de pago" : "pendientes de pago"}`
    );
  }

  return <p className="text-sm text-slate-600">{partes.join(" · ")}</p>;
}
