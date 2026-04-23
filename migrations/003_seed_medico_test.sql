-- ============================================================================
-- Seed 003: Datos de test del médico Theo Mazza
-- ============================================================================
-- Carga la configuración inicial del médico para poder probar el flujo de
-- agendamiento en Fase 1.
--
-- Incluye:
-- 1. Actualización del perfil del médico (slug, teléfono y dirección del
--    consultorio).
-- 2. Horarios de atención (lunes a viernes, 9-13 y 14-18, turnos de 30 min).
-- ============================================================================


-- 1) Actualizar datos del médico Theo Mazza
UPDATE medicos
SET
  slug                  = 'drtheomazza',
  telefono_consultorio  = '+5491138722251',
  direccion_consultorio = 'Av. Libertador 278, Piso 4C'
WHERE id = '2929611c-fd29-4b9f-a291-eafaf7959c64';


-- 2) Cargar horarios de atención
-- Lunes a viernes (dia_semana 1 a 5), dos bloques por día:
--   - Mañana: 09:00 a 13:00
--   - Tarde:  14:00 a 18:00
-- Duración de turno: 30 minutos.

INSERT INTO horarios_medicos (medico_id, dia_semana, hora_inicio, hora_fin, duracion_turno_min) VALUES
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 1, '09:00', '13:00', 30),  -- Lunes mañana
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 1, '14:00', '18:00', 30),  -- Lunes tarde
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 2, '09:00', '13:00', 30),  -- Martes mañana
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 2, '14:00', '18:00', 30),  -- Martes tarde
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 3, '09:00', '13:00', 30),  -- Miércoles mañana
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 3, '14:00', '18:00', 30),  -- Miércoles tarde
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 4, '09:00', '13:00', 30),  -- Jueves mañana
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 4, '14:00', '18:00', 30),  -- Jueves tarde
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 5, '09:00', '13:00', 30),  -- Viernes mañana
  ('2929611c-fd29-4b9f-a291-eafaf7959c64', 5, '14:00', '18:00', 30);  -- Viernes tarde