"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle2,
  MoreVertical,
  Download,
  Archive,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";

interface Props {
  consultaId: string;
  informeUrl: string | null;
  informeEstado: string | null;
}

export default function ConsultaHeaderActions({
  consultaId,
  informeUrl,
  informeEstado,
}: Props) {
  const [estado, setEstado] = useState(informeEstado);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function marcarRevisada() {
    setLoading(true);
    try {
      await fetch(`/api/consultas/${consultaId}/revisado`, { method: "POST" });
      setEstado("revisado");
      toast.success("Consulta marcada como revisada");
    } catch {
      toast.error("Error al marcar como revisada");
    } finally {
      setLoading(false);
    }
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Keyboard shortcut: R to toggle revisada
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "r" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        if (estado === "enviado") {
          e.preventDefault();
          marcarRevisada();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Ver informe */}
      {informeUrl && (
        <Tooltip content="Ver informe completo">
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.open(informeUrl, "_blank")}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver informe</span>
          </Button>
        </Tooltip>
      )}

      {/* Marcar revisada */}
      {estado === "revisado" ? (
        <div className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-success-600 bg-success-50 border border-success-500/20 rounded-[var(--radius-sm)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Revisada</span>
        </div>
      ) : estado === "enviado" ? (
        <Tooltip content="Marcar como revisada (R)">
          <Button
            variant="secondary"
            size="sm"
            onClick={marcarRevisada}
            loading={loading}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marcar revisada</span>
          </Button>
        </Tooltip>
      ) : null}

      {/* Kebab menu */}
      <div className="relative" ref={menuRef}>
        <Tooltip content="Mas opciones">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mas opciones"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </Tooltip>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-[var(--radius-md)] shadow-lg py-1 min-w-[200px] z-20 animate-[scaleIn_100ms_ease-in-out]">
            {informeUrl && (
              <button
                onClick={() => {
                  window.open(informeUrl, "_blank");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary transition-colors flex items-center gap-2.5"
              >
                <Download className="w-4 h-4" />
                Descargar informe
              </button>
            )}
            <button
              onClick={() => {
                toast.info("Funcion disponible proximamente");
                setMenuOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-secondary transition-colors flex items-center gap-2.5"
              )}
            >
              <Archive className="w-4 h-4" />
              Archivar consulta
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                toast.info("Funcion disponible proximamente");
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2.5"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar consulta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
