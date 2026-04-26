export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";
import ConsultaTabsMobile from "@/components/consultas/ConsultaTabsMobile";
import ConsultaHeaderActions from "@/components/consultas/ConsultaHeaderActions";
import { ChevronLeft, AlertTriangle } from "lucide-react";

async function getConsulta(id: string, medicoId: string) {
  return prisma.consultas.findFirst({
    where: { id, medico_id: medicoId },
    include: {
      paciente: true,
      mensajes: { orderBy: { orden: "asc" } },
      informe: true,
      archivos: { orderBy: { created_at: "asc" } },
    },
  });
}

async function getHistorialPaciente(
  pacienteId: string,
  consultaActualId: string,
  medicoId: string
) {
  return prisma.consultas.findMany({
    where: {
      paciente_id: pacienteId,
      medico_id: medicoId,
      id: { not: consultaActualId },
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      motivo: true,
      estado: true,
      alarma: true,
      sistema: true,
      created_at: true,
    },
    take: 20,
  });
}

function formatFechaHora(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  const badgeVariant = consulta.alarma ? "urgente" : (consulta.estado ?? "en_curso");

  // Serialize dates for client
  const mensajesSerializados = consulta.mensajes.map((m) => ({
    ...m,
    created_at: m.created_at ? m.created_at.toISOString() : null,
  }));

  const archivosSerializados = consulta.archivos.map((a) => ({
    ...a,
    created_at: a.created_at ? a.created_at.toISOString() : null,
  }));

  // Get patient history
  const historialRaw = paciente
    ? await getHistorialPaciente(paciente.id, id, session.user.id).catch(
        () => []
      )
    : [];

  const historial = historialRaw.map((h) => ({
    ...h,
    created_at: h.created_at ? h.created_at.toISOString() : null,
    estado: h.estado ?? "en_curso",
    alarma: h.alarma ?? false,
  }));

  return (
    <div>
      {/* ─── Sticky Header ─── */}
      <div className="sticky top-14 md:top-0 z-10 bg-surface-secondary pb-4 md:pb-6 -mt-1">
        <div className="flex items-start justify-between gap-4">
          {/* Left: back + info */}
          <div className="flex items-start gap-3 min-w-0">
            <Link
              href={paciente ? `/pacientes/${paciente.id}` : "/pacientes"}
              className="text-text-muted hover:text-text-primary transition-colors mt-1.5 flex-shrink-0 focus-ring rounded-[var(--radius-sm)] p-0.5"
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary break-words leading-tight">
                  {nombreCompleto}
                </h1>
                <Badge variant={badgeVariant} />
                {consulta.alarma && (
                  <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs md:text-sm text-text-muted mt-1 flex items-center gap-1.5 flex-wrap">
                {paciente?.dni && (
                  <>
                    <span>DNI {paciente.dni}</span>
                    <span className="text-border">·</span>
                  </>
                )}
                <span>{paciente?.celular ?? "Sin telefono"}</span>
                <span className="text-border">·</span>
                <span>{formatFechaHora(consulta.created_at)}</span>
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <ConsultaHeaderActions
            consultaId={id}
            informeUrl={consulta.informe?.google_doc_url ?? null}
            informeEstado={consulta.informe?.estado ?? null}
          />
        </div>
      </div>

      {/* ─── Body ─── */}
      <ConsultaTabsMobile
        mensajes={mensajesSerializados}
        archivos={archivosSerializados}
        historial={historial}
        fichaClinicaProps={{
          consulta: {
            motivo: consulta.motivo,
            evolucion: consulta.evolucion,
            alarma: consulta.alarma ?? false,
            motivo_alarma: consulta.motivo_alarma,
            sintomas: consulta.sintomas as Record<string, unknown>,
            medicacion_habitual: consulta.medicacion_habitual,
            alergias: consulta.alergias,
            dentro_cobertura: consulta.dentro_cobertura,
          },
          paciente: paciente ? { prepaga: paciente.prepaga } : null,
        }}
        devolucionMedicoProps={{
          consultaId: id,
          devolucionInicial: consulta.devolucion_medico ?? null,
          devolucionAtInicial: consulta.devolucion_at
            ? consulta.devolucion_at.toISOString()
            : null,
        }}
      />
    </div>
  );
}
