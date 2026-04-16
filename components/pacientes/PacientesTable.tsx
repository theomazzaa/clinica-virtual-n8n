"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

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
  consultas: {
    created_at: string | null;
    estado: string;
    alarma: boolean;
    informe: { google_doc_url: string | null } | null;
  }[];
  _count: { consultas: number };
};

function formatFecha(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Buenos_Aires",
  });
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
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

const POR_PAGINA = 10;

export default function PacientesTable({ pacientes }: { pacientes: Paciente[] }) {
  const [search, setSearch] = useState("");
  const [filtroPrepaga, setFiltroPrepaga] = useState("");
  const [soloUrgentes, setSoloUrgentes] = useState(false);
  const [pagina, setPagina] = useState(0);

  const prepagas = Array.from(
    new Set(pacientes.map((p) => p.prepaga).filter(Boolean))
  ) as string[];

  const filtered = pacientes.filter((p) => {
    const fullName = `${p.nombre} ${p.apellido ?? ""}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      (p.dni ?? "").includes(search);
    const matchPrepaga = !filtroPrepaga || p.prepaga === filtroPrepaga;
    const matchUrgente =
      !soloUrgentes || p.consultas.some((c) => c.alarma && c.estado === "en_curso");
    return matchSearch && matchPrepaga && matchUrgente;
  });

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const paginados = filtered.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
  const inicio = pagina * POR_PAGINA + 1;
  const fin = Math.min((pagina + 1) * POR_PAGINA, filtered.length);

  function cambiarPagina(nueva: number) {
    setPagina(Math.max(0, Math.min(nueva, totalPaginas - 1)));
  }

  // Reset pagination when filters change
  function handleSearch(v: string) {
    setSearch(v);
    setPagina(0);
  }
  function handlePrepaga(v: string) {
    setFiltroPrepaga(v);
    setPagina(0);
  }
  function handleUrgentes(v: boolean) {
    setSoloUrgentes(v);
    setPagina(0);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
      {/* Filtros */}
      <div className="px-4 md:px-6 py-4 border-b border-[#E2E8F0] flex gap-3 flex-wrap items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
        />
        <select
          value={filtroPrepaga}
          onChange={(e) => handlePrepaga(e.target.value)}
          className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#64748B] w-full sm:w-auto"
        >
          <option value="">Todas las prepagas</option>
          {prepagas.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#64748B] whitespace-nowrap">
          <input
            type="checkbox"
            checked={soloUrgentes}
            onChange={(e) => handleUrgentes(e.target.checked)}
            className="w-4 h-4 accent-[#EF4444] rounded"
          />
          Solo urgentes
        </label>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden divide-y divide-[#E2E8F0]">
        {paginados.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#64748B]">
            No se encontraron pacientes
          </div>
        ) : (
          paginados.map((p) => {
            const fullName = `${p.nombre} ${p.apellido ?? ""}`.trim();
            const ultimaConsulta = p.consultas[0];
            const docUrl = ultimaConsulta?.informe?.google_doc_url ?? null;
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${getAvatarColor(fullName)}`}
                >
                  {p.nombre[0]?.toUpperCase() ?? "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1E293B] truncate">{fullName}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {p.dni ? `DNI ${p.dni}` : "Sin DNI"}
                    {p.prepaga ? ` · ${p.prepaga}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {ultimaConsulta && (
                      <Badge variant={ultimaConsulta.estado} />
                    )}
                    {ultimaConsulta?.alarma && ultimaConsulta.estado === "en_curso" && (
                      <Badge variant="urgente" />
                    )}
                    <span className="text-xs text-[#94A3B8]">
                      {ultimaConsulta ? formatFecha(ultimaConsulta.created_at) : "Sin consultas"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {docUrl ? (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver informe"
                      className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  ) : null}
                  <Link
                    href={`/pacientes/${p.id}`}
                    title="Ver paciente"
                    className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop: Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] text-left">
              <th className="px-6 py-3 font-medium">Paciente</th>
              <th className="px-6 py-3 font-medium">DNI</th>
              <th className="px-6 py-3 font-medium">Última consulta</th>
              <th className="px-6 py-3 font-medium">Estado</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              paginados.map((p) => {
                const fullName = `${p.nombre} ${p.apellido ?? ""}`.trim();
                const ultimaConsulta = p.consultas[0];
                const docUrl = ultimaConsulta?.informe?.google_doc_url ?? null;
                const esUrgente = ultimaConsulta?.alarma && ultimaConsulta?.estado === "en_curso";
                return (
                  <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    {/* Avatar + Nombre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm ${getAvatarColor(fullName)}`}
                        >
                          {p.nombre[0]?.toUpperCase() ?? "P"}
                        </div>
                        <div>
                          <p className="font-medium text-[#1E293B]">{fullName}</p>
                          <p className="text-xs text-[#94A3B8]">
                            {p._count.consultas} consulta{p._count.consultas !== 1 ? "s" : ""}
                            {p.prepaga ? ` · ${p.prepaga}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* DNI */}
                    <td className="px-6 py-4 text-[#64748B]">{p.dni ?? "-"}</td>
                    {/* Última consulta */}
                    <td className="px-6 py-4 text-[#64748B]">
                      {ultimaConsulta ? formatFecha(ultimaConsulta.created_at) : "-"}
                    </td>
                    {/* Estado */}
                    <td className="px-6 py-4">
                      {esUrgente ? (
                        <Badge variant="urgente" />
                      ) : ultimaConsulta ? (
                        <Badge variant={ultimaConsulta.estado} />
                      ) : (
                        <span className="text-[#94A3B8] text-xs">Sin consultas</span>
                      )}
                    </td>
                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Ver paciente */}
                        <Link
                          href={`/pacientes/${p.id}`}
                          title="Ver ficha"
                          className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {/* Ver informe */}
                        {docUrl ? (
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver informe"
                            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        ) : (
                          <span title="Sin informe" className="p-2 text-[#CBD5E1] opacity-40 cursor-not-allowed">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </span>
                        )}
                        {/* Enviar mensaje — próximamente */}
                        <span title="Próximamente" className="p-2 text-[#CBD5E1] opacity-40 cursor-not-allowed">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filtered.length > POR_PAGINA && (
        <div className="px-4 md:px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between text-sm">
          <span className="text-[#64748B]">
            Mostrando {inicio}–{fin} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarPagina(pagina - 1)}
              disabled={pagina === 0}
              className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-[#64748B]">
              {pagina + 1} / {totalPaginas}
            </span>
            <button
              onClick={() => cambiarPagina(pagina + 1)}
              disabled={pagina >= totalPaginas - 1}
              className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
