namespace GirasolesRes.Application.Common;

public static class MensajesCatalogo
{
    public const string MSG_01 = "Ingrese su usuario.";
    public const string MSG_02 = "Ingrese su contraseña.";
    public const string MSG_03 = "El usuario debe tener entre 3 y 30 caracteres, sin espacios.";
    public const string MSG_04 = "Usuario o contraseña incorrectos. Revise sus datos e intente nuevamente.";
    public const string MSG_05 = "Su cuenta está desactivada. Comuníquese con la administradora.";
    public const string MSG_06 = "Demasiados intentos. Intente nuevamente en 15 minutos.";
    public const string MSG_07 = "Ingresando…";
    public const string MSG_08 = "Ingreso correcto. Redirigiendo…";
    public const string MSG_09 = "No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.";
    public const string MSG_10 = "Mayúsculas activadas.";
    public const string MSG_11 = "Si el correo está registrado, recibirá un código de 6 dígitos en unos minutos.";
    public const string MSG_12 = "Ingrese un correo válido, por ejemplo: nombre@dominio.com.";
    public const string MSG_13 = "El código es incorrecto o ha vencido. Solicite uno nuevo.";
    public const string MSG_14 = "La contraseña debe tener entre 8 y 64 caracteres.";
    public const string MSG_15 = "Las contraseñas no coinciden.";
    public const string MSG_16 = "Contraseña actualizada. Ya puede iniciar sesión.";
    public const string MSG_17 = "Si es personal del restaurante, pida a la administradora que restablezca su contraseña.";
    public const string MSG_18 = "No se pudo enviar el código. Intente nuevamente.";

    // CUS-02: Gestión de usuarios
    public const string MSG_19 = "Ingrese el nombre completo.";
    public const string MSG_20 = "El nombre debe tener entre 3 y 60 caracteres y solo letras y espacios.";
    public const string MSG_21 = "Ese usuario ya está registrado. Elija otro nombre de usuario.";
    public const string MSG_22 = "Seleccione un rol.";
    public const string MSG_23 = "El correo es obligatorio para el administrador.";
    public const string MSG_24 = "Ese correo ya está asignado a otro usuario.";
    public const string MSG_25 = "Usuario registrado correctamente.";
    public const string MSG_26 = "Cambios guardados correctamente.";
    public const string MSG_27 = "¿Desactivar a {0}? No podrá iniciar sesión, pero se conservará su historial.";
    public const string MSG_28 = "¿Activar a {0}? Podrá iniciar sesión nuevamente.";
    public const string MSG_29 = "Usuario desactivado.";
    public const string MSG_30 = "Usuario activado.";
    public const string MSG_31 = "No puede desactivar ni eliminar su propia cuenta.";
    public const string MSG_32 = "Debe haber al menos un administrador activo.";
    public const string MSG_33 = "¿Eliminar a {0}? Esta acción no se puede deshacer.";
    public const string MSG_34 = "No se puede eliminar: el usuario tiene movimientos registrados. Desactívelo para conservar su historial.";
    public const string MSG_35 = "Usuario eliminado correctamente.";
    public const string MSG_36 = "No se encontraron usuarios con ese criterio. Pruebe con otro nombre o quite los filtros.";
    public const string MSG_37 = "No se pudo cargar la lista de usuarios. Intente nuevamente.";
    public const string MSG_38 = "No se pudo completar la operación. Intente nuevamente.";
    public const string MSG_39 = "No tiene permiso para usar esta función.";

    // CUS-03: Perfil de usuario (barra superior)
    public const string MSG_40 = "¿Cerrar sesión? Tendrá que ingresar nuevamente para usar el sistema.";
    public const string MSG_41 = "Sesión cerrada correctamente.";
    public const string MSG_42 = "Su sesión vencerá en 2 minutos por inactividad. ¿Desea continuar?";
    public const string MSG_43 = "Su sesión expiró por inactividad. Inicie sesión nuevamente.";
    public const string MSG_44 = "Ingrese su contraseña actual.";
    public const string MSG_45 = "La contraseña actual no es correcta. Revise lo escrito e intente nuevamente.";
    public const string MSG_46 = "La nueva contraseña debe ser distinta de la actual.";
    public const string MSG_47 = "Contraseña actualizada correctamente.";
    public const string MSG_48 = "Por seguridad se cerró su sesión tras varios intentos fallidos. Inicie sesión nuevamente.";
    public const string MSG_49 = "No tiene permiso para cambiar la contraseña. Pida a la administradora que la restablezca.";
    public const string MSG_50 = "No se pudo cerrar la sesión en el servidor, pero se cerró en este equipo.";

    // CUS-04: Gestión de productos
    public const string MSG_51 = "Ingrese el nombre del producto.";
    public const string MSG_52 = "El nombre debe tener entre 3 y 50 caracteres.";
    public const string MSG_53 = "Ese producto ya está registrado. Use otro nombre o edite el existente.";
    public const string MSG_54 = "Seleccione una categoría.";
    public const string MSG_55 = "Ingrese el precio.";
    public const string MSG_56 = "Ingrese un precio válido, mayor a S/ 0.00 y con hasta 2 decimales (ejemplo: 8.00).";
    public const string MSG_57 = "Producto registrado correctamente.";
    public const string MSG_58 = "Producto actualizado correctamente.";
    public const string MSG_59 = "El nuevo precio se aplicará solo a los pedidos nuevos. Los pedidos y ventas ya registrados no cambian.";
    public const string MSG_60 = "¿Desactivar {0}? Dejará de aparecer al tomar pedidos y en el menú del día, pero se conservará su historial.";
    public const string MSG_61 = "¿Activar {0}? Volverá a estar disponible para pedidos y para el menú del día.";
    public const string MSG_62 = "{0} forma parte del menú de hoy. Al desactivarlo se retirará del menú.";
    public const string MSG_63 = "Producto desactivado.";
    public const string MSG_64 = "Producto activado.";
    public const string MSG_65 = "No hay productos registrados. Use \"Nuevo producto\" para crear el primero.";
    public const string MSG_66 = "No se encontraron productos con ese criterio. Pruebe con otro nombre o quite los filtros.";
    public const string MSG_67 = "No se pudo cargar la lista de productos. Intente nuevamente.";

    // CUS-05: Gestión del menú del día
    public const string MSG_68 = "Seleccione al menos un producto para el menú de hoy.";
    public const string MSG_69 = "Registre productos antes de definir el menú. (enlace \"Ir a Productos\")";
    public const string MSG_70 = "Menú del día guardado correctamente.";
    public const string MSG_71 = "Todavía no definió el menú de hoy. Seleccione los productos y pulse GUARDAR MENÚ.";
    public const string MSG_72 = "Tiene cambios sin guardar. ¿Desea descartarlos?";
    public const string MSG_73 = "Solo se puede modificar el menú de la fecha actual.";
    public const string MSG_74 = "¿Marcar {0} como agotado? Mozos y cajeros ya no podrán pedirlo; los pedidos registrados no cambian.";
    public const string MSG_75 = "¿Marcar {0} como disponible? Podrá pedirse nuevamente.";
    public const string MSG_76 = "{0} marcado como agotado.";
    public const string MSG_77 = "{0} marcado como disponible.";
    public const string MSG_78 = "No hay menú definido para hoy. La administradora debe definirlo.";
    public const string MSG_79 = "{0} se agotó. Elija otro plato.";
    public const string MSG_80 = "No se pudo cargar el menú del día. Intente nuevamente.";

    // CUS-06: Gestión de mesas
    public const string MSG_81 = "Ingrese el número o nombre de la mesa.";
    public const string MSG_82 = "El nombre de la mesa debe tener entre 1 y 20 caracteres.";
    public const string MSG_83 = "Esa mesa ya está registrada. Use otro número o nombre.";
    public const string MSG_84 = "Mesa registrada correctamente.";
    public const string MSG_85 = "Mesa actualizada correctamente.";
    public const string MSG_86 = "¿Desactivar {0}? Dejará de aparecer al tomar pedidos, pero se conservará su historial.";
    public const string MSG_87 = "¿Activar {0}? Volverá a estar disponible para pedidos.";
    public const string MSG_88 = "No se puede desactivar {0}: tiene un pedido pendiente de cobro.";
    public const string MSG_89 = "Mesa desactivada.";
    public const string MSG_90 = "Mesa activada.";
    public const string MSG_91 = "No hay mesas registradas. Use \"Nueva mesa\" para crear la primera.";
    public const string MSG_92 = "No hay mesas registradas. Pida a la administradora que las registre.";
    public const string MSG_93 = "No hay mesas con ese estado. Cambie el filtro.";
    public const string MSG_94 = "No se pudieron cargar las mesas. Intente nuevamente.";
    public const string MSG_95 = "La {0} ya tiene un pedido abierto. Agregue productos a ese pedido.";
}
