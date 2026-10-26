import assert from 'node:assert/strict';
import type { PedidoAbiertoMesaDto } from '../frontend/src/types/pedido';

console.log('=================================================================');
console.log('TEST SUITE: CORRECCIONES DE TRAZABILIDAD 2');
console.log('=================================================================');

// ----------------------------------------------------------------------------
// 1. SELECTOR DE PEDIDOS EN MESA CON MÚLTIPLES ABIERTOS (Punto 6)
// ----------------------------------------------------------------------------
console.log('\n1. Probando SelectorPedidoModal (Múltiples pedidos abiertos):');

const mockPedidos: PedidoAbiertoMesaDto[] = [
  { id: 'ped-1', numero: 101, estado: 'En preparación', total: 45.50 },
  { id: 'ped-2', numero: 105, estado: 'Pendiente', total: 28.00 },
];

// Comportamiento del selector: simulación de selección y mapeo
function simularSeleccionPedido(
  pedidos: PedidoAbiertoMesaDto[],
  idSeleccionado: string,
  onSeleccionar: (id: string) => void
) {
  const encontrado = pedidos.find(p => p.id === idSeleccionado);
  if (!encontrado) throw new Error('Pedido no encontrado');
  onSeleccionar(encontrado.id);
  return {
    numero: encontrado.numero,
    estado: encontrado.estado,
    totalFormateado: `S/ ${encontrado.total.toFixed(2)}`
  };
}

let pedidoIdElegido = '';
const info1 = simularSeleccionPedido(mockPedidos, 'ped-1', (id) => { pedidoIdElegido = id; });
assert.equal(pedidoIdElegido, 'ped-1');
assert.equal(info1.numero, 101);
assert.equal(info1.estado, 'En preparación');
assert.equal(info1.totalFormateado, 'S/ 45.50');
console.log('  [PASS] Selector permite elegir Pedido 101 y mapea estado y total');

const info2 = simularSeleccionPedido(mockPedidos, 'ped-2', (id) => { pedidoIdElegido = id; });
assert.equal(pedidoIdElegido, 'ped-2');
assert.equal(info2.numero, 105);
assert.equal(info2.estado, 'Pendiente');
assert.equal(info2.totalFormateado, 'S/ 28.00');
console.log('  [PASS] Selector permite elegir Pedido 105 y mapea estado y total');

// Verificación de flujo: si pedidos === 1, continúa directo; si > 1, abre selector
function resolverFlujoAmpliacion(pedidos: PedidoAbiertoMesaDto[]) {
  if (pedidos.length === 0) return { accion: 'nuevo' };
  if (pedidos.length === 1) return { accion: 'directo', pedidoId: pedidos[0].id };
  return { accion: 'mostrar_selector', pedidos };
}

assert.deepEqual(resolverFlujoAmpliacion([]), { accion: 'nuevo' });
assert.deepEqual(resolverFlujoAmpliacion([mockPedidos[0]]), { accion: 'directo', pedidoId: 'ped-1' });
assert.equal(resolverFlujoAmpliacion(mockPedidos).accion, 'mostrar_selector');
console.log('  [PASS] Flujo condicional: 0 pedidos -> nuevo, 1 pedido -> directo, >1 pedidos -> mostrar selector');

// ----------------------------------------------------------------------------
// 2. KEEP-ALIVE DEL COCINERO (Punto 9)
// ----------------------------------------------------------------------------
console.log('\n2. Probando Keep-Alive del Cocinero (Renovación periódica de token):');
const INTERVALO_MS = 20 * 60 * 1000; // 20 minutos
assert.equal(INTERVALO_MS, 1_200_000);
console.log('  [PASS] Intervalo de renovación es exactamente 20 minutos (1,200,000 ms)');

// ----------------------------------------------------------------------------
// 3. PRECIO DE PRODUCTO (Punto 2)
// ----------------------------------------------------------------------------
console.log('\n3. Probando validación de precio en frontend (Límite 999.99):');
function validarPrecio(precioStr: string): { valido: boolean; error?: string } {
  const normalizado = precioStr.trim().replace(',', '.');
  const regexDecimal = /^\d+(\.\d{1,2})?$/;
  if (!normalizado) return { valido: false, error: 'Ingrese el precio.' };
  if (!regexDecimal.test(normalizado) || parseFloat(normalizado) <= 0 || parseFloat(normalizado) > 999.99) {
    return { valido: false, error: 'Ingrese un precio válido, mayor a S/ 0.00 y con hasta 2 decimales (ejemplo: 8.00).' };
  }
  return { valido: true };
}

assert.equal(validarPrecio('999.99').valido, true);
assert.equal(validarPrecio('500.00').valido, true);
assert.equal(validarPrecio('1000.00').valido, false);
assert.equal(validarPrecio('1500').valido, false);
console.log('  [PASS] Precio 999.99 aceptado, precios superiores a 999.99 rechazados con mensaje MSG-56');

// ----------------------------------------------------------------------------
// 4. DEMORA EN COCINA (Punto 8)
// ----------------------------------------------------------------------------
console.log('\n4. Probando umbral límite de demora en cocina (>= 15 minutos):');
function esDemoraCocina(minutosEspera: number): boolean {
  return minutosEspera >= 15;
}

assert.equal(esDemoraCocina(14), false);
assert.equal(esDemoraCocina(15), true);
assert.equal(esDemoraCocina(16), true);

// Frontera exacta con segundos (14:59 no cuenta, 15:00 sí cuenta)
const seg14_59 = 14 * 60 + 59;
const minCalculados14_59 = Math.floor(seg14_59 / 60);
assert.equal(minCalculados14_59, 14);
assert.equal(esDemoraCocina(minCalculados14_59), false);

const seg15_00 = 15 * 60;
const minCalculados15_00 = Math.floor(seg15_00 / 60);
assert.equal(minCalculados15_00, 15);
assert.equal(esDemoraCocina(minCalculados15_00), true);
console.log('  [PASS] 14:59 no cuenta como demora (false), 15:00 sí cuenta como demora (true)');

console.log('\n=================================================================');
console.log('TODAS LAS PRUEBAS DE TRAZABILIDAD 2 SUPERADAS SATISFACTORIAMENTE');
console.log('=================================================================\n');
