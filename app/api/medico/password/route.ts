import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { passwordActual, passwordNuevo } = await req.json();

  if (!passwordActual || !passwordNuevo) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (passwordNuevo.length < 6) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  try {
    const medico = await prisma.medicos.findUnique({
      where: { id: session.user.id },
      select: { password_hash: true },
    });

    if (!medico?.password_hash) {
      return NextResponse.json({ error: "Sin contraseña configurada" }, { status: 400 });
    }

    const ok = await bcrypt.compare(passwordActual, medico.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    const nuevo_hash = await bcrypt.hash(passwordNuevo, 12);
    await prisma.medicos.update({
      where: { id: session.user.id },
      data: { password_hash: nuevo_hash, updated_at: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error cambio password:", error);
    return NextResponse.json({ error: "Error al cambiar la contraseña" }, { status: 500 });
  }
}
