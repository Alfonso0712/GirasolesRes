SISTEMA DE RESTAURANTE GIRASOLES
Requerimientos funcionales (RF-01 a RF-35) e historias de usuario (HU01 a HU35)
1. Requerimientos funcionales

<!-- tabla 1 -->
| Código | Requerimiento | Actor | HU | Prioridad |
|---|---|---|---|---|
| RF-01 | El sistema debe permitir al usuario iniciar sesión con usuario y contraseña. | Administrador, Cajero, Mozo o Cocinero | HU01 | Must (Alta) |
| RF-02 | El sistema debe permitir: registrar usuarios (nombre, usuario único, correo, contraseña y rol). | Administrador | HU02 | Must (Alta) |
| RF-03 | El sistema debe permitir al administrador: listar los usuarios con búsqueda y filtros por rol y estado. | Administrador | HU03 | Must (Alta) |
| RF-04 | El sistema debe permitir al administrador: editar los datos, el correo, el rol y la contraseña de un usuario. | Administrador | HU04 | Should (Media) |
| RF-05 | El sistema debe permitir al administrador activar o desactivar usuarios. | Administrador | HU05 | Should (Media) |
| RF-06 | El sistema debe permitir al administrador cambiar su contraseña. | Administrador | HU06 | Should (Media) |
| RF-07 | El sistema debe permitir al administrador recuperar su contraseña mediante un código enviado a su correo electrónico. | Administrador | HU07 | Should (Media) |
| RF-08 | El sistema debe permitir al administrador eliminar usuarios sin movimientos registrados. | Administrador | HU08 | Could (Baja) |
| RF-09 | El sistema debe permitir: registrar productos de carta (con categoría y precio) y componentes de menú (con rol y sin precio). | Administrador | HU09 | Must (Alta) |
| RF-10 | El sistema debe permitir: listar y buscar productos y componentes. | Administrador | HU10 | Should (Media) |
| RF-11 | El sistema debe permitir: editar datos y precio de productos y componentes. | Administrador | HU11 | Should (Media) |
| RF-12 | El sistema debe permitir: activar o desactivar productos y componentes. | Administrador | HU12 | Should (Media) |
| RF-13 | El sistema debe permitir: definir el menú del día (opciones de cada rol, menús completos habilitados y productos de carta). | Administrador | HU13 | Should (Media) |
| RF-14 | El sistema debe permitir: marcar un plato u opción como agotado o disponible. | Administrador o Cocinero | HU14 | Could (Baja) |
| RF-15 | El sistema debe permitir: registrar mesas. | Administrador | HU15 | Must (Alta) |
| RF-16 | El sistema debe permitir: ver mesas y su estado. | Administrador, Cajero o Mozo | HU16 | Must (Alta) |
| RF-17 | El sistema debe permitir: editar y desactivar mesas. | Administrador | HU17 | Could (Baja) |
| RF-18 | El sistema debe permitir al Mozo y al Administrador: registrar pedido de mesa (productos y menús completos) y generar y enviar la comanda a cocina. | Mozo, Administrador | HU18 | Must (Alta) |
| RF-19 | El sistema debe permitir al Mozo y al Administrador: agregar productos o menús completos a un pedido de mesa. | Mozo, Administrador | HU19 | Should (Media) |
| RF-20 | El sistema debe permitir: registrar pedido para llevar (productos y menús completos) y generar y enviar la comanda a cocina. | Cajero | HU20 | Must (Alta) |
| RF-21 | El sistema debe permitir: modificar un pedido antes de que cocina inicie su preparación y anular un pedido con su motivo (el Administrador puede anular cualquier pedido no pagado). | Mozo, Cajero, Administrador | HU21 | Must (Alta) |
| RF-22 | El sistema debe permitir: listar pedidos con su estado, ver su detalle y mostrar el aviso de comanda lista. | Administrador, Cajero o Mozo | HU22 | Must (Alta) |
| RF-23 | El sistema debe permitir: visualizar comandas pendientes. | Cocinero | HU23 | Must (Alta) |
| RF-24 | El sistema debe permitir: actualizar el estado de la comanda. | Cocinero | HU24 | Must (Alta) |
| RF-25 | El sistema debe permitir: cobrar un pedido eligiendo el tipo de comprobante, el método de pago y el vuelto, y liberar la mesa al pagar. | Cajero | HU25 | Must (Alta) |
| RF-26 | El sistema debe permitir: emitir el comprobante de pago (ticket, boleta o factura, con desglose de IGV en boleta y factura). | Cajero | HU26 | Must (Alta) |
| RF-27 | El sistema debe permitir: anular una venta. | Administrador | HU27 | Must (Alta) |
| RF-28 | El sistema debe permitir: listar y buscar ventas. | Administrador o Cajero | HU28 | Must (Alta) |
| RF-29 | El sistema debe permitir: abrir la caja. | Cajero | HU29 | Must (Alta) |
| RF-30 | El sistema debe permitir: cerrar la caja y cuadrar. | Cajero | HU30 | Must (Alta) |
| RF-31 | El sistema debe permitir: consultar el historial de cierres. | Administrador | HU31 | Should (Media) |
| RF-32 | El sistema debe permitir: reporte de ventas por rango. | Administrador | HU32 | Should (Media) |
| RF-33 | El sistema debe permitir: platos vendidos por producto. | Administrador | HU33 | Must (Alta) |
| RF-34 | El sistema debe permitir: indicadores del día del administrador. | Administrador | HU34 | Should (Media) |
| RF-35 | El sistema debe permitir: gestionar menús completos. | Administrador | HU35 | Should (Media) |

Criterios aplicados
- Cerrar sesión y el panel de inicio con accesos rápidos forman parte de la navegación del sistema y no se consideran RF.
- Liberar la mesa al pagar es una regla de negocio de RF-28 (cobrar un pedido): al registrarse el pago la mesa queda libre automáticamente.
- Generar y enviar la comanda se incorpora a los RF de registro de pedido (mesa y para llevar); el aviso de comanda lista, al RF de listar pedidos; y el método de pago y vuelto, al RF de cobrar.
2. Historias de usuario
HU01 · Iniciar sesión

<!-- tabla 2 -->
| Actor | Administrador, Cajero, Mozo o Cocinero |
|---|---|
| Como | Administrador, cajero, mozo o cocinero, |
| Quiero | iniciar sesión con mi usuario y contraseña. |
| Para | acceder a las funciones que corresponden a mi rol. |
| RF de origen | RF-01 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin autenticación no se puede usar ningún otro módulo. |

HU02 · Registrar usuario

<!-- tabla 3 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | registrar usuarios con nombre, usuario único, correo, contraseña y rol, |
| Para | permitir que un empleado use el sistema. |
| RF de origen | RF-02 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin usuarios registrados no hay quién opere el sistema. |

HU03 · Listar y buscar usuarios

<!-- tabla 4 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | listar y buscar los usuarios registrados por nombre y filtrarlos por rol y estado, |
| Para | ubicar rápidamente a un empleado. |
| RF de origen | RF-03 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Todas las acciones de gestión (editar, activar, desactivar, eliminar) se inician desde la lista; sin ella el administrador no puede ubicar a su personal. |

HU04 · Editar usuario

<!-- tabla 5 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | editar los datos, el correo, el rol y la contraseña de un usuario, |
| Para | mantener la información del personal actualizada. |
| RF de origen | RF-04 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Corrige errores de datos y permite cambiar el rol; existen alternativas temporales (desactivar y registrar de nuevo). |

HU05 · Activar o desactivar usuarios

<!-- tabla 6 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | activar o desactivar usuarios, |
| Para | bloquear el acceso del personal que ya no trabaja o está suspendido, sin perder su historial. |
| RF de origen | RF-05 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es muy útil por la rotación de personal en un restaurante, pero el sistema puede operar sin ella al inicio. |

HU06 · Cambiar contraseña

<!-- tabla 7 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | cambiar mi contraseña, |
| Para | mantener segura mi cuenta. |
| RF de origen | RF-06 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Mejora la seguridad, pero no bloquea la operación del sistema; mientras tanto puede cambiarla desde la edición de usuario (HU05). |

HU07 · Recuperar contraseña

<!-- tabla 8 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | recuperar mi contraseña mediante un código enviado a mi correo, |
| Para | volver a ingresar si la olvido. |
| RF de origen | RF-07 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Si el administrador no puede recuperar su contraseña pierde el acceso, pero el sistema puede operar sin esta función al inicio. |

HU08 · Eliminar usuarios

<!-- tabla 9 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | eliminar usuarios registrados que no tengan movimientos, |
| Para | depurar usuarios creados por error. |
| RF de origen | RF-08 |
| Prioridad | Could (Baja) |
| Validación MoSCoW | Es una mejora de bajo costo: desactivar (HU06) ya bloquea el acceso conservando el historial; eliminar solo depura registros creados por error. |

HU09 · Registrar productos

<!-- tabla 10 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | registrar productos de carta (con categoría y precio) y componentes de menú (con rol y sin precio). |
| Para | tener la carta del restaurante cargada para poder tomar pedidos. |
| RF de origen | RF-09 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin productos registrados no se puede tomar ningún pedido ni calcular ningún cobro. |

HU10 · Listar y buscar productos

<!-- tabla 11 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | listar y buscar los productos y componentes registrados. |
| Para | ubicar rápidamente un producto y revisar su precio y estado. |
| RF de origen | RF-10 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es importante para administrar la carta, pero al inicio el sistema puede operar con pocos productos sin buscador. |

HU11 · Editar producto

<!-- tabla 12 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | editar los datos y el precio de un producto o componente. |
| Para | mantener actualizada la carta cuando cambie un precio o un nombre. |
| RF de origen | RF-11 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Un precio desactualizado afecta los cobros, pero temporalmente puede resolverse registrando el producto de nuevo. |

HU12 · Activar o desactivar productos

<!-- tabla 13 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | activar o desactivar productos y componentes. |
| Para | retirar de la carta un producto que ya no se vende sin perder su historial de ventas. |
| RF de origen | RF-12 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Evita eliminar productos con ventas registradas; el sistema puede operar al inicio sin ella. |

HU13 · Definir el menú del día

<!-- tabla 14 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | definir el menú del día: las opciones de cada rol, los menús completos habilitados y los productos de carta del día. |
| Para | que el mozo y el cajero solo ofrezcan lo que se prepara ese día. |
| RF de origen | RF-13 |
| Prioridad | Should (Media) |
| Validación MoSCoW | El menú cambia todos los días, pero al inicio el sistema puede operar mostrando todos los productos activos. |

HU14 · Marcar plato como agotado

<!-- tabla 15 -->
| Actor | Administrador o Cocinero |
|---|---|
| Como | Administrador o cocinero, |
| Quiero | marcar un plato u opción del menú del día como agotado o disponible. |
| Para | evitar que se tomen pedidos de un plato que ya no hay. |
| RF de origen | RF-14 |
| Prioridad | Could (Baja) |
| Validación MoSCoW | Mejora de bajo costo; mientras tanto el cocinero puede avisar al mozo verbalmente. |

HU15 · Registrar mesas

<!-- tabla 16 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | registrar las mesas del restaurante. |
| Para | poder asignar cada pedido a una mesa. |
| RF de origen | RF-15 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin mesas registradas no se puede registrar un pedido de mesa. |

HU16 · Ver mesas y su estado

<!-- tabla 17 -->
| Actor | Administrador, Cajero o Mozo |
|---|---|
| Como | Administrador, cajero o mozo, |
| Quiero | ver las mesas con su estado (libre u ocupada). |
| Para | saber qué mesas puedo atender y cuáles tienen un pedido pendiente de cobro. |
| RF de origen | RF-16 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | El mozo necesita saber qué mesa está libre para tomar el pedido y el cajero cuál debe cobrar. |

HU17 · Editar y desactivar mesas

<!-- tabla 18 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | editar los datos de una mesa y activarla o desactivarla. |
| Para | adaptar el sistema a la distribución del local, por ejemplo al retirar una mesa. |
| RF de origen | RF-17 |
| Prioridad | Could (Baja) |
| Validación MoSCoW | Mejora de bajo costo; la distribución del local cambia pocas veces. |

HU18 · Registrar pedido de mesa

<!-- tabla 19 -->
| Actor | Mozo, Administrador |
|---|---|
| Como | mozo o administrador, |
| Quiero | registrar el pedido de una mesa, libre u ocupada, con productos y menús completos (una opción por parte), cantidad y observaciones (por ejemplo, el tipo de presa), y que al guardarlo el sistema genere y envíe la comanda a cocina, |
| Para | que cocina reciba exactamente lo que pidió el cliente, sin depender de avisos verbales. |
| RF de origen | RF-18 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Es el inicio de todo el proceso de venta; sin pedidos ni comanda a cocina no hay ventas que controlar y se mantiene el aviso verbal. |

HU19 · Agregar productos a un pedido de mesa

<!-- tabla 20 -->
| Actor | Mozo, Administrador |
|---|---|
| Como | mozo o administrador, |
| Quiero | agregar productos o menús completos a un pedido de mesa que aún no se ha pagado. |
| Para | atender lo que el cliente pide después sin crear un pedido aparte (si prefiere, puede registrar un pedido nuevo para la misma mesa). |
| RF de origen | RF-19 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es útil para mantener una sola cuenta por grupo, pero existe una alternativa: registrar un pedido nuevo para la misma mesa (una mesa puede tener varios pedidos abiertos), por lo que el sistema puede operar sin ella al inicio. |

HU20 · Registrar pedido para llevar

<!-- tabla 21 -->
| Actor | Cajero |
|---|---|
| Como | Cajero, |
| Quiero | registrar un pedido para llevar con productos y menús completos, cantidad y observaciones, y que al guardarlo el sistema genere y envíe la comanda a cocina, |
| Para | atender a clientes que no consumen en el local y enviar su pedido a cocina. |
| RF de origen | RF-20 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | La venta para llevar es parte de la operación diaria del restaurante y la comanda automática evita el aviso verbal a cocina. |

HU21 · Modificar o anular un pedido

<!-- tabla 22 -->
| Actor | Mozo, Cajero, Administrador |
|---|---|
| Como | mozo, cajero o administrador, |
| Quiero | modificar los pedidos que registré antes de que cocina inicie su preparación y anular un pedido con su motivo (el administrador puede anular cualquier pedido no pagado). |
| Para | corregir errores de registro sin afectar las cuentas del día. |
| RF de origen | RF-21 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Un error en un pedido, si no se corrige, altera las cuentas del día y cocina prepara lo equivocado; además, un pedido abandonado (cliente que se fue sin pagar) impediría cerrar la caja si nadie pudiera anularlo. El sistema no puede operar sin corregir o anular pedidos. |

HU22 · Listar pedidos con su estado

<!-- tabla 23 -->
| Actor | Administrador, Cajero o Mozo |
|---|---|
| Como | Administrador, cajero o mozo, |
| Quiero | consultar los pedidos con su estado (pendiente, en preparación, listo, pagado o anulado) y ver el aviso cuando una comanda esté lista, |
| Para | saber qué pedidos están en curso, recoger de inmediato los que ya están listos y ubicar los que deben cobrarse. |
| RF de origen | RF-22 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | El cajero necesita ubicar el pedido para cobrarlo y el mozo saber cuál está listo para servir; el aviso de comanda lista se muestra en esta misma lista. |

HU23 · Visualizar comandas pendientes

<!-- tabla 24 -->
| Actor | Cocinero |
|---|---|
| Como | Cocinero, |
| Quiero | visualizar las comandas pendientes en orden de llegada, con la mesa o "para llevar", los productos y las observaciones. |
| Para | preparar los pedidos en el orden correcto y sin errores. |
| RF de origen | RF-23 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin esta vista, cocina no recibe los pedidos registrados. |

HU24 · Actualizar el estado de la comanda

<!-- tabla 25 -->
| Actor | Cocinero |
|---|---|
| Como | Cocinero, |
| Quiero | cambiar el estado de una comanda a "en preparación" y a "lista". |
| Para | avisar que el pedido ya puede llevarse al cliente. |
| RF de origen | RF-24 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Permite conocer el avance de cada pedido y cuándo puede servirse. |

HU25 · Cobrar un pedido

<!-- tabla 26 -->
| Actor | Cajero |
|---|---|
| Como | Cajero, |
| Quiero | cobrar un pedido de mesa o para llevar con el total calculado automáticamente, eligiendo el tipo de comprobante y registrando si el cliente paga en efectivo o por Yape y, en efectivo, el monto recibido y el vuelto, y que al pagar la mesa quede libre, |
| Para | evitar errores de suma al cobrar, entregar el vuelto correcto y saber cuánto dinero entró por cada medio de pago. |
| RF de origen | RF-25 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Es el objetivo central del sistema: reemplazar el cálculo manual del cobro; sin separar efectivo y Yape no es posible cuadrar la caja al final del día. |

HU26 · Emitir comprobante de pago

<!-- tabla 27 -->
| Actor | Cajero |
|---|---|
| Como | Cajero, |
| Quiero | emitir el comprobante de pago (ticket, boleta o factura, con desglose de IGV en boleta y factura) y poder imprimirlo o descargarlo. |
| Para | entregar al cliente la constancia de su pago y llevar un registro numerado de las ventas. |
| RF de origen | RF-26 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Los comprobantes de pago son parte esencial del alcance y respaldan cada venta registrada. |

HU27 · Anular una venta

<!-- tabla 28 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | anular una venta indicando el motivo. |
| Para | corregir cobros registrados por error manteniendo el control de lo ocurrido. |
| RF de origen | RF-27 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Un cobro equivocado debe poder corregirse el mismo día; sin esta función el dinero registrado no cuadra con lo real. |

HU28 · Listar y buscar ventas

<!-- tabla 29 -->
| Actor | Administrador o Cajero |
|---|---|
| Como | Administrador o cajero, |
| Quiero | listar y buscar las ventas por fecha o número de comprobante. |
| Para | revisar lo vendido y ubicar un comprobante cuando el cliente lo necesite. |
| RF de origen | RF-28 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Es necesaria para ubicar la venta que se debe anular (HU27) y para reimprimir un comprobante; sin ella no hay forma de corregir un cobro. |

HU29 · Abrir caja

<!-- tabla 30 -->
| Actor | Cajero |
|---|---|
| Como | Cajero, |
| Quiero | abrir la caja del día indicando el monto inicial. |
| Para | tener un punto de partida para cuadrar el dinero al cierre. |
| RF de origen | RF-29 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Sin el monto inicial no puede calcularse el efectivo esperado al cierre. |

HU30 · Cerrar caja y cuadrar

<!-- tabla 31 -->
| Actor | Cajero |
|---|---|
| Como | Cajero, |
| Quiero | cerrar la caja viendo el total vendido por método de pago, ingresando el efectivo contado y viendo la diferencia. |
| Para | saber si el dinero cuadra con las ventas sin sumar a mano ni rehacer cuentas. |
| RF de origen | RF-30 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Resuelve el problema principal del restaurante: el conteo manual y el cuaderno. |

HU31 · Consultar cierres de caja

<!-- tabla 32 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | consultar el historial de cierres de caja. |
| Para | revisar cuánto se vendió cada día y si hubo diferencias. |
| RF de origen | RF-31 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es importante para supervisar, pero el cierre diario ya permite operar. |

HU32 · Consultar reporte de ventas

<!-- tabla 33 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | consultar el reporte de ventas por rango de fechas, con el total general y por método de pago. |
| Para | conocer cuánto vende el restaurante en un período. |
| RF de origen | RF-32 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es indispensable a largo plazo para decidir, pero el cierre de caja ya cubre el control diario. |

HU33 · Consultar platos vendidos

<!-- tabla 34 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | consultar la cantidad de platos vendidos por producto, por día o por rango de fechas. |
| Para | saber cuántos platos se venden y comprobar que cuadran con el dinero. |
| RF de origen | RF-33 |
| Prioridad | Must (Alta) |
| Validación MoSCoW | Hoy no se controla cuántos platos se venden; resolverlo es parte del problema que justifica el sistema. |

HU34 · Ver indicadores del día

<!-- tabla 35 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | ver al ingresar el resumen del día (ventas, platos vendidos, pedidos, mesas, caja, menú y alertas), |
| Para | saber cómo va el negocio sin revisar cada módulo. |
| RF de origen | RF-34 |
| Prioridad | Should (Media) |
| Validación MoSCoW | Es muy útil para controlar el negocio, pero el administrador puede obtener la misma información entrando a cada módulo. |

HU35 · Gestionar menús completos

<!-- tabla 36 -->
| Actor | Administrador |
|---|---|
| Como | Administrador, |
| Quiero | consultar los menús completos (desayuno completo, almuerzo completo y solo segundo) y editar su precio y su estado, |
| Para | mantener actualizados los precios y retirar un menú que ya no se ofrece, sin modificar su estructura. |
| RF de origen | RF-35 |
| Prioridad | Should (Media) |
| Validación MoSCoW | El precio de los menús cambia con poca frecuencia y al inicio puede cargarse una sola vez; el sistema puede operar sin esta pantalla. |
