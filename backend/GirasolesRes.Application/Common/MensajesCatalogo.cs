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

    // CUS-07: Registro de pedido de mesa
    public const string MSG_96 = "Seleccione una mesa libre.";
    public const string MSG_97 = "Agregue al menos un producto al pedido.";
    public const string MSG_98 = "La cantidad debe ser un número entero entre 1 y 20.";
    public const string MSG_99 = "La observación no puede superar los 100 caracteres.";
    public const string MSG_100 = "Pedido N.º {0} registrado para {1}. La comanda se envió a cocina.";
    public const string MSG_101 = "Productos agregados al pedido N.º {0}. Se envió una comanda adicional a cocina.";
    public const string MSG_102 = "Tiene un pedido sin registrar. ¿Desea descartarlo?";
    public const string MSG_103 = "Hay platos agotados en su pedido. Quite o cambie las líneas marcadas.";
    public const string MSG_104 = "El pedido ya no puede modificarse porque fue pagado o anulado.";
    public const string MSG_105 = "No se pudo registrar el pedido. Su pedido sigue en pantalla; intente nuevamente.";
    public const string MSG_106 = "No se pudieron agregar los productos. El pedido no cambió; intente nuevamente.";
    public const string MSG_107 = "No hay productos disponibles para pedir. Avise a la administradora.";
    public const string MSG_108 = "No hay mesas libres. Revise la vista de mesas.";

    // CUS-08: Registro de pedido para llevar
    public const string MSG_109 = "La referencia no puede superar los 30 caracteres.";
    public const string MSG_110 = "Pedido para llevar N.º {0} registrado. La comanda se envió a cocina.";
    public const string MSG_111 = "No se pudo registrar el pedido para llevar. Su pedido sigue en pantalla; intente nuevamente.";

    // CUS-09: Gestión de pedidos (Complemento CUS09)
    public const string MSG_112 = "No se encontraron pedidos con ese criterio. Pruebe con otro filtro.";
    public const string MSG_113 = "Todavía no hay pedidos hoy.";
    public const string MSG_114 = "No se pudieron cargar los pedidos. Intente nuevamente.";
    public const string MSG_115 = "El pedido ya está en preparación y no puede modificarse. Avise a cocina.";
    public const string MSG_116 = "Solo puede modificar o anular los pedidos que usted registró.";
    public const string MSG_117 = "Indique el motivo de la anulación (entre 5 y 100 caracteres).";
    public const string MSG_118 = "¿Anular el pedido N.º {0} ({1})? No se podrá deshacer y quedará registrado con su motivo.";
    public const string MSG_119 = "Pedido N.º {0} modificado. Cocina verá la comanda actualizada.";
    public const string MSG_120 = "Pedido N.º {0} anulado.";
    public const string MSG_121 = "Para quitar todos los productos, anule el pedido.";
    public const string MSG_122 = "No se pudo actualizar el pedido. El pedido original no cambió; intente nuevamente.";
    public const string MSG_123 = "Pedido N.º {0} listo para recoger: {1}.";

    // CUS-10: Gestión de comandas de cocina (Complemento CUS10)
    public const string MSG_124 = "No hay comandas pendientes. Todo al día.";
    public const string MSG_125 = "No se pudieron cargar las comandas. Intente nuevamente.";
    public const string MSG_126 = "Comanda N.º {0} en preparación.";
    public const string MSG_127 = "Comanda N.º {0} marcada como lista. Se avisó a {1}.";
    public const string MSG_128 = "La comanda N.º {0} fue anulada y se retiró de la pantalla.";
    public const string MSG_129 = "El pedido N.º {0} fue modificado. Revise los cambios.";
    public const string MSG_130 = "Primero debe iniciar la preparación de la comanda.";
    public const string MSG_131 = "No se pudo actualizar la comanda. El estado anterior se conserva; intente nuevamente.";
    public const string MSG_132 = "Sin conexión: las comandas pueden estar desactualizadas (datos de hace {0} s).";
    public const string MSG_133 = "Nueva comanda N.º {0} ({1}).";
    public const string MSG_134 = "No se puede deshacer: el pedido ya fue pagado, anulado o pasó el tiempo permitido.";

    // CUS-11: Cobro de pedidos (Complemento CUS11)
    public const string MSG_135 = "Debe abrir la caja antes de cobrar.";
    public const string MSG_136 = "No hay pedidos pendientes de cobro.";
    public const string MSG_137 = "El pedido N.º {0} no puede cobrarse: ya fue pagado o anulado.";
    public const string MSG_138 = "El pedido N.º {0} aún no está listo ({1}). ¿Desea cobrarlo de todos modos?";
    public const string MSG_139 = "El total del pedido cambió a S/ {0:F2}. Revise el detalle antes de cobrar.";
    public const string MSG_140 = "Seleccione el método de pago.";
    public const string MSG_141 = "Ingrese el monto recibido.";
    public const string MSG_142 = "Ingrese un monto válido, con hasta 2 decimales (ejemplo: 20.00).";
    public const string MSG_143 = "El monto recibido es menor al total. Falta S/ {0:F2}.";
    public const string MSG_144 = "Confirme que recibió el pago por Yape.";
    public const string MSG_145 = "Vuelto a entregar: S/ {0:F2}";
    public const string MSG_146 = "Cobro registrado. Comprobante {0} por S/ {1:F2}.";
    public const string MSG_147 = "No se pudo registrar el cobro. El pedido sigue pendiente de cobro; intente nuevamente.";
    public const string MSG_148 = "No se pudo generar la vista del comprobante. La venta está registrada; regenérelo desde Ventas.";
    public const string MSG_149 = "No se encontró una impresora disponible. Descargue el comprobante.";
    public const string MSG_150 = "¿Cancelar el cobro? El pedido seguirá pendiente de cobro.";
    public const string MSG_151 = "La referencia de Yape no puede superar los 20 caracteres.";
    public const string MSG_152 = "El monto recibido no puede superar S/ 9,999.99.";
}

