import { Timer } from "lucide-react";

interface TiempoAhorradoCardProps {
  totalPacientes: number;
}

function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  if (minutos < 1440) return `${(minutos / 60).toFixed(1)} hs`;
  const dias = Math.floor(minutos / 1440);
  const hs = Math.round((minutos % 1440) / 60);
  return hs > 0 ? `${dias} dias ${hs} hs` : `${dias} dias`;
}

export default function TiempoAhorradoCard({
  totalPacientes,
}: TiempoAhorradoCardProps) {
  const totalMinutos = totalPacientes * 15;
  const tiempoFormateado = formatTiempo(totalMinutos);

  return (
    <div className="relative overflow-hidden bg-success-50 border border-success-500/20 border-l-4 border-l-success-500 rounded-[var(--radius-lg)] p-4 md:p-5 flex items-center justify-between mb-4 md:mb-5">
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-medium text-success-600">
          Tiempo Ahorrado
        </p>
        <p className="text-3xl md:text-4xl font-bold text-success-600 mt-1">
          {tiempoFormateado}
        </p>
        <p className="text-xs md:text-sm text-success-500 mt-1">
          Gracias a la automatizacion
        </p>
      </div>
      <Timer className="w-20 h-20 md:w-24 md:h-24 text-success-500 opacity-10 flex-shrink-0" strokeWidth={1.5} />
    </div>
  );
}
