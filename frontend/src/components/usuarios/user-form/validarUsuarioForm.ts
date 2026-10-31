import type { RolUsuario } from '../../../types/usuario';

export interface ValidarUsuarioParams {
  nombre: string;
  usuario: string;
  correo: string;
  rol: RolUsuario;
  contrasena: string;
  confirmarContrasena: string;
  isEdit: boolean;
}

export function validarUsuarioForm({
  nombre,
  usuario,
  correo,
  rol,
  contrasena,
  confirmarContrasena,
  isEdit,
}: ValidarUsuarioParams): Record<string, string> {
  const nuevosErrores: Record<string, string> = {};
  const nombreTrim = nombre.trim();
  const usuarioTrim = usuario.trim();
  const correoTrim = correo.trim();

  // RV-11: Nombre completo
  if (!nombreTrim) {
    nuevosErrores.nombre = 'Ingrese el nombre completo.'; // MSG-19
  } else if (nombreTrim.length < 3 || nombreTrim.length > 60 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombreTrim)) {
    nuevosErrores.nombre = 'El nombre debe tener entre 3 y 60 letras y espacios.'; // MSG-20
  }

  // RV-12: Usuario
  if (!usuarioTrim) {
    nuevosErrores.usuario = 'Ingrese su usuario.'; // MSG-01
  } else if (usuarioTrim.length < 3 || usuarioTrim.length > 30 || !/^[a-zA-Z0-9._-]+$/.test(usuarioTrim)) {
    nuevosErrores.usuario = 'El usuario debe tener entre 3 y 30 caracteres, sin espacios.'; // MSG-03
  }

  // RV-15: Rol
  if (!rol) {
    nuevosErrores.rol = 'Seleccione un rol.'; // MSG-22
  }

  // RV-16: Correo obligatorio para Administrador y máx 100 caracteres
  if (rol === 'Administrador' && !correoTrim) {
    nuevosErrores.correo = 'El correo es obligatorio para el administrador.'; // MSG-23
  } else if (correoTrim && correoTrim.length > 100) {
    nuevosErrores.correo = 'El correo no puede tener más de 100 caracteres.';
  } else if (correoTrim && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoTrim)) {
    nuevosErrores.correo = 'Ingrese un correo válido, por ejemplo: nombre@dominio.com.'; // MSG-12
  }

  // RV-13 y RV-14: Contraseña y confirmación
  if (!isEdit) {
    if (!contrasena) {
      nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
    } else if (contrasena.length < 8 || contrasena.length > 64) {
      nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
    } else if (contrasena !== confirmarContrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
    }
  } else {
    if (contrasena) {
      if (contrasena.length < 8 || contrasena.length > 64) {
        nuevosErrores.contrasena = 'La contraseña debe tener entre 8 y 64 caracteres.'; // MSG-14
      } else if (contrasena !== confirmarContrasena) {
        nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'; // MSG-15
      }
    }
  }

  return nuevosErrores;
}
