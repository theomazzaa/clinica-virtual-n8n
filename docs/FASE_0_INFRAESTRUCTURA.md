# Fase 0 — Infraestructura y preparación de base de datos

**Fecha**: 23 de abril de 2026
**Estado**: Completada ✓

## Objetivo

Preparar un entorno de desarrollo completo, aislado del entorno productivo, y dejar la base de datos con las tablas necesarias para construir el flujo de agendamiento en las siguientes fases.

## Entornos

A partir de esta fase, el proyecto tiene dos entornos paralelos:

| Capa | Producción | Desarrollo |
|---|---|---|
| Base de datos | `clinica_virtual` | `clinica_virtual_dev` |
| App web | `n8n-medipanel.htkfef.easypanel.host` | `n8n-doc-agent-dev.htkfef.easypanel.host` |
| Workflows n8n | `DocAgent v3 pre consulta original` + `enviar pdf informe` | `DocAgent MVP consultorios` + `DocAgent MVP consultorio` |
| Rama Git | `main` | `dev` |
| Redis keys | sin prefijo | prefijo `dev:` |

La carpeta local del proyecto (`C:\Dev\clinica virtual n8n\clinica-virtual-webapp`) se movió fuera de OneDrive para evitar conflictos de sincronización con Git.

## Cambios aplicados a la base de datos `clinica_virtual_dev`

### Migración 001 — `medicos` y `horarios_medicos`

Archivo: `migrations/001_preparar_medicos_y_horarios.sql`

**Tabla `medicos` — columnas agregadas:**
- `mp_access_token` (text): token de acceso de Mercado Pago Connect
- `mp_refresh_token` (text): token de refresh de Mercado Pago
- `mp_user_id` (varchar 50): ID del usuario del médico en Mercado Pago
- `telefono_consultorio` (varchar 30): se usa en los mensajes al paciente
- `direccion_consultorio` (text): se usa en los mensajes al paciente
- `slug` (varchar 50): identificador único del médico para el link de WhatsApp

**Índice creado:**
- `idx_medicos_slug`: unique sobre `slug`

**Tabla nueva `horarios_medicos`:**

Configura la disponibilidad horaria de cada médico. Un médico puede tener múltiples filas (ej. mañana y tarde del mismo día = 2 filas).

Columnas: `id`, `medico_id`, `dia_semana` (0=dom a 6=sáb), `hora_inicio`, `hora_fin`, `duracion_turno_min`, `activo`, `created_at`, `updated_at`.

Constraints: `hora_fin > hora_inicio`, `dia_semana BETWEEN 0 AND 6`.

### Migración 002 — `consultas` y `holds`

Archivo: `migrations/002_ampliar_consultas_y_crear_holds.sql`

**Decisión estructural**: no se creó una tabla `turnos` nueva. En vez de eso, se amplió `consultas` con los campos de agendamiento y pago. Un turno y una consulta son el mismo registro en distintas fases del ciclo de vida.

**Tabla `consultas` — columnas agregadas:**
- `fecha_hora_turno` (timestamptz): cuándo es el turno agendado
- `duracion_min` (integer, default 30)
- `modalidad_cobro` (varchar 20): 'privada' | 'os' | 'os_copago'
- `monto_centavos` (integer): monto en centavos para evitar problemas de decimales
- `payment_id_mp` (varchar 50): ID del pago en Mercado Pago
- `external_reference_mp` (varchar 100): referencia única para asociar webhook MP al turno
- `token_os` (varchar 100): token de autorización de obra social
- `token_estado` (varchar 20): 'pendiente' | 'validado' | 'rechazado'
- `hold_id` (uuid): referencia al hold que originó el turno (trazabilidad)

**Índices creados:**
- `idx_consultas_external_ref`: unique parcial (solo donde no es null)
- `idx_consultas_fecha_hora`: sobre `(medico_id, fecha_hora_turno)`

**Tabla nueva `holds`:**

Registros temporales que reservan un slot mientras el paciente completa datos (5 min) y paga (15 min). Si vence, el slot se libera. Si se confirma el pago, el hold se "promueve" a una fila en `consultas`.

Columnas: `id`, `medico_id`, `paciente_id` (nullable), `whatsapp_from`, `slot_datetime`, `modalidad`, `monto_centavos`, `datos_json`, `external_reference` (unique), `expires_at`, `estado`, `created_at`.

Estados posibles: `activo`, `confirmado`, `vencido`, `rechazado`.

**Índices:**
- `idx_holds_slot`: parcial sobre `(medico_id, slot_datetime) WHERE estado = 'activo'`
- `idx_holds_expires`: parcial sobre `expires_at WHERE estado = 'activo'`
- `idx_pacientes_celular`: sobre `(medico_id, celular)` (para búsqueda rápida al identificar paciente recurrente)

### Seed 003 — Médico de test

Archivo: `migrations/003_seed_medico_test.sql`

Configura al médico `Theo Mazza` (UUID `2929611c-fd29-4b9f-a291-eafaf7959c64`) como médico de test para construcción y validación.

**Datos actualizados:**
- `slug`: `drtheomazza`
- `telefono_consultorio`: `+5491138722251`
- `direccion_consultorio`: `Av. Libertador 278, Piso 4C`

**Horarios cargados (10 filas en `horarios_medicos`):**
- Lunes a viernes (dia_semana 1-5)
- Dos bloques por día: 09:00-13:00 y 14:00-18:00
- Duración de turno: 30 minutos

## Decisiones de diseño tomadas

1. **`consultas` extendida, no tabla `turnos` nueva**: ahorra duplicación de campos y relaciones. Un solo ciclo de vida del turno/consulta.

2. **Hold con `paciente_id` nullable**: al crear el hold, si el paciente es nuevo, todavía no existe en `pacientes`. Queda null. Se promueve a paciente real solo cuando el pago se confirma, en la misma transacción.

3. **Identificación de paciente por celular, pero sin unique constraint**: para MVP se tolera el duplicado en casos borde (ej. mamá agenda con su celular, luego hijo agenda con el mismo). Se agrega índice no-unique.

4. **Monto en centavos (integer) en lugar de decimal**: evita problemas de redondeo estándar en finanzas.

5. **Estados terminales en hold archivados, no borrados**: permite debug y métricas (tasa de conversión hold → turno).

6. **Google Calendar fuera del MVP**: la disponibilidad se calcula solo con `horarios_medicos` - turnos existentes - holds activos. GCal se incorpora en fase post-piloto.

## Lo que NO se hizo en esta fase (postergado a fases siguientes)

- Tabla para configuración de cobro (modalidades activas, montos) — va en Fase 2
- Campos de `NEXTAUTH_URL` o configuración específica de deploy — ya resueltos al crear `doc_agent_dev`
- Commit de `.env` o secrets — mantenidos locales/en Easypanel
- Gitignore ajustado para `next-env.d.ts` y `tsconfig.tsbuildinfo` — pendiente en próxima sesión

## Próxima fase

**Fase 1 — Agendamiento básico por WhatsApp (sin pago)**. Construcción del workflow nuevo en n8n que permite a un paciente llegar desde un link, elegir día y horario, dejar sus datos, y que quede un `hold` activo en BD. Duración estimada: 2 sesiones.