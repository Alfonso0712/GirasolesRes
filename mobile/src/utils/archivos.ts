import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
 * Guarda un Blob PDF en el directorio de caché nativo (Directory.Cache) mediante
 * @capacitor/filesystem y abre la hoja nativa de compartir con @capacitor/share.
 * En navegadores web utiliza un enlace de descarga directa como respaldo.
 */
export async function compartirPdf(blob: Blob, nombre: string): Promise<void> {
  const limpio = nombre.replace(/[^a-zA-Z0-9._-]/g, '_');
  const nombreSeguro = limpio.toLowerCase().endsWith('.pdf') ? limpio : `${limpio}.pdf`;

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
