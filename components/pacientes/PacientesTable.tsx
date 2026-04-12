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
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
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
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        />
        <select
          value={filtroPrepaga}
          onChange={(e) => setFiltroPrepaga(e.target.value)}
          className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#64748B]"
        >
          <option value="">Todas las prepagas</option>
          {prepagas.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] text-left">
              <th className="px-6 py-3 font-medium">Nombre</th>
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
                <td colSpan={9} className="px-6 py-12 text-center text-[#64748B]">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1E293B]">
                    {p.nombre} {p.apellido ?? ""}
                  </td>
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
