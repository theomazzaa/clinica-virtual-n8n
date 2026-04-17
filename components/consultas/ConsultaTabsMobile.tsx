"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Paperclip, History } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatConversacion from "@/components/consultas/ChatConversacion";
import FichaClinica from "@/components/consultas/FichaClinica";
import DevolucionMedico from "@/components/consultas/DevolucionMedico";
import ArchivosAdjuntos from "@/components/consultas/ArchivosAdjuntos";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Link from "next/link";

type Mensaje = {
  id: string;
  consulta_id: string;
  rol: string;
  contenido: string;
  orden: number;
  created_at: string | null;
};

type Archivo = {
  id: string;
  tipo: string | null;
  url: string;
  nombre_archivo: string | null;
  created_at: string | null;
};

type HistorialItem = {
  id: string;
  motivo: string | null;
  estado: string;
  alarma: boolean;
  sistema: string | null;
  created_at: string | null;
};

interface ConsultaTabsMobileProps {
  mensajes: Mensaje[];
  archivos: Archivo[];
  historial: HistorialItem[];
  fichaClinicaProps: {
    consulta: {
      motivo: string | null;
      evolucion: string | null;
      alarma: boolean;
      motivo_alarma: string | null;
      sintomas: Record<string, unknown>;
      medicacion_habitual: string | null;
      alergias: string | null;
      dentro_cobertura: boolean | null;
    };
    paciente: { prepaga: string | null } | null;
  };
  devolucionMedicoProps: {
    consultaId: string;
    devolucionInicial: string | null;
    devolucionAtInicial: string | null;
  };
}

function formatFecha(d: string | null) {
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

/* ─── Historial Timeline ─── */
function HistorialPaciente({ items }: { items: HistorialItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="w-8 h-8 text-text-muted mb-3" />
        <p className="text-sm font-medium text-text-primary">Sin historial</p>
        <p className="text-xs text-text-muted mt-1">
          No hay otras consultas de este paciente
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-0">
      {items.map((item, i) => (
        <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
          {/* Timeline line */}
          {i < items.length - 1 && (
            <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
          )}
          {/* Dot */}
          <div
            className={cn(
              "w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 mt-0.5",
              item.alarma
                ? "border-danger-500 bg-danger-50"
                : item.estado === "finalizada"
                  ? "border-gray-300 bg-gray-100"
                  : "border-primary-500 bg-primary-50"
            )}
          />
          {/* Content */}
          <Link
            href={`/consultas/${item.id}`}
            className="flex-1 min-w-0 group"
          >
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge variant={item.alarma ? "urgente" : item.estado} />
              {item.sistema && (
                <span className="text-[11px] text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">
                  {item.sistema}
                </span>
              )}
            </div>
            <p className="text-sm text-text-primary group-hover:text-primary-600 transition-colors truncate">
              {item.motivo ?? "Sin motivo registrado"}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {formatFecha(item.created_at)}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export default function ConsultaTabsMobile({
  mensajes,
  archivos,
  historial,
  fichaClinicaProps,
  devolucionMedicoProps,
}: ConsultaTabsMobileProps) {
  const router = useRouter();
  const [leftTab, setLeftTab] = useState("conversacion");
  const [mobileTab, setMobileTab] = useState("chat");

  // Keyboard shortcut: Escape to go back
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "Escape" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        router.back();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  const leftTabs = [
    { id: "conversacion", label: "Conversacion", count: mensajes.length },
    ...(archivos.length > 0
      ? [{ id: "archivos", label: "Archivos", count: archivos.length }]
      : []),
    ...(historial.length > 0
      ? [{ id: "historial", label: "Historial", count: historial.length }]
      : []),
  ];

  const mobileTabs = [
    { id: "chat", label: "Chat", count: mensajes.length },
    { id: "ficha", label: "Ficha" },
    ...(archivos.length > 0
      ? [{ id: "archivos", label: "Archivos", count: archivos.length }]
      : []),
  ];

  return (
    <>
      {/* ─── Mobile ─── */}
      <div className="lg:hidden">
        <div className="sticky top-14 z-10 bg-surface-secondary -mx-4 px-4">
          <Tabs tabs={mobileTabs} active={mobileTab} onChange={setMobileTab} />
        </div>

        <div className="mt-4">
          {mobileTab === "chat" && <ChatConversacion mensajes={mensajes} />}
          {mobileTab === "ficha" && (
            <div className="flex flex-col gap-4">
              <FichaClinica {...fichaClinicaProps} />
              <DevolucionMedico {...devolucionMedicoProps} />
              {historial.length > 0 && (
                <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-text-primary text-[15px]">
                      Historial del paciente
                    </h2>
                  </div>
                  <HistorialPaciente items={historial} />
                </div>
              )}
            </div>
          )}
          {mobileTab === "archivos" && (
            <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
              <ArchivosAdjuntos archivos={archivos} />
            </div>
          )}
        </div>
      </div>

      {/* ─── Desktop (lg+) — 60/40 ─── */}
      <div className="hidden lg:grid lg:grid-cols-[3fr_2fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col">
          <div className="bg-surface rounded-t-[var(--radius-lg)] border border-b-0 border-border px-4">
            <Tabs tabs={leftTabs} active={leftTab} onChange={setLeftTab} />
          </div>

          {leftTab === "conversacion" && (
            <ChatConversacion
              mensajes={mensajes}
              className="rounded-t-none border-t-0 shadow-none"
            />
          )}
          {leftTab === "archivos" && (
            <div className="bg-surface rounded-b-[var(--radius-lg)] border border-t-0 border-border">
              <ArchivosAdjuntos archivos={archivos} />
            </div>
          )}
          {leftTab === "historial" && (
            <div className="bg-surface rounded-b-[var(--radius-lg)] border border-t-0 border-border">
              <HistorialPaciente items={historial} />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <FichaClinica {...fichaClinicaProps} />
          <DevolucionMedico {...devolucionMedicoProps} />
        </div>
      </div>
    </>
  );
}
