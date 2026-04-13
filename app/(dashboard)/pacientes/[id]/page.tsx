export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";

function formatFecha(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatFechaHora(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function getPaciente(id: string, medicoId: string) {
  return prisma.pacientes.findFirst({
    where: { id, medico_id: medicoId },
    include: {
      consultas: {
        orderBy: { created_at: "desc" },
        select: {
          id: true, sistema: true, motivo: true, estado: true,
          alarma: true, created_at: true,
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
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/pacientes"
          className="text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <span className="text-[#2563EB] font-bold text-lg">
              {paciente.nombre[0]?.toUpperCase() ?? "P"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              {paciente.nombre} {paciente.apellido ?? ""}
            </h1>
            <p className="text-[#64748B] text-sm mt-0.5">
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
          <div className="divide-y divide-[#E2E8F0]">
            {paciente.consultas.length === 0 ? (
              <p className="px-6 py-12 text-center text-[#64748B]">Sin consultas registradas</p>
            ) : (
              paciente.consultas.map((c) => (
                <Link
                  key={c.id}
                  href={`/consultas/${c.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {c.alarma && (
                        <svg className="w-4 h-4 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-[#1E293B]">
                        {c.sistema ?? "Sin sistema"}
                      </span>
                      <Badge variant={c.alarma ? "urgente" : c.estado} />
                    </div>
                    <p className="text-sm text-[#64748B] truncate">{c.motivo ?? "Sin motivo"}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{formatFechaHora(c.created_at)}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors ml-4"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
