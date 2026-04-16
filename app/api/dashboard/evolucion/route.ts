import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hace30dias = new Date();
  hace30dias.setDate(hace30dias.getDate() - 29);
  hace30dias.setHours(0, 0, 0, 0);

  const consultas = await prisma.consultas.findMany({
    where: {
      medico_id: session.user.id,
      created_at: { gte: hace30dias },
    },
    select: { created_at: true },
  });

  // Agrupar por día
  const conteo = new Map<string, number>();
  for (const c of consultas) {
    if (!c.created_at) continue;
    const fecha = c.created_at.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
    conteo.set(fecha, (conteo.get(fecha) ?? 0) + 1);
  }

  // Rellenar los 30 días
  const resultado: { fecha: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const etiqueta = d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
    resultado.push({ fecha: etiqueta, total: conteo.get(etiqueta) ?? 0 });
  }

  return NextResponse.json(resultado);
}
