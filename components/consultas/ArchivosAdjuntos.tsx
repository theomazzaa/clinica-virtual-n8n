"use client";

import { useEffect, useState } from "react";

type Archivo = {
  id: string;
  tipo: string | null;
  url: string;
  nombre_archivo: string | null;
  created_at: string | null;
};

function formatFechaHora(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Buenos_Aires",
  });
}

function esImagen(tipo: string | null) {
  if (!tipo) return false;
  return tipo.includes("foto") || tipo.includes("imagen") || tipo.includes("photo");
}

function IconoImagen() {
  return (
    <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconoDocumento() {
  return (
    <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function ArchivosAdjuntos({ consultaId }: { consultaId: string }) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    fetch(`/api/consultas/${consultaId}/archivos`)
      .then((r) => r.json())
      .then((d) => {
        setArchivos(Array.isArray(d) ? d : []);
        setCargado(true);
      })
      .catch(() => setCargado(true));
  }, [consultaId]);

  if (!cargado || archivos.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4">
      <h2 className="font-semibold text-[#1E293B] text-sm mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        Archivos adjuntos
        <span className="text-[#94A3B8] font-normal">({archivos.length})</span>
      </h2>
      <div className="space-y-2">
        {archivos.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
          >
            <div className="flex-shrink-0">
              {esImagen(a.tipo) ? <IconoImagen /> : <IconoDocumento />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1E293B] truncate">
                {a.nombre_archivo ?? "Archivo sin nombre"}
              </p>
              <p className="text-xs text-[#94A3B8]">{formatFechaHora(a.created_at)}</p>
            </div>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
            >
              Ver archivo
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
