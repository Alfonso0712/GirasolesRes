/**
 * Guardia automática contra reglas CSS/Tailwind que parten palabras letra por letra.
 * FASE 9.1 - SUBPASO W-F
 *
 * Verifica en mobile/src/ que no existan utilidades ni declaraciones como:
 * - break-all / [word-break:break-all] / word-break: break-all
 * - overflow-wrap: anywhere / [overflow-wrap:anywhere]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html']);

const FORBIDDEN_PATTERNS = [
  {
    name: 'break-all',
    regex: /(?:^|[\s"'`:[])break-all(?=$|[\s"'`:;\]])/,
  },
  {
    name: 'word-break: break-all',
    regex: /word-break\s*:\s*break-all/i,
  },
  {
    name: 'overflow-wrap: anywhere',
    regex: /overflow-wrap\s*:\s*anywhere/i,
  },
];

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function runLayoutCheck() {
  const files = collectFiles(SRC_DIR);
  const violations = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.regex.test(line)) {
          const relPath = path.relative(path.resolve(__dirname, '..'), filePath);
          violations.push(`${relPath}:${i + 1}: regla prohibida "${pattern.name}"`);
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n[ERROR] Se detectaron reglas que parten palabras en mobile/src/:');
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }

  console.log(
    `[OK] check-layout-rules: ${files.length} archivos revisados en mobile/src/ sin reglas prohibidas.`
  );
}

runLayoutCheck();
