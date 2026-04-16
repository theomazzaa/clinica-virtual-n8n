"use client";

import { useState } from "react";
import ChatConversacion from "@/components/consultas/ChatConversacion";
import FichaClinica from "@/components/consultas/FichaClinica";
import DevolucionMedico from "@/components/consultas/DevolucionMedico";

type Mensaje = {
  id: string;
  consulta_id: string;
  rol: string;
  contenido: string;
  orden: number;
  created_at: string | null;
};

type Informe = {
  id: string;
  consulta_id: string;
  google_doc_url: string | null;
  google_doc_id: string | null;
  estado: string;
  created_at: string | null;
  enviado_at: string | null;
  revisado_at: string | null;
} | null;

interface ConsultaTabsMobileProps {
  mensajes: Mensaje[];
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
    informe: Informe;
    consultaId: string;
  };
  devolucionMedicoProps: {
    consultaId: string;
    devolucionInicial: string | null;
    devolucionAtInicial: string | null;
  };
}

type Tab = "conversacion" | "ficha";

export default function ConsultaTabsMobile({
  mensajes,
  fichaClinicaProps,
  devolucionMedicoProps,
}: ConsultaTabsMobileProps) {
  const [tabActivo, setTabActivo] = useState<Tab>("conversacion");

  return (
    <>
      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <div className="sticky top-14 z-10 bg-white border-b border-[#E2E8F0] flex mb-4">
          <button
            onClick={() => setTabActivo("conversacion")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabActivo === "conversacion"
                ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Conversación
          </button>
          <button
            onClick={() => setTabActivo("ficha")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabActivo === "ficha"
                ? "border-b-2 border-[#2563EB] text-[#2563EB]"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Ficha clínica
          </button>
        </div>

        {tabActivo === "conversacion" && (
          <ChatConversacion mensajes={mensajes} />
        )}
        {tabActivo === "ficha" && (
          <div className="flex flex-col gap-4">
            <FichaClinica {...fichaClinicaProps} />
            <DevolucionMedico {...devolucionMedicoProps} />
          </div>
        )}
      </div>

      {/* Desktop: dos columnas (lg+) */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <ChatConversacion mensajes={mensajes} />
        <div className="flex flex-col gap-6">
          <FichaClinica {...fichaClinicaProps} />
          <DevolucionMedico {...devolucionMedicoProps} />
        </div>
      </div>
    </>
  );
}
