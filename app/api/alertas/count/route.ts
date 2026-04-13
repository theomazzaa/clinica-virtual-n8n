import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.consultas.count({
    where: {
      medico_id: session.user.id,
      alarma: true,
      informe: { estado: { not: "revisado" } },
    },
  }).catch(() => 0);

  return NextResponse.json({ count });
}
