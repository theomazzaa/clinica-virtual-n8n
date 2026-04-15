export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import ChatConversacion from "@/components/consultas/ChatConversacion";
import FichaClinica from "@/components/consultas/FichaClinica";
import DevolucionMedico from "@/components/consultas/DevolucionMedico";

async function getConsulta(id: string, medicoId: string) {
  return prisma.consultas.findFirst({
    where: { id, medico_id: medicoId },
    include: {
      paciente: true,
      mensajes: { orderBy: { orden: "asc" } },
      informe: true,
    },
  });
}

function formatFechaHora(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Buenos_Aires",
  });
}

export default async function DetalleConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const consulta = await getConsulta(id, session.user.id).catch(() => null);
  if (!consulta) notFound();

  const paciente = consulta.paciente;
  const nombreCompleto = paciente
    ? `${paciente.nombre} ${paciente.apellido ?? ""}`.trim()
    : "Paciente desconocido";

  const badgeVariant = consulta.alarma ? "urgente" : consulta.estado;

  const mensajesSerializados = consulta.mensajes.map((m) => ({
    ...m,
    created_at: m.created_at ? m.created_at.toISOString() : null,
  }));

  const informeSerializado = consulta.informe
    ? {
        ...consulta.informe,
        created_at: consulta.informe.created_at
          ? consulta.informe.created_at.toISOString()
          : null,
        enviado_at: consulta.informe.enviado_at
          ? consulta.informe.enviado_at.toISOString()
          : null,
        revisado_at: consulta.informe.revisado_at
          ? consulta.informe.revisado_at.toISOString()
          : null,
      }
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-start gap-3 md:gap-4">
          <Link
            href={paciente ? `/pacientes/${paciente.id}` : "/pacientes"}
            className="text-[#64748B] hover:text-[#1E293B] transition-colors mt-1 flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold text-[#1E293B] break-words">{nombreCompleto}</h1>
              <Badge variant={badgeVariant} />
              {consulta.alarma && (
                <svg className="w-5 h-5 text-[#EF4444] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#64748B] mt-0.5">
              {paciente?.celular ?? "Sin teléfono"} · {formatFechaHora(consulta.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatConversacion mensajes={mensajesSerializados} />
        <div className="flex flex-col gap-6">
          <FichaClinica
            consulta={{
              motivo: consulta.motivo,
              evolucion: consulta.evolucion,
              alarma: consulta.alarma,
              motivo_alarma: consulta.motivo_alarma,
              sintomas: consulta.sintomas as Record<string, unknown>,
              medicacion_habitual: consulta.medicacion_habitual,
              alergias: consulta.alergias,
              dentro_cobertura: consulta.dentro_cobertura,
            }}
            paciente={paciente ? { prepaga: paciente.prepaga } : null}
            informe={informeSerializado}
            consultaId={id}
          />
          <DevolucionMedico
            consultaId={id}
            devolucionInicial={consulta.devolucion_medico ?? null}
            devolucionAtInicial={
              consulta.devolucion_at ? consulta.devolucion_at.toISOString() : null
            }
          />
        </div>
      </div>
    </div>
  );
}
