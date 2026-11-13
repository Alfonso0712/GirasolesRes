#!/usr/bin/env node

/**
 * Script de verificación automática de conexión y blindaje contra regresiones.
 * No modificar sin actualizar mobile/CONNECTION.md y AGENTS.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_MOBILE = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_MOBILE, 'src');
const DIST_DIR = path.join(ROOT_MOBILE, 'dist');

export const URL_ESPERADA = 'https://girasoles.astrazynk.pp.ua/api';
export const HOST_BLOQUEADO = 'girasolesres.pp.ua';

function leerArchivoSeguro(rutaRelativa) {
  const rutaCompleta = path.join(ROOT_MOBILE, rutaRelativa);
  if (!fs.existsSync(rutaCompleta)) {
    console.error(`[ERROR] Archivo requerido no encontrado: ${rutaRelativa}`);
    process.exit(1);
  }
  return fs.readFileSync(rutaCompleta, 'utf-8');
}

function listarArchivosRecursivo(directorio) {
  let archivos = [];
  if (!fs.existsSync(directorio)) return archivos;
  const entradas = fs.readdirSync(directorio, { withFileTypes: true });
  for (const entrada of entradas) {
    const rutaCompleta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      archivos = archivos.concat(listarArchivosRecursivo(rutaCompleta));
    } else if (entrada.isFile()) {
      archivos.push(rutaCompleta);
    }
  }
  return archivos;
}

function verificarFuente() {
  console.log('--- Iniciando verificación de código fuente (--src) ---');
  let errores = 0;

  // (a) serverConfig.ts contiene la URL esperada y HOSTS_BLOQUEADOS incluye girasolesres.pp.ua
  const serverConfig = leerArchivoSeguro('src/config/serverConfig.ts');
  if (!serverConfig.includes(URL_ESPERADA)) {
    console.error(`[ERROR] src/config/serverConfig.ts no contiene la URL esperada (${URL_ESPERADA}).`);
    errores++;
  } else {
    console.log(`[OK] serverConfig.ts contiene la URL esperada.`);
  }

  const hostsBloqueadosRegex = /HOSTS_BLOQUEADOS[\s\S]*?=\s*\[([\s\S]*?)\]/;
  const hostsBloqueadosMatch = serverConfig.match(hostsBloqueadosRegex);
  if (!hostsBloqueadosMatch || !hostsBloqueadosMatch[1].includes(HOST_BLOQUEADO)) {
    console.error(`[ERROR] src/config/serverConfig.ts no incluye ${HOST_BLOQUEADO} en HOSTS_BLOQUEADOS.`);
    errores++;
  } else {
    console.log(`[OK] serverConfig.ts bloquea correctamente el host del sitio web (${HOST_BLOQUEADO}).`);
  }

  // (b) .env.demo y .env.production
  const envDemo = leerArchivoSeguro('.env.demo');
  if (!envDemo.includes('VITE_DEMO_MODE=true') || !envDemo.includes(URL_ESPERADA)) {
    console.error(`[ERROR] .env.demo debe contener VITE_DEMO_MODE=true y ${URL_ESPERADA}.`);
    errores++;
  } else {
    console.log(`[OK] .env.demo configurado correctamente para demostración.`);
  }

  const envProd = leerArchivoSeguro('.env.production');
  if (!envProd.includes('VITE_DEMO_MODE=false') || !envProd.includes(URL_ESPERADA)) {
    console.error(`[ERROR] .env.production debe contener VITE_DEMO_MODE=false y ${URL_ESPERADA}.`);
    errores++;
  } else {
    console.log(`[OK] .env.production configurado correctamente para producción.`);
  }

  // (c) appConfig.ts exporta MODO_DEMO
  const appConfig = leerArchivoSeguro('src/config/appConfig.ts');
  if (!/export\s+(const\s+MODO_DEMO|{[^}]*MODO_DEMO[^}]*})/.test(appConfig)) {
    console.error(`[ERROR] src/config/appConfig.ts debe exportar MODO_DEMO.`);
    errores++;
  } else {
    console.log(`[OK] appConfig.ts exporta MODO_DEMO.`);
  }

  // (d) LoginView.tsx importa ServidorConfigSheet y demoAccounts y usa MODO_DEMO
  const loginView = leerArchivoSeguro('src/components/auth/LoginView.tsx');
  if (!loginView.includes('ServidorConfigSheet')) {
    console.error(`[ERROR] LoginView.tsx debe referenciar/importar ServidorConfigSheet.`);
    errores++;
  }
  if (!loginView.includes('demoAccounts')) {
    console.error(`[ERROR] LoginView.tsx debe referenciar/importar demoAccounts.`);
    errores++;
  }
  if (!loginView.includes('MODO_DEMO')) {
    console.error(`[ERROR] LoginView.tsx debe usar MODO_DEMO.`);
    errores++;
  }
  if (loginView.includes('ServidorConfigSheet') && loginView.includes('demoAccounts') && loginView.includes('MODO_DEMO')) {
    console.log(`[OK] LoginView.tsx integra ServidorConfigSheet, demoAccounts y MODO_DEMO.`);
  }

  // (e) la URL esperada aparece solo UNA vez en src/
  const archivosSrc = listarArchivosRecursivo(SRC_DIR);
  let conteoUrlEsperada = 0;
  const apariciones = [];

  for (const archivo of archivosSrc) {
    if (/\.(tsx?|jsx?|css|html)$/.test(archivo)) {
      const contenido = fs.readFileSync(archivo, 'utf-8');
      const coincidencias = contenido.split(URL_ESPERADA).length - 1;
      if (coincidencias > 0) {
        conteoUrlEsperada += coincidencias;
        apariciones.push(`${path.relative(ROOT_MOBILE, archivo)} (${coincidencias})`);
      }
    }
  }

  if (conteoUrlEsperada !== 1) {
    console.error(`[ERROR] La URL esperada (${URL_ESPERADA}) debe figurar EXACTAMENTE UNA VEZ en src/. Se encontraron ${conteoUrlEsperada} apariciones en: ${apariciones.join(', ')}`);
    errores++;
  } else {
    console.log(`[OK] La URL esperada figura exactamente una sola vez en el código fuente: ${apariciones[0]}.`);
  }

  if (errores > 0) {
    console.error(`\n[FALLO] La verificación de código fuente detectó ${errores} error(es).`);
    process.exit(1);
  }

  console.log('[ÉXITO] Verificación de código fuente (--src) aprobada al 100%.\n');
}

function extraerContrasenasDemo() {
  const demoAccounts = leerArchivoSeguro('src/config/demoAccounts.ts');
  const contrasenas = [];
  const regex = /contrasena:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(demoAccounts)) !== null) {
    if (match[1] && !contrasenas.includes(match[1])) {
      contrasenas.push(match[1]);
    }
  }
  return contrasenas;
}

function verificarDist(modo) {
  console.log(`--- Iniciando verificación de distribución (--dist=${modo}) ---`);
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`[ERROR] La carpeta de distribución dist/ no existe. Ejecute el build primero.`);
    process.exit(1);
  }

  const archivosDist = listarArchivosRecursivo(DIST_DIR).filter((f) =>
    /\.(js|css|html)$/.test(f)
  );

  if (archivosDist.length === 0) {
    console.error(`[ERROR] No se encontraron archivos generados (.js, .css, .html) en dist/.`);
    process.exit(1);
  }

  let errores = 0;

  if (modo === 'production') {
    const terminosProhibidos = [
      { nombre: 'Modo demostración', regex: /modo\s+demostraci[oó]n/i },
      { nombre: 'Acceso rápido', regex: /acceso\s+r[aá]pido/i },
      { nombre: '10.0.2.2', regex: /10\.0\.2\.2/ },
    ];
    const contrasenas = extraerContrasenasDemo();

    for (const termino of terminosProhibidos) {
      for (const archivo of archivosDist) {
        const contenido = fs.readFileSync(archivo, 'utf-8');
        if (termino.regex.test(contenido)) {
          console.error(
            `[ERROR] El paquete de producción contiene el término prohibido "${termino.nombre}" en ${path.relative(ROOT_MOBILE, archivo)}.`
          );
          errores++;
          break;
        }
      }
    }

    for (const contrasena of contrasenas) {
      for (const archivo of archivosDist) {
        const contenido = fs.readFileSync(archivo, 'utf-8');
        if (contenido.includes(contrasena)) {
          console.error(
            `[ERROR] El paquete de producción contiene una contraseña de demostración (enmascarada) en ${path.relative(ROOT_MOBILE, archivo)}.`
          );
          errores++;
          break;
        }
      }
    }

    if (errores === 0) {
      console.log(`[OK] El paquete de producción está completamente limpio de elementos de demostración y secretos.`);
    }
  } else if (modo === 'demo') {
    let tieneAccesoRapido = false;
    let tieneUrlEsperada = false;

    for (const archivo of archivosDist) {
      const contenido = fs.readFileSync(archivo, 'utf-8');
      if (/acceso\s+r[aá]pido/i.test(contenido)) tieneAccesoRapido = true;
      if (contenido.includes(URL_ESPERADA)) tieneUrlEsperada = true;
    }

    if (!tieneAccesoRapido) {
      console.error(`[ERROR] El paquete de demostración debe incluir la funcionalidad "Acceso rápido".`);
      errores++;
    } else {
      console.log(`[OK] El paquete de demostración contiene el bloque "Acceso rápido".`);
    }

    if (!tieneUrlEsperada) {
      console.error(`[ERROR] El paquete de demostración debe incluir la URL esperada (${URL_ESPERADA}).`);
      errores++;
    } else {
      console.log(`[OK] El paquete de demostración contiene la URL oficial de la API.`);
    }
  } else {
    console.error(`[ERROR] Modo de distribución desconocido: ${modo}. Use "production" o "demo".`);
    process.exit(1);
  }

  if (errores > 0) {
    console.error(`\n[FALLO] La verificación de distribución (--dist=${modo}) detectó ${errores} error(es).`);
    process.exit(1);
  }

  console.log(`[ÉXITO] Verificación de distribución (--dist=${modo}) aprobada al 100%.\n`);
}

// Procesar argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Uso: node verify-connection.mjs [--src] [--dist=production|demo]');
  process.exit(1);
}

for (const arg of args) {
  if (arg === '--src') {
    verificarFuente();
  } else if (arg.startsWith('--dist=')) {
    const modo = arg.split('=')[1];
    verificarDist(modo);
  } else {
    console.error(`[ERROR] Argumento no reconocido: ${arg}`);
    process.exit(1);
  }
}
