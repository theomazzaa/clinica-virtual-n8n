import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/ui/Badge";

const MEDICO_ID = "48315179-21eb-406d-8c8b-e172d120bdcf";

function formatFechaHora(d: Date | null) {
  if (!d) return "-";
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

async function getAlarmas() {
  return prisma.consultas.findMany({
    where: { medico_id: MEDICO_ID, alarma: true },
    orderBy: { created_at: "desc" },
    include: {
      paciente: { select: { id: true, nombre: true, apellido: true, celular: true } },
      informe: { select: { google_doc_url: true } },
    },
  });
}

export default async function AlarmasPage() {
  let alarmas: Awaited<ReturnType<typeof getAlarmas>> = [];
  try {
    alarmas = await getAlarmas();
  } catch (e) {
    console.error(e);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Alertas</h1>
        <p className="text-[#64748B] mt-1">
          {alarmas.length === 0 ? "Sin alertas activas" : `${alarmas.length} consulta${alarmas.length !== 1 ? "s" : ""} con alarma`}
        </p>
      </div>

      {alarmas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#1E293B] font-medium">Sin alertas activas</p>
          <p className="text-[#64748B] text-sm mt-1">Todas las consultas están bajo control</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alarmas.map((c) => {
            const nombre = c.paciente
              ? `${c.paciente.nombre} ${c.paciente.apellido ?? ""}`.trim()
              : "Paciente desconocido";
            return (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-red-200 bg-[#FEF2F2]">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1E293B]">{nombre}</span>
                        <Badge variant="urgente" />
                        <span className="text-sm text-[#64748B]">{c.sistema ?? ""}</span>
                      </div>
                      <p className="text-sm text-[#64748B]">{c.motivo ?? "Sin motivo"}</p>
                      {c.motivo_alarma && (
                        <p className="text-sm text-red-600 mt-1">⚠ {c.motivo_alarma}</p>
                      )}
                      <p className="text-xs text-[#94A3B8] mt-1">
                        {c.paciente?.celular ?? ""} · {formatFechaHora(c.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.informe?.google_doc_url && (
                      <a
                        href={c.informe.google_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-white transition-colors"
                      >
                        Ver informe
                      </a>
                    )}
                    <Link
                      href={`/consultas/${c.id}`}
                      className="px-3 py-1.5 text-sm bg-[#EF4444] text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
