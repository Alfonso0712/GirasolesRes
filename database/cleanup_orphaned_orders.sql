-- Script de Limpieza y Saneamiento Operativo: Anulación de Pedidos Huérfanos de Pruebas Anteriores
-- Restaurante Girasoles - Base de Datos PostgreSQL

BEGIN;

-- 1. Anular pedidos de fechas anteriores que quedaron en estado no terminal
UPDATE pedidos
SET ped_estado = 'Anulado',
    ped_motivo_anulacion = 'Saneamiento administrativo: Pedido huérfano de prueba de fecha anterior',
    fec_actualizacion_utc = NOW()
WHERE ped_fecha_operativa < CURRENT_DATE
  AND ped_estado NOT IN ('Pagado', 'Anulado');

-- 2. Cancelar comandas activas asociadas a los pedidos de fechas anteriores
UPDATE comandas
SET cmd_estado = 'Cancelada'
WHERE id_pedido IN (
    SELECT id_pedido 
    FROM pedidos 
    WHERE ped_fecha_operativa < CURRENT_DATE 
      AND ped_estado = 'Anulado'
)
AND cmd_estado != 'Cancelada';

-- 3. Liberar mesas que estaban retenidas exclusivamente por pedidos de fechas anteriores
UPDATE mesas
SET est_ocupacion = 'Libre',
    fec_actualizacion_utc = NOW()
WHERE id_mesa IN (
    SELECT DISTINCT id_mesa 
    FROM pedidos 
    WHERE ped_fecha_operativa < CURRENT_DATE
      AND id_mesa IS NOT NULL
)
AND id_mesa NOT IN (
    SELECT DISTINCT id_mesa 
    FROM pedidos 
    WHERE ped_estado NOT IN ('Pagado', 'Anulado') 
      AND id_mesa IS NOT NULL
);

COMMIT;
