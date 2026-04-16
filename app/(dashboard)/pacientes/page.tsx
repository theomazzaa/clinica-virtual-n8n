export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PacientesTable from "@/components/pacientes/PacientesTable";

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
    fecha_nacimiento: p.fecha_nacimiento ? p.fecha_nacimiento.toISOString() : null,
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">Pacientes</h1>
        <p className="text-sm md:text-base text-[#64748B] mt-1">{serialized.length} pacientes registrados</p>
      </div>
      <PacientesTable pacientes={serialized} />
    </div>
  );
}
