-- ============================================================================
-- Migración 002: Ampliar tabla consultas + Crear tabla holds
-- ============================================================================
-- Objetivo:
-- 1. Agregar a la tabla consultas los campos necesarios para representar
--    un turno agendado y pago con Mercado Pago u obra social.
-- 2. Crear tabla holds: registros temporales (20 min) que reservan un slot
--    mientras el paciente completa datos y paga. Si el pago se confirma,
--    el hold se "promueve" a una fila en consultas.
-- ============================================================================


-- 1) Agregar columnas nuevas a la tabla consultas
ALTER TABLE consultas
  ADD COLUMN fecha_hora_turno      timestamptz,
  ADD COLUMN duracion_min          integer DEFAULT 30,
  ADD COLUMN modalidad_cobro       varchar(20),   -- 'privada' | 'os' | 'os_copago'
  ADD COLUMN monto_centavos        integer,
  ADD COLUMN payment_id_mp         varchar(50),
  ADD COLUMN external_reference_mp varchar(100),
  ADD COLUMN token_os              varchar(100),
  ADD COLUMN token_estado          varchar(20),   -- 'pendiente' | 'validado' | 'rechazado'
  ADD COLUMN hold_id               uuid;


-- 2) Garantizar que external_reference_mp sea único (evita que dos turnos
--    compartan el mismo ID de referencia de Mercado Pago).
CREATE UNIQUE INDEX idx_consultas_external_ref 
  ON consultas(external_reference_mp) 
  WHERE external_reference_mp IS NOT NULL;


-- 3) Índice para ordenar turnos por fecha/hora dentro de cada médico.
--    Se usa en cada consulta de "agenda del día" o "agenda de la semana".
CREATE INDEX idx_consultas_fecha_hora 
  ON consultas(medico_id, fecha_hora_turno);


-- 4) Crear tabla holds
--    Representa una reserva temporal de un slot mientras el paciente completa
--    datos (5 min) y paga (15 min). Si vence, el slot se libera automáticamente.
--    Si el pago se confirma, se promueve a una fila en consultas.
CREATE TABLE holds (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico_id           uuid NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
  paciente_id         uuid REFERENCES pacientes(id) ON DELETE RESTRICT,  -- nullable
  whatsapp_from       varchar(30) NOT NULL,
  slot_datetime       timestamptz NOT NULL,
  modalidad           varchar(20) NOT NULL,   -- 'privada' | 'os' | 'os_copago'
  monto_centavos      integer,
  datos_json          jsonb NOT NULL DEFAULT '{}'::jsonb,
  external_reference  varchar(100) UNIQUE NOT NULL,
  expires_at          timestamptz NOT NULL,
  estado              varchar(20) NOT NULL DEFAULT 'activo',  -- 'activo' | 'confirmado' | 'vencido' | 'rechazado'
  created_at          timestamptz DEFAULT now()
);


-- 5) Índice para calcular disponibilidad rápido.
--    Parcial: solo índexa holds activos (los otros no afectan disponibilidad).
CREATE INDEX idx_holds_slot 
  ON holds(medico_id, slot_datetime) 
  WHERE estado = 'activo';


-- 6) Índice para el job que libera holds vencidos.
--    Parcial también: solo activos con expires_at pasado a ser relevante.
CREATE INDEX idx_holds_expires 
  ON holds(expires_at) 
  WHERE estado = 'activo';


-- 7) Índice para búsqueda rápida de pacientes por celular.
--    Se usa cuando un paciente vuelve a agendar: el bot busca por celular
--    para reconocer al paciente y evitar que retipee datos.
CREATE INDEX idx_pacientes_celular 
  ON pacientes(medico_id, celular);