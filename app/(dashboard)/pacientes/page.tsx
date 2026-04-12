export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PacientesTable from "@/components/pacientes/PacientesTable";

const MEDICO_ID = "48315179-21eb-406d-8c8b-e172d120bdcf";

async function getPacientes() {
  return prisma.pacientes.findMany({
    where: { medico_id: MEDICO_ID },
    orderBy: { created_at: "desc" },
    include: {
      consultas: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { created_at: true, estado: true },
      },
      _count: { select: { consultas: true } },
    },
  });
}

export default async function PacientesPage() {
  let pacientes: Awaited<ReturnType<typeof getPacientes>> = [];
  try {
    pacientes = await getPacientes();
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
    })),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Pacientes</h1>
        <p className="text-[#64748B] mt-1">{serialized.length} pacientes registrados</p>
      </div>
      <PacientesTable pacientes={serialized} />
    </div>
  );
}
