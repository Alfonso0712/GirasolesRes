/**
 * Guardia automática de arquitectura y calidad para mobile/src/.
 * FASE 11-1 - SUBPASO X-D
 *
 * Verifica:
 *   a) Tipos y aserciones: 0 any, 0 !, 0 @ts-ignore/@ts-expect-error, as != const bajo línea base.
 *   b) Grafo de dependencias: 0 importaciones circulares.
 *   c) Exportaciones sin uso (salvo lista explícita en línea base).
 *   d) Tamaños por archivo (componentes <= 150, resto <= 200) sin crecer sobre línea base.
 *   e) Capas: utils/config/types sin depender de capas superiores; ui sin depender de dominio/services/pages;
 *      components -> services de valor sin crecer sobre línea base.
 *   f) Reglas de negocio centralizadas: sin comparaciones directas de rol fuera de permisos/navigation,
 *      sin cálculos fiscales duplicados (1.18 / 700) fuera de utils/fiscal.ts ni RN-140 fuera de utils/pedidos.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOBILE_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(MOBILE_ROOT, 'src');
const BASELINE_PATH = path.join(__dirname, 'architecture-baseline.json');

const ROLES_DOMINIO = new Set([
  "'Administrador'",
  '"Administrador"',
  "'Cajero'",
  '"Cajero"',
  "'Mozo'",
  '"Mozo"',
  "'Cocinero'",
  '"Cocinero"',
]);

const ROLE_CHECK_ALLOWLIST = new Set([
  'src/config/permisos.ts',
  'src/config/navigation.ts',
  'src/config/demoAccounts.ts',
]);

const COMPONENT_LINE_LIMIT = 150;
const OTHER_LINE_LIMIT = 200;

function normalizePath(filePath) {
  return path.resolve(filePath).replace(/\\/g, '/').toLowerCase();
}

function toRelPath(filePath) {
  return path.relative(MOBILE_ROOT, filePath).replace(/\\/g, '/');
}

function isProdSourceFile(filePath) {
  const norm = normalizePath(filePath);
  const srcNorm = normalizePath(SRC_ROOT) + '/';
  if (!norm.startsWith(srcNorm)) return false;
  if (norm.endsWith('.d.ts')) return false;
  if (norm.includes('.test.') || norm.includes('.spec.')) return false;
  if (norm.includes('/src/test/')) return false;
  return true;
}

function isTestFile(filePath) {
  const norm = normalizePath(filePath);
  const srcNorm = normalizePath(SRC_ROOT) + '/';
  if (!norm.startsWith(srcNorm)) return false;
  return norm.includes('.test.') || norm.includes('.spec.');
}

function loadProgram() {
  const tsconfigPath = path.join(MOBILE_ROOT, 'tsconfig.app.json');
  const readResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (readResult.error) {
    throw new Error(`No se pudo leer ${tsconfigPath}`);
  }
  const parsed = ts.parseJsonConfigFileContent(readResult.config, ts.sys, MOBILE_ROOT);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const prodFiles = program.getSourceFiles().filter((sf) => isProdSourceFile(sf.fileName));
  const testFiles = program.getSourceFiles().filter((sf) => isTestFile(sf.fileName));
  return { program, options: parsed.options, prodFiles, testFiles };
}

function lineNumberAt(sf, pos) {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}

function collectImportsAndCycles(prodFiles, options) {
  const prodSet = new Set(prodFiles.map((sf) => toRelPath(sf.fileName)));
  const graph = new Map();
  const layerViolations = [];
  const legacyCompSvc = {};
  const legacyBaseLayer = {};

  for (const sf of prodFiles) {
    const rel = toRelPath(sf.fileName);
    const deps = new Set();
    graph.set(rel, deps);

    ts.forEachChild(sf, function scan(node) {
      let spec = null;
      let isTypeOnly = false;
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        spec = node.moduleSpecifier.text;
        isTypeOnly =
          ts.isImportDeclaration(node) &&
          (Boolean(node.importClause?.isTypeOnly) ||
            (Boolean(node.importClause?.namedBindings) &&
              ts.isNamedImports(node.importClause.namedBindings) &&
              node.importClause.namedBindings.elements.every((el) => el.isTypeOnly)));
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        spec = node.arguments[0].text;
      }

      if (spec) {
        const resolved = ts.resolveModuleName(spec, sf.fileName, options, ts.sys).resolvedModule;
        if (resolved) {
          const targetRel = toRelPath(resolved.resolvedFileName);
          if (prodSet.has(targetRel)) {
            deps.add(targetRel);
          }

          const line = lineNumberAt(sf, node.getStart(sf));
          if (
            (rel.startsWith('src/utils/') ||
              rel.startsWith('src/config/') ||
              rel.startsWith('src/types/')) &&
            /^src\/(services|components|pages|hooks)\//.test(targetRel)
          ) {
            if (rel === 'src/config/navigation.ts' && targetRel.startsWith('src/pages/')) {
              legacyBaseLayer[rel] = (legacyBaseLayer[rel] || 0) + 1;
            } else {
              layerViolations.push(`${rel}:${line}: capa base importa capa superior (${targetRel})`);
            }
          }

          if (rel.startsWith('src/components/ui/') && /^src\/(services|pages)\//.test(targetRel)) {
            layerViolations.push(`${rel}:${line}: componente UI importa ${targetRel}`);
          }

          if (
            rel.startsWith('src/components/ui/') &&
            targetRel.startsWith('src/components/') &&
            !targetRel.startsWith('src/components/ui/')
          ) {
            layerViolations.push(`${rel}:${line}: componente UI importa dominio (${targetRel})`);
          }

          if (
            rel.startsWith('src/components/') &&
            !rel.startsWith('src/components/ui/') &&
            targetRel.startsWith('src/services/') &&
            !isTypeOnly
          ) {
            legacyCompSvc[rel] = (legacyCompSvc[rel] || 0) + 1;
          }
        }
      }
      ts.forEachChild(node, scan);
    });
  }

  const state = new Map();
  const stack = [];
  const cycles = [];

  function dfs(node) {
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) || []) {
      const nextState = state.get(next) || 0;
      if (nextState === 1) {
        const idx = stack.indexOf(next);
        cycles.push([...stack.slice(idx), next].join(' -> '));
      } else if (nextState === 0) {
        dfs(next);
      }
    }
    stack.pop();
    state.set(node, 2);
  }

  for (const node of [...graph.keys()].sort()) {
    if ((state.get(node) || 0) === 0) dfs(node);
  }

  return { cycles, layerViolations, legacyCompSvc, legacyBaseLayer };
}

function collectExportsUsage(prodFiles, testFiles, options) {
  const declared = new Map();
  const used = new Map();
  const reexportedStar = new Set();

  function markUsed(fileRel, name) {
    if (!used.has(fileRel)) used.set(fileRel, new Set());
    used.get(fileRel).add(name);
  }

  function addDeclared(fileRel, name, kind) {
    if (!declared.has(fileRel)) declared.set(fileRel, []);
    const list = declared.get(fileRel);
    if (!list.some((item) => item.name === name)) {
      list.push({ name, kind });
    }
  }

  for (const sf of prodFiles) {
    const rel = toRelPath(sf.fileName);
    ts.forEachChild(sf, (node) => {
      const hasExport =
        Array.isArray(node.modifiers) &&
        node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const hasDefault =
        Array.isArray(node.modifiers) &&
        node.modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

      if (ts.isExportAssignment(node)) {
        addDeclared(rel, 'default', 'value');
        return;
      }
      if (!hasExport && !ts.isExportDeclaration(node)) return;

      if (hasDefault) {
        addDeclared(rel, 'default', 'value');
        return;
      }

      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            addDeclared(rel, decl.name.text, 'value');
          }
        }
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        addDeclared(rel, node.name.text, 'value');
      } else if (ts.isClassDeclaration(node) && node.name) {
        addDeclared(rel, node.name.text, 'value');
      } else if (ts.isEnumDeclaration(node)) {
        addDeclared(rel, node.name.text, 'value');
      } else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        addDeclared(rel, node.name.text, 'type');
      } else if (ts.isExportDeclaration(node)) {
        if (!node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const resolved = ts.resolveModuleName(
            node.moduleSpecifier.text,
            sf.fileName,
            options,
            ts.sys
          ).resolvedModule;
          if (resolved) reexportedStar.add(toRelPath(resolved.resolvedFileName));
        } else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          const isTypeReexport = Boolean(node.isTypeOnly);
          for (const spec of node.exportClause.elements) {
            const exportedName = spec.name.text;
            const kind = isTypeReexport || spec.isTypeOnly ? 'type' : 'value';
            addDeclared(rel, exportedName, kind);
            if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
              const resolved = ts.resolveModuleName(
                node.moduleSpecifier.text,
                sf.fileName,
                options,
                ts.sys
              ).resolvedModule;
              if (resolved) {
                const targetRel = toRelPath(resolved.resolvedFileName);
                const origName = spec.propertyName ? spec.propertyName.text : spec.name.text;
                markUsed(targetRel, origName);
              }
            }
          }
        }
      }
    });
  }

  for (const sf of [...prodFiles, ...testFiles]) {
    const isTest = isTestFile(sf.fileName);
    ts.forEachChild(sf, function scanImports(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const resolved = ts.resolveModuleName(
          node.moduleSpecifier.text,
          sf.fileName,
          options,
          ts.sys
        ).resolvedModule;
        if (resolved && node.importClause) {
          const targetRel = toRelPath(resolved.resolvedFileName);
          if (node.importClause.name) {
            markUsed(targetRel, 'default');
          }
          const nb = node.importClause.namedBindings;
          if (nb && ts.isNamespaceImport(nb)) {
            markUsed(targetRel, '*');
          } else if (nb && ts.isNamedImports(nb)) {
            for (const el of nb.elements) {
              const origName = el.propertyName ? el.propertyName.text : el.name.text;
              if (!isTest || targetRel.startsWith('src/')) {
                markUsed(targetRel, origName);
              }
            }
          }
        }
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const resolved = ts.resolveModuleName(
          node.arguments[0].text,
          sf.fileName,
          options,
          ts.sys
        ).resolvedModule;
        if (resolved) {
          markUsed(toRelPath(resolved.resolvedFileName), 'default');
        }
      }
      ts.forEachChild(node, scanImports);
    });
  }

  const unused = {};
  for (const [fileRel, exportsList] of [...declared.entries()].sort()) {
    if (reexportedStar.has(fileRel)) continue;
    const fileUsed = used.get(fileRel) || new Set();
    if (fileUsed.has('*')) continue;
    const missing = exportsList
      .filter((item) => item.kind === 'value' && !fileUsed.has(item.name))
      .map((item) => item.name)
      .sort();
    if (missing.length > 0) {
      unused[fileRel] = missing;
    }
  }
  return unused;
}

function collectAstAndSizeMetrics(prodFiles) {
  const anyFindings = [];
  const nonNullFindings = [];
  const tsIgnoreFindings = [];
  const asCastsByFile = {};
  const oversizedComponents = {};
  const oversizedOther = {};
  const roleComparisons = [];
  const duplicatedBusinessRules = [];

  for (const sf of prodFiles) {
    const rel = toRelPath(sf.fileName);
    const fullText = sf.getFullText();
    const lines = fullText.split(/\r?\n/);

    const isComponent = rel.startsWith('src/components/') && rel.endsWith('.tsx');
    if (isComponent && lines.length > COMPONENT_LINE_LIMIT) {
      oversizedComponents[rel] = lines.length;
    } else if (!isComponent && lines.length > OTHER_LINE_LIMIT) {
      oversizedOther[rel] = lines.length;
    }

    lines.forEach((lineText, idx) => {
      if (/(?:\/\/|\/\*)\s*@ts-(?:ignore|expect-error)\b/.test(lineText)) {
        tsIgnoreFindings.push(`${rel}:${idx + 1}: directiva @ts-ignore/@ts-expect-error prohibida`);
      }
    });

    ts.forEachChild(sf, function visit(node, parent) {
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        anyFindings.push(`${rel}:${lineNumberAt(sf, node.getStart(sf))}: tipo 'any' prohibido`);
      }

      if (ts.isNonNullExpression(node)) {
        nonNullFindings.push(
          `${rel}:${lineNumberAt(sf, node.getStart(sf))}: operador '!' (non-null assertion) prohibido`
        );
      }

      if (ts.isAsExpression(node) && node.type.getText(sf) !== 'const') {
        asCastsByFile[rel] = (asCastsByFile[rel] || 0) + 1;
      }

      if (
        ts.isBinaryExpression(node) &&
        (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
          node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken ||
          node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
          node.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken)
      ) {
        const leftText = node.left.getText(sf);
        const rightText = node.right.getText(sf);
        if ((ROLES_DOMINIO.has(leftText) || ROLES_DOMINIO.has(rightText)) && !ROLE_CHECK_ALLOWLIST.has(rel)) {
          roleComparisons.push(
            `${rel}:${lineNumberAt(sf, node.getStart(sf))}: comparación directa de rol (${node.getText(sf)})`
          );
        }
      }

      if (ts.isNumericLiteral(node) && rel !== 'src/utils/fiscal.ts') {
        if (node.text === '1.18') {
          duplicatedBusinessRules.push(
            `${rel}:${lineNumberAt(sf, node.getStart(sf))}: literal fiscal 1.18 fuera de utils/fiscal.ts`
          );
        } else if (
          node.text === '700' &&
          parent &&
          ts.isBinaryExpression(parent) &&
          (parent.operatorToken.kind === ts.SyntaxKind.GreaterThanEqualsToken ||
            parent.operatorToken.kind === ts.SyntaxKind.GreaterThanToken ||
            parent.operatorToken.kind === ts.SyntaxKind.LessThanToken ||
            parent.operatorToken.kind === ts.SyntaxKind.LessThanEqualsToken)
        ) {
          duplicatedBusinessRules.push(
            `${rel}:${lineNumberAt(sf, node.getStart(sf))}: umbral de boleta 700 fuera de utils/fiscal.ts`
          );
        }
      }

      if (
        ts.isArrayLiteralExpression(node) &&
        rel !== 'src/utils/pedidos.ts' &&
        node.elements.length === 4 &&
        node.elements.every((el) => ts.isStringLiteral(el))
      ) {
        const vals = node.elements.map((el) => el.text).sort().join(',');
        if (vals === 'Entrada,Extra,Refresco,Segundo') {
          duplicatedBusinessRules.push(
            `${rel}:${lineNumberAt(sf, node.getStart(sf))}: ROLES_COMPONENTE duplicado fuera de utils/pedidos.ts`
          );
        }
      }

      ts.forEachChild(node, (child) => visit(child, node));
    });
  }

  return {
    anyFindings,
    nonNullFindings,
    tsIgnoreFindings,
    asCastsByFile,
    oversizedComponents,
    oversizedOther,
    roleComparisons,
    duplicatedBusinessRules,
  };
}

function compareRatchetMap(actualMap, baselineMap, label) {
  const errors = [];
  for (const [fileRel, actualVal] of Object.entries(actualMap)) {
    const allowed = baselineMap[fileRel];
    if (allowed === undefined) {
      errors.push(`${fileRel}: ${label} (${actualVal}) supera el límite y no está en línea base`);
    } else if (actualVal > allowed) {
      errors.push(`${fileRel}: ${label} creció de ${allowed} (línea base) a ${actualVal}`);
    }
  }
  return errors;
}

function compareUnusedExports(unusedMap, allowedMap) {
  const errors = [];
  for (const [fileRel, names] of Object.entries(unusedMap)) {
    const allowed = new Set(allowedMap[fileRel] || []);
    const unexpected = names.filter((n) => !allowed.has(n));
    if (unexpected.length > 0) {
      errors.push(`${fileRel}: exportaciones sin uso no autorizadas: ${unexpected.join(', ')}`);
    }
  }
  return errors;
}

function main() {
  const measureOnly = process.argv.includes('--measure');
  const { options, prodFiles, testFiles } = loadProgram();
  const { cycles, layerViolations, legacyCompSvc, legacyBaseLayer } = collectImportsAndCycles(
    prodFiles,
    options
  );
  const unusedExports = collectExportsUsage(prodFiles, testFiles, options);
  const astMetrics = collectAstAndSizeMetrics(prodFiles);

  if (measureOnly) {
    console.log(
      JSON.stringify(
        {
          anyCount: astMetrics.anyFindings.length,
          nonNullCount: astMetrics.nonNullFindings.length,
          tsIgnoreCount: astMetrics.tsIgnoreFindings.length,
          cyclesCount: cycles.length,
          roleComparisonsCount: astMetrics.roleComparisons.length,
          duplicatedBusinessRulesCount: astMetrics.duplicatedBusinessRules.length,
          layerViolationsCount: layerViolations.length,
          allowedAsCastsByFile: astMetrics.asCastsByFile,
          oversizedComponents: astMetrics.oversizedComponents,
          oversizedOther: astMetrics.oversizedOther,
          legacyBaseLayerImportsByFile: legacyBaseLayer,
          legacyComponentServiceImportsByFile: legacyCompSvc,
          allowedUnusedExports: unusedExports,
        },
        null,
        2
      )
    );
    return;
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`[ERROR] No existe la línea base en ${toRelPath(BASELINE_PATH)}`);
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const violations = [
    ...astMetrics.anyFindings,
    ...astMetrics.nonNullFindings,
    ...astMetrics.tsIgnoreFindings,
    ...cycles.map((c) => `Ciclo de importación detectado: ${c}`),
    ...layerViolations,
    ...astMetrics.roleComparisons,
    ...astMetrics.duplicatedBusinessRules,
    ...compareRatchetMap(astMetrics.asCastsByFile, baseline.allowedAsCastsByFile, "aserciones 'as'"),
    ...compareRatchetMap(
      astMetrics.oversizedComponents,
      baseline.oversizedComponents,
      `líneas de componente (límite ${COMPONENT_LINE_LIMIT})`
    ),
    ...compareRatchetMap(
      astMetrics.oversizedOther,
      baseline.oversizedOther,
      `líneas de módulo (límite ${OTHER_LINE_LIMIT})`
    ),
    ...compareRatchetMap(
      legacyBaseLayer,
      baseline.legacyBaseLayerImportsByFile || {},
      'imports de vista en config/navigation'
    ),
    ...compareRatchetMap(
      legacyCompSvc,
      baseline.legacyComponentServiceImportsByFile,
      'imports de servicio en componente'
    ),
    ...compareUnusedExports(unusedExports, baseline.allowedUnusedExports),
  ];

  if (violations.length > 0) {
    console.error('\n[ERROR] Se detectaron violaciones de arquitectura en mobile/src/:');
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }

  console.log(
    `[OK] check-architecture: ${prodFiles.length} archivos de producción revisados | 0 any | 0 ! | 0 @ts-ignore | 0 ciclos | 0 comparaciones de rol | reglas a-f en verde.`
  );
}

main();
