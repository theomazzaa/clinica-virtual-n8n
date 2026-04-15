"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface Consulta {
  id: string;
  estado: string;
  alarma: boolean;
  motivo: string | null;
  sistema: string | null;
  created_at: string | null;
  paciente: {
    nombre: string;
    apellido: string | null;
    celular: string | null;
  } | null;
}

interface RecentPatientsProps {
  consultas: Consulta[];
}

function getInitial(nombre: string) {
  return nombre.charAt(0).toUpperCase();
}

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function formatFecha(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Buenos_Aires",
  });
}

export default function RecentPatients({ consultas }: RecentPatientsProps) {
  if (consultas.length === 0) {
    return (
      <div className="text-center py-12 text-[#64748B]">
        <p>No hay consultas recientes</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E2E8F0]">
      {consultas.map((c) => {
        const nombre = c.paciente
          ? `${c.paciente.nombre} ${c.paciente.apellido ?? ""}`.trim()
          : "Paciente desconocido";
        const badgeVariant = c.alarma ? "urgente" : c.estado === "finalizada" ? "completa" : c.estado;

        return (
          <Link
            key={c.id}
            href={`/consultas/${c.id}`}
            className="flex items-center gap-3 md:gap-4 py-3 md:py-4 px-2 hover:bg-[#F8FAFC] rounded-lg transition-colors group"
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg flex-shrink-0 ${getAvatarColor(nombre)}`}
            >
              {getInitial(nombre)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <p className="font-medium text-[#1E293B] text-sm md:text-base truncate">{nombre}</p>
                {c.alarma && (
                  <svg className="w-4 h-4 text-[#EF4444] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-xs md:text-sm text-[#64748B] truncate">
                {c.paciente?.celular ?? "Sin teléfono"}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-1 md:gap-1.5 flex-shrink-0">
              <p className="text-[10px] md:text-xs text-[#64748B]">{formatFecha(c.created_at)}</p>
              <Badge variant={badgeVariant} />
            </div>

            {/* Arrow */}
            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
