import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MEDICO_ID = "48315179-21eb-406d-8c8b-e172d120bdcf";

export async function GET() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [
      totalPacientes,
      consultasActivas,
      nuevosHoy,
      casosUrgentes,
      recientes,
    ] = await Promise.all([
      prisma.pacientes.count({ where: { medico_id: MEDICO_ID } }),
      prisma.consultas.count({
        where: { medico_id: MEDICO_ID, estado: "en_curso" },
      }),
      prisma.pacientes.count({
        where: {
          medico_id: MEDICO_ID,
          created_at: { gte: hoy },
        },
      }),
      prisma.consultas.count({
        where: { medico_id: MEDICO_ID, alarma: true, estado: "en_curso" },
      }),
      prisma.consultas.findMany({
        where: { medico_id: MEDICO_ID },
        orderBy: { created_at: "desc" },
        take: 10,
        include: {
          paciente: {
            select: {
              nombre: true,
              apellido: true,
              celular: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalPacientes,
      consultasActivas,
      nuevosHoy,
      casosUrgentes,
      recientes,
    });
  } catch (error) {
    console.error("Error dashboard:", error);
    return NextResponse.json({ error: "Error al cargar datos" }, { status: 500 });
  }
}
