import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nombre, apellido, email, password, matricula, especialidad } =
      await req.json();

    if (!nombre || !apellido || !email || !password || !matricula) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.medicos.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json(
        { error: "Ya existe un médico registrado con ese email" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.medicos.create({
      data: {
        nombre,
        apellido,
        email,
        password_hash,
        matricula_nacional: matricula,
        especialidad: especialidad || null,
        zonas_cobertura: [],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error registro:", error);
    return NextResponse.json({ error: "Error al registrar el médico" }, { status: 500 });
  }
}
