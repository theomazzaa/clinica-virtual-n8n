export const dynamic = "force-dynamic";

import { MEDICO_ID_DEV } from "@/lib/dev-config";
import { parsearFechaParam } from "@/lib/agenda-helpers";
import {
  fetchTurnosDelDia,
  fetchTurnosDeLaSemana,
  TurnoConPaciente,
} from "@/lib/agenda-queries";
import HeaderAgenda from "@/components/agenda/HeaderAgenda";
import ContadorTurnos from "@/components/agenda/ContadorTurnos";
import AgendaDelDia from "@/components/agenda/AgendaDelDia";
import AgendaSemanal from "@/components/agenda/AgendaSemanal";

type Vista = "hoy" | "semana";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; fecha?: string }>;
}) {
  const params = await searchParams;

  const vista: Vista = params.vista === "semana" ? "semana" : "hoy";
  const fecha = parsearFechaParam(params.fecha);

  const turnos: TurnoConPaciente[] =
    vista === "semana"
      ? await fetchTurnosDeLaSemana(MEDICO_ID_DEV, fecha)
      : await fetchTurnosDelDia(MEDICO_ID_DEV, fecha);

  return (
    <div className="space-y-6">
      <HeaderAgenda vista={vista} fecha={fecha} />
      <ContadorTurnos turnos={turnos} vista={vista} />
      {vista === "hoy" ? (
        <AgendaDelDia turnos={turnos} fecha={fecha} />
      ) : (
        <AgendaSemanal turnos={turnos} fecha={fecha} />
      )}
    </div>
  );
}
