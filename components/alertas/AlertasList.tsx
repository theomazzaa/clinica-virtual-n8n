"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";

type Alerta = {
  id: string;
  sistema: string | null;
  motivo: string | null;
  motivo_alarma: string | null;
  estado: string;
  created_at: string | null;
  paciente: {
    id: string;
    nombre: string;
    apellido: string | null;
    celular: string | null;
    dni: string | null;
  } | null;
  informe: {
    google_doc_url: string | null;
    estado: string;
  } | null;
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

type TabId = "sin_revisar" | "revisadas" | "todas";

export default function AlertasList({ alertas }: { alertas: Alerta[] }) {
  const [tab, setTab] = useState<TabId>("sin_revisar");
  const [revisadasLocal, setRevisadasLocal] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  function isRevisada(a: Alerta) {
    return revisadasLocal.has(a.id) || a.informe?.estado === "revisado";
  }

  const sinRevisar = alertas.filter((a) => !isRevisada(a));
  const revisadas = alertas.filter((a) => isRevisada(a));

  const filtered =
    tab === "sin_revisar"
      ? sinRevisar
      : tab === "revisadas"
        ? revisadas
        : alertas;

  async function marcarRevisada(consultaId: string) {
    setLoadingIds((prev) => new Set(prev).add(consultaId));
    try {
      const res = await fetch(`/api/consultas/${consultaId}/revisado`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setRevisadasLocal((prev) => new Set(prev).add(consultaId));
      toast.success("Marcada como revisada");
    } catch {
      toast.error("Error al marcar como revisada");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(consultaId);
        return next;
      });
    }
  }

  const tabs = [
    { id: "sin_revisar", label: "Sin revisar", count: sinRevisar.length },
    { id: "revisadas", label: "Revisadas", count: revisadas.length },
    { id: "todas", label: "Todas", count: alertas.length },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
          {tab === "sin_revisar" ? (
            <EmptyState
              icon={ShieldCheck}
              title="Sin alertas pendientes"
              description="Todas las consultas con alarma fueron revisadas"
            />
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="Sin alertas"
              description={
                tab === "revisadas"
                  ? "No hay alertas revisadas"
                  : "No hay consultas con alarma"
              }
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const nombre = a.paciente
              ? `${a.paciente.nombre} ${a.paciente.apellido ?? ""}`.trim()
              : "Paciente desconocido";
            const revisada = isRevisada(a);

            return (
              <div
                key={a.id}
                className={cn(
                  "bg-surface rounded-[var(--radius-lg)] shadow-sm border transition-all duration-150",
                  revisada
                    ? "border-border"
                    : "border-danger-500/20 border-l-[3px] border-l-danger-500 bg-danger-50/30"
                )}
              >
                <div className="px-4 md:px-6 py-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        revisada ? "bg-success-50" : "bg-danger-50"
                      )}
                    >
                      {revisada ? (
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-text-primary text-[15px]">
                          {nombre}
                        </span>
                        <Badge
                          variant={revisada ? "success" : "urgent"}
                          label={revisada ? "Revisada" : "Urgente"}
                        />
                        {a.sistema && (
                          <span className="text-[11px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full border border-border">
                            {a.sistema}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-text-secondary line-clamp-1">
                        {a.motivo ?? "Sin motivo"}
                      </p>

                      {a.motivo_alarma && !revisada && (
                        <p className="text-sm text-danger-600 mt-1 line-clamp-2 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {a.motivo_alarma}
                        </p>
                      )}

                      <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1.5">
                        {a.paciente?.dni && (
                          <>
                            <span>DNI {a.paciente.dni}</span>
                            <span className="text-border">·</span>
                          </>
                        )}
                        <span>{formatFechaHora(a.created_at)}</span>
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Link href={`/consultas/${a.id}`}>
                          <Button
                            variant={revisada ? "secondary" : "destructive"}
                            size="sm"
                          >
                            Ver detalle
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        {a.informe?.google_doc_url && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              window.open(a.informe!.google_doc_url!, "_blank")
                            }
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Informe
                          </Button>
                        )}

                        {!revisada && (
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={loadingIds.has(a.id)}
                            onClick={() => marcarRevisada(a.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Marcar revisada
                          </Button>
                        )}
                      </div>
                    </div>
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
