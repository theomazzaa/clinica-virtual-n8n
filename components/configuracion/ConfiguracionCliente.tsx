"use client";

import { useState } from "react";

type MedicoData = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  especialidad: string | null;
  matricula_nacional: string;
  zonas_cobertura: string[];
  system_prompt: string | null;
};

type Props = { medico: MedicoData };

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
      <h2 className="font-semibold text-[#1E293B] mb-5 text-lg">{titulo}</h2>
      {children}
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", readOnly = false, placeholder,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; readOnly?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{label}</label>
      <input
        type={type} value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all ${
          readOnly ? "bg-[#F8FAFC] text-[#64748B] cursor-default" : ""
        }`}
      />
    </div>
  );
}

export default function ConfiguracionCliente({ medico }: Props) {
  // Perfil
  const [perfil, setPerfil] = useState({
    nombre: medico.nombre,
    apellido: medico.apellido,
    telefono: medico.telefono ?? "",
    especialidad: medico.especialidad ?? "",
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [perfilOk, setPerfilOk] = useState(false);
  const [perfilError, setPerfilError] = useState("");

  // Password
  const [pass, setPass] = useState({ actual: "", nuevo: "", confirmar: "" });
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [passOk, setPassOk] = useState(false);
  const [passError, setPassError] = useState("");

  // Zonas
  const [zonas, setZonas] = useState<string[]>(medico.zonas_cobertura);
  const [nuevaZona, setNuevaZona] = useState("");
  const [guardandoZonas, setGuardandoZonas] = useState(false);
  const [zonasOk, setZonasOk] = useState(false);

  // System prompt
  const [prompt, setPrompt] = useState(medico.system_prompt ?? "");
  const [guardandoPrompt, setGuardandoPrompt] = useState(false);
  const [promptOk, setPromptOk] = useState(false);

  async function guardarPerfil() {
    setGuardandoPerfil(true);
    setPerfilError("");
    setPerfilOk(false);
    try {
      const res = await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error");
      }
      setPerfilOk(true);
      setTimeout(() => setPerfilOk(false), 3000);
    } catch (e) {
      setPerfilError((e as Error).message);
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function cambiarPassword() {
    setPassError("");
    setPassOk(false);
    if (pass.nuevo !== pass.confirmar) {
      setPassError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (pass.nuevo.length < 6) {
      setPassError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setGuardandoPass(true);
    try {
      const res = await fetch("/api/medico/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual: pass.actual, passwordNuevo: pass.nuevo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      setPassOk(true);
      setPass({ actual: "", nuevo: "", confirmar: "" });
      setTimeout(() => setPassOk(false), 3000);
    } catch (e) {
      setPassError((e as Error).message);
    } finally {
      setGuardandoPass(false);
    }
  }

  async function guardarZonas() {
    setGuardandoZonas(true);
    setZonasOk(false);
    try {
      await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, zonas_cobertura: zonas }),
      });
      setZonasOk(true);
      setTimeout(() => setZonasOk(false), 3000);
    } finally {
      setGuardandoZonas(false);
    }
  }

  async function guardarPrompt() {
    setGuardandoPrompt(true);
    setPromptOk(false);
    try {
      await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, system_prompt: prompt }),
      });
      setPromptOk(true);
      setTimeout(() => setPromptOk(false), 3000);
    } finally {
      setGuardandoPrompt(false);
    }
  }

  function agregarZona() {
    const z = nuevaZona.trim();
    if (z && !zonas.includes(z)) {
      setZonas([...zonas, z]);
      setNuevaZona("");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Perfil */}
      <Seccion titulo="Perfil del médico">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="Nombre" value={perfil.nombre}
            onChange={(v) => setPerfil((p) => ({ ...p, nombre: v }))} />
          <Input label="Apellido" value={perfil.apellido}
            onChange={(v) => setPerfil((p) => ({ ...p, apellido: v }))} />
          <Input label="Email" value={medico.email} readOnly />
          <Input label="Teléfono" value={perfil.telefono}
            onChange={(v) => setPerfil((p) => ({ ...p, telefono: v }))}
            placeholder="+54 9 11 0000-0000" />
          <Input label="Especialidad" value={perfil.especialidad}
            onChange={(v) => setPerfil((p) => ({ ...p, especialidad: v }))}
            placeholder="Clínica médica" />
          <Input label="Matrícula" value={medico.matricula_nacional} readOnly />
        </div>
        {perfilError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {perfilError}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={guardarPerfil} disabled={guardandoPerfil}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {guardandoPerfil ? "Guardando..." : "Guardar perfil"}
          </button>
          {perfilOk && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardado
            </span>
          )}
        </div>
      </Seccion>

      {/* Cambiar contraseña */}
      <Seccion titulo="Cambiar contraseña">
        <div className="space-y-4 mb-4">
          <Input label="Contraseña actual" type="password" value={pass.actual}
            onChange={(v) => setPass((p) => ({ ...p, actual: v }))} placeholder="••••••••" />
          <Input label="Nueva contraseña" type="password" value={pass.nuevo}
            onChange={(v) => setPass((p) => ({ ...p, nuevo: v }))} placeholder="••••••••" />
          <Input label="Confirmar nueva contraseña" type="password" value={pass.confirmar}
            onChange={(v) => setPass((p) => ({ ...p, confirmar: v }))} placeholder="••••••••" />
        </div>
        {passError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {passError}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={cambiarPassword} disabled={guardandoPass || !pass.actual || !pass.nuevo}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {guardandoPass ? "Cambiando..." : "Cambiar contraseña"}
          </button>
          {passOk && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Contraseña actualizada
            </span>
          )}
        </div>
      </Seccion>

      {/* Zonas de cobertura */}
      <Seccion titulo="Zonas de cobertura">
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
          {zonas.length === 0 ? (
            <p className="text-sm text-[#64748B]">Sin zonas configuradas</p>
          ) : (
            zonas.map((z) => (
              <span
                key={z}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-sm rounded-full"
              >
                {z}
                <button
                  onClick={() => setZonas(zonas.filter((x) => x !== z))}
                  className="text-[#93C5FD] hover:text-[#EF4444] transition-colors"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={nuevaZona}
            onChange={(e) => setNuevaZona(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregarZona()}
            placeholder="Ej: Palermo, Villa Crespo..."
            className="flex-1 px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          <button
            onClick={agregarZona}
            className="px-4 py-2 border border-[#2563EB] text-[#2563EB] rounded-lg text-sm font-medium hover:bg-[#EFF6FF] transition-colors"
          >
            Agregar
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={guardarZonas} disabled={guardandoZonas}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {guardandoZonas ? "Guardando..." : "Guardar zonas"}
          </button>
          {zonasOk && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardado
            </span>
          )}
        </div>
      </Seccion>

      {/* System prompt */}
      <Seccion titulo="Prompt del agente IA">
        <p className="text-sm text-[#64748B] mb-3">
          Personalizá el comportamiento del agente de IA que entrevista a tus pacientes.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={10}
          placeholder="Escribí las instrucciones del agente..."
          className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-y mb-4 font-mono"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={guardarPrompt} disabled={guardandoPrompt}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {guardandoPrompt ? "Guardando..." : "Guardar prompt"}
          </button>
          {promptOk && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardado
            </span>
          )}
        </div>
      </Seccion>
    </div>
  );
}
