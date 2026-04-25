-- ============================================================================
-- Migración 004: Arquitectura multi-médico
-- ============================================================================
-- Objetivo:
-- 1. Agregar columna telefono_whatsapp a la tabla medicos.
--    Es el número de WhatsApp asignado a cada médico en YCloud.
--    Sirve para identificar al médico cuando llega un mensaje al webhook.
-- 2. Eliminar al médico Blas Mazza (no se usa en testing del MVP).
-- 3. Seedear telefono_whatsapp del médico Theo (drtheomazza).
-- 4. Aplicar restricciones UNIQUE y NOT NULL una vez seedeado.
--
-- Decisión arquitectónica documentada en docs/ARQUITECTURA_MULTI_MEDICO.md
-- ============================================================================


-- 1) Agregar columna nullable inicialmente
--    (no podemos agregarla NOT NULL directo porque hay filas existentes
--     que no tienen valor todavía)
ALTER TABLE medicos
  ADD COLUMN telefono_whatsapp varchar(30);


-- 2) Eliminar al médico Blas Mazza
--    Verificación previa confirmó: 0 consultas, 0 pacientes, 0 horarios.
--    Borrado limpio sin riesgo de datos huérfanos.
DELETE FROM medicos
WHERE id = '1459563f-0667-4ee8-8d02-db74dd816742';


-- 3) Seedear telefono_whatsapp del médico Theo
UPDATE medicos
SET telefono_whatsapp = '+5491176102312'
WHERE id = '2929611c-fd29-4b9f-a291-eafaf7959c64';


-- 4) Ahora que todos los médicos tienen valor, aplicar restricciones
ALTER TABLE medicos
  ALTER COLUMN telefono_whatsapp SET NOT NULL;

ALTER TABLE medicos
  ADD CONSTRAINT medicos_telefono_whatsapp_unique UNIQUE (telefono_whatsapp);


-- 5) Crear índice para búsqueda rápida del médico por número
--    (este índice se va a usar en cada mensaje entrante)
CREATE INDEX idx_medicos_telefono_whatsapp 
  ON medicos(telefono_whatsapp);