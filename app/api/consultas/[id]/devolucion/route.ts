import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { devolucion } = await req.json();

  if (!devolucion || typeof devolucion !== "string") {
    return NextResponse.json({ error: "Contenido inválido" }, { status: 400 });
  }

  try {
    const devolucion_at = new Date();

    // Solo actualiza si la consulta pertenece al médico logueado
    const updated = await prisma.consultas.updateMany({
      where: { id, medico_id: session.user.id },
      data: {
        devolucion_medico: devolucion.trim(),
        devolucion_at,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, devolucion_at: devolucion_at.toISOString() });
  } catch (error) {
    console.error("Error devolucion:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
