import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Solo disponible en development
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible" }, { status: 403 });
  }

  const MEDICO_ID = "48315179-21eb-406d-8c8b-e172d120bdcf";
  const password = "temporal123";
  const hash = await bcrypt.hash(password, 12);

  const result = await prisma.medicos.update({
    where: { id: MEDICO_ID },
    data: { password_hash: hash },
  });

  return NextResponse.json({
    ok: true,
    message: `Password seteado para ${result.nombre} ${result.apellido}`,
  });
}
