import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const medico = await prisma.medicos.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, nombre: true, apellido: true, email: true,
      telefono: true, especialidad: true, matricula_nacional: true,
      zonas_cobertura: true, system_prompt: true,
    },
  });

  if (!medico) {
    return NextResponse.json({ error: "Médico no encontrado" }, { status: 404 });
  }

  return NextResponse.json(medico);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { nombre, apellido, telefono, especialidad, zonas_cobertura, system_prompt } = body;

  try {
    const updated = await prisma.medicos.update({
      where: { id: session.user.id },
      data: {
        nombre: nombre?.trim(),
        apellido: apellido?.trim(),
        telefono: telefono?.trim() || null,
        especialidad: especialidad?.trim() || null,
        zonas_cobertura: zonas_cobertura ?? [],
        system_prompt: system_prompt?.trim() || null,
        updated_at: new Date(),
      },
      select: {
        id: true, nombre: true, apellido: true, email: true,
        telefono: true, especialidad: true, matricula_nacional: true,
        zonas_cobertura: true, system_prompt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizar perfil:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
