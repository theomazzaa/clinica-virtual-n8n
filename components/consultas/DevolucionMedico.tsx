"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Save, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

type Props = {
  consultaId: string;
  devolucionInicial: string | null;
  devolucionAtInicial: string | null;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function DevolucionMedico({
  consultaId,
  devolucionInicial,
  devolucionAtInicial,
}: Props) {
  const [texto, setTexto] = useState(devolucionInicial ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    devolucionAtInicial ? new Date(devolucionAtInicial) : null
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const doSave = useCallback(
    async (value: string) => {
      if (!value.trim()) return;
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/consultas/${consultaId}/devolucion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devolucion: value }),
        });
        if (!res.ok) throw new Error();
        setLastSavedAt(new Date());
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [consultaId]
  );

  function handleChange(value: string) {
    setTexto(value);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (value.trim()) {
      setSaveStatus("idle");
      saveTimerRef.current = setTimeout(() => doSave(value), 2000);
    }
  }

  // Keyboard shortcut: E to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "e" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function formatRelativeTime(date: Date) {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 5) return "recien";
    if (diffSec < 60) return `hace ${diffSec}s`;
    if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)}min`;
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Buenos_Aires",
    });
  }

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary text-[15px]">
            Devolucion del medico
          </h2>
          {/* Save status indicator */}
          <div className="h-4 mt-0.5">
            {saveStatus === "saving" && (
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Guardando...
              </span>
            )}
            {saveStatus === "saved" && lastSavedAt && (
              <span className="text-[11px] text-success-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Guardado {formatRelativeTime(lastSavedAt)}
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-[11px] text-danger-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Error al guardar
              </span>
            )}
            {saveStatus === "idle" && lastSavedAt && (
              <span className="text-[11px] text-text-muted">
                Guardado {formatRelativeTime(lastSavedAt)}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1 border border-border">
          <kbd className="font-mono">E</kbd> para enfocar
        </span>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-3">
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Escribi tu devolucion, diagnostico o indicaciones para este paciente..."
          rows={5}
          className={cn(
            "w-full px-3.5 py-2.5 border rounded-[var(--radius-sm)] text-sm text-text-primary",
            "placeholder:text-text-muted resize-y",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
            "border-border hover:border-border-strong"
          )}
        />

        <div className="flex justify-end">
          <Button
            onClick={() => doSave(texto)}
            disabled={!texto.trim() || saveStatus === "saving"}
            loading={saveStatus === "saving"}
            size="sm"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar devolucion
          </Button>
        </div>
      </div>
    </div>
  );
}
