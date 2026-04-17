"use client";

import { useState } from "react";
import { Check, X, MapPin, Bot } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

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

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-[var(--radius-lg)] shadow-xs border border-border p-5 md:p-6">
      <h2 className="font-semibold text-text-primary text-[15px] mb-1">
        {titulo}
      </h2>
      {descripcion && (
        <p className="text-xs text-text-muted mb-5">{descripcion}</p>
      )}
      {!descripcion && <div className="mb-5" />}
      {children}
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
  const [perfilError, setPerfilError] = useState("");

  // Password
  const [pass, setPass] = useState({ actual: "", nuevo: "", confirmar: "" });
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [passError, setPassError] = useState("");

  // Zonas
  const [zonas, setZonas] = useState<string[]>(medico.zonas_cobertura);
  const [nuevaZona, setNuevaZona] = useState("");
  const [guardandoZonas, setGuardandoZonas] = useState(false);

  // System prompt
  const [prompt, setPrompt] = useState(medico.system_prompt ?? "");
  const [guardandoPrompt, setGuardandoPrompt] = useState(false);

  async function guardarPerfil() {
    setGuardandoPerfil(true);
    setPerfilError("");
    try {
      const res = await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }
      toast.success("Perfil actualizado");
    } catch (e) {
      setPerfilError((e as Error).message);
      toast.error("Error al guardar perfil");
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function cambiarPassword() {
    setPassError("");
    if (pass.nuevo !== pass.confirmar) {
      setPassError("Las contrasenas nuevas no coinciden");
      return;
    }
    if (pass.nuevo.length < 6) {
      setPassError("La contrasena debe tener al menos 6 caracteres");
      return;
    }
    setGuardandoPass(true);
    try {
      const res = await fetch("/api/medico/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordActual: pass.actual,
          passwordNuevo: pass.nuevo,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      toast.success("Contrasena actualizada");
      setPass({ actual: "", nuevo: "", confirmar: "" });
    } catch (e) {
      setPassError((e as Error).message);
      toast.error("Error al cambiar contrasena");
    } finally {
      setGuardandoPass(false);
    }
  }

  async function guardarZonas() {
    setGuardandoZonas(true);
    try {
      await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, zonas_cobertura: zonas }),
      });
      toast.success("Zonas actualizadas");
    } catch {
      toast.error("Error al guardar zonas");
    } finally {
      setGuardandoZonas(false);
    }
  }

  async function guardarPrompt() {
    setGuardandoPrompt(true);
    try {
      await fetch("/api/medico/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, system_prompt: prompt }),
      });
      toast.success("Prompt actualizado");
    } catch {
      toast.error("Error al guardar prompt");
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
    <div className="space-y-5 max-w-3xl">
      {/* Perfil */}
      <Seccion titulo="Perfil del medico" descripcion="Datos de tu cuenta profesional">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Input
            label="Nombre"
            value={perfil.nombre}
            onChange={(e) =>
              setPerfil((p) => ({ ...p, nombre: e.target.value }))
            }
          />
          <Input
            label="Apellido"
            value={perfil.apellido}
            onChange={(e) =>
              setPerfil((p) => ({ ...p, apellido: e.target.value }))
            }
          />
          <Input label="Email" value={medico.email} readOnly disabled />
          <Input
            label="Telefono"
            value={perfil.telefono}
            onChange={(e) =>
              setPerfil((p) => ({ ...p, telefono: e.target.value }))
            }
            placeholder="+54 9 11 0000-0000"
          />
          <Input
            label="Especialidad"
            value={perfil.especialidad}
            onChange={(e) =>
              setPerfil((p) => ({ ...p, especialidad: e.target.value }))
            }
            placeholder="Clinica medica"
          />
          <Input
            label="Matricula"
            value={medico.matricula_nacional}
            readOnly
            disabled
          />
        </div>
        {perfilError && (
          <p className="text-xs text-danger-600 bg-danger-50 border border-danger-500/20 rounded-[var(--radius-sm)] px-3 py-2 mb-4">
            {perfilError}
          </p>
        )}
        <Button onClick={guardarPerfil} loading={guardandoPerfil}>
          Guardar perfil
        </Button>
      </Seccion>

      {/* Cambiar contrasena */}
      <Seccion
        titulo="Cambiar contrasena"
        descripcion="Actualiza tu contrasena de acceso"
      >
        <div className="space-y-4 mb-5">
          <Input
            label="Contrasena actual"
            type="password"
            value={pass.actual}
            onChange={(e) =>
              setPass((p) => ({ ...p, actual: e.target.value }))
            }
            placeholder="........"
          />
          <Input
            label="Nueva contrasena"
            type="password"
            value={pass.nuevo}
            onChange={(e) =>
              setPass((p) => ({ ...p, nuevo: e.target.value }))
            }
            placeholder="........"
          />
          <Input
            label="Confirmar nueva contrasena"
            type="password"
            value={pass.confirmar}
            onChange={(e) =>
              setPass((p) => ({ ...p, confirmar: e.target.value }))
            }
            placeholder="........"
          />
        </div>
        {passError && (
          <p className="text-xs text-danger-600 bg-danger-50 border border-danger-500/20 rounded-[var(--radius-sm)] px-3 py-2 mb-4">
            {passError}
          </p>
        )}
        <Button
          onClick={cambiarPassword}
          loading={guardandoPass}
          disabled={!pass.actual || !pass.nuevo}
        >
          Cambiar contrasena
        </Button>
      </Seccion>

      {/* Zonas de cobertura */}
      <Seccion
        titulo="Zonas de cobertura"
        descripcion="Areas donde realizas atencion domiciliaria"
      >
        <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
          {zonas.length === 0 ? (
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Sin zonas configuradas
            </p>
          ) : (
            zonas.map((z) => (
              <span
                key={z}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-[var(--radius-full)] border border-primary-500/20"
              >
                {z}
                <button
                  onClick={() => setZonas(zonas.filter((x) => x !== z))}
                  className="text-primary-500/50 hover:text-danger-500 transition-colors"
                  aria-label={`Quitar ${z}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2 mb-5">
          <div className="flex-1">
            <Input
              value={nuevaZona}
              onChange={(e) => setNuevaZona(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarZona()}
              placeholder="Ej: Palermo, Villa Crespo..."
            />
          </div>
          <Button variant="secondary" onClick={agregarZona}>
            Agregar
          </Button>
        </div>
        <Button onClick={guardarZonas} loading={guardandoZonas}>
          Guardar zonas
        </Button>
      </Seccion>

      {/* System prompt */}
      <Seccion
        titulo="Prompt del agente IA"
        descripcion="Personaliza el comportamiento del agente que entrevista a tus pacientes"
      >
        <div className="flex items-center gap-2 mb-3 text-text-muted">
          <Bot className="w-4 h-4" />
          <span className="text-xs">
            Instrucciones personalizadas para la entrevista clinica
          </span>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={10}
          placeholder="Escribi las instrucciones del agente..."
          className="mb-5 font-mono text-xs"
        />
        <Button onClick={guardarPrompt} loading={guardandoPrompt}>
          Guardar prompt
        </Button>
      </Seccion>
    </div>
  );
}
