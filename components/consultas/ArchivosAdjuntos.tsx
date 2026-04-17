"use client";

import { Image, FileText, ExternalLink, Paperclip } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

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
  return (
    tipo.includes("foto") || tipo.includes("imagen") || tipo.includes("photo")
  );
}

export default function ArchivosAdjuntos({ archivos }: { archivos: Archivo[] }) {
  if (archivos.length === 0) {
    return (
      <EmptyState
        icon={Paperclip}
        title="Sin archivos adjuntos"
        description="Esta consulta no tiene archivos adjuntos"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {archivos.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-[var(--radius-md)] border border-border bg-surface overflow-hidden hover:shadow-md transition-all duration-150 hover:border-primary-200 focus-ring block"
        >
          {/* Preview / Icon */}
          <div className="aspect-[4/3] bg-surface-secondary flex items-center justify-center relative overflow-hidden">
            {esImagen(a.tipo) ? (
              <>
                <img
                  src={a.url}
                  alt={a.nombre_archivo ?? "Imagen"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector(".fallback-icon");
                      if (fallback) (fallback as HTMLElement).style.display = "flex";
                    }
                  }}
                />
                <div
                  className="fallback-icon absolute inset-0 items-center justify-center hidden"
                >
                  <Image className="w-8 h-8 text-text-muted" />
                </div>
              </>
            ) : (
              <FileText className="w-8 h-8 text-text-muted" />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-150 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 backdrop-blur-sm text-text-primary text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                Ver
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-2.5">
            <p className="text-xs font-medium text-text-primary truncate">
              {a.nombre_archivo ?? "Archivo sin nombre"}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {formatFechaHora(a.created_at)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
