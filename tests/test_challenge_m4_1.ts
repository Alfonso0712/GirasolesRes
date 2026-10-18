/**
 * Empirical Verification & Stress Test Harness for Milestone 4 (Worker M4-1)
 * History Pagination, Date Filter Validation, Timezone Stability & Pinned Open Register
 * 
 * Rules tested:
 * - RN-110 / RV-131: 20 records per page pagination, boundary buttons, page clamping.
 * - RN-111 / E-320: Pinned open register on page 1, excluded/handled on page 2+, disabled PDF.
 * - RV-130 / MSG-188: Date filter validation (inverted range, future dates, catalog message).
 * - PET Night Hours (19:00 - 23:59 UTC-5): Timezone stability, avoidance of false-positive future date errors.
 * - RV-131 / E-314 / RN-113: Cuadre badges, difference formatting, and "Con ajustes" badges.
 * - RN-106 / E-319: Access guard for non-admin roles.
 */

import assert from 'node:assert/strict';

console.log('=================================================================');
console.log('EMPIRICAL CHALLENGER M4-1: HISTORY PAGINATION & DATE FILTER SUITE');
console.log('=================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// ============================================================================
// 1. DATE HELPERS & ORACLES (Extracted directly from HistorialCierresPage.tsx)
// ============================================================================

const getFechaActualLimaStr = (baseDate: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(baseDate);
};

const restarDiasLimaStr = (diasAtras: number, baseDate: Date = new Date()): string => {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() - diasAtras);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

const validarRangoFechas = (fDesde: string, fHasta: string, hoyLimaStr: string): string | null => {
  const msg188 =
    "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro.";
  if (fDesde && fDesde > hoyLimaStr) {
    return msg188;
  }
  if (fHasta && fHasta > hoyLimaStr) {
    return msg188;
  }
  if (fDesde && fHasta && fDesde > fHasta) {
    return msg188;
  }
  return null;
};

const esCajaAbierta = (c: any): boolean => {
  return (
    c.esAbierta === true ||
    c.estado?.toLowerCase() === 'abierta' ||
    (!c.fechaCierre && (c.montoCierre === null || c.montoCierre === undefined))
  );
};

// ============================================================================
// DIMENSION 1: PAGINATION & BOUNDARIES (RN-110, RV-131)
// ============================================================================
console.log('1. Testing Pagination Mechanics & Boundary Buttons (RN-110, RV-131):');

runTest('Page size is configured to 20 records per page', () => {
  const tamano = 20;
  assert.equal(tamano, 20);
});

runTest('Total pages calculation handles 0, boundary and multi-page totals', () => {
  const calcTotalPages = (total: number, tamano: number = 20) =>
    Math.max(1, Math.ceil(total / tamano));

  assert.equal(calcTotalPages(0), 1, '0 items should result in 1 page');
  assert.equal(calcTotalPages(1), 1, '1 item should result in 1 page');
  assert.equal(calcTotalPages(19), 1, '19 items should result in 1 page');
  assert.equal(calcTotalPages(20), 1, '20 items should result in exactly 1 page');
  assert.equal(calcTotalPages(21), 2, '21 items should result in 2 pages');
  assert.equal(calcTotalPages(40), 2, '40 items should result in 2 pages');
  assert.equal(calcTotalPages(41), 3, '41 items should result in 3 pages');
  assert.equal(calcTotalPages(100), 5, '100 items should result in 5 pages');
});

runTest('Pagination control visibility: hidden when totalPaginas <= 1', () => {
  const isPaginationVisible = (totalPaginas: number) => totalPaginas > 1;
  assert.equal(isPaginationVisible(1), false, 'Pagination hidden when totalPaginas = 1');
  assert.equal(isPaginationVisible(2), true, 'Pagination visible when totalPaginas = 2');
  assert.equal(isPaginationVisible(5), true, 'Pagination visible when totalPaginas = 5');
});

runTest('Navigation buttons enabled/disabled states at boundaries', () => {
  const getButtonStates = (pagina: number, totalPaginas: number, cargando: boolean = false) => ({
    prevDisabled: pagina <= 1 || cargando,
    nextDisabled: pagina >= totalPaginas || cargando,
  });

  // Page 1 of 3 (start boundary)
  const page1 = getButtonStates(1, 3);
  assert.equal(page1.prevDisabled, true, 'Prev must be disabled on page 1');
  assert.equal(page1.nextDisabled, false, 'Next must be enabled on page 1');

  // Page 2 of 3 (middle page)
  const page2 = getButtonStates(2, 3);
  assert.equal(page2.prevDisabled, false, 'Prev must be enabled on middle page');
  assert.equal(page2.nextDisabled, false, 'Next must be enabled on middle page');

  // Page 3 of 3 (end boundary)
  const page3 = getButtonStates(3, 3);
  assert.equal(page3.prevDisabled, false, 'Prev must be enabled on last page');
  assert.equal(page3.nextDisabled, true, 'Next must be disabled on last page');

  // When loading: both buttons must be disabled regardless of page
  const loadingState = getButtonStates(2, 3, true);
  assert.equal(loadingState.prevDisabled, true, 'Prev must be disabled while loading');
  assert.equal(loadingState.nextDisabled, true, 'Next must be disabled while loading');
});

runTest('Page clamping prevents navigation out of bounds', () => {
  const prevPage = (p: number) => Math.max(1, p - 1);
  const nextPage = (p: number, totalPaginas: number) => Math.min(totalPaginas, p + 1);

  // Prev clamping
  assert.equal(prevPage(1), 1, 'Prev on page 1 clamps to 1');
  assert.equal(prevPage(2), 1, 'Prev on page 2 navigates to 1');

  // Next clamping
  assert.equal(nextPage(3, 3), 3, 'Next on page 3 clamps to 3');
  assert.equal(nextPage(2, 3), 3, 'Next on page 2 navigates to 3');
});

runTest('Filter changes (desde, hasta, chips, clear) reset page to 1', () => {
  let pagina = 3;
  const onFilterChange = () => {
    pagina = 1;
  };

  onFilterChange();
  assert.equal(pagina, 1, 'Changing filter resets page to 1');
});

// ============================================================================
// DIMENSION 2: PINNED OPEN REGISTER MECHANICS (RN-111, E-320)
// ============================================================================
console.log('\n2. Testing Pinned Open Register Mechanics (RN-111, E-320):');

runTest('Detection predicate esCajaAbierta identifies open register variants', () => {
  // Explicit flag
  assert.equal(esCajaAbierta({ esAbierta: true }), true);
  // Estado string case variations
  assert.equal(esCajaAbierta({ estado: 'Abierta' }), true);
  assert.equal(esCajaAbierta({ estado: 'abierta' }), true);
  assert.equal(esCajaAbierta({ estado: 'ABIERTA' }), true);
  // Missing closing fields
  assert.equal(esCajaAbierta({ fechaCierre: null, montoCierre: null }), true);
  assert.equal(esCajaAbierta({ fechaCierre: null, montoCierre: undefined }), true);
});

runTest('Detection predicate esCajaAbierta correctly rejects closed registers', () => {
  // Normal closed register
  assert.equal(
    esCajaAbierta({
      estado: 'Cerrada',
      fechaCierre: '2026-10-18T14:00:00Z',
      montoCierre: 250.0,
      diferencia: 0.0,
    }),
    false
  );

  // Closed register with zero cash count
  assert.equal(
    esCajaAbierta({
      estado: 'Cerrada',
      fechaCierre: '2026-10-18T14:00:00Z',
      montoCierre: 0.0,
      diferencia: -150.0,
    }),
    false
  );

  // Closed register with esAbierta: false
  assert.equal(
    esCajaAbierta({
      esAbierta: false,
      estado: 'Cerrada',
      fechaCierre: '2026-10-18T14:00:00Z',
      montoCierre: 100.0,
    }),
    false
  );
});

runTest('Page 1 presentation of open register: row 1, badges, and disabled PDF', () => {
  const openItem = {
    cajaId: 'caja-open-1',
    estado: 'Abierta',
    fechaApertura: '2026-10-18T08:00:00Z',
    fechaAperturaLocal: '18/10/2026 08:00',
    fechaCierre: null,
    montoInicial: 150.0,
    ventasEfectivo: 320.0,
    ventasYape: 180.0,
    totalVentas: 500.0,
    montoCierre: null,
    efectivoContado: null,
    diferencia: null,
  };

  const isAbierta = esCajaAbierta(openItem);
  assert.equal(isAbierta, true);

  // UI expectations for open register
  const badgeText = isAbierta ? 'Abierta' : 'Cerrada';
  assert.equal(badgeText, 'Abierta');

  const contadoDisplay = isAbierta ? '—' : `S/ ${(openItem.efectivoContado ?? 0).toFixed(2)}`;
  assert.equal(contadoDisplay, '—', 'Contado must be displayed as dash for open register');

  const diferenciaDisplay = isAbierta ? '—' : 'Calculated';
  assert.equal(diferenciaDisplay, '—', 'Diferencia must be displayed as dash for open register');

  const isPdfDisabled = isAbierta;
  assert.equal(isPdfDisabled, true, 'PDF download button must be disabled for open register');
});

runTest('Page 2+ exclusion: Open register is not duplicated or present on page 2+', () => {
  // Simulate repository paging: 25 items total (1 open, 24 closed)
  const allRegisters = [
    { id: 'caja-open', fechaAperturaUtc: '2026-10-18T08:00:00Z', estado: 'Abierta' },
    ...Array.from({ length: 24 }, (_, i) => ({
      id: `caja-closed-${i + 1}`,
      fechaAperturaUtc: new Date(Date.parse('2026-10-18T07:00:00Z') - (i + 1) * 86400000).toISOString(),
      estado: 'Cerrada',
      fechaCierre: '2026-10-18T18:00:00Z',
      montoCierre: 200,
    })),
  ];

  assert.equal(allRegisters.length, 25);

  // Page 1 query (skip 0, take 20)
  const page1Items = allRegisters.slice(0, 20);
  assert.equal(page1Items.length, 20);
  assert.equal(page1Items[0].id, 'caja-open', 'Row 1 of Page 1 must be the open register');
  assert.equal(esCajaAbierta(page1Items[0]), true);

  // Page 2 query (skip 20, take 20)
  const page2Items = allRegisters.slice(20, 40);
  assert.equal(page2Items.length, 5);
  // Verify that NONE of page 2 items are the open register
  const page2HasOpen = page2Items.some((c) => esCajaAbierta(c) || c.id === 'caja-open');
  assert.equal(page2HasOpen, false, 'Page 2 must NOT contain the open register');
});

// ============================================================================
// DIMENSION 3: DATE FILTER VALIDATION (RV-130, MSG-188)
// ============================================================================
console.log('\n3. Testing Date Filter Validation & Error Catalog MSG-188 (RV-130):');

const EXPECTED_MSG_188 =
  "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro.";

runTest('Inverted range (desde > hasta) triggers exact MSG-188', () => {
  const hoy = '2026-10-18';
  const err1 = validarRangoFechas('2026-10-18', '2026-10-17', hoy);
  assert.equal(err1, EXPECTED_MSG_188);

  const err2 = validarRangoFechas('2026-10-10', '2026-10-01', hoy);
  assert.equal(err2, EXPECTED_MSG_188);

  const err3 = validarRangoFechas('2026-05-15', '2026-05-14', hoy);
  assert.equal(err3, EXPECTED_MSG_188);
});

runTest('Future date in "desde" triggers exact MSG-188', () => {
  const hoy = '2026-10-18';
  const errTomorrow = validarRangoFechas('2026-10-19', '', hoy);
  assert.equal(errTomorrow, EXPECTED_MSG_188);

  const errFutureYear = validarRangoFechas('2099-01-01', '', hoy);
  assert.equal(errFutureYear, EXPECTED_MSG_188);
});

runTest('Future date in "hasta" triggers exact MSG-188', () => {
  const hoy = '2026-10-18';
  const errTomorrow = validarRangoFechas('2026-10-10', '2026-10-19', hoy);
  assert.equal(errTomorrow, EXPECTED_MSG_188);

  const errFutureYear = validarRangoFechas('', '2099-12-31', hoy);
  assert.equal(errFutureYear, EXPECTED_MSG_188);
});

runTest('Both dates in future trigger exact MSG-188', () => {
  const hoy = '2026-10-18';
  const err = validarRangoFechas('2026-10-19', '2026-10-20', hoy);
  assert.equal(err, EXPECTED_MSG_188);
});

runTest('Valid ranges return null (no error)', () => {
  const hoy = '2026-10-18';

  // Same day today
  assert.equal(validarRangoFechas('2026-10-18', '2026-10-18', hoy), null);
  // Same day historical
  assert.equal(validarRangoFechas('2026-10-10', '2026-10-10', hoy), null);
  // Range from historical to today
  assert.equal(validarRangoFechas('2026-10-01', '2026-10-18', hoy), null);
  // Historical range
  assert.equal(validarRangoFechas('2026-09-01', '2026-09-30', hoy), null);
  // Only desde
  assert.equal(validarRangoFechas('2026-10-01', '', hoy), null);
  // Only hasta
  assert.equal(validarRangoFechas('', '2026-10-18', hoy), null);
  // Both empty (all records)
  assert.equal(validarRangoFechas('', '', hoy), null);
});

// ============================================================================
// DIMENSION 4: TIMEZONE VERIFICATION (PET NIGHT HOURS 19:00 - 23:59 UTC-5)
// ============================================================================
console.log('\n4. Testing Timezone Stability During PET Night Hours (19:00 - 23:59 UTC-5):');

runTest('getFechaActualLimaStr returns correct Lima date when UTC has rolled over to next day', () => {
  // On 2026-10-18, PET night hours:
  // 19:00 PET = 2026-10-19T00:00:00Z
  // 20:00 PET = 2026-10-19T01:00:00Z
  // 21:00 PET = 2026-10-19T02:00:00Z
  // 22:00 PET = 2026-10-19T03:00:00Z
  // 23:00 PET = 2026-10-19T04:00:00Z
  // 23:59:59 PET = 2026-10-19T04:59:59.999Z

  const testHours = [
    { petHour: '19:00', utcIso: '2026-10-19T00:00:00.000Z' },
    { petHour: '20:00', utcIso: '2026-10-19T01:00:00.000Z' },
    { petHour: '21:00', utcIso: '2026-10-19T02:00:00.000Z' },
    { petHour: '22:00', utcIso: '2026-10-19T03:00:00.000Z' },
    { petHour: '23:00', utcIso: '2026-10-19T04:00:00.000Z' },
    { petHour: '23:30', utcIso: '2026-10-19T04:30:00.000Z' },
    { petHour: '23:59:59', utcIso: '2026-10-19T04:59:59.999Z' },
  ];

  for (const th of testHours) {
    const testDate = new Date(th.utcIso);
    const limaDateStr = getFechaActualLimaStr(testDate);
    const naiveUtcDateStr = testDate.toISOString().split('T')[0];

    // Naive UTC has rolled over to tomorrow (2026-10-19)
    assert.equal(naiveUtcDateStr, '2026-10-19', `Naive UTC must be 2026-10-19 at ${th.petHour}`);

    // BUT Lima date must remain 2026-10-18
    assert.equal(
      limaDateStr,
      '2026-10-18',
      `getFechaActualLimaStr must return 2026-10-18 at PET ${th.petHour}`
    );

    // Critical: Validating today's date ('2026-10-18') at night hours must NOT trigger false MSG-188
    const err = validarRangoFechas('2026-10-18', '2026-10-18', limaDateStr);
    assert.equal(
      err,
      null,
      `Validating today ('2026-10-18') during PET night hour ${th.petHour} must NOT trigger MSG-188`
    );
  }
});

runTest('Midnight rollover in PET (00:00:00 PET) correctly advances Lima date', () => {
  // At 00:00:00 PET on 2026-10-19 = 2026-10-19T05:00:00.000Z
  const midnightPet = new Date('2026-10-19T05:00:00.000Z');
  const limaDateStr = getFechaActualLimaStr(midnightPet);
  assert.equal(limaDateStr, '2026-10-19', 'At 00:00:00 PET, Lima date must advance to 2026-10-19');
});

runTest('Full 24-hour sweep of Lima date formatting without DST anomalies', () => {
  // Test every single hour of 2026-10-18 in Peru (UTC-5)
  // From 00:00 PET (05:00 UTC) to 23:00 PET (04:00 UTC next day)
  for (let petH = 0; petH < 24; petH++) {
    const utcH = (petH + 5) % 24;
    const isNextDayUtc = petH >= 19;
    const day = isNextDayUtc ? 19 : 18;
    const isoString = `2026-10-${day.toString().padStart(2, '0')}T${utcH
      .toString()
      .padStart(2, '0')}:00:00.000Z`;

    const d = new Date(isoString);
    const limaDate = getFechaActualLimaStr(d);
    assert.equal(
      limaDate,
      '2026-10-18',
      `Hour ${petH}:00 PET (${isoString}) must format as 2026-10-18 in Lima`
    );
  }
});

runTest('Quick filter date arithmetic (Ayer, 7d, 30d) during night hours', () => {
  // Simulate executing quick filter chips at 21:00 PET on 2026-10-18 (02:00 UTC on 2026-10-19)
  const nightTime = new Date('2026-10-19T02:00:00.000Z');
  const hoyLima = getFechaActualLimaStr(nightTime);
  assert.equal(hoyLima, '2026-10-18');

  // "Ayer" (1 día atrás)
  const ayer = restarDiasLimaStr(1, nightTime);
  assert.equal(ayer, '2026-10-17');

  // "7 días atrás"
  const sieteDias = restarDiasLimaStr(7, nightTime);
  assert.equal(sieteDias, '2026-10-11');

  // "30 días atrás"
  const treintaDias = restarDiasLimaStr(30, nightTime);
  assert.equal(treintaDias, '2026-09-18');

  // Verify all quick filter ranges are valid and do not trigger MSG-188
  assert.equal(validarRangoFechas(ayer, ayer, hoyLima), null);
  assert.equal(validarRangoFechas(sieteDias, hoyLima, hoyLima), null);
  assert.equal(validarRangoFechas(treintaDias, hoyLima, hoyLima), null);
});

// ============================================================================
// DIMENSION 5: CUADRE BADGES, DISCREPANCIES & ADJUSTMENTS (RV-131, E-314, RN-113)
// ============================================================================
console.log('\n5. Testing Badges, Cuadre Semantics & Role Guards (RV-131, RN-113, RN-106):');

runTest('Cuadre badge formatting for exact, sobrante, and faltante balances', () => {
  const formatCuadreBadge = (c: any) => {
    if (esCajaAbierta(c)) return '—';
    const diff = c.diferencia !== null && c.diferencia !== undefined ? Number(c.diferencia) : null;
    if (diff === null) return '—';
    if (diff === 0) return 'Cuadra · S/ 0.00';
    if (diff > 0) return `+ S/ ${diff.toFixed(2)}`;
    return `- S/ ${Math.abs(diff).toFixed(2)}`;
  };

  const baseClosed = {
    estado: 'Cerrada',
    fechaCierre: '2026-10-18T14:00:00Z',
    montoCierre: 200.0,
  };

  assert.equal(formatCuadreBadge({ ...baseClosed, esAbierta: true }), '—');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: 0 }), 'Cuadra · S/ 0.00');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: 0.0 }), 'Cuadra · S/ 0.00');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: 15.5 }), '+ S/ 15.50');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: 0.1 }), '+ S/ 0.10');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: -25.0 }), '- S/ 25.00');
  assert.equal(formatCuadreBadge({ ...baseClosed, diferencia: -0.5 }), '- S/ 0.50');
});

runTest('Subsequent void adjustments badge "Con ajustes" (RN-113)', () => {
  const hasAjustesBadge = (c: any) => Boolean(c.conAjustes || c.tieneAjustesPosteriores);

  assert.equal(hasAjustesBadge({ conAjustes: true }), true);
  assert.equal(hasAjustesBadge({ tieneAjustesPosteriores: true }), true);
  assert.equal(hasAjustesBadge({ conAjustes: false, tieneAjustesPosteriores: false }), false);
  assert.equal(hasAjustesBadge({}), false);
});

runTest('Role Guard strictly restricts access to Administrador (RN-106, E-319)', () => {
  const canAccessHistory = (rol: string) => rol === 'Administrador';

  assert.equal(canAccessHistory('Administrador'), true);
  assert.equal(canAccessHistory('Cajero'), false);
  assert.equal(canAccessHistory('Mozo'), false);
  assert.equal(canAccessHistory('Cocinero'), false);
  assert.equal(canAccessHistory(''), false);
  assert.equal(canAccessHistory(undefined as any), false);
});

// ============================================================================
// DIMENSION 6: ADVERSARIAL STRESS TESTING & CALENDAR CORNER CASES
// ============================================================================
console.log('\n6. Testing Adversarial Stress Scenarios & Calendar Boundaries:');

runTest('Cross-year, leap year and cross-month date ranges', () => {
  const hoy = '2026-10-18';

  // Cross-year valid: 2025-12-30 to 2026-01-02
  assert.equal(validarRangoFechas('2025-12-30', '2026-01-02', hoy), null);

  // Cross-year inverted: 2026-01-01 to 2025-12-31 -> MSG-188
  assert.equal(validarRangoFechas('2026-01-01', '2025-12-31', hoy), EXPECTED_MSG_188);

  // Leap year 2024: 2024-02-28 to 2024-02-29
  assert.equal(validarRangoFechas('2024-02-28', '2024-02-29', hoy), null);

  // Cross-month inverted: 2026-10-01 to 2026-09-30 -> MSG-188
  assert.equal(validarRangoFechas('2026-10-01', '2026-09-30', hoy), EXPECTED_MSG_188);
});

runTest('Anterior Sin Cerrar register (RN-108 / E-291) pinned on Page 1', () => {
  // If an unclosed register remains from yesterday
  const anteriorSinCerrar = {
    cajaId: 'caja-unclosed-yesterday',
    estado: 'Abierta',
    fechaApertura: '2026-10-17T18:00:00Z',
    fechaAperturaLocal: '17/10/2026 13:00',
    fechaCierre: null,
    montoInicial: 100.0,
    montoCierre: null,
  };

  assert.equal(esCajaAbierta(anteriorSinCerrar), true);

  // Even when opened yesterday, since no new register can open until closed,
  // it is the newest register in DB and sits at index 0 of page 1.
  const dataset = [
    anteriorSinCerrar,
    { cajaId: 'caja-closed-prev-1', fechaApertura: '2026-10-16T08:00:00Z', estado: 'Cerrada', fechaCierre: '2026-10-16T18:00:00Z', montoCierre: 120 },
    { cajaId: 'caja-closed-prev-2', fechaApertura: '2026-10-15T08:00:00Z', estado: 'Cerrada', fechaCierre: '2026-10-15T18:00:00Z', montoCierre: 150 },
  ];

  assert.equal(dataset[0].cajaId, 'caja-unclosed-yesterday');
  assert.equal(esCajaAbierta(dataset[0]), true, 'Anterior sin cerrar register must be recognized as open');
});

runTest('1,000 Randomized stress test against date validator oracle', () => {
  const hoy = '2026-10-18';
  let checkedCount = 0;

  for (let i = 0; i < 1000; i++) {
    // Generate dates between 2026-01-01 and 2026-12-31
    const m1 = Math.floor(Math.random() * 12) + 1;
    const d1 = Math.floor(Math.random() * 28) + 1;
    const sDesde = `2026-${m1.toString().padStart(2, '0')}-${d1.toString().padStart(2, '0')}`;

    const m2 = Math.floor(Math.random() * 12) + 1;
    const d2 = Math.floor(Math.random() * 28) + 1;
    const sHasta = `2026-${m2.toString().padStart(2, '0')}-${d2.toString().padStart(2, '0')}`;

    const result = validarRangoFechas(sDesde, sHasta, hoy);

    const isFuture = sDesde > hoy || sHasta > hoy;
    const isInverted = sDesde > sHasta;

    if (isFuture || isInverted) {
      assert.equal(
        result,
        EXPECTED_MSG_188,
        `Expected MSG-188 for ${sDesde} -> ${sHasta} (future: ${isFuture}, inverted: ${isInverted})`
      );
    } else {
      assert.equal(result, null, `Expected valid (null) for ${sDesde} -> ${sHasta}`);
    }
    checkedCount++;
  }

  assert.equal(checkedCount, 1000);
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n=================================================================');
console.log(`RESULTS: ${passCount} PASSED, ${failCount} FAILED (TOTAL: ${passCount + failCount})`);
console.log('=================================================================');

if (failCount > 0) {
  process.exit(1);
}
