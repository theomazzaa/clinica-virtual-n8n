-- ============================================================================
-- Migración 005: Seed horarios por slot (30 minutos)
-- ============================================================================
-- Fecha: 25 de abril de 2026
-- Aplicada en: clinica_virtual_dev (NO aplicada en producción todavía)
--
-- Cambios:
-- 1. Borra las franjas horarias genéricas de Theo (9-13 y 14-18).
-- 2. Inserta 80 slots individuales de 30 minutos (lunes a viernes).
--    Mañana: 09:00 a 12:30 (8 slots por día)
--    Tarde:  14:00 a 17:30 (8 slots por día)
--
-- Decisión: cada fila representa un turno reservable concreto.
-- Facilita la verificación de disponibilidad y la creación de holds.
-- ============================================================================

-- Paso 1: Borrar franjas genéricas de Theo
DELETE FROM horarios_medicos 
WHERE medico_id = '2929611c-fd29-4b9f-a291-eafaf7959c64'::uuid;

-- Paso 2: Insertar slots de 30 minutos
INSERT INTO horarios_medicos (id, medico_id, dia_semana, hora_inicio, hora_fin, duracion_turno_min, activo)
SELECT 
  gen_random_uuid(),
  '2929611c-fd29-4b9f-a291-eafaf7959c64'::uuid,
  dia,
  ('09:00'::time + (slot * interval '30 minutes')),
  ('09:00'::time + (slot * interval '30 minutes') + interval '30 minutes'),
  30,
  true
FROM 
  generate_series(1, 5) AS dia,
  generate_series(0, 7) AS slot
UNION ALL
SELECT 
  gen_random_uuid(),
  '2929611c-fd29-4b9f-a291-eafaf7959c64'::uuid,
  dia,
  ('14:00'::time + (slot * interval '30 minutes')),
  ('14:00'::time + (slot * interval '30 minutes') + interval '30 minutes'),
  30,
  true
FROM 
  generate_series(1, 5) AS dia,
  generate_series(0, 7) AS slot;