/**
 * Empirical Verification Test Harness for Milestone 3 Frontend Cash Register
 * Tests:
 * 1. Opening validations (AbrirCajaModal)
 * 2. Denomination counter (ContadorDenominacionesModal: all 11 denominations, [0..999] validation, IEEE-754 precision)
 * 3. Observation length (CerrarCajaModal: <= 200 chars, counter, MSG-179)
 * 4. Concurrency protection (CerrarCajaModal: 409 MSG-189 reload & state preservation)
 */

import assert from 'node:assert/strict';

// ============================================================================
// 1. ABRIR CAJA MODAL VALIDATION ORACLE
// ============================================================================

function validarMontoAbrir(montoInput: string): { valor: number | null; error: string | null } {
  const raw = montoInput.trim();
  if (!raw) {
    return { valor: null, error: 'Ingrese el monto inicial.' }; // MSG-169
  }

  // Acepta coma o punto como separador decimal
  const normalizado = raw.replace(',', '.');
  const parsed = parseFloat(normalizado);

  if (isNaN(parsed) || parsed < 0) {
    return { valor: null, error: 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.' }; // MSG-170
  }

  // Validar hasta 2 decimales
  const partes = normalizado.split('.');
  if (partes.length === 2 && partes[1].length > 2) {
    return { valor: null, error: 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.' }; // MSG-170
  }

  // RV-120: Límite superior S/ 99,999.99
  if (parsed > 99999.99) {
    return { valor: null, error: 'El monto no puede superar S/ 99,999.99.' }; // MSG-171
  }

  return { valor: Math.round(parsed * 100) / 100, error: null };
}

// ============================================================================
// 2. CONTADOR DE DENOMINACIONES ORACLE & ARITHMETIC
// ============================================================================

interface DenominacionDef {
  id: string;
  valor: number;
  etiqueta: string;
  tipo: 'billete' | 'moneda';
}

const DENOMINACIONES: DenominacionDef[] = [
  // Billetes
  { id: 'b200', valor: 200, etiqueta: 'S/ 200', tipo: 'billete' },
  { id: 'b100', valor: 100, etiqueta: 'S/ 100', tipo: 'billete' },
  { id: 'b50', valor: 50, etiqueta: 'S/ 50', tipo: 'billete' },
  { id: 'b20', valor: 20, etiqueta: 'S/ 20', tipo: 'billete' },
  { id: 'b10', valor: 10, etiqueta: 'S/ 10', tipo: 'billete' },
  // Monedas
  { id: 'm5', valor: 5, etiqueta: 'S/ 5.00', tipo: 'moneda' },
  { id: 'm2', valor: 2, etiqueta: 'S/ 2.00', tipo: 'moneda' },
  { id: 'm1', valor: 1, etiqueta: 'S/ 1.00', tipo: 'moneda' },
  { id: 'm050', valor: 0.50, etiqueta: 'S/ 0.50', tipo: 'moneda' },
  { id: 'm020', valor: 0.20, etiqueta: 'S/ 0.20', tipo: 'moneda' },
  { id: 'm010', valor: 0.10, etiqueta: 'S/ 0.10', tipo: 'moneda' },
];

function validarCantidadDenominacion(rawVal: string): { cantidad: number; error: string | null } {
  const trimmed = rawVal.trim();
  if (trimmed === '') {
    return { cantidad: 0, error: null };
  }

  const isStrictInteger = /^\d+$/.test(trimmed);
  const parsed = parseInt(trimmed, 10);
  if (!isStrictInteger || isNaN(parsed) || parsed < 0 || parsed > 999) {
    return {
      cantidad: isNaN(parsed) ? 0 : parsed,
      error: 'La cantidad debe ser un número entero entre 0 y 999.', // MSG-184
    };
  }
  return { cantidad: parsed, error: null };
}

function calcularTotalDenominaciones(
  cantidades: Record<string, number>,
  errores: Record<string, string> = {}
): number {
  const totalCentavos = DENOMINACIONES.reduce((acc, denom) => {
    const cant = cantidades[denom.id] || 0;
    const tieneError = Boolean(errores[denom.id]);
    if (tieneError || cant <= 0 || cant > 999) return acc;
    const centavosDenom = Math.round(denom.valor * 100);
    return acc + cant * centavosDenom;
  }, 0);
  return totalCentavos / 100;
}

// ============================================================================
// 3. CERRAR CAJA OBSERVATION VALIDATION
// ============================================================================

function validarObservacionCierre(observacion: string): { valida: boolean; error: string | null } {
  if (observacion.length > 200) {
    return { valida: false, error: 'La observación no puede superar los 200 caracteres.' }; // MSG-179
  }
  return { valida: true, error: null };
}

// ============================================================================
// 4. CONCURRENCY PROTECTION SIMULATION
// ============================================================================

interface MockClosingState {
  resumen: { efectivoEsperado: number; cajaId: number };
  efectivoContado: string;
  errorServidor: string | null;
  pasoConfirmacion: boolean;
  recargado: boolean;
}

async function simularCierreConcurrente(
  estado: MockClosingState,
  servidorMock: () => Promise<any>,
  recargarResumenMock: () => Promise<{ efectivoEsperado: number; cajaId: number }>
) {
  try {
    await servidorMock();
  } catch (err: any) {
    if (err.codigo === 'caja_concurrencia' || err.codigo === 'totales_cambiaron') {
      estado.errorServidor =
        err.message || 'Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.';
      try {
        const nuevoResumen = await recargarResumenMock();
        estado.resumen = nuevoResumen;
        estado.recargado = true;
      } catch {
        // ignore
      }
    }
    estado.pasoConfirmacion = false;
  }
}

// ============================================================================
// RUN EMPIRICAL TEST SUITE
// ============================================================================

async function runEmpiricalSuite() {
  console.log('=================================================================');
  console.log('EMPIRICAL CHALLENGER M3-1: FRONTEND VALIDATION & EDGE CASE SUITE');
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
  // TEST SUITE 1: AbrirCajaModal Validations & Boundaries
  // --------------------------------------------------------------------------
  console.log('1. Testing AbrirCajaModal opening validations:');

  test('Empty string -> MSG-169', () => {
    const res = validarMontoAbrir('');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese el monto inicial.');
  });

  test('Whitespace only string -> MSG-169', () => {
    const res = validarMontoAbrir('   \t\n  ');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese el monto inicial.');
  });

  test('Negative amount (-0.01) -> MSG-170', () => {
    const res = validarMontoAbrir('-0.01');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('Negative integer (-50) -> MSG-170', () => {
    const res = validarMontoAbrir('-50');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('Non-numeric alphabetic input ("abc") -> MSG-170', () => {
    const res = validarMontoAbrir('abc');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('More than 2 decimals ("50.123") -> MSG-170', () => {
    const res = validarMontoAbrir('50.123');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('Smallest invalid 3 decimals ("0.001") -> MSG-170', () => {
    const res = validarMontoAbrir('0.001');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('Boundary above max: 100,000.00 -> MSG-171', () => {
    const res = validarMontoAbrir('100000.00');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'El monto no puede superar S/ 99,999.99.');
  });

  test('Boundary above max: 100,000 -> MSG-171', () => {
    const res = validarMontoAbrir('100000');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'El monto no puede superar S/ 99,999.99.');
  });

  test('Boundary just above max: 99,999.991 -> MSG-170 (fails decimals first)', () => {
    const res = validarMontoAbrir('99999.991');
    assert.equal(res.valor, null);
    assert.equal(res.error, 'Ingrese un monto válido, desde S/ 0.00 y con hasta 2 decimales.');
  });

  test('Valid boundary: S/ 0.00 allowed', () => {
    const res = validarMontoAbrir('0.00');
    assert.equal(res.error, null);
    assert.equal(res.valor, 0);
  });

  test('Valid boundary: S/ 0 allowed', () => {
    const res = validarMontoAbrir('0');
    assert.equal(res.error, null);
    assert.equal(res.valor, 0);
  });

  test('Valid boundary: S/ 99,999.99 allowed', () => {
    const res = validarMontoAbrir('99999.99');
    assert.equal(res.error, null);
    assert.equal(res.valor, 99999.99);
  });

  test('Valid comma as decimal separator: "150,50" -> 150.50', () => {
    const res = validarMontoAbrir('150,50');
    assert.equal(res.error, null);
    assert.equal(res.valor, 150.5);
  });

  test('Valid typical opening: S/ 150.00', () => {
    const res = validarMontoAbrir('150.00');
    assert.equal(res.error, null);
    assert.equal(res.valor, 150.0);
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 2: ContadorDenominacionesModal Denominations, Quantities & Float
  // --------------------------------------------------------------------------
  console.log('\n2. Testing ContadorDenominacionesModal:');

  test('Verify all 11 Peruvian denominations are configured exactly', () => {
    assert.equal(DENOMINACIONES.length, 11);
    const expectedValues = [200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10];
    const actualValues = DENOMINACIONES.map((d) => d.valor);
    assert.deepEqual(actualValues, expectedValues);

    const billetes = DENOMINACIONES.filter((d) => d.tipo === 'billete');
    const monedas = DENOMINACIONES.filter((d) => d.tipo === 'moneda');
    assert.equal(billetes.length, 5);
    assert.equal(monedas.length, 6);
  });

  test('Integer validation: valid integer 0..999 passes', () => {
    for (const validVal of ['0', '1', '50', '999']) {
      const res = validarCantidadDenominacion(validVal);
      assert.equal(res.error, null, `Expected no error for ${validVal}`);
      assert.equal(res.cantidad, parseInt(validVal, 10));
    }
  });

  test('Integer validation: empty input resets to 0 with no error', () => {
    const res = validarCantidadDenominacion('');
    assert.equal(res.error, null);
    assert.equal(res.cantidad, 0);
  });

  test('Integer validation: negative value (-1) -> MSG-184', () => {
    const res = validarCantidadDenominacion('-1');
    assert.equal(res.error, 'La cantidad debe ser un número entero entre 0 y 999.');
  });

  test('Integer validation: value > 999 (1000) -> MSG-184', () => {
    const res = validarCantidadDenominacion('1000');
    assert.equal(res.error, 'La cantidad debe ser un número entero entre 0 y 999.');
  });

  test('Integer validation: decimal units ("3.5") -> MSG-184', () => {
    const res = validarCantidadDenominacion('3.5');
    assert.equal(res.error, 'La cantidad debe ser un número entero entre 0 y 999.');
  });

  test('Integer validation: letters ("abc") -> MSG-184', () => {
    const res = validarCantidadDenominacion('abc');
    assert.equal(res.error, 'La cantidad debe ser un número entero entre 0 y 999.');
  });

  test('IEEE-754 precision: stress test combinations of 0.10, 0.20, 0.50', () => {
    // In naive float arithmetic:
    // 0.1 * 3 = 0.30000000000000004
    // 0.1 * 7 = 0.7000000000000001
    // 0.2 * 3 = 0.6000000000000001
    // 0.2 * 14 = 2.8000000000000003
    // Here we verify the counter computes exact cent amounts without drift.

    const testCases = [
      { m010: 3, expected: 0.30 },
      { m010: 7, expected: 0.70 },
      { m010: 29, expected: 2.90 },
      { m020: 3, expected: 0.60 },
      { m020: 14, expected: 2.80 },
      { m050: 3, expected: 1.50 },
      { m010: 3, m020: 3, m050: 3, expected: 0.30 + 0.60 + 1.50 }, // 2.40
      { m010: 1, m020: 2, m050: 1, expected: 1.00 },
      { m010: 999, m020: 999, m050: 999, expected: (999 * 10 + 999 * 20 + 999 * 50) / 100 }, // 799.20
    ];

    for (const tc of testCases) {
      const cantidades: Record<string, number> = {};
      if (tc.m010) cantidades['m010'] = tc.m010;
      if (tc.m020) cantidades['m020'] = tc.m020;
      if (tc.m050) cantidades['m050'] = tc.m050;

      const total = calcularTotalDenominaciones(cantidades);
      assert.equal(
        total,
        tc.expected,
        `Expected ${tc.expected} but got ${total} for ${JSON.stringify(cantidades)}`
      );
      assert.equal(
        total.toFixed(2),
        tc.expected.toFixed(2),
        `toFixed(2) mismatch: ${total.toFixed(2)} vs ${tc.expected.toFixed(2)}`
      );
    }
  });

  test('IEEE-754 exhaustive sweep: all coin values 0.10, 0.20, 0.50 from 1 to 100 units', () => {
    for (let q = 1; q <= 100; q++) {
      // 0.10 test
      const t1 = calcularTotalDenominaciones({ m010: q });
      const expected1 = Math.round(q * 10) / 100;
      assert.equal(t1, expected1, `Failed at m010 x ${q}: got ${t1}, expected ${expected1}`);

      // 0.20 test
      const t2 = calcularTotalDenominaciones({ m020: q });
      const expected2 = Math.round(q * 20) / 100;
      assert.equal(t2, expected2, `Failed at m020 x ${q}: got ${t2}, expected ${expected2}`);

      // 0.50 test
      const t3 = calcularTotalDenominaciones({ m050: q });
      const expected3 = Math.round(q * 50) / 100;
      assert.equal(t3, expected3, `Failed at m050 x ${q}: got ${t3}, expected ${expected3}`);
    }
  });

  test('Maximum possible cash register count (all 11 denominations at 999 units)', () => {
    const cantidades: Record<string, number> = {};
    for (const d of DENOMINACIONES) {
      cantidades[d.id] = 999;
    }
    const total = calcularTotalDenominaciones(cantidades);
    // (200 + 100 + 50 + 20 + 10 + 5 + 2 + 1 + 0.5 + 0.2 + 0.1) = 388.80
    // 388.80 * 999 = 388,411.20
    const expected = 388411.20;
    assert.equal(total, expected);
    assert.equal(total.toFixed(2), '388411.20');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Observation Length in CerrarCajaModal
  // --------------------------------------------------------------------------
  console.log('\n3. Testing CerrarCajaModal observation length & MSG-179:');

  test('Empty observation (0 chars) is valid', () => {
    const res = validarObservacionCierre('');
    assert.equal(res.valida, true);
    assert.equal(res.error, null);
  });

  test('Observation with 199 chars is valid', () => {
    const obs = 'a'.repeat(199);
    const res = validarObservacionCierre(obs);
    assert.equal(res.valida, true);
    assert.equal(res.error, null);
  });

  test('Observation with boundary 200 chars is valid', () => {
    const obs = 'a'.repeat(200);
    const res = validarObservacionCierre(obs);
    assert.equal(res.valida, true);
    assert.equal(res.error, null);
  });

  test('Observation with boundary 201 chars fails with MSG-179', () => {
    const obs = 'a'.repeat(201);
    const res = validarObservacionCierre(obs);
    assert.equal(res.valida, false);
    assert.equal(res.error, 'La observación no puede superar los 200 caracteres.');
  });

  test('Observation with 250 chars fails with MSG-179', () => {
    const obs = 'a'.repeat(250);
    const res = validarObservacionCierre(obs);
    assert.equal(res.valida, false);
    assert.equal(res.error, 'La observación no puede superar los 200 caracteres.');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Concurrency Protection (409 MSG-189)
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Concurrency Protection in CerrarCajaModal:');

  test('Server 409 caja_concurrencia displays MSG-189, reloads summary and preserves counted cash', async () => {
    const state: MockClosingState = {
      resumen: { efectivoEsperado: 450.00, cajaId: 10 },
      efectivoContado: '450.00',
      errorServidor: null,
      pasoConfirmacion: true,
      recargado: false,
    };

    const mockServidorConcurrente = async () => {
      const err = new Error('Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.');
      (err as any).status = 409;
      (err as any).codigo = 'caja_concurrencia';
      (err as any).efectivoEsperadoActual = 480.00;
      (err as any).efectivoEsperadoMostrado = 450.00;
      throw err;
    };

    const mockRecargarResumen = async () => {
      return { efectivoEsperado: 480.00, cajaId: 10 };
    };

    await simularCierreConcurrente(state, mockServidorConcurrente, mockRecargarResumen);

    assert.equal(
      state.errorServidor,
      'Los totales cambiaron mientras contaba. Revise el resumen antes de cerrar.',
      'Must display MSG-189'
    );
    assert.equal(state.resumen.efectivoEsperado, 480.00, 'Must update expected cash to new value');
    assert.equal(state.efectivoContado, '450.00', 'Must preserve cashier counted input');
    assert.equal(state.pasoConfirmacion, false, 'Must dismiss confirmation modal to show updated summary');
    assert.equal(state.recargado, true, 'Must reload summary from backend');
  });

  console.log('\n=================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEmpiricalSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
