export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentPatients from "@/components/dashboard/RecentPatients";

type ConsultaReciente = {
  id: string;
  estado: string;
  alarma: boolean;
  motivo: string | null;
  sistema: string | null;
  created_at: Date | null;
  finalizada_at: Date | null;
  sintomas: unknown;
  protocolo: unknown;
  datos_json_completo: unknown;
  paciente_id: string | null;
  medico_id: string;
  evolucion: string | null;
  medicacion_habitual: string | null;
  alergias: string | null;
  motivo_alarma: string | null;
  dentro_cobertura: boolean | null;
  devolucion_medico: string | null;
  devolucion_at: Date | null;
  paciente: { nombre: string; apellido: string | null; celular: string | null } | null;
};

async function getDashboardData(medicoId: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [totalPacientes, consultasActivas, nuevosHoy, casosUrgentes, recientes] =
    await Promise.all([
      prisma.pacientes.count({ where: { medico_id: medicoId } }),
      prisma.consultas.count({ where: { medico_id: medicoId, estado: "en_curso" } }),
      prisma.pacientes.count({ where: { medico_id: medicoId, created_at: { gte: hoy } } }),
      prisma.consultas.count({ where: { medico_id: medicoId, alarma: true, estado: "en_curso" } }),
      prisma.consultas.findMany({
        where: { medico_id: medicoId },
        orderBy: { created_at: "desc" },
        take: 10,
        include: {
          paciente: { select: { nombre: true, apellido: true, celular: true } },
        },
      }),
    ]);

  return { totalPacientes, consultasActivas, nuevosHoy, casosUrgentes, recientes };
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const defaultData: DashboardData = {
  totalPacientes: 0,
  consultasActivas: 0,
  nuevosHoy: 0,
  casosUrgentes: 0,
  recientes: [],
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const medicoId = session.user.id;
  const nombreMedico = (session.user as { nombre?: string }).nombre ?? session.user.name ?? "Doctor";

  let data: DashboardData = defaultData;
  try {
    data = await getDashboardData(medicoId);
  } catch {
    data = defaultData;
  }

  const { totalPacientes, consultasActivas, nuevosHoy, casosUrgentes, recientes } = data;

  const recientesSerializados = recientes.map((c: ConsultaReciente) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
    finalizada_at: c.finalizada_at ? c.finalizada_at.toISOString() : null,
    devolucion_at: c.devolucion_at ? c.devolucion_at.toISOString() : null,
    sintomas: c.sintomas as Record<string, unknown>,
    protocolo: c.protocolo as Record<string, unknown>,
    datos_json_completo: c.datos_json_completo as Record<string, unknown> | null,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Dashboard</h1>
        <p className="text-[#64748B] mt-1">Bienvenido, Dr. {nombreMedico}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Pacientes"
          value={totalPacientes}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Consultas activas"
          value={consultasActivas}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <MetricCard
          title="Nuevos hoy"
          value={nuevosHoy}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        />
        <MetricCard
          title="Casos urgentes"
          value={casosUrgentes}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Recent patients */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-semibold text-[#1E293B]">Consultas recientes</h2>
          <Link href="/pacientes" className="text-sm text-[#2563EB] hover:underline font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="px-4 py-2">
          <RecentPatients consultas={recientesSerializados as Parameters<typeof RecentPatients>[0]["consultas"]} />
        </div>
      </div>
    </div>
  );
}
