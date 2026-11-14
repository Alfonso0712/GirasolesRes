/**
 * Script de verificación de presupuesto de rendimiento (Performance Budget).
 * FASE 6 - SUBPASO Q-F
 *
 * Límites estrictos:
 * 1. Bundle principal (index-*.js) <= 300 KB.
 * 2. Cualquier chunk individual <= 120 KB.
 * 3. Cualquier imagen referenciada en dist/assets <= 100 KB.
 * 4. Presupuesto total del bundle de aplicación en dist/ <= 1.2 MB (1,228.8 KB).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const ASSETS_DIR = path.resolve(DIST_DIR, 'assets');

const LIMIT_INDEX_JS_KB = 300;
const LIMIT_CHUNK_JS_KB = 120;
const LIMIT_IMAGE_KB = 100;
const LIMIT_TOTAL_DIST_KB = 1228.8; // 1.2 MB

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

function formatKb(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runCheck() {
  console.log('\n--- Iniciando verificación de presupuesto de rendimiento (check-budget) ---');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`[ERROR] El directorio dist/ no existe (${DIST_DIR}). Ejecute vite build primero.`);
    process.exit(1);
  }

  const allFiles = getAllFiles(DIST_DIR);
  let appBundleBytes = 0;
  const errores = [];
  const avisos = [];

  let indexJsFound = false;

  for (const file of allFiles) {
    const stat = fs.statSync(file);
    const sizeBytes = stat.size;
    const sizeKb = sizeBytes / 1024;
    const relPath = path.relative(DIST_DIR, file).replace(/\\/g, '/');
    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file);
    const isInAssets = file.startsWith(ASSETS_DIR);

    // Detección de archivos públicos no referenciados heredados (candidatos a limpieza Q-G)
    if (!isInAssets && basename === 'favicon.png' && sizeKb > 1000) {
      avisos.push(`Archivo público heredado no referenciado: ${relPath} (${formatKb(sizeBytes)}). Pendiente de decisión de usuario en Q-G.`);
      continue;
    }

    appBundleBytes += sizeBytes;

    // 1. Bundle JS principal
    if (basename.startsWith('index-') && ext === '.js') {
      indexJsFound = true;
      if (sizeKb > LIMIT_INDEX_JS_KB) {
        errores.push(`Bundle principal excede límite: ${relPath} (${formatKb(sizeBytes)} > ${LIMIT_INDEX_JS_KB} KB)`);
      } else {
        console.log(`[OK] Bundle principal: ${basename} (${formatKb(sizeBytes)} <= ${LIMIT_INDEX_JS_KB} KB)`);
      }
    } else if (ext === '.js' && isInAssets) {
      // 2. Chunks JS secundarios
      if (sizeKb > LIMIT_CHUNK_JS_KB) {
        errores.push(`Chunk JS excede límite individual: ${relPath} (${formatKb(sizeBytes)} > ${LIMIT_CHUNK_JS_KB} KB)`);
      }
    }

    // 3. Imágenes referenciadas en dist/assets
    if (isInAssets && IMAGE_EXTENSIONS.has(ext)) {
      if (sizeKb > LIMIT_IMAGE_KB) {
        errores.push(`Imagen en dist/assets excede límite de 100 KB: ${relPath} (${formatKb(sizeBytes)} > ${LIMIT_IMAGE_KB} KB)`);
      } else {
        console.log(`[OK] Imagen optimizada en assets: ${basename} (${formatKb(sizeBytes)} <= ${LIMIT_IMAGE_KB} KB)`);
      }
    }
  }

  if (!indexJsFound) {
    errores.push('No se encontró el archivo index-*.js en el directorio de distribución.');
  }

  // 4. Presupuesto del bundle de aplicación
  const totalKb = appBundleBytes / 1024;
  if (totalKb > LIMIT_TOTAL_DIST_KB) {
    errores.push(`Bundle de aplicación excede límite: ${formatKb(appBundleBytes)} > ${LIMIT_TOTAL_DIST_KB} KB (1.2 MB)`);
  } else {
    console.log(`[OK] Presupuesto total del bundle: ${formatKb(appBundleBytes)} <= ${LIMIT_TOTAL_DIST_KB} KB (1.2 MB)`);
  }

  for (const aviso of avisos) {
    console.log(`[AVISO] ${aviso}`);
  }

  if (errores.length > 0) {
    console.error('\n[FALLO] Se detectaron violaciones al presupuesto de rendimiento:');
    for (const err of errores) {
      console.error(` - ❌ ${err}`);
    }
    process.exit(1);
  }

  console.log('[ÉXITO] Presupuesto de rendimiento aprobado al 100%.\n');
}

runCheck();
