interface TiempoAhorradoCardProps {
  totalConsultas: number;
}

function formatTiempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  if (minutos < 1440) return `${(minutos / 60).toFixed(1)} hs`;
  const dias = Math.floor(minutos / 1440);
  const hs = Math.round((minutos % 1440) / 60);
  return hs > 0 ? `${dias} días ${hs} hs` : `${dias} días`;
}

export default function TiempoAhorradoCard({ totalConsultas }: TiempoAhorradoCardProps) {
  const totalMinutos = totalConsultas * 10;
  const tiempoFormateado = formatTiempo(totalMinutos);

  return (
    <div className="relative overflow-hidden bg-[#F0FDF4] border border-[#BBF7D0] border-l-4 border-l-[#22C55E] rounded-xl p-4 md:p-6 flex items-center justify-between mb-4 md:mb-6">
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-medium text-[#16A34A]">Tiempo Ahorrado</p>
        <p className="text-3xl md:text-4xl font-bold text-[#15803D] mt-1">{tiempoFormateado}</p>
        <p className="text-xs md:text-sm text-[#4ADE80] mt-1">Gracias a la automatización</p>
      </div>
      {/* Ícono decorativo */}
      <div className="opacity-10 text-[#22C55E] flex-shrink-0">
        <svg className="w-20 h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  );
}
