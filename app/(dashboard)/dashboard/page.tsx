export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  BarChart3,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
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
  paciente: {
    nombre: string;
    apellido: string | null;
    celular: string | null;
  } | null;
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
    totalPacientes,
    recientes,
  ] = await Promise.all([
    prisma.consultas.count({
      where: { medico_id: medicoId, created_at: { gte: hoy } },
    }),
    prisma.consultas.count({
      where: { medico_id: medicoId, created_at: { gte: inicioSemana } },
    }),
    prisma.consultas.count({
      where: { medico_id: medicoId, created_at: { gte: inicioMes } },
    }),
    prisma.consultas.count({
      where: { medico_id: medicoId, alarma: true, estado: "en_curso" },
    }),
    prisma.pacientes.count({
      where: { medico_id: medicoId },
    }),
    prisma.consultas.findMany({
      where: { medico_id: medicoId },
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        paciente: {
          select: { nombre: true, apellido: true, celular: true },
        },
      },
    }),
  ]);

  return {
    consultasHoy,
    consultasSemana,
    consultasMes,
    urgencias,
    totalPacientes,
    recientes,
  };
}

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const defaultData: DashboardData = {
  consultasHoy: 0,
  consultasSemana: 0,
  consultasMes: 0,
  urgencias: 0,
  totalPacientes: 0,
  recientes: [],
};

function formatFechaHoy() {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const medicoId = session.user.id;
  const nombreMedico =
    (session.user as { nombre?: string }).nombre ??
    session.user.name ??
    "Doctor";

  let data: DashboardData = defaultData;
  try {
    data = await getDashboardData(medicoId);
  } catch {
    data = defaultData;
  }

  const {
    consultasHoy,
    consultasSemana,
    consultasMes,
    urgencias,
    totalPacientes,
    recientes,
  } = data;

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
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Bienvenido, Dr. {nombreMedico} — {formatFechaHoy()}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
        <MetricCard
          title="Hoy"
          value={consultasHoy}
          color="blue"
          icon={<CalendarDays className="w-5 h-5" />}
        />
        <MetricCard
          title="Esta semana"
          value={consultasSemana}
          color="blue"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <MetricCard
          title="Este mes"
          value={consultasMes}
          color="blue"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <MetricCard
          title="Urgencias"
          value={urgencias}
          color="red"
          href="/alarmas"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Tiempo ahorrado */}
      <TiempoAhorradoCard totalPacientes={totalPacientes} />

      {/* Grafico de evolucion */}
      <DashboardChart />

      {/* Consultas recientes */}
      <div className="bg-surface rounded-[var(--radius-lg)] shadow-xs border border-border">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary text-sm md:text-[15px]">
            Consultas recientes
          </h2>
          <Link
            href="/pacientes"
            className="text-xs md:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors focus-ring rounded-[var(--radius-sm)] px-1"
          >
            Ver todos
          </Link>
        </div>
        <div className="px-2 md:px-4 py-2">
          <RecentPatients
            consultas={
              recientesSerializados as Parameters<
                typeof RecentPatients
              >[0]["consultas"]
            }
          />
        </div>
      </div>
    </div>
  );
}
