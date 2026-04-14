import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan email o password" }, { status: 400 });
    }

    // Primero listar todos los médicos para debug
    const todos = await prisma.medicos.findMany({
      select: { email: true, nombre: true, apellido: true, password_hash: true },
    });

    const medico = await prisma.medicos.findUnique({ where: { email } });
    if (!medico) {
      return NextResponse.json({
        error: "Médico no encontrado",
        emails_existentes: todos.map((m) => m.email),
      }, { status: 404 });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.medicos.update({
      where: { email },
      data: { password_hash: hash },
    });

    return NextResponse.json({ ok: true, message: `Password reseteado para ${medico.nombre} ${medico.apellido}` });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
