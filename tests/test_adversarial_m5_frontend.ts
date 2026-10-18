/**
 * Empirical Adversarial Test Harness for Milestone 5 Frontend:
 * CUS 13 (Caja y Cierre de Caja) White-Box Stress & Vulnerability Testing
 * Evaluates: Double-click / Idempotency, Focus Trap / Tab Loop / Esc,
 * Touch Targets (>=44px), Zero-Global-Scroll Container, Empty States, Tabular-nums.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = path.resolve('frontend/src');

interface Finding {
  component: string;
  category: 'IDEMPOTENCY' | 'FOCUS_TRAP_ESC' | 'TOUCH_TARGETS' | 'CONTAINER_LAYOUT' | 'EMPTY_STATES' | 'TABULAR_NUMS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  line?: number;
  snippet?: string;
}

const findings: Finding[] = [];

// ============================================================================
// 1. FILE INSPECTION HELPERS
// ============================================================================

function readFileContent(relPath: string): { content: string; lines: string[] } {
  const fullPath = path.join(FRONTEND_DIR, relPath);
  assert.ok(fs.existsSync(fullPath), `Target file does not exist: ${fullPath}`);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return { content, lines: content.split('\n') };
}

// ============================================================================
// 2. ADVERSARIAL PROBES
// ============================================================================

console.log('=================================================================');
console.log('EMPIRICAL CHALLENGER M5-2: FRONTEND ADVERSARIAL PROBING');
console.log('=================================================================\n');

// ----------------------------------------------------------------------------
// Probe 1: Rapid Double-Click & Token Idempotency
// ----------------------------------------------------------------------------
console.log('1. Probing Double-Click Debouncing & Token Idempotency:');

{
  // AbrirCajaModal
  const { content, lines } = readFileContent('components/caja/AbrirCajaModal.tsx');
  const hasGuard = content.includes('if (procesando) return;');
  const hasDisabled = content.includes('disabled={procesando}');
  const hasIdempotency = content.includes('crypto.randomUUID()');
  
  assert.ok(hasGuard, 'AbrirCajaModal must have if (procesando) return guard');
  assert.ok(hasDisabled, 'AbrirCajaModal confirm button must be disabled when processing');
  assert.ok(hasIdempotency, 'AbrirCajaModal must generate UUID solicitudId for idempotency');
  console.log('  [PASS] AbrirCajaModal: Double-click guard, disabled state, and UUID token verified.');

  // CerrarCajaModal
  const cerrar = readFileContent('components/caja/CerrarCajaModal.tsx');
  const hasCerrarGuard = cerrar.content.includes('if (procesandoCierre) return;');
  const hasCerrarDisabled = cerrar.content.includes('disabled={procesandoCierre}');
  const hasCerrarIdempotency = cerrar.content.includes('crypto.randomUUID()');

  assert.ok(hasCerrarGuard, 'CerrarCajaModal must have if (procesandoCierre) return guard');
  assert.ok(hasCerrarDisabled, 'CerrarCajaModal confirm button must be disabled when processing');
  assert.ok(hasCerrarIdempotency, 'CerrarCajaModal must generate UUID solicitudId for idempotency');
  console.log('  [PASS] CerrarCajaModal: Double-click guard, disabled state, and UUID token verified.');

  // CierreDetalleModal PDF download
  const detalle = readFileContent('components/caja/CierreDetalleModal.tsx');
  const hasDetallePdfGuard = detalle.content.includes('if (descargandoPdf) return;');
  if (!hasDetallePdfGuard) {
    findings.push({
      component: 'CierreDetalleModal.tsx',
      category: 'IDEMPOTENCY',
      severity: 'LOW',
      description: 'handleDescargarPdf relies on button disabled={...} without a defensive synchronous guard (if (descargandoPdf) return;) at the start of the function.',
      line: 54,
      snippet: 'const handleDescargarPdf = async () => { if (!cajaId) return; setDescargandoPdf(true);'
    });
    console.log('  [WARN] CierreDetalleModal: handleDescargarPdf lacks synchronous in-function re-entry guard.');
  }

  // HistorialCierresPage PDF download
  const historial = readFileContent('pages/HistorialCierresPage.tsx');
  const hasHistorialPdfGuard = historial.content.includes('if (descargandoPdfId) return;') || historial.content.includes('if (descargandoPdfId === cajaId) return;');
  if (!hasHistorialPdfGuard) {
    findings.push({
      component: 'HistorialCierresPage.tsx',
      category: 'IDEMPOTENCY',
      severity: 'LOW',
      description: 'handleDescargarPdf relies on button disabled={...} without a defensive synchronous guard at function entry.',
      line: 174,
      snippet: 'const handleDescargarPdf = async (cajaId: string) => {'
    });
    console.log('  [WARN] HistorialCierresPage: handleDescargarPdf lacks synchronous in-function re-entry guard.');
  }
}

// ----------------------------------------------------------------------------
// Probe 2: Modal Focus Trapping, Tab Key Loops & Escape Key Dismissal
// ----------------------------------------------------------------------------
console.log('\n2. Probing Modal Focus Trapping, Tab Key Loops & Escape Dismissal:');

const modals = [
  { file: 'components/caja/CierreDetalleModal.tsx', name: 'CierreDetalleModal' },
  { file: 'components/caja/AbrirCajaModal.tsx', name: 'AbrirCajaModal' },
  { file: 'components/caja/CerrarCajaModal.tsx', name: 'CerrarCajaModal' },
  { file: 'components/caja/ContadorDenominacionesModal.tsx', name: 'ContadorDenominacionesModal' },
];

for (const m of modals) {
  const { content, lines } = readFileContent(m.file);

  // Check 2.1: Global Escape listener vs local onKeyDown
  const hasGlobalEscListener = content.includes("window.addEventListener('keydown'") || content.includes('addEventListener("keydown"');
  const hasLocalOnKeyDown = content.includes("e.key === 'Escape'") || content.includes('e.key === "Escape"');

  if (!hasGlobalEscListener && hasLocalOnKeyDown) {
    findings.push({
      component: m.file,
      category: 'FOCUS_TRAP_ESC',
      severity: 'HIGH',
      description: `${m.name} binds Escape key only on a non-focusable overlay <div> via onKeyDown, rather than a global window keydown listener or focused container. If focus is on the triggering element or body, pressing Escape will fail to dismiss the modal.`,
    });
    console.log(`  [FAIL] ${m.name}: Escape listener is localized on non-focused overlay div (no window.addEventListener).`);
  } else if (hasGlobalEscListener) {
    console.log(`  [PASS] ${m.name}: Escape key handled via window listener.`);
  }

  // Check 2.2: Focus Trapping and Tab Key Loop
  const hasTabLoop = content.includes("e.key === 'Tab'") || content.includes('e.key === "Tab"') || content.includes('focus-trap') || content.includes('trapFocus');
  if (!hasTabLoop) {
    findings.push({
      component: m.file,
      category: 'FOCUS_TRAP_ESC',
      severity: 'HIGH',
      description: `${m.name} has NO focus trapping or Tab key loop mechanism. Pressing Tab allows focus to escape outside the modal into background DOM elements.`,
    });
    console.log(`  [FAIL] ${m.name}: Missing Tab key loop / focus trap.`);
  } else {
    console.log(`  [PASS] ${m.name}: Focus trapping / Tab loop implemented.`);
  }

  // Check 2.3: Initial focus on open
  const hasInitialFocus = content.includes('.focus()');
  if (!hasInitialFocus) {
    findings.push({
      component: m.file,
      category: 'FOCUS_TRAP_ESC',
      severity: 'MEDIUM',
      description: `${m.name} does not place initial focus on any interactive element upon opening. Focus remains on the background element that triggered the modal.`,
    });
    console.log(`  [FAIL] ${m.name}: No initial focus placed on open.`);
  } else {
    console.log(`  [PASS] ${m.name}: Initial focus placement found.`);
  }
}

// ----------------------------------------------------------------------------
// Probe 3: Screen Resizing, Mobile Responsiveness & Touch Targets (>=44px)
// ----------------------------------------------------------------------------
console.log('\n3. Probing Touch Targets (>= 44px) and Container Scroll Layout:');

// Regex to find interactive classes with < 44px heights/widths
const sub44Regex = /min-[hw]-\[(?:3[0-9]|2[0-9]|40|41|42|43)px\]|w-(?:8|9|10)\s+h-(?:8|9|10)|h-(?:8|9|10)\s+w-(?:8|9|10)/;

const targetFiles = [
  'pages/HistorialCierresPage.tsx',
  'components/caja/CierreDetalleModal.tsx',
  'components/caja/AbrirCajaModal.tsx',
  'components/caja/CerrarCajaModal.tsx',
  'components/caja/ContadorDenominacionesModal.tsx',
  'pages/CobrosPage.tsx',
];

for (const relPath of targetFiles) {
  const { lines } = readFileContent(relPath);
  lines.forEach((line, idx) => {
    // Only inspect interactive elements (button, input, select, a)
    if (line.includes('<button') || line.includes('<input') || line.includes('<select') || line.includes('type="button"') || line.includes('type="submit"')) {
      const match = line.match(sub44Regex);
      if (match) {
        findings.push({
          component: relPath,
          category: 'TOUCH_TARGETS',
          severity: 'MEDIUM',
          description: `Interactive touch target is below WCAG 2.5.5 minimum 44px (${match[0]}).`,
          line: idx + 1,
          snippet: line.trim()
        });
      }
    }
    // Also check if any button in preceding lines had sub-44 min-h/min-w
    if (line.includes('min-h-[36px]') || line.includes('min-w-[36px]') || line.includes('min-h-[40px]')) {
      // Check surrounding lines for button/input
      const context = lines.slice(Math.max(0, idx - 2), idx + 3).join(' ');
      if (context.includes('<button') || context.includes('<input') || context.includes('type=')) {
        findings.push({
          component: relPath,
          category: 'TOUCH_TARGETS',
          severity: 'MEDIUM',
          description: `Sub-44px touch target dimension detected: ${line.trim().substring(0, 80)}`,
          line: idx + 1,
          snippet: line.trim()
        });
      }
    }
  });
}

// Container scroll layout check
{
  const historial = readFileContent('pages/HistorialCierresPage.tsx');
  const cobros = readFileContent('pages/CobrosPage.tsx');
  const mainLayout = readFileContent('layouts/MainLayout.tsx');

  assert.ok(mainLayout.content.includes('overflow-hidden'), 'MainLayout main container has overflow-hidden');

  // Does HistorialCierresPage provide its own scroll container (h-full overflow-y-auto or flex-1 overflow-y-auto)?
  const hasPageScroll = historial.content.includes('overflow-y-auto') && (historial.content.includes('h-full') || historial.content.includes('flex-1'));
  if (!hasPageScroll) {
    findings.push({
      component: 'pages/HistorialCierresPage.tsx',
      category: 'CONTAINER_LAYOUT',
      severity: 'HIGH',
      description: 'HistorialCierresPage root element (<div className="space-y-6 ...">) lacks "h-full overflow-y-auto" or "flex-1 overflow-y-auto". Inside MainLayout\'s overflow-hidden container, content exceeding viewport height (such as 20 table rows) will clip at the bottom, making pagination controls inaccessible.',
      line: 188,
      snippet: '<div className="space-y-6 animate-fade-in text-[#482813]">'
    });
    console.log('  [FAIL] HistorialCierresPage: Missing root scroll container inside unscrollable MainLayout.');
  } else {
    console.log('  [PASS] HistorialCierresPage: Root scroll container verified.');
  }

  // CobrosPage
  const hasCobrosScroll = cobros.content.includes('h-full flex flex-col overflow-hidden') && cobros.content.includes('flex-1 overflow-y-auto min-h-0');
  assert.ok(hasCobrosScroll, 'CobrosPage must have zero-global-scroll architecture');
  console.log('  [PASS] CobrosPage: Zero-global-scroll architecture verified.');
}

// ----------------------------------------------------------------------------
// Probe 4: Empty State Rendering
// ----------------------------------------------------------------------------
console.log('\n4. Probing Empty State Rendering:');

{
  // HistorialCierresPage
  const historial = readFileContent('pages/HistorialCierresPage.tsx');
  const hasMsg185 = historial.content.includes('MSG-185') || historial.content.includes('No se encontraron cierres de caja con ese criterio');
  const hasMsg187 = historial.content.includes('MSG-187') || historial.content.includes('Aún no hay cierres de caja registrados');
  const hasMsg186 = historial.content.includes('MSG-186') || historial.content.includes('No se pudo cargar el historial de cierres');

  assert.ok(hasMsg185, 'HistorialCierresPage must handle empty filter state MSG-185');
  assert.ok(hasMsg187, 'HistorialCierresPage must handle zero closures state MSG-187');
  assert.ok(hasMsg186, 'HistorialCierresPage must handle load error state MSG-186');
  console.log('  [PASS] HistorialCierresPage: Empty filter (MSG-185), zero closures (MSG-187), and error (MSG-186) verified.');

  // CierreDetalleModal
  const detalle = readFileContent('components/caja/CierreDetalleModal.tsx');
  const hasPlatosEmpty = detalle.content.includes('Sin ventas de platos registradas');
  const hasObsOmit = detalle.content.includes('detalle.observacion && detalle.observacion.trim().length > 0');
  const hasAdjustmentsOmit = detalle.content.includes('tieneAjustes &&');

  assert.ok(hasPlatosEmpty, 'CierreDetalleModal must render empty message when 0 dishes sold');
  assert.ok(hasObsOmit, 'CierreDetalleModal must cleanly omit observation when empty');
  assert.ok(hasAdjustmentsOmit, 'CierreDetalleModal must cleanly omit adjustments when none');
  console.log('  [PASS] CierreDetalleModal: 0 dishes sold, empty observation, and 0 adjustments verified.');

  // CobrosPage
  const cobros = readFileContent('pages/CobrosPage.tsx');
  const hasCobrosEmpty = cobros.content.includes('No hay pedidos pendientes de cobro');
  assert.ok(hasCobrosEmpty, 'CobrosPage must handle 0 uncollected orders');
  console.log('  [PASS] CobrosPage: 0 uncollected orders empty state verified.');
}

// ----------------------------------------------------------------------------
// Probe 5: Currency Display Formatting Consistency (`tabular-nums`)
// ----------------------------------------------------------------------------
console.log('\n5. Probing Currency Formatting & tabular-nums:');

for (const relPath of targetFiles) {
  const { lines } = readFileContent(relPath);
  lines.forEach((line, idx) => {
    // Check if line renders "S/" and a numerical variable/toFixed, but does NOT contain tabular-nums
    if (line.includes('S/') && (line.includes('.toFixed(2)') || line.includes('Number(') || line.includes('monto') || line.includes('total') || line.includes('precio'))) {
      const hasTabularNums = line.includes('tabular-nums');
      // Also check if immediate parent container or wrapper had tabular-nums
      const prevLine = lines[idx - 1] || '';
      const prevPrevLine = lines[idx - 2] || '';
      const contextHasTabular = prevLine.includes('tabular-nums') || prevPrevLine.includes('tabular-nums');

      if (!hasTabularNums && !contextHasTabular) {
        findings.push({
          component: relPath,
          category: 'TABULAR_NUMS',
          severity: 'LOW',
          description: `Currency amount "S/" rendered without tabular-nums font-feature: ${line.trim()}`,
          line: idx + 1,
          snippet: line.trim()
        });
      }
    }
  });
}

const tabularGaps = findings.filter(f => f.category === 'TABULAR_NUMS');
console.log(`  [*] Identified ${tabularGaps.length} places where currency amounts miss tabular-nums styling.`);

// ============================================================================
// 3. FINDINGS SUMMARY
// ============================================================================

console.log('\n=================================================================');
console.log('FINDINGS MATRIX SUMMARY:');
console.log('=================================================================');

const criticals = findings.filter(f => f.severity === 'CRITICAL');
const highs = findings.filter(f => f.severity === 'HIGH');
const mediums = findings.filter(f => f.severity === 'MEDIUM');
const lows = findings.filter(f => f.severity === 'LOW');

console.log(`Total Findings : ${findings.length}`);
console.log(`  - CRITICAL   : ${criticals.length}`);
console.log(`  - HIGH       : ${highs.length}`);
console.log(`  - MEDIUM     : ${mediums.length}`);
console.log(`  - LOW        : ${lows.length}`);

console.log('\nDetailed Findings:');
findings.forEach((f, i) => {
  console.log(`[${i + 1}] [${f.severity}] [${f.category}] ${f.component}${f.line ? `:${f.line}` : ''}`);
  console.log(`    ${f.description}`);
  if (f.snippet) console.log(`    Snippet: ${f.snippet}`);
});

console.log('\n=================================================================');
const verdict = (criticals.length > 0 || highs.length > 0 || mediums.length > 0) ? 'REQUEST_CHANGES' : 'APPROVE';
console.log(`CHALLENGER VERDICT: ${verdict}`);
console.log('=================================================================\n');

// Write machine-readable findings to a temporary JSON or let test runner finish
fs.writeFileSync(
  path.resolve('.agents/teamwork/challenger_m5_2/findings.json'),
  JSON.stringify({ findings, verdict, summary: { total: findings.length, critical: criticals.length, high: highs.length, medium: mediums.length, low: lows.length } }, null, 2)
);
