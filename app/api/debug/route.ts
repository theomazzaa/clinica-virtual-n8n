import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const medicos = await prisma.medicos.findMany({
      select: { id: true, nombre: true, apellido: true, email: true },
    });
    const totalPacientes = await prisma.pacientes.count();
    const totalConsultas = await prisma.consultas.count();
    return NextResponse.json({ medicos, totalPacientes, totalConsultas });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
