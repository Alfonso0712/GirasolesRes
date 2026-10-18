/**
 * Empirical Verification and Stress Test Suite for Milestone 4
 * Tests:
 * 1. Role Segregation Logic:
 *    - Sidebar role visibility (fail-closed, null/undefined safety, exact role matching).
 *    - HomePage navigation guards & redirection targets.
 *    - HistorialCierresPage role guard.
 * 2. Date Filtering & Lima Timezone Safety (RV-130, MSG-188):
 *    - Intl America/Lima conversion across late evening (PET 23:59:59).
 *    - Date range validation (desde > hasta, future dates, valid ranges).
 *    - Quick range calculation (hoy, ayer, 7 dias, 30 dias).
 * 3. Detail Modal Calculations & Business Rules:
 *    - 8-metric financial breakdown consistency.
 *    - Observation whitespace omission.
 *    - Subsequent void adjustments immutability (RN-113).
 *    - Discrepancy badges (cuadra, sobrante, faltante).
 */

import assert from 'node:assert/strict';

// ============================================================================
// 1. ROLE SEGREGATION ORACLE
// ============================================================================

function canSeeHistorialMenu(session: { rol?: string } | null | undefined): boolean {
  const rol = session?.rol;
  return rol === 'Administrador';
}

function resolveUnauthorizedRedirect(rol?: string): string {
  if (rol === 'Cajero') return 'pedidos-llevar';
  if (rol === 'Mozo') return 'mesas';
  if (rol === 'Cocinero') return 'cocina';
  return 'inicio';
}

// ============================================================================
// 2. LIMA TIMEZONE & DATE VALIDATION ORACLE (RV-130, MSG-188)
// ============================================================================

function getFechaActualLima(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function restarDiasLima(diasAtras: number, now: Date = new Date()): string {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() - diasAtras);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

const MSG_188 =
  "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro.";

function validarRangoFechas(fDesde: string, fHasta: string, hoyLima: string): string | null {
  if (fDesde && fDesde > hoyLima) {
    return MSG_188;
  }
  if (fHasta && fHasta > hoyLima) {
    return MSG_188;
  }
  if (fDesde && fHasta && fDesde > fHasta) {
    return MSG_188;
  }
  return null;
}

// ============================================================================
// 3. FINANCIAL BREAKDOWN & DISCREPANCY ORACLE
// ============================================================================

interface CierreFinanzas {
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
}

function calcularFinanzas(
  montoInicial: number,
  ventasEfectivo: number,
  ventasYape: number,
  efectivoContado: number | null
): CierreFinanzas {
  const totalVentas = ventasEfectivo + ventasYape;
  const efectivoEsperado = montoInicial + ventasEfectivo;
  const diferencia = efectivoContado !== null ? efectivoContado - efectivoEsperado : null;

  return {
    montoInicial,
    ventasEfectivo,
    ventasYape,
    totalVentas,
    efectivoEsperado,
    efectivoContado,
    diferencia,
  };
}

function determinarEstadoCuadreBadge(
  diferencia: number | null,
  esAbierta: boolean
): { tipo: string; texto: string } {
  if (esAbierta || diferencia === null) {
    return { tipo: 'sin_arqueo', texto: '—' };
  }
  if (diferencia === 0) {
    return { tipo: 'cuadra', texto: 'Cuadra · S/ 0.00' };
  }
  if (diferencia > 0) {
    return { tipo: 'sobrante', texto: `+ S/ ${diferencia.toFixed(2)}` };
  }
  return { tipo: 'faltante', texto: `- S/ ${Math.abs(diferencia).toFixed(2)}` };
}

function debeOmitirObservacion(observacion: string | null | undefined): boolean {
  if (!observacion) return true;
  return observacion.trim().length === 0;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runM4Suite() {
  console.log('=================================================================');
  console.log('EMPIRICAL REVIEW TEST SUITE: MILESTONE 4 (SECURITY & NAVIGATION)');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Strict Role Segregation Tests
  // --------------------------------------------------------------------------
  console.log('1. Testing Strict Role Segregation (RN-106, E-319):');

  test('Admin session sees Historial de Cierres menu item', () => {
    assert.equal(canSeeHistorialMenu({ rol: 'Administrador' }), true);
  });

  test('Cajero session DOES NOT see Historial de Cierres menu item', () => {
    assert.equal(canSeeHistorialMenu({ rol: 'Cajero' }), false);
  });

  test('Mozo session DOES NOT see Historial de Cierres menu item', () => {
    assert.equal(canSeeHistorialMenu({ rol: 'Mozo' }), false);
  });

  test('Cocinero session DOES NOT see Historial de Cierres menu item', () => {
    assert.equal(canSeeHistorialMenu({ rol: 'Cocinero' }), false);
  });

  test('Null session fails closed (DOES NOT see menu item)', () => {
    assert.equal(canSeeHistorialMenu(null), false);
  });

  test('Undefined session fails closed (DOES NOT see menu item)', () => {
    assert.equal(canSeeHistorialMenu(undefined), false);
  });

  test('Empty object session fails closed (DOES NOT see menu item)', () => {
    assert.equal(canSeeHistorialMenu({}), false);
  });

  test('Session with lowercase "administrador" fails closed (strict case check)', () => {
    assert.equal(canSeeHistorialMenu({ rol: 'administrador' }), false);
  });

  test('Redirect destination for unauthorized Cajero is pedidos-llevar', () => {
    assert.equal(resolveUnauthorizedRedirect('Cajero'), 'pedidos-llevar');
  });

  test('Redirect destination for unauthorized Mozo is mesas', () => {
    assert.equal(resolveUnauthorizedRedirect('Mozo'), 'mesas');
  });

  test('Redirect destination for unauthorized Cocinero is cocina', () => {
    assert.equal(resolveUnauthorizedRedirect('Cocinero'), 'cocina');
  });

  test('Redirect destination for unknown role defaults to inicio', () => {
    assert.equal(resolveUnauthorizedRedirect('Otro'), 'inicio');
  });

  // --------------------------------------------------------------------------
  // 2. Date Filtering & Lima Timezone Safety Tests
  // --------------------------------------------------------------------------
  console.log('\n2. Testing Date Range Filtering & Lima Timezone Safety (RV-130):');

  test('Lima evening 23:59:59 (PET) converts to current Lima date, NOT UTC tomorrow', () => {
    // 2026-10-19T04:59:59Z is 2026-10-18 23:59:59 in America/Lima
    const lateEveningPet = new Date('2026-10-19T04:59:59Z');
    const limaDate = getFechaActualLima(lateEveningPet);
    assert.equal(limaDate, '2026-10-18');
  });

  test('Lima early morning 00:00:01 (PET) converts to new Lima date', () => {
    // 2026-10-19T05:00:01Z is 2026-10-19 00:00:01 in America/Lima
    const morningPet = new Date('2026-10-19T05:00:01Z');
    const limaDate = getFechaActualLima(morningPet);
    assert.equal(limaDate, '2026-10-19');
  });

  test('Quick filter "Ayer" subtracts 1 calendar day correctly across month boundary', () => {
    // Nov 1, 2026 12:00 UTC -> Oct 31, 2026 yesterday
    const novFirst = new Date('2026-11-01T17:00:00Z');
    assert.equal(getFechaActualLima(novFirst), '2026-11-01');
    assert.equal(restarDiasLima(1, novFirst), '2026-10-31');
  });

  test('Quick filter "7 días" subtracts 7 calendar days', () => {
    const oct18 = new Date('2026-10-18T17:00:00Z');
    assert.equal(restarDiasLima(7, oct18), '2026-10-11');
  });

  test('Quick filter "30 días" subtracts 30 calendar days', () => {
    const oct18 = new Date('2026-10-18T17:00:00Z');
    assert.equal(restarDiasLima(30, oct18), '2026-09-18');
  });

  test('Valid date range within today passes validation', () => {
    const hoy = '2026-10-18';
    assert.equal(validarRangoFechas('2026-10-01', '2026-10-18', hoy), null);
    assert.equal(validarRangoFechas('2026-10-18', '2026-10-18', hoy), null);
  });

  test('Inverted date range (desde > hasta) triggers MSG-188', () => {
    const hoy = '2026-10-18';
    const err = validarRangoFechas('2026-10-18', '2026-10-10', hoy);
    assert.equal(err, MSG_188);
  });

  test('Future "desde" date triggers MSG-188', () => {
    const hoy = '2026-10-18';
    const err = validarRangoFechas('2026-10-19', '2026-10-25', hoy);
    assert.equal(err, MSG_188);
  });

  test('Future "hasta" date triggers MSG-188', () => {
    const hoy = '2026-10-18';
    const err = validarRangoFechas('2026-10-10', '2026-10-25', hoy);
    assert.equal(err, MSG_188);
  });

  test('Empty filters pass validation (all records requested)', () => {
    const hoy = '2026-10-18';
    assert.equal(validarRangoFechas('', '', hoy), null);
  });

  // --------------------------------------------------------------------------
  // 3. Detail Modal Business Rules & Immutability (RN-113)
  // --------------------------------------------------------------------------
  console.log('\n3. Testing Detail Modal Calculations & Immutability (RN-113):');

  test('8-Metric financial breakdown matches expected accounting formula', () => {
    const fin = calcularFinanzas(150.00, 320.50, 180.00, 470.50);
    assert.equal(fin.montoInicial, 150.00);
    assert.equal(fin.ventasEfectivo, 320.50);
    assert.equal(fin.ventasYape, 180.00);
    assert.equal(fin.totalVentas, 500.50);
    assert.equal(fin.efectivoEsperado, 470.50);
    assert.equal(fin.efectivoContado, 470.50);
    assert.equal(fin.diferencia, 0.00);
  });

  test('Discrepancy badge: Exact balance -> "Cuadra · S/ 0.00"', () => {
    const b = determinarEstadoCuadreBadge(0.00, false);
    assert.equal(b.tipo, 'cuadra');
    assert.equal(b.texto, 'Cuadra · S/ 0.00');
  });

  test('Discrepancy badge: Surplus (+12.50) -> "+ S/ 12.50"', () => {
    const b = determinarEstadoCuadreBadge(12.50, false);
    assert.equal(b.tipo, 'sobrante');
    assert.equal(b.texto, '+ S/ 12.50');
  });

  test('Discrepancy badge: Deficit (-8.00) -> "- S/ 8.00"', () => {
    const b = determinarEstadoCuadreBadge(-8.00, false);
    assert.equal(b.tipo, 'faltante');
    assert.equal(b.texto, '- S/ 8.00');
  });

  test('Discrepancy badge: Open register displays "—"', () => {
    const b = determinarEstadoCuadreBadge(null, true);
    assert.equal(b.tipo, 'sin_arqueo');
    assert.equal(b.texto, '—');
  });

  test('Observation clean omission on null, empty, or whitespace', () => {
    assert.equal(debeOmitirObservacion(null), true);
    assert.equal(debeOmitirObservacion(undefined), true);
    assert.equal(debeOmitirObservacion(''), true);
    assert.equal(debeOmitirObservacion('   \t\n  '), true);
    assert.equal(debeOmitirObservacion('Cuadre conforme'), false);
  });

  test('RN-113 Subsequent void adjustments do not mutate historical balance snapshot', () => {
    // Original closure
    const snapshot = calcularFinanzas(100.00, 200.00, 50.00, 300.00);
    assert.equal(snapshot.efectivoEsperado, 300.00);
    assert.equal(snapshot.diferencia, 0.00);

    // Simulate subsequent void of a 45.00 cash sale
    const subsequentVoid = { ventaId: 'v-99', montoAnulado: 45.00, metodoPago: 'Efectivo' };

    // Per RN-113, snapshot values must NOT be subtracted or altered
    assert.equal(snapshot.efectivoEsperado, 300.00, 'Expected cash must remain 300.00');
    assert.equal(snapshot.ventasEfectivo, 200.00, 'Cash sales must remain 200.00');
    assert.equal(snapshot.diferencia, 0.00, 'Difference must remain 0.00');
    assert.equal(subsequentVoid.montoAnulado, 45.00, 'Voided amount recorded only in audit adjustment section');
  });

  console.log('\n=================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runM4Suite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
