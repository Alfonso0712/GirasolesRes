-- ==============================================================================
-- RESTAURANTE GIRASOLES
-- Script de Corrección de Codificación (Charset / Encoding UTF-8)
-- Propósito: Restaurar tildes y caracteres 'ñ' corrompidos por importaciones
--           en terminales de Windows sin codificación UTF-8.
-- ==============================================================================

SET client_encoding = 'UTF8';

BEGIN;

-- 1. Reparación de Productos en Carta y Componentes
UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'Caf?', 'Café')
WHERE nom_producto LIKE '%Caf?%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'T?', 'Té')
WHERE nom_producto LIKE '%T?%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'chicharr?n', 'chicharrón')
WHERE nom_producto LIKE '%chicharr?n%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'Chicharr?n', 'Chicharrón')
WHERE nom_producto LIKE '%Chicharr?n%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'arequipe?a', 'arequipeña')
WHERE nom_producto LIKE '%arequipe?a%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'huanca?na', 'huancaína')
WHERE nom_producto LIKE '%huanca?na%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'Aj?', 'Ají')
WHERE nom_producto LIKE '%Aj?%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'lime?o', 'limeño')
WHERE nom_producto LIKE '%lime?o%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'lime?a', 'limeña')
WHERE nom_producto LIKE '%lime?a%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'Tallar?n', 'Tallarín')
WHERE nom_producto LIKE '%Tallar?n%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'pl?tano', 'plátano')
WHERE nom_producto LIKE '%pl?tano%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'Porci?n', 'Porción')
WHERE nom_producto LIKE '%Porci?n%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'reci?n', 'recién')
WHERE nom_producto LIKE '%reci?n%';

UPDATE public.productos
SET nom_producto = REPLACE(nom_producto, 'diet?tico', 'dietético')
WHERE nom_producto LIKE '%diet?tico%';

-- 2. Reparación de Menús Completos
UPDATE public.menus_completos
SET nom_menu_completo = REPLACE(nom_menu_completo, 'Caf?', 'Café')
WHERE nom_menu_completo LIKE '%Caf?%';

UPDATE public.menus_completos
SET nom_menu_completo = REPLACE(nom_menu_completo, 'chicharr?n', 'chicharrón')
WHERE nom_menu_completo LIKE '%chicharr?n%';

UPDATE public.menus_completos
SET nom_menu_completo = REPLACE(nom_menu_completo, 'Chicharr?n', 'Chicharrón')
WHERE nom_menu_completo LIKE '%Chicharr?n%';

-- 3. Reparación de Detalles de Pedido si existen
UPDATE public.detalles_pedido
SET det_nombre = REPLACE(det_nombre, 'Caf?', 'Café')
WHERE det_nombre LIKE '%Caf?%';

UPDATE public.detalles_pedido
SET det_nombre = REPLACE(det_nombre, 'T?', 'Té')
WHERE det_nombre LIKE '%T?%';

UPDATE public.detalles_pedido
SET det_nombre = REPLACE(det_nombre, 'chicharr?n', 'chicharrón')
WHERE det_nombre LIKE '%chicharr?n%';

UPDATE public.detalles_pedido
SET det_nombre = REPLACE(det_nombre, 'arequipe?a', 'arequipeña')
WHERE det_nombre LIKE '%arequipe?a%';

UPDATE public.detalles_pedido
SET det_nombre = REPLACE(det_nombre, 'huanca?na', 'huancaína')
WHERE det_nombre LIKE '%huanca?na%';

COMMIT;
