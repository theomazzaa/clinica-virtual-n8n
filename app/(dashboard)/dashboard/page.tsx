export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentPatients from "@/components/dashboard/RecentPatients";
import TiempoAhorradoCard from "@/components/dashboard/TiempoAhorradoCard";
import DashboardChart from "@/components/dashboard/DashboardChart";

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

  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1);
  inicioSemana.setHours(0, 0, 0, 0);

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [
    consultasHoy,
    consultasSemana,
    consultasMes,
    urgencias,
    totalConsultas,
    recientes,
  ] = await Promise.all([
    prisma.consultas.count({ where: { medico_id: medicoId, created_at: { gte: hoy } } }),
    prisma.consultas.count({ where: { medico_id: medicoId, created_at: { gte: inicioSemana } } }),
    prisma.consultas.count({ where: { medico_id: medicoId, created_at: { gte: inicioMes } } }),
    prisma.consultas.count({ where: { medico_id: medicoId, alarma: true, estado: "en_curso" } }),
    prisma.consultas.count({ where: { medico_id: medicoId } }),
    prisma.consultas.findMany({
      where: { medico_id: medicoId },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        paciente: { select: { nombre: true, apellido: true, celular: true } },
      },
    }),
  ]);

  return { consultasHoy, consultasSemana, consultasMes, urgencias, totalConsultas, recientes };
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const defaultData: DashboardData = {
  consultasHoy: 0,
  consultasSemana: 0,
  consultasMes: 0,
  urgencias: 0,
  totalConsultas: 0,
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

  const { consultasHoy, consultasSemana, consultasMes, urgencias, totalConsultas, recientes } = data;

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
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">Dashboard</h1>
        <p className="text-sm md:text-base text-[#64748B] mt-1">Bienvenido, Dr. {nombreMedico}</p>
      </div>

      {/* KPIs — 2×2 mobile, 4 columnas desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
        <MetricCard
          title="Hoy"
          value={consultasHoy}
          color="blue"
          icon={
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Esta semana"
          value={consultasSemana}
          color="blue"
          icon={
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <MetricCard
          title="Este mes"
          value={consultasMes}
          color="blue"
          icon={
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <MetricCard
          title="Urgencias"
          value={urgencias}
          color="red"
          href="/alarmas"
          icon={
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Tiempo ahorrado */}
      <TiempoAhorradoCard totalConsultas={totalConsultas} />

      {/* Gráfico de evolución */}
      <DashboardChart />

      {/* Consultas recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="font-semibold text-[#1E293B] text-sm md:text-base">Consultas recientes</h2>
          <Link href="/pacientes" className="text-xs md:text-sm text-[#2563EB] hover:underline font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="px-2 md:px-4 py-2">
          <RecentPatients consultas={recientesSerializados as Parameters<typeof RecentPatients>[0]["consultas"]} />
        </div>
      </div>
    </div>
  );
}
