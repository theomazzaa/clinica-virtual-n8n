export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConsultasList from "@/components/pacientes/ConsultasList";

function formatFecha(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Buenos_Aires" });
}


async function getPaciente(id: string, medicoId: string) {
  return prisma.pacientes.findFirst({
    where: { id, medico_id: medicoId },
    include: {
      consultas: {
        orderBy: { created_at: "desc" },
        select: {
          id: true, sistema: true, motivo: true, estado: true,
          alarma: true, created_at: true, finalizada_at: true,
        },
      },
    },
  });
}

export default async function FichaPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const paciente = await getPaciente(id, session.user.id).catch(() => null);
  if (!paciente) notFound();

  const consultasSerializadas = paciente.consultas.map((c) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
    finalizada_at: c.finalizada_at ? c.finalizada_at.toISOString() : null,
  }));

  const campos = [
    { label: "DNI", value: paciente.dni },
    { label: "Edad", value: paciente.edad ? `${paciente.edad} años` : null },
    { label: "Sexo", value: paciente.sexo },
    { label: "Fecha de nacimiento", value: formatFecha(paciente.fecha_nacimiento) },
    { label: "Celular", value: paciente.celular },
    { label: "Email", value: paciente.email },
    { label: "Domicilio", value: paciente.domicilio },
    { label: "Prepaga", value: paciente.prepaga },
    { label: "Plan", value: paciente.plan },
    { label: "Credencial", value: paciente.credencial },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Link
          href="/pacientes"
          className="text-[#64748B] hover:text-[#1E293B] transition-colors flex-shrink-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <span className="text-[#2563EB] font-bold text-base md:text-lg">
              {paciente.nombre[0]?.toUpperCase() ?? "P"}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-[#1E293B] truncate">
              {paciente.nombre} {paciente.apellido ?? ""}
            </h1>
            <p className="text-[#64748B] text-xs md:text-sm mt-0.5">
              Paciente desde {formatFecha(paciente.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos personales */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h2 className="font-semibold text-[#1E293B] mb-4">Datos personales</h2>
          <dl className="space-y-3">
            {campos.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-[#64748B] uppercase tracking-wide">{label}</dt>
                <dd className="text-sm text-[#1E293B] mt-0.5">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Historial de consultas */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-semibold text-[#1E293B]">
              Historial de consultas ({paciente.consultas.length})
            </h2>
          </div>
          <div className="p-4">
            <ConsultasList consultas={consultasSerializadas} />
          </div>
        </div>
      </div>
    </div>
  );
}
