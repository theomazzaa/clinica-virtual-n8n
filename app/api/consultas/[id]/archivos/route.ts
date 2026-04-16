import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verificar que la consulta pertenece al médico
  const consulta = await prisma.consultas.findUnique({
    where: { id },
    select: { medico_id: true },
  });

  if (!consulta || consulta.medico_id !== session.user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const archivos = await prisma.archivos_consulta.findMany({
    where: { consulta_id: id },
    select: {
      id: true,
      tipo: true,
      url: true,
      nombre_archivo: true,
      created_at: true,
    },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(
    archivos.map((a) => ({
      ...a,
      created_at: a.created_at ? a.created_at.toISOString() : null,
    }))
  );
}
