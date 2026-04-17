"use client";

import {
  ClipboardList,
  Stethoscope,
  Clock,
  Activity,
  TrendingUp,
  MapPin,
  Zap,
  Pill,
  AlertTriangle,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
};

function Seccion({
  titulo,
  valor,
  Icon,
}: {
  titulo: string;
  valor?: string | null;
  Icon: LucideIcon;
}) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {titulo}
      </p>
      <p className="text-sm text-text-primary leading-relaxed">{valor || "-"}</p>
    </div>
  );
}

export default function FichaClinica({ consulta, paciente }: FichaClinicaProps) {
  const sintomas = (consulta.sintomas as Sintomas) ?? {};
  const caract = sintomas.caracteristicas ?? {};

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-text-primary text-[15px]">Ficha clinica</h2>
        <p className="text-[11px] text-text-muted mt-0.5">Datos de preconsulta</p>
      </div>

      {/* Content */}
      <div className="px-6 py-2 max-h-[calc(100vh-420px)] overflow-y-auto custom-scrollbar">
        {/* Red Flags */}
        {consulta.alarma && (
          <div className="bg-danger-50 border-l-4 border-l-danger-600 rounded-r-[var(--radius-md)] p-4 my-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
              <span className="font-semibold text-danger-600 text-xs uppercase tracking-wider">
                Red Flags
              </span>
            </div>
            {consulta.motivo_alarma ? (
              consulta.motivo_alarma.split("\n").map((linea, i) => (
                <p
                  key={i}
                  className={cn(
                    "text-sm text-danger-700 leading-relaxed",
                    i > 0 && "mt-1"
                  )}
                >
                  {linea}
                </p>
              ))
            ) : (
              <p className="text-sm text-danger-700">Alarma activada</p>
            )}
          </div>
        )}

        <Seccion titulo="Motivo de consulta" valor={consulta.motivo} Icon={ClipboardList} />
        <Seccion titulo="Sintomas" valor={sintomas.sintomas_actuales} Icon={Stethoscope} />
        <Seccion titulo="Duracion" valor={caract.duracion} Icon={Clock} />
        <Seccion titulo="Intensidad" valor={caract.intensidad} Icon={Activity} />
        <Seccion
          titulo="Evolucion"
          valor={caract.evolucion ?? consulta.evolucion}
          Icon={TrendingUp}
        />
        <Seccion titulo="Localizacion" valor={caract.localizacion} Icon={MapPin} />
        <Seccion titulo="Factores" valor={caract.factores_que_empeoran_o_alivian} Icon={Zap} />
        <Seccion titulo="Medicacion habitual" valor={consulta.medicacion_habitual} Icon={Pill} />
        <Seccion titulo="Alergias" valor={consulta.alergias} Icon={AlertTriangle} />

        {/* Cobertura */}
        <div className="py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Cobertura
          </p>
          <p className="text-sm text-text-primary">
            {consulta.dentro_cobertura === true
              ? `Dentro de cobertura${paciente?.prepaga ? ` · ${paciente.prepaga}` : ""}`
              : consulta.dentro_cobertura === false
                ? `Fuera de cobertura${paciente?.prepaga ? ` · ${paciente.prepaga}` : ""}`
                : paciente?.prepaga ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
