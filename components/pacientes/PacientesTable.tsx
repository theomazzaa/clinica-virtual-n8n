"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Tooltip from "@/components/ui/Tooltip";
import { Switch } from "@/components/ui/Checkbox";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

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

const POR_PAGINA = 10;

export default function PacientesTable({
  pacientes,
}: {
  pacientes: Paciente[];
}) {
  const router = useRouter();
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
      !soloUrgentes ||
      p.consultas.some((c) => c.alarma && c.estado === "en_curso");
    return matchSearch && matchPrepaga && matchUrgente;
  });

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA);
  const paginados = filtered.slice(
    pagina * POR_PAGINA,
    (pagina + 1) * POR_PAGINA
  );
  const inicio = pagina * POR_PAGINA + 1;
  const fin = Math.min((pagina + 1) * POR_PAGINA, filtered.length);

  function cambiarPagina(nueva: number) {
    setPagina(Math.max(0, Math.min(nueva, totalPaginas - 1)));
  }

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

  function clearFilters() {
    setSearch("");
    setFiltroPrepaga("");
    setSoloUrgentes(false);
    setPagina(0);
  }

  const hasActiveFilters = search || filtroPrepaga || soloUrgentes;

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] border border-border shadow-sm">
      {/* Filters */}
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "w-full h-9 pl-9 pr-3 text-sm bg-surface border rounded-[var(--radius-sm)]",
                "placeholder:text-text-muted text-text-primary",
                "transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
                "border-border hover:border-border-strong"
              )}
            />
          </div>

          {/* Prepaga select */}
          <div className="relative">
            <select
              value={filtroPrepaga}
              onChange={(e) => handlePrepaga(e.target.value)}
              className={cn(
                "h-9 pl-3 pr-8 text-sm bg-surface border rounded-[var(--radius-sm)] appearance-none",
                "text-text-secondary",
                "transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600",
                "border-border hover:border-border-strong",
                filtroPrepaga && "border-primary-300 bg-primary-50 text-primary-700"
              )}
            >
              <option value="">Todas las prepagas</option>
              {prepagas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none rotate-90" />
          </div>

          {/* Urgentes switch */}
          <Switch
            checked={soloUrgentes}
            onChange={handleUrgentes}
            label="Solo urgentes"
          />
        </div>

        {/* Results count */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
            <span>
              Mostrando {filtered.length} de {pacientes.length} pacientes
            </span>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden divide-y divide-border">
        {paginados.length === 0 ? (
          <MobileEmpty search={search} onClear={clearFilters} total={pacientes.length} />
        ) : (
          paginados.map((p) => {
            const fullName = `${p.nombre} ${p.apellido ?? ""}`.trim();
            const ultimaConsulta = p.consultas[0];
            const docUrl = ultimaConsulta?.informe?.google_doc_url ?? null;
            const esUrgente =
              ultimaConsulta?.alarma && ultimaConsulta?.estado === "en_curso";

            return (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors"
              >
                <Avatar name={fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {p.dni ? `DNI ${p.dni}` : "Sin DNI"}
                    {p.prepaga ? ` · ${p.prepaga}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {esUrgente ? (
                      <Badge variant="urgente" />
                    ) : ultimaConsulta ? (
                      <Badge variant={ultimaConsulta.estado} />
                    ) : null}
                    <span className="text-[11px] text-text-muted">
                      {ultimaConsulta
                        ? formatFecha(ultimaConsulta.created_at)
                        : "Sin consultas"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {docUrl && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(docUrl, "_blank");
                      }}
                      className="p-1.5 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-[var(--radius-sm)] transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                DNI
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Ultima consulta
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {paginados.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <DesktopEmpty search={search} onClear={clearFilters} total={pacientes.length} />
                </td>
              </tr>
            ) : (
              paginados.map((p) => {
                const fullName =
                  `${p.nombre} ${p.apellido ?? ""}`.trim();
                const ultimaConsulta = p.consultas[0];
                const docUrl =
                  ultimaConsulta?.informe?.google_doc_url ?? null;
                const esUrgente =
                  ultimaConsulta?.alarma &&
                  ultimaConsulta?.estado === "en_curso";

                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/pacientes/${p.id}`)}
                    className="border-b border-border hover:bg-surface-secondary transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={fullName} size="sm" />
                        <div>
                          <p className="font-medium text-text-primary">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {p._count.consultas} consulta
                            {p._count.consultas !== 1 ? "s" : ""}
                            {p.prepaga ? ` · ${p.prepaga}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-text-secondary">
                      {p.dni ?? "-"}
                    </td>
                    <td className="px-6 py-3.5 text-text-secondary">
                      {ultimaConsulta
                        ? formatFecha(ultimaConsulta.created_at)
                        : "-"}
                    </td>
                    <td className="px-6 py-3.5">
                      {esUrgente ? (
                        <Badge variant="urgente" />
                      ) : ultimaConsulta ? (
                        <Badge variant={ultimaConsulta.estado} />
                      ) : (
                        <span className="text-[11px] text-text-muted">
                          Sin consultas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip content="Ver ficha">
                          <Link
                            href={`/pacientes/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-[var(--radius-sm)] transition-colors focus-ring"
                            aria-label="Ver ficha"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Tooltip>

                        {docUrl ? (
                          <Tooltip content="Ver informe">
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-text-muted hover:text-primary-600 hover:bg-primary-50 rounded-[var(--radius-sm)] transition-colors focus-ring"
                              aria-label="Ver informe"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          </Tooltip>
                        ) : (
                          <Tooltip content="Sin informe">
                            <span
                              className="p-2 text-text-muted opacity-30 cursor-not-allowed"
                              aria-label="Sin informe"
                            >
                              <FileText className="w-4 h-4" />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > POR_PAGINA && (
        <div className="px-4 md:px-6 py-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-text-muted text-xs">
            Mostrando {inicio}–{fin} de {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cambiarPagina(pagina - 1)}
              disabled={pagina === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-text-muted px-2">
              {pagina + 1} / {totalPaginas}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cambiarPagina(pagina + 1)}
              disabled={pagina >= totalPaginas - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Empty States ─── */

function MobileEmpty({
  search,
  onClear,
  total,
}: {
  search: string;
  onClear: () => void;
  total: number;
}) {
  if (total === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin pacientes"
        description="Aun no hay pacientes registrados"
      />
    );
  }
  return (
    <EmptyState
      icon={SearchX}
      title="Sin resultados"
      description={
        search
          ? `No encontramos pacientes que coincidan con "${search}"`
          : "No hay pacientes con los filtros seleccionados"
      }
      action={
        <Button variant="secondary" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      }
    />
  );
}

function DesktopEmpty({
  search,
  onClear,
  total,
}: {
  search: string;
  onClear: () => void;
  total: number;
}) {
  if (total === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin pacientes"
        description="Aun no hay pacientes registrados"
      />
    );
  }
  return (
    <EmptyState
      icon={SearchX}
      title="Sin resultados"
      description={
        search
          ? `No encontramos pacientes que coincidan con "${search}"`
          : "No hay pacientes con los filtros seleccionados"
      }
      action={
        <Button variant="secondary" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      }
    />
  );
}
