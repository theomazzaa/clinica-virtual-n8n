import { Prisma } from "@prisma/client";

export type DatosJsonHold = {
  para_quien?: string;
  nombre?: string;
  dni?: string;
  fecha_nacimiento?: string;
  email?: string;
};

// Tipo derivado del schema real: hold con la relación pacientes incluida.
// El campo de relación se llama `pacientes` (plural) por la introspección de Prisma.
export type HoldConPaciente = Prisma.holdsGetPayload<{ include: { pacientes: true } }>;

export function parseDatosJson(value: unknown): DatosJsonHold {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  const obj = value as Record<string, unknown>;
  return {
    para_quien: typeof obj.para_quien === "string" ? obj.para_quien : undefined,
    nombre: typeof obj.nombre === "string" ? obj.nombre : undefined,
    dni: typeof obj.dni === "string" ? obj.dni : undefined,
    fecha_nacimiento:
      typeof obj.fecha_nacimiento === "string" ? obj.fecha_nacimiento : undefined,
    email: typeof obj.email === "string" ? obj.email : undefined,
  };
}

export function calcularEdad(
  fechaNacimiento: string | undefined | null
): number | null {
  if (!fechaNacimiento) return null;

  let fecha: Date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
    const [y, m, d] = fechaNacimiento.split("-").map(Number);
    fecha = new Date(y, m - 1, d);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNacimiento)) {
    const [d, m, y] = fechaNacimiento.split("/").map(Number);
    fecha = new Date(y, m - 1, d);
  } else {
    return null;
  }

  if (isNaN(fecha.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNac = fecha.getMonth();
  if (
    mesActual < mesNac ||
    (mesActual === mesNac && hoy.getDate() < fecha.getDate())
  ) {
    edad--;
  }

  return edad >= 0 ? edad : null;
}

export function extraerDatosPacienteDelHold(hold: HoldConPaciente): {
  nombre: string | null;
  dni: string | null;
  email: string | null;
  edad: number | null;
  celular: string | null;
} {
  const paciente = hold.pacientes;

  if (paciente) {
    // TODO: toISOString() convierte a UTC antes de formatear — en bordes de día
    // (ej. medianoche ART) el día puede correrse. Reemplazar por componentes UTC directos
    // cuando haya casos reales de edad incorrecta.
    const edadCalculada = paciente.fecha_nacimiento
      ? calcularEdad(paciente.fecha_nacimiento.toISOString().split("T")[0])
      : null;

    return {
      nombre:
        [paciente.nombre, paciente.apellido].filter(Boolean).join(" ") || null,
      dni: paciente.dni ?? null,
      email: paciente.email ?? null,
      // edad en tabla tiene prioridad; fallback a calcularEdad desde fecha_nacimiento
      edad: paciente.edad ?? edadCalculada,
      celular: paciente.celular ?? null,
    };
  }

  // Fallback: datos del paciente en el JSONB del hold (cuando paciente_id es null)
  const datos = parseDatosJson(hold.datos_json);
  return {
    nombre: datos.nombre ?? null,
    dni: datos.dni ?? null,
    email: datos.email ?? null,
    edad: calcularEdad(datos.fecha_nacimiento),
    celular: null, // datos_json no captura celular
  };
}
