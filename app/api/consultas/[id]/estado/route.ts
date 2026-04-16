import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { estado } = body as { estado: string };

  const validos = ["en_curso", "finalizada", "cancelada"];
  if (!validos.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  // Verificar que la consulta pertenece al médico
  const consulta = await prisma.consultas.findUnique({
    where: { id },
    select: { medico_id: true },
  });

  if (!consulta || consulta.medico_id !== session.user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const data: { estado: string; finalizada_at: Date | null } = {
    estado,
    finalizada_at: estado === "finalizada" ? new Date() : null,
  };

  const updated = await prisma.consultas.update({
    where: { id },
    data,
    select: { id: true, estado: true, finalizada_at: true },
  });

  return NextResponse.json({
    ok: true,
    estado: updated.estado,
    finalizada_at: updated.finalizada_at?.toISOString() ?? null,
  });
}
