export function validarChangePasswordForm(
  contrasenaActual: string,
  nuevaContrasena: string,
  confirmarContrasena: string
): Record<string, string> {
  const nuevosErrores: Record<string, string> = {};

  // RV-23: Contraseña actual obligatoria
  if (!contrasenaActual) {
    nuevosErrores.contrasenaActual = 'Ingrese su contraseña actual.'; // MSG-44
  }

  // RV-24: Nueva contraseña obligatoria y entre 8 y 64 caracteres
  if (!nuevaContrasena) {
    nuevosErrores.nuevaContrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
  } else if (nuevaContrasena.length < 8 || nuevaContrasena.length > 64) {
    nuevosErrores.nuevaContrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
  } else if (contrasenaActual && nuevaContrasena === contrasenaActual) {
    // RV-26: Nueva distinta de la actual
    nuevosErrores.nuevaContrasena = 'La nueva contraseña debe ser distinta de la actual.'; // MSG-46
  }

  // RV-25: Confirmación igual a nueva contraseña
  if (!confirmarContrasena) {
    nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
  } else if (confirmarContrasena !== nuevaContrasena) {
    nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
  }

  return nuevosErrores;
}
