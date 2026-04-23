-- ============================================================================
-- Migración 001: Preparar tabla medicos + Crear tabla horarios_medicos
-- ============================================================================
-- Objetivo:
-- 1. Agregar a la tabla medicos los campos que necesita el nuevo flujo:
--    - Tokens de Mercado Pago (para cobros)
--    - Teléfono y dirección del consultorio (para los mensajes al paciente)
--    - Slug (para el link de WhatsApp único por médico)
-- 2. Crear tabla horarios_medicos (disponibilidad base de cada médico)
-- ============================================================================


-- 1) Agregar columnas nuevas a la tabla medicos
ALTER TABLE medicos
  ADD COLUMN mp_access_token      text,
  ADD COLUMN mp_refresh_token     text,
  ADD COLUMN mp_user_id           varchar(50),
  ADD COLUMN telefono_consultorio varchar(30),
  ADD COLUMN direccion_consultorio text,
  ADD COLUMN slug                 varchar(50);


-- 2) Garantizar que slug sea único entre médicos (dos médicos no pueden
--    tener el mismo slug porque es lo que identifica al médico en el link).
CREATE UNIQUE INDEX idx_medicos_slug ON medicos(slug);


-- 3) Crear tabla horarios_medicos
--    Guarda la configuración horaria de cada médico: en qué día de la semana
--    atiende, desde qué hora hasta qué hora, y cuánto dura cada turno.
--    Un médico puede tener varias filas (ej. lunes 9-13 y lunes 16-20 = 2 filas).
CREATE TABLE horarios_medicos (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico_id         uuid NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  dia_semana        smallint NOT NULL,  -- 0=domingo, 1=lunes, ..., 6=sábado
  hora_inicio       time NOT NULL,      -- ej. '09:00'
  hora_fin          time NOT NULL,      -- ej. '13:00'
  duracion_turno_min integer NOT NULL DEFAULT 30,
  activo            boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  
  -- Asegura que hora_fin sea posterior a hora_inicio
  CONSTRAINT check_horario_valido CHECK (hora_fin > hora_inicio),
  
  -- Asegura que el día de la semana sea válido (0 a 6)
  CONSTRAINT check_dia_valido CHECK (dia_semana BETWEEN 0 AND 6)
);


-- 4) Índice para búsqueda rápida por médico (se va a usar en cada cálculo
--    de disponibilidad)
CREATE INDEX idx_horarios_medicos_medico ON horarios_medicos(medico_id) WHERE activo = true;