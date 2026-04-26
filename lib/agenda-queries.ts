import { prisma } from "@/lib/prisma";
import { HoldConPaciente } from "@/lib/datos-json";
import {
  inicioDelDiaArgentina,
  finDelDiaArgentina,
  inicioDeSemanaArgentina,
  finDeSemanaArgentina,
} from "@/lib/agenda-helpers";

// Reusar el tipo centralizado de datos-json para no duplicar la definición.
export type TurnoConPaciente = HoldConPaciente;

export async function fetchTurnosEnRango(
  medicoId: string,
  desde: Date,
  hasta: Date
): Promise<TurnoConPaciente[]> {
  return prisma.holds.findMany({
    where: {
      medico_id: medicoId,
      slot_datetime: { gte: desde, lte: hasta },
      OR: [
        { estado: "confirmado" },
        { estado: "activo", expires_at: { gt: new Date() } },
      ],
    },
    include: { pacientes: true },
    orderBy: { slot_datetime: "asc" },
  });
}

export async function fetchTurnosDelDia(
  medicoId: string,
  fecha: Date
): Promise<TurnoConPaciente[]> {
  return fetchTurnosEnRango(
    medicoId,
    inicioDelDiaArgentina(fecha),
    finDelDiaArgentina(fecha)
  );
}

export async function fetchTurnosDeLaSemana(
  medicoId: string,
  fecha: Date
): Promise<TurnoConPaciente[]> {
  return fetchTurnosEnRango(
    medicoId,
    inicioDeSemanaArgentina(fecha),
    finDeSemanaArgentina(fecha)
  );
}
