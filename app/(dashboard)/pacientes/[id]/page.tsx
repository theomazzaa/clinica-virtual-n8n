export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConsultasList from "@/components/pacientes/ConsultasList";
import Avatar from "@/components/ui/Avatar";
import { ChevronLeft } from "lucide-react";

function formatFecha(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Buenos_Aires",
  });
}

async function getPaciente(id: string, medicoId: string) {
  return prisma.pacientes.findFirst({
    where: { id, medico_id: medicoId },
    include: {
      consultas: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          sistema: true,
          motivo: true,
          estado: true,
          alarma: true,
          created_at: true,
          finalizada_at: true,
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

  const fullName = `${paciente.nombre} ${paciente.apellido ?? ""}`.trim();

  const consultasSerializadas = paciente.consultas.map((c) => ({
    ...c,
    created_at: c.created_at ? c.created_at.toISOString() : null,
    finalizada_at: c.finalizada_at ? c.finalizada_at.toISOString() : null,
    estado: c.estado ?? "en_curso",
    alarma: c.alarma ?? false,
  }));

  const campos = [
    { label: "DNI", value: paciente.dni },
    { label: "Edad", value: paciente.edad ? `${paciente.edad} anos` : null },
    { label: "Sexo", value: paciente.sexo },
    {
      label: "Fecha de nacimiento",
      value: formatFecha(paciente.fecha_nacimiento),
    },
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
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link
          href="/pacientes"
          className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 focus-ring rounded-[var(--radius-sm)] p-0.5"
          aria-label="Volver a pacientes"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={fullName} size="lg" />
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-text-primary truncate">
              {fullName}
            </h1>
            <p className="text-text-muted text-xs md:text-sm mt-0.5">
              Paciente desde {formatFecha(paciente.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos personales */}
        <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm p-6">
          <h2 className="font-semibold text-text-primary text-[15px] mb-4">
            Datos personales
          </h2>
          <dl className="space-y-3">
            {campos.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {label}
                </dt>
                <dd className="text-sm text-text-primary mt-0.5">
                  {value || "-"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Historial de consultas */}
        <div className="lg:col-span-2 bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-text-primary text-[15px]">
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
