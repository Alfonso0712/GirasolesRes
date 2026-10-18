/**
 * Empirical Verification Test Harness for Milestone 4 Frontend:
 * Role-Based Access Control, Closings History, Detail Modal & PDF Actions
 * Restaurante Girasoles - Challenger M4-2
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================================
// 1. ROLE-BASED ACCESS CONTROL ORACLE (RN-106, E-319)
// ============================================================================

interface RoleSession {
  rol?: string;
  usuario?: string;
}

function evaluateSidebarRoleAccess(session?: RoleSession | null): {
  canSeeHistorialCierres: boolean;
  canSeeCaja: boolean;
  canSeeVentas: boolean;
  canSeeUsuarios: boolean;
} {
  // Simulates line 26 of Sidebar.tsx: const rol = session?.rol;
  const rol = session?.rol;

  return {
    canSeeHistorialCierres: rol === 'Administrador',
    canSeeCaja: rol === 'Administrador' || rol === 'Cajero',
    canSeeVentas: rol === 'Administrador' || rol === 'Cajero',
    canSeeUsuarios: rol === 'Administrador',
  };
}

function evaluateHomePageNavigationGuard(
  paginaDeseada: string,
  session: RoleSession
): { permitida: boolean; paginaEfectiva: string } {
  // Simulates onSelectPagina and useEffect guard in HomePage.tsx
  if (paginaDeseada === 'historial-cierres' && session.rol !== 'Administrador') {
    const defaultPage =
      session.rol === 'Cajero'
        ? 'pedidos-llevar'
        : session.rol === 'Mozo'
        ? 'mesas'
        : session.rol === 'Cocinero'
        ? 'cocina'
        : 'inicio';
    return { permitida: false, paginaEfectiva: defaultPage };
  }
  return { permitida: true, paginaEfectiva: paginaDeseada };
}

// ============================================================================
// 2. DATE RANGE VALIDATION ORACLE (HistorialCierresPage RV-130 / MSG-188)
// ============================================================================

function validarRangoFechasOracle(fDesde: string, fHasta: string, hoyLimaStr: string): string | null {
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
}

// ============================================================================
// 3. OPEN REGISTER DETECTION ORACLE (RN-111, E-320)
// ============================================================================

interface CierreItemCandidate {
  esAbierta?: boolean;
  estado?: string | null;
  fechaCierre?: string | null;
  montoCierre?: number | null;
  efectivoContado?: number | null;
  montoInicial?: number;
}

function esCajaAbiertaOracle(c: CierreItemCandidate): boolean {
  return (
    c.esAbierta === true ||
    c.estado?.toLowerCase() === 'abierta' ||
    (!c.fechaCierre && (c.montoCierre === null || c.montoCierre === undefined))
  );
}

// ============================================================================
// 4. FINANCIAL BREAKDOWN & CUADRE BADGE ORACLE (RV-131, E-314, Vista 13.4)
// ============================================================================

interface DetalleFinanciero {
  montoInicial: number;
  ventasEfectivo: number;
  ventasYape: number;
  totalVentas: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
  estado: string;
}

function calcularCuadreBadge(detalle: DetalleFinanciero): {
  tipo: 'abierta' | 'cuadra' | 'sobrante' | 'faltante' | 'sinArqueo';
  texto: string;
  colorClase: string;
} {
  const abierta = detalle.estado.toLowerCase() === 'abierta' || detalle.efectivoContado === null;
  if (abierta) {
    return {
      tipo: 'abierta',
      texto: 'Turno en curso (Sin Arqueo)',
      colorClase: 'stone',
    };
  }

  const dif = detalle.diferencia !== null ? detalle.diferencia : null;
  if (dif === null) {
    return { tipo: 'sinArqueo', texto: 'Sin Arqueo', colorClase: 'stone' };
  }

  if (dif === 0) {
    return { tipo: 'cuadra', texto: 'Cuadra (S/ 0.00)', colorClase: 'emerald' };
  } else if (dif > 0) {
    return { tipo: 'sobrante', texto: `Sobrante (+S/ ${dif.toFixed(2)})`, colorClase: 'amber' };
  } else {
    return { tipo: 'faltante', texto: `Faltante (-S/ ${Math.abs(dif).toFixed(2)})`, colorClase: 'rose' };
  }
}

// ============================================================================
// 5. SUBSEQUENT VOID ADJUSTMENTS ORACLE (RN-113)
// ============================================================================

interface DetalleAjustes {
  tieneAjustesPosteriores?: boolean;
  conAjustes?: boolean;
  ajustesPosteriores?: Array<{
    ventaId: string;
    total?: number;
    montoAnulado?: number;
    motivo?: string;
  }>;
}

function evaluarTieneAjustes(detalle: DetalleAjustes): boolean {
  return Boolean(
    detalle.tieneAjustesPosteriores ||
      detalle.conAjustes ||
      (detalle.ajustesPosteriores && detalle.ajustesPosteriores.length > 0)
  );
}

// ============================================================================
// RUN EMPIRICAL TEST SUITE
// ============================================================================

async function runEmpiricalSuite() {
  console.log('=================================================================');
  console.log('EMPIRICAL CHALLENGER M4-2: ROLE AUTHORIZATION & DETAIL SUITE');
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
  // TEST SUITE 1: Role-Based Access Control in Sidebar (RN-106, E-319)
  // --------------------------------------------------------------------------
  console.log('1. Testing Role-Based Menu Item Visibility (Sidebar.tsx):');

  test('Administrador CAN see "Historial de Cierres" in Sidebar', () => {
    const res = evaluateSidebarRoleAccess({ rol: 'Administrador' });
    assert.equal(res.canSeeHistorialCierres, true);
  });

  test('Cajero CANNOT see "Historial de Cierres" in Sidebar (RN-106, E-319)', () => {
    const res = evaluateSidebarRoleAccess({ rol: 'Cajero' });
    assert.equal(res.canSeeHistorialCierres, false);
    // But can see Caja and Ventas
    assert.equal(res.canSeeCaja, true);
    assert.equal(res.canSeeVentas, true);
  });

  test('Mozo CANNOT see "Historial de Cierres" in Sidebar (RN-106, E-319)', () => {
    const res = evaluateSidebarRoleAccess({ rol: 'Mozo' });
    assert.equal(res.canSeeHistorialCierres, false);
  });

  test('Cocinero CANNOT see "Historial de Cierres" in Sidebar (RN-106, E-319)', () => {
    const res = evaluateSidebarRoleAccess({ rol: 'Cocinero' });
    assert.equal(res.canSeeHistorialCierres, false);
  });

  test('Unauthenticated or undefined role CANNOT see "Historial de Cierres" (Fail-Closed)', () => {
    const resUndef = evaluateSidebarRoleAccess({});
    assert.equal(resUndef.canSeeHistorialCierres, false);

    const resNull = evaluateSidebarRoleAccess(null);
    assert.equal(resNull.canSeeHistorialCierres, false);
  });

  test('Verify Sidebar.tsx source has fail-closed fix on line 26', () => {
    const sidebarPath = path.resolve('frontend/src/components/Sidebar.tsx');
    const content = fs.readFileSync(sidebarPath, 'utf-8');

    // Must NOT contain the fail-open fallback: const rol = session?.rol || 'Administrador'
    assert.ok(
      !content.includes("session?.rol || 'Administrador'"),
      'Sidebar.tsx must NOT contain fail-open fallback "session?.rol || \'Administrador\'"'
    );

    // Must contain fail-closed definition: const rol = session?.rol;
    assert.ok(
      content.includes('const rol = session?.rol;'),
      'Sidebar.tsx must contain strict fail-closed "const rol = session?.rol;"'
    );

    // Must guard historial-cierres with rol === 'Administrador'
    assert.ok(
      content.includes("rol === 'Administrador' && ("),
      'Sidebar.tsx must guard navigation with rol === \'Administrador\''
    );
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Unauthorized Route Mounting & Guarding (HomePage.tsx)
  // --------------------------------------------------------------------------
  console.log('\n2. Testing Unauthorized Route Mounting & Redirection (HomePage.tsx):');

  test('Administrador accessing "historial-cierres" is allowed', () => {
    const res = evaluateHomePageNavigationGuard('historial-cierres', { rol: 'Administrador' });
    assert.equal(res.permitida, true);
    assert.equal(res.paginaEfectiva, 'historial-cierres');
  });

  test('Cajero attempting to access "historial-cierres" is blocked and redirected to "pedidos-llevar"', () => {
    const res = evaluateHomePageNavigationGuard('historial-cierres', { rol: 'Cajero' });
    assert.equal(res.permitida, false);
    assert.equal(res.paginaEfectiva, 'pedidos-llevar');
  });

  test('Mozo attempting to access "historial-cierres" is blocked and redirected to "mesas"', () => {
    const res = evaluateHomePageNavigationGuard('historial-cierres', { rol: 'Mozo' });
    assert.equal(res.permitida, false);
    assert.equal(res.paginaEfectiva, 'mesas');
  });

  test('Cocinero attempting to access "historial-cierres" is blocked and redirected to "cocina"', () => {
    const res = evaluateHomePageNavigationGuard('historial-cierres', { rol: 'Cocinero' });
    assert.equal(res.permitida, false);
    assert.equal(res.paginaEfectiva, 'cocina');
  });

  test('Verify HomePage.tsx source contains redirection effect, onSelectPagina guard, and ShieldAlert fallback', () => {
    const homePath = path.resolve('frontend/src/pages/HomePage.tsx');
    const content = fs.readFileSync(homePath, 'utf-8');

    // 1. Redirection effect
    assert.ok(
      content.includes("if (paginaActiva === 'historial-cierres' && session.rol !== 'Administrador')"),
      'HomePage.tsx must contain useEffect auto-redirect for non-admin on historial-cierres'
    );

    // 2. onSelectPagina guard
    assert.ok(
      content.includes("if (p === 'historial-cierres' && session.rol !== 'Administrador')"),
      'HomePage.tsx must block onSelectPagina transition to historial-cierres for non-admin'
    );

    // 3. Fallback restricted view with ShieldAlert
    assert.ok(
      content.includes('<ShieldAlert className="w-8 h-8" />'),
      'HomePage.tsx must render ShieldAlert in the restricted access branch'
    );
    assert.ok(
      content.includes('Acceso Restringido'),
      'HomePage.tsx must display "Acceso Restringido"'
    );
    assert.ok(
      content.includes('RN-106, E-319'),
      'HomePage.tsx must document rule RN-106, E-319 in restricted view'
    );

    // 4. Dashboard card for historial-cierres restricted to Administrador
    assert.ok(
      content.includes("session.rol === 'Administrador' && (") &&
        content.includes("setPaginaActiva('historial-cierres')"),
      'HomePage.tsx must restrict the dashboard card to Administrador'
    );
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 3: In-Situ Guard in HistorialCierresPage.tsx (RN-106)
  // --------------------------------------------------------------------------
  console.log('\n3. Testing In-Situ Guard in HistorialCierresPage.tsx:');

  test('Verify HistorialCierresPage.tsx source enforces in-situ role check and ShieldAlert', () => {
    const pagePath = path.resolve('frontend/src/pages/HistorialCierresPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    assert.ok(
      content.includes("if (session.rol !== 'Administrador')"),
      'HistorialCierresPage.tsx must have in-situ check for session.rol !== "Administrador"'
    );

    assert.ok(
      content.includes('<ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />'),
      'HistorialCierresPage.tsx must render ShieldAlert for non-admin'
    );

    assert.ok(
      content.includes('Acceso restringido (RN-106 / E-319)'),
      'HistorialCierresPage.tsx must display RN-106 / E-319 title'
    );

    assert.ok(
      content.includes('MSG-39'),
      'HistorialCierresPage.tsx must display catalog MSG-39'
    );
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Date Range Validation Oracle (RV-130, MSG-188)
  // --------------------------------------------------------------------------
  console.log('\n4. Testing Date Range Filter validation (RV-130, MSG-188):');

  const hoyLima = '2026-10-18';

  test('Valid range: past dates (2026-10-01 to 2026-10-10) -> Valid (null)', () => {
    const err = validarRangoFechasOracle('2026-10-01', '2026-10-10', hoyLima);
    assert.equal(err, null);
  });

  test('Valid range: single day (desde == hasta == 2026-10-18) -> Valid (null)', () => {
    const err = validarRangoFechasOracle('2026-10-18', '2026-10-18', hoyLima);
    assert.equal(err, null);
  });

  test('Invalid range: desde > hasta (2026-10-15 > 2026-10-10) -> MSG-188', () => {
    const err = validarRangoFechasOracle('2026-10-15', '2026-10-10', hoyLima);
    assert.equal(
      err,
      "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro."
    );
  });

  test('Invalid range: future "desde" (2026-10-19 > hoy) -> MSG-188', () => {
    const err = validarRangoFechasOracle('2026-10-19', '2026-10-19', hoyLima);
    assert.equal(
      err,
      "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro."
    );
  });

  test('Invalid range: future "hasta" (2026-10-10 to 2026-10-25) -> MSG-188', () => {
    const err = validarRangoFechasOracle('2026-10-10', '2026-10-25', hoyLima);
    assert.equal(
      err,
      "El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro."
    );
  });

  test('Verify HistorialCierresPage.tsx source enforces exact MSG-188 and Lima timezone', () => {
    const pagePath = path.resolve('frontend/src/pages/HistorialCierresPage.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    assert.ok(
      content.includes("El rango de fechas no es válido. La fecha 'desde' no puede ser posterior a 'hasta' ni estar en el futuro."),
      'HistorialCierresPage.tsx must use exact catalog MSG-188 string'
    );
    assert.ok(
      content.includes("timeZone: 'America/Lima'"),
      'HistorialCierresPage.tsx must compute calendar dates in America/Lima timezone'
    );
    assert.ok(
      content.includes('tamano: 20'),
      'HistorialCierresPage.tsx must paginate by 20 per RN-110 / RV-131'
    );
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Open Register Pinning & PDF Button Guarding
  // --------------------------------------------------------------------------
  console.log('\n5. Testing Open Register Pinning & PDF Action Guarding:');

  test('esCajaAbierta oracle correctly flags open register', () => {
    assert.equal(esCajaAbiertaOracle({ esAbierta: true }), true);
    assert.equal(esCajaAbiertaOracle({ estado: 'Abierta' }), true);
    assert.equal(esCajaAbiertaOracle({ estado: 'abierta' }), true);
    assert.equal(esCajaAbiertaOracle({ fechaCierre: null, montoCierre: null }), true);
    assert.equal(
      esCajaAbiertaOracle({ estado: 'Cerrada', fechaCierre: '2026-10-18T16:00:00Z', montoCierre: 300 }),
      false
    );
  });

  test('Verify HistorialCierresPage.tsx and CierreDetalleModal.tsx disable PDF for open registers', () => {
    const pagePath = path.resolve('frontend/src/pages/HistorialCierresPage.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');

    assert.ok(
      pageContent.includes('!abierta ?') && pageContent.includes('PDF no disponible para caja abierta'),
      'HistorialCierresPage.tsx must disable PDF button when register is open'
    );

    const modalPath = path.resolve('frontend/src/components/caja/CierreDetalleModal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(
      modalContent.includes('disabled={cargando || !detalle || descargandoPdf || esAbierta}'),
      'CierreDetalleModal.tsx must disable DESCARGAR PDF button when esAbierta is true'
    );
    assert.ok(
      modalContent.includes("title={esAbierta ? 'No disponible mientras la caja esté abierta'"),
      'CierreDetalleModal.tsx must set tooltip explaining why PDF is disabled for open register'
    );
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Detail Modal Financial Breakdown (8 Metrics)
  // --------------------------------------------------------------------------
  console.log('\n6. Testing CierreDetalleModal.tsx 8-Metric Financial Breakdown & Cuadre:');

  test('Cuadre badge oracle renders exact labels, signs, and styles', () => {
    // 1. Cuadra
    const bCuadra = calcularCuadreBadge({
      montoInicial: 100,
      ventasEfectivo: 200,
      ventasYape: 50,
      totalVentas: 250,
      efectivoEsperado: 300,
      efectivoContado: 300,
      diferencia: 0,
      estado: 'Cerrada',
    });
    assert.equal(bCuadra.tipo, 'cuadra');
    assert.equal(bCuadra.texto, 'Cuadra (S/ 0.00)');
    assert.equal(bCuadra.colorClase, 'emerald');

    // 2. Sobrante
    const bSobrante = calcularCuadreBadge({
      montoInicial: 100,
      ventasEfectivo: 200,
      ventasYape: 50,
      totalVentas: 250,
      efectivoEsperado: 300,
      efectivoContado: 305,
      diferencia: 5,
      estado: 'Cerrada',
    });
    assert.equal(bSobrante.tipo, 'sobrante');
    assert.equal(bSobrante.texto, 'Sobrante (+S/ 5.00)');
    assert.equal(bSobrante.colorClase, 'amber');

    // 3. Faltante
    const bFaltante = calcularCuadreBadge({
      montoInicial: 100,
      ventasEfectivo: 200,
      ventasYape: 50,
      totalVentas: 250,
      efectivoEsperado: 300,
      efectivoContado: 290,
      diferencia: -10,
      estado: 'Cerrada',
    });
    assert.equal(bFaltante.tipo, 'faltante');
    assert.equal(bFaltante.texto, 'Faltante (-S/ 10.00)');
    assert.equal(bFaltante.colorClase, 'rose');

    // 4. Abierta
    const bAbierta = calcularCuadreBadge({
      montoInicial: 100,
      ventasEfectivo: 0,
      ventasYape: 0,
      totalVentas: 0,
      efectivoEsperado: 100,
      efectivoContado: null,
      diferencia: null,
      estado: 'Abierta',
    });
    assert.equal(bAbierta.tipo, 'abierta');
    assert.equal(bAbierta.texto, 'Turno en curso (Sin Arqueo)');
  });

  test('Verify CierreDetalleModal.tsx contains all 8 metrics and print styles', () => {
    const modalPath = path.resolve('frontend/src/components/caja/CierreDetalleModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Metric 1: Monto inicial
    assert.ok(content.includes('Monto Inicial (Apertura):'), 'Must display Monto Inicial');
    // Metric 2: Ventas en efectivo
    assert.ok(content.includes('Ventas en Efectivo:'), 'Must display Ventas Efectivo');
    // Metric 3: Ventas Yape / QR
    assert.ok(content.includes('Ventas por Yape / QR:'), 'Must display Ventas Yape');
    // Metric 4: Total Ventas Facturadas
    assert.ok(content.includes('TOTAL VENTAS FACTURADAS:'), 'Must display Total Ventas');
    // Metric 5: Efectivo Físico Esperado
    assert.ok(content.includes('Efectivo Físico Esperado:'), 'Must display Efectivo Esperado');
    // Metric 6: Efectivo Físico Contado
    assert.ok(content.includes('Efectivo Físico Contado:'), 'Must display Efectivo Contado');
    // Metric 7: Diferencia de Cuadre
    assert.ok(content.includes('Diferencia de Cuadre:'), 'Must display Diferencia de Cuadre');
    // Metric 8: Estado de Cuadre badge
    assert.ok(content.includes('Estado: Cuadra (S/ 0.00)'), 'Must display Cuadra badge');
    assert.ok(content.includes('Estado: Sobrante (+S/'), 'Must display Sobrante badge');
    assert.ok(content.includes('Estado: Faltante (-S/'), 'Must display Faltante badge');

    // Print CSS styles
    assert.ok(content.includes('@media print'), 'Must include @media print style sheet');
    assert.ok(content.includes('.no-print'), 'Must hide elements with .no-print class');
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Subsequent Void Adjustments (RN-113)
  // --------------------------------------------------------------------------
  console.log('\n7. Testing Subsequent Void Adjustments (RN-113):');

  test('evaluarTieneAjustes oracle correctly identifies adjustments', () => {
    assert.equal(evaluarTieneAjustes({ tieneAjustesPosteriores: true }), true);
    assert.equal(evaluarTieneAjustes({ conAjustes: true }), true);
    assert.equal(
      evaluarTieneAjustes({
        ajustesPosteriores: [{ ventaId: 'v1', total: 50, montoAnulado: 50, motivo: 'Cancelado' }],
      }),
      true
    );
    assert.equal(evaluarTieneAjustes({ tieneAjustesPosteriores: false, conAjustes: false, ajustesPosteriores: [] }), false);
  });

  test('Verify CierreDetalleModal.tsx implements RN-113 warning banner, immutability note, and itemized table', () => {
    const modalPath = path.resolve('frontend/src/components/caja/CierreDetalleModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Warning alert
    assert.ok(
      content.includes('Cierre con ajustes posteriores (RN-113)'),
      'Must display "Cierre con ajustes posteriores (RN-113)" warning alert'
    );

    // Immutability explanation
    assert.ok(
      content.includes('el arqueo y balance histórico original permanecen estrictamente inmutables'),
      'Must explain historical snapshot immutability per RN-113'
    );

    // Section 5 title
    assert.ok(
      content.includes('Ventas Anuladas Posteriores al Cierre'),
      'Must display section "Ventas Anuladas Posteriores al Cierre"'
    );

    // Audit note
    assert.ok(
      content.includes('Nota de Auditoría per RN-113:'),
      'Must include "Nota de Auditoría per RN-113:" note'
    );

    // Clean omission when no observation
    assert.ok(
      content.includes('detalle.observacion && detalle.observacion.trim().length > 0'),
      'Must cleanly omit observation card when whitespace or empty'
    );
  });

  console.log('\n=================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEmpiricalSuite().catch((err) => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
