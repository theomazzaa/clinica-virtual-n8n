"use client";

import { useState } from "react";

type Sintomas = {
  sintomas_actuales?: string;
  caracteristicas?: {
    duracion?: string;
    intensidad?: string;
    localizacion?: string;
    evolucion?: string;
    factores_que_empeoran_o_alivian?: string;
    sintomas_asociados?: string;
  };
};

type FichaClinicaProps = {
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
  informe: {
    id: string;
    estado: string;
    google_doc_url: string | null;
  } | null;
  consultaId: string;
};

function Seccion({ titulo, valor, icono }: { titulo: string; valor?: string | null; icono: string }) {
  return (
    <div className="py-3 border-b border-[#E2E8F0] last:border-0">
      <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1 flex items-center gap-1">
        <span>{icono}</span> {titulo}
      </p>
      <p className="text-sm text-[#1E293B]">{valor || "-"}</p>
    </div>
  );
}

export default function FichaClinica({ consulta, paciente, informe, consultaId }: FichaClinicaProps) {
  const [marcandoRevisado, setMarcandoRevisado] = useState(false);
  const [informeEstado, setInformeEstado] = useState(informe?.estado ?? null);

  const sintomas = (consulta.sintomas as Sintomas) ?? {};
  const caract = sintomas.caracteristicas ?? {};

  async function marcarRevisado() {
    setMarcandoRevisado(true);
    try {
      await fetch(`/api/consultas/${consultaId}/revisado`, { method: "POST" });
      setInformeEstado("revisado");
    } finally {
      setMarcandoRevisado(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-auto md:h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="font-semibold text-[#1E293B]">Ficha clínica</h2>
        <p className="text-xs text-[#64748B] mt-0.5">Datos de preconsulta</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {/* Red Flags */}
        {consulta.alarma && (
          <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-[#EF4444] text-sm">RED FLAGS</span>
            </div>
            {consulta.motivo_alarma ? (
              consulta.motivo_alarma.split("\n").map((linea, i) => (
                <p key={i} className="text-sm text-red-700 flex items-start gap-1">
                  <span>⚠</span> {linea}
                </p>
              ))
            ) : (
              <p className="text-sm text-red-700">⚠ Alarma activada</p>
            )}
          </div>
        )}

        <Seccion titulo="Motivo de consulta" valor={consulta.motivo} icono="📋" />
        <Seccion titulo="Síntomas" valor={sintomas.sintomas_actuales} icono="🩺" />
        <Seccion titulo="Duración" valor={caract.duracion} icono="⏱" />
        <Seccion titulo="Intensidad" valor={caract.intensidad} icono="📊" />
        <Seccion titulo="Evolución" valor={caract.evolucion ?? consulta.evolucion} icono="📈" />
        <Seccion titulo="Localización" valor={caract.localizacion} icono="📍" />
        <Seccion titulo="Factores" valor={caract.factores_que_empeoran_o_alivian} icono="⚡" />
        <Seccion titulo="Medicación habitual" valor={consulta.medicacion_habitual} icono="💊" />
        <Seccion titulo="Alergias" valor={consulta.alergias} icono="⚠️" />
        <div className="py-3 border-b border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] uppercase tracking-wide mb-1 flex items-center gap-1">
            <span>🏥</span> Cobertura
          </p>
          <p className="text-sm text-[#1E293B]">
            {consulta.dentro_cobertura === true
              ? `Dentro de cobertura${paciente?.prepaga ? ` · ${paciente.prepaga}` : ""}`
              : consulta.dentro_cobertura === false
              ? `Fuera de cobertura${paciente?.prepaga ? ` · ${paciente.prepaga}` : ""}`
              : paciente?.prepaga ?? "-"}
          </p>
        </div>
      </div>

      {/* Botones informe */}
      {informe && (
        <div className="px-6 py-4 border-t border-[#E2E8F0] space-y-2">
          {informe.google_doc_url && (
            <a
              href={informe.google_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver informe
            </a>
          )}
          {informeEstado === "revisado" ? (
            <div className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium border border-green-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Revisado
            </div>
          ) : informeEstado === "enviado" ? (
            <button
              onClick={marcarRevisado}
              disabled={marcandoRevisado}
              className="w-full px-4 py-2 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors disabled:opacity-50"
            >
              {marcandoRevisado ? "Marcando..." : "Marcar como revisado"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
