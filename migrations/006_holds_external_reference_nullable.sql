-- ============================================================================
-- Migración 006: external_reference nullable en holds
-- ============================================================================
-- Fecha: 25 de abril de 2026
-- Aplicada en: clinica_virtual_dev
--
-- external_reference es el ID que devuelve Mercado Pago al crear el link.
-- Lo tendremos disponible en Fase 2. Por ahora lo hacemos nullable.
-- ============================================================================

ALTER TABLE holds ALTER COLUMN external_reference DROP NOT NULL;