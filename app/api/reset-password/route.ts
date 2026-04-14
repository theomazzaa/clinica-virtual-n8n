import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Faltan email o password" }, { status: 400 });
  }

  const medico = await prisma.medicos.findUnique({ where: { email } });
  if (!medico) {
    return NextResponse.json({ error: "Médico no encontrado" }, { status: 404 });
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.medicos.update({
    where: { email },
    data: { password_hash: hash },
  });

  return NextResponse.json({ ok: true, message: `Password reseteado para ${medico.nombre} ${medico.apellido}` });
}
