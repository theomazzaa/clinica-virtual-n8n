import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { TurnoConPaciente } from "@/lib/agenda-queries";
import { extraerDatosPacienteDelHold } from "@/lib/datos-json";
import { formatearHoraArgentina } from "@/lib/agenda-helpers";

interface Props {
  turno: TurnoConPaciente;
}

const MODALIDAD_LABEL: Record<string, string> = {
  privada: "Particular",
  os: "Obra Social",
  os_copago: "Obra Social + Copago",
};

function modalidadLabel(value: string): string {
  return (
    MODALIDAD_LABEL[value] ??
    value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")
  );
}

export default function TurnoCard({ turno }: Props) {
  const { nombre, dni, email, edad } = extraerDatosPacienteDelHold(turno);
  const hora = formatearHoraArgentina(turno.slot_datetime);
  const esConfirmado = turno.estado === "confirmado";

  return (
    <Card>
      <div className="flex items-start gap-5">
        {/* Hora */}
        <div className="flex-shrink-0 pt-0.5">
          <span className="text-2xl font-semibold text-blue-600 tabular-nums">
            {hora}
          </span>
        </div>

        {/* Datos del paciente */}
        <div className="flex-1 min-w-0">
          {nombre ? (
            <p className="text-sm font-semibold text-slate-900">{nombre}</p>
          ) : (
            <p className="text-sm italic text-slate-400">Paciente sin datos</p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">
            {[
              dni ? `DNI ${dni}` : null,
              edad !== null ? `${edad} años` : null,
              email ?? null,
            ]
              .filter(Boolean)
              .join(" · ") || "Sin datos adicionales"}
          </p>
          <div className="mt-2 space-y-0.5">
            <p className="text-xs text-slate-600">
              <span className="font-medium">Cobro:</span>{" "}
              {modalidadLabel(turno.modalidad)}
            </p>
            {/* TODO Fase 4: modalidad de atención no está disponible en holds aún */}
            <p className="text-xs text-slate-600">
              <span className="font-medium">Atención:</span>{" "}
              <span className="text-slate-400">No informado</span>
            </p>
          </div>
        </div>

        {/* Badge + Botones */}
        <div className="flex-shrink-0 flex flex-col items-end gap-3">
          {esConfirmado ? (
            <Badge
              variant="success"
              label="Confirmado"
              dot={false}
              icon={true}
            />
          ) : (
            <Badge
              variant="warning"
              label="Pendiente de pago"
              dot={true}
              icon={false}
            />
          )}
          <div className="flex flex-col gap-1.5">
            <Tooltip content="Disponible en Fase 4" side="left">
              <Button variant="secondary" size="sm" disabled>
                Ver informe preliminar
              </Button>
            </Tooltip>
            <Tooltip content="Disponible en Fase 5" side="left">
              <Button variant="secondary" size="sm" disabled>
                Notas del médico
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}
