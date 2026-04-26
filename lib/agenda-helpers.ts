export const TZ_OFFSET_MINUTES = -180; // UTC-3, Argentina (sin DST)

const DIAS = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Devuelve los componentes de la fecha en TZ Argentina usando métodos UTC puros.
// Suma el offset (negativo) al timestamp para simular el reloj ART.
function artComponents(fecha: Date) {
  const artMs = fecha.getTime() + TZ_OFFSET_MINUTES * 60 * 1000;
  const d = new Date(artMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),    // 0-based
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    dayOfWeek: d.getUTCDay(), // 0=Dom, 1=Lun, ..., 6=Sab
  };
}

// Convierte ART medianoche (00:00:00.000) de un día dado a UTC.
// artMidnightMs - TZ_OFFSET_MINUTES invierte el ajuste del offset.
function artMidnightToUtc(year: number, month: number, day: number): Date {
  const artMs = Date.UTC(year, month, day, 0, 0, 0, 0);
  return new Date(artMs - TZ_OFFSET_MINUTES * 60 * 1000);
}

// Convierte ART fin de día (23:59:59.999) de un día dado a UTC.
function artEndOfDayToUtc(year: number, month: number, day: number): Date {
  const artMs = Date.UTC(year, month, day, 23, 59, 59, 999);
  return new Date(artMs - TZ_OFFSET_MINUTES * 60 * 1000);
}

export function inicioDelDiaArgentina(fecha: Date): Date {
  const { year, month, day } = artComponents(fecha);
  return artMidnightToUtc(year, month, day);
}

export function finDelDiaArgentina(fecha: Date): Date {
  const { year, month, day } = artComponents(fecha);
  return artEndOfDayToUtc(year, month, day);
}

export function inicioDeSemanaArgentina(fecha: Date): Date {
  const { year, month, day, dayOfWeek } = artComponents(fecha);
  // (dayOfWeek + 6) % 7: Lun→0, Mar→1, ..., Sab→5, Dom→6
  const daysBack = (dayOfWeek + 6) % 7;
  // Date.UTC normaliza días negativos automáticamente (ej. día 0 = último del mes anterior)
  const artMs = Date.UTC(year, month, day - daysBack, 0, 0, 0, 0);
  return new Date(artMs - TZ_OFFSET_MINUTES * 60 * 1000);
}

export function finDeSemanaArgentina(fecha: Date): Date {
  const { year, month, day, dayOfWeek } = artComponents(fecha);
  const daysBack = (dayOfWeek + 6) % 7;
  const artMs = Date.UTC(year, month, day - daysBack + 6, 23, 59, 59, 999);
  return new Date(artMs - TZ_OFFSET_MINUTES * 60 * 1000);
}

export function formatearFechaArgentina(fecha: Date): string {
  const { year, month, day } = artComponents(fecha);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

export function formatearHoraArgentina(fecha: Date): string {
  const { hours, minutes } = artComponents(fecha);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Devuelve "DD de mes" sin día de semana ni año. Ej: "28 de abril".
export function formatearDiaMes(fecha: Date): string {
  const { day, month } = artComponents(fecha);
  return `${day} de ${MESES[month]}`;
}

export function formatearDiaSemanaLargo(fecha: Date): string {
  const { day, month, dayOfWeek } = artComponents(fecha);
  return `${DIAS[dayOfWeek]} ${day} de ${MESES[month]}`;
}

// Parsea "YYYY-MM-DD" como ART mediodía (12:00 ART) para evitar TZ edge cases en bordes de día.
// Si el param es undefined o inválido, devuelve now().
// Inversa exacta de aFechaParam: aFechaParam(parsearFechaParam("2026-04-28")) === "2026-04-28"
export function parsearFechaParam(fechaParam: string | undefined): Date {
  if (!fechaParam || !/^\d{4}-\d{2}-\d{2}$/.test(fechaParam)) {
    return new Date();
  }
  const [y, m, d] = fechaParam.split("-").map(Number);
  // ART mediodía como punto de referencia del día
  const artNoonMs = Date.UTC(y, m - 1, d, 12, 0, 0, 0);
  const result = new Date(artNoonMs - TZ_OFFSET_MINUTES * 60 * 1000);
  return isNaN(result.getTime()) ? new Date() : result;
}

// Convierte un Date a "YYYY-MM-DD" en TZ Argentina.
// Inversa exacta de parsearFechaParam.
export function aFechaParam(fecha: Date): string {
  const { year, month, day } = artComponents(fecha);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
