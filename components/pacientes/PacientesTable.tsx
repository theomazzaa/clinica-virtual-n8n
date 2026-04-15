"use client";

import { useState } from "react";
import Link from "next/link";

type Paciente = {
  id: string;
  nombre: string;
  apellido: string | null;
  dni: string | null;
  edad: number | null;
  sexo: string | null;
  prepaga: string | null;
  celular: string | null;
  created_at: string | null;
  consultas: { created_at: string | null; estado: string }[];
  _count: { consultas: number };
};

function formatFecha(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Buenos_Aires" });
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

export default function PacientesTable({ pacientes }: { pacientes: Paciente[] }) {
  const [search, setSearch] = useState("");
  const [filtroPrepaga, setFiltroPrepaga] = useState("");

  const prepagas = Array.from(new Set(pacientes.map((p) => p.prepaga).filter(Boolean))) as string[];

  const filtered = pacientes.filter((p) => {
    const nombre = `${p.nombre} ${p.apellido ?? ""}`.toLowerCase();
    const matchSearch =
      nombre.includes(search.toLowerCase()) ||
      (p.dni ?? "").includes(search);
    const matchPrepaga = !filtroPrepaga || p.prepaga === filtroPrepaga;
    return matchSearch && matchPrepaga;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      {/* Filtros */}
      <div className="px-4 md:px-6 py-4 border-b border-[#E2E8F0] flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        />
        <select
          value={filtroPrepaga}
          onChange={(e) => setFiltroPrepaga(e.target.value)}
          className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#64748B] w-full sm:w-auto"
        >
          <option value="">Todas las prepagas</option>
          {prepagas.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden divide-y divide-[#E2E8F0]">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#64748B]">
            No se encontraron pacientes
          </div>
        ) : (
          filtered.map((p) => {
            const fullName = `${p.nombre} ${p.apellido ?? ""}`.trim();
            return (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${getAvatarColor(fullName)}`}
                >
                  {p.nombre[0]?.toUpperCase() ?? "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1E293B] truncate">{fullName}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {p.dni ? `DNI ${p.dni}` : "Sin DNI"}
                    {p.edad ? ` · ${p.edad} años` : ""}
                    {p.prepaga ? ` · ${p.prepaga}` : ""}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {p._count.consultas} consulta{p._count.consultas !== 1 ? "s" : ""}
                    {p.consultas[0] ? ` · Última: ${formatFecha(p.consultas[0].created_at)}` : ""}
                  </p>
                </div>
                <svg className="w-5 h-5 text-[#CBD5E1] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })
        )}
      </div>

      {/* Desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] text-left">
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Apellido</th>
              <th className="px-6 py-3 font-medium">DNI</th>
              <th className="px-6 py-3 font-medium">Edad</th>
              <th className="px-6 py-3 font-medium">Sexo</th>
              <th className="px-6 py-3 font-medium">Prepaga</th>
              <th className="px-6 py-3 font-medium">Celular</th>
              <th className="px-6 py-3 font-medium">Última consulta</th>
              <th className="px-6 py-3 font-medium">Consultas</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-[#64748B]">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1E293B]">{p.nombre}</td>
                  <td className="px-6 py-4 text-[#1E293B]">{p.apellido ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B]">{p.dni ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B]">{p.edad ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B] capitalize">{p.sexo ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B]">{p.prepaga ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B]">{p.celular ?? "-"}</td>
                  <td className="px-6 py-4 text-[#64748B]">
                    {p.consultas[0] ? formatFecha(p.consultas[0].created_at) : "-"}
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">{p._count.consultas}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="text-[#2563EB] hover:underline font-medium"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
