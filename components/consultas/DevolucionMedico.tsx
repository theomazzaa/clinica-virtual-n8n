"use client";

import { useState } from "react";

type Props = {
  consultaId: string;
  devolucionInicial: string | null;
  devolucionAtInicial: string | null;
};

function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default function DevolucionMedico({
  consultaId,
  devolucionInicial,
  devolucionAtInicial,
}: Props) {
  const [texto, setTexto] = useState(devolucionInicial ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardadoAt, setGuardadoAt] = useState<string | null>(devolucionAtInicial);
  const [error, setError] = useState("");
  const [guardadoOk, setGuardadoOk] = useState(false);

  async function guardar() {
    if (!texto.trim()) return;
    setGuardando(true);
    setError("");
    setGuardadoOk(false);

    try {
      const res = await fetch(`/api/consultas/${consultaId}/devolucion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devolucion: texto }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      const data = await res.json();
      setGuardadoAt(data.devolucion_at);
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    } catch {
      setError("No se pudo guardar la devolución. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="font-semibold text-[#1E293B]">Devolución del médico</h2>
        {guardadoAt && (
          <p className="text-xs text-[#64748B] mt-0.5">
            Última actualización: {formatFechaHora(guardadoAt)}
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="px-6 py-4 space-y-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí tu devolución, diagnóstico o indicaciones para este paciente..."
          rows={5}
          className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none transition-all"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          {guardadoOk && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardado correctamente
            </span>
          )}
          {!guardadoOk && <span />}
          <button
            onClick={guardar}
            disabled={guardando || !texto.trim()}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Guardar devolución"}
          </button>
        </div>
      </div>
    </div>
  );
}
