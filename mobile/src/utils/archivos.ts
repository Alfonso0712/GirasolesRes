import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FileOpener } from '@capacitor-community/file-opener';

export type MetodoGuardadoPdf = 'documentos' | 'compartir';
export type MetodoAperturaPdf = 'visor' | 'compartir';

function blobABase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultado = reader.result;
      if (typeof resultado !== 'string') {
        reject(new Error('No se pudo convertir el archivo PDF a base64.'));
        return;
      }
      const comaIdx = resultado.indexOf(',');
      resolve(comaIdx >= 0 ? resultado.slice(comaIdx + 1) : resultado);
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo PDF.'));
    reader.readAsDataURL(blob);
  });
}

function descargarEnNavegador(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Sanitiza un nombre de archivo PDF eliminando caracteres inválidos del sistema de archivos
 * y asegurando la extensión `.pdf`.
 */
export function sanitizarNombrePdf(nombre: string): string {
  const sinExt = nombre.trim().replace(/\.pdf$/i, '');
  const limpio = sinExt
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '');
  const base = limpio || 'documento';
  return `${base}.pdf`;
}

/**
 * Construye el nombre canónico `comprobante-{numero}.pdf` sin caracteres inválidos.
 */
export function nombreArchivoComprobante(numero: string): string {
  const numLimpio = (numero || '')
    .trim()
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitizarNombrePdf(`comprobante-${numLimpio || 'sin-numero'}.pdf`);
}

/**
 * Guarda un Blob PDF en el directorio de caché nativo (`Directory.Cache`) mediante
 * `@capacitor/filesystem` y abre la hoja nativa de compartir con `@capacitor/share`.
 * En navegadores web utiliza un enlace de descarga directa como respaldo.
 */
export async function compartirPdf(blob: Blob, nombre: string): Promise<void> {
  const nombreSeguro = sanitizarNombrePdf(nombre);

  if (Capacitor.isNativePlatform()) {
    const base64Data = await blobABase64(blob);
    const archivo = await Filesystem.writeFile({
      path: nombreSeguro,
      data: base64Data,
      directory: Directory.Cache,
    });
    await Share.share({
      title: nombreSeguro,
      url: archivo.uri,
      dialogTitle: 'Guardar o compartir PDF',
    });
    return;
  }

  descargarEnNavegador(blob, nombreSeguro);
}

/**
 * Intenta guardar un archivo PDF en `Directory.Documents` dentro de la carpeta `Girasoles/`.
 * Si falla por permisos de almacenamiento en Android, abre la hoja nativa de compartir como respaldo
 * y devuelve cuál método utilizó (`'documentos'` o `'compartir'`).
 */
export async function guardarPdf(blob: Blob, nombre: string): Promise<MetodoGuardadoPdf> {
  const nombreSeguro = sanitizarNombrePdf(nombre);

  if (Capacitor.isNativePlatform()) {
    const base64Data = await blobABase64(blob);
    try {
      await Filesystem.writeFile({
        path: `Girasoles/${nombreSeguro}`,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
      return 'documentos';
    } catch {
      await compartirPdf(blob, nombreSeguro);
      return 'compartir';
    }
  }

  descargarEnNavegador(blob, nombreSeguro);
  return 'documentos';
}

/**
 * Escribe el PDF en `Directory.Cache` e intenta abrirlo en el visor de PDF del sistema
 * mediante `@capacitor-community/file-opener` (`application/pdf`), desde donde el usuario
 * puede imprimir. Si el plugin o visor no está disponible, recurre a `compartirPdf`.
 */
export async function abrirPdf(blob: Blob, nombre: string): Promise<MetodoAperturaPdf> {
  const nombreSeguro = sanitizarNombrePdf(nombre);

  if (Capacitor.isNativePlatform()) {
    const base64Data = await blobABase64(blob);
    const archivo = await Filesystem.writeFile({
      path: nombreSeguro,
      data: base64Data,
      directory: Directory.Cache,
    });

    try {
      await FileOpener.open({
        filePath: archivo.uri,
        contentType: 'application/pdf',
        openWithDefault: true,
      });
      return 'visor';
    } catch {
      await Share.share({
        title: nombreSeguro,
        url: archivo.uri,
        dialogTitle: 'Imprimir o compartir PDF',
      });
      return 'compartir';
    }
  }

  descargarEnNavegador(blob, nombreSeguro);
  return 'visor';
}
