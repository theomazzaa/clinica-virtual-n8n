export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PacientesTable from "@/components/pacientes/PacientesTable";
import { UserPlus } from "lucide-react";

async function getPacientes(medicoId: string) {
  return prisma.pacientes.findMany({
    where: { medico_id: medicoId },
    orderBy: { created_at: "desc" },
    include: {
      consultas: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: {
          created_at: true,
          estado: true,
          alarma: true,
          informe: { select: { google_doc_url: true } },
        },
      },
      _count: { select: { consultas: true } },
    },
  });
}

export default async function PacientesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let pacientes: Awaited<ReturnType<typeof getPacientes>> = [];
  try {
    pacientes = await getPacientes(session.user.id);
  } catch (e) {
    console.error(e);
  }

  const serialized = pacientes.map((p) => ({
    ...p,
    fecha_nacimiento: p.fecha_nacimiento
      ? p.fecha_nacimiento.toISOString()
      : null,
    created_at: p.created_at ? p.created_at.toISOString() : null,
    updated_at: p.updated_at ? p.updated_at.toISOString() : null,
    consultas: p.consultas.map((c) => ({
      ...c,
      created_at: c.created_at ? c.created_at.toISOString() : null,
      informe: c.informe ?? null,
    })),
  }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">
            Pacientes
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {serialized.length} paciente{serialized.length !== 1 ? "s" : ""}{" "}
            registrado{serialized.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          disabled
          title="Proximamente"
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium bg-primary-600 text-white rounded-[var(--radius-sm)] opacity-50 cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo paciente</span>
        </button>
      </div>

      <PacientesTable pacientes={serialized} />
    </div>
  );
}
