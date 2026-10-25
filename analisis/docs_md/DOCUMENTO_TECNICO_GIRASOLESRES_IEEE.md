UNIVERSIDAD PERUANA LOS ANDES
FACULTAD DE INGENIERÍA
ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS Y COMPUTACIÓN
——————————————————————————————————————
DOCUMENTO TÉCNICO DE PRESENTACIÓN DEL SOFTWARE
Software GirasolesRes para el Control de Venta del Restaurante Girasoles
Estructurado bajo el Modelo de Calidad ISO/IEC 25010 y Estándar IEEE

<!-- tabla 1 -->
| Proyecto: | Sistema Web de Gestión Gastronómica, POS y Control Operativo (GirasolesRes) |
|---|---|
| Autores: | VILCAHUAMAN LOZANO, Alfonso Gabriel
CHUQUI CONTRERAS, Jazztin William
LOBATON ABREGU, Jhilmar Jaison
SANTILLAN TRUJILLO, Brandon Kody
CORONEL GUEVARA, Jack Yhems |
| Institución: | Universidad Peruana Los Andes – Facultad de Ingeniería |
| Docente / Asesor: | Ing. Jorge Alberto Vega Flores |
| Versión / Estado: | Versión 1.0 (Entorno de Producción) |
| Fecha y Sede: | Octubre 2026  \|  Huancayo – Perú |

ÍNDICE GENERAL
•  [1. Introducción](#1-introducción)
•  [1.1 Antecedentes](#11-antecedentes)
•  [1.2 Objetivo del Documento](#12-objetivo-del-documento)
•  [1.3 Alcance](#13-alcance)
•  [2. Descripción General del Proyecto](#2-descripción-general-del-proyecto)
•  [2.1 Nombre del Proyecto](#21-nombre-del-proyecto)
•  [2.2 Problema](#22-problema)
•  [2.3 Objetivo General](#23-objetivo-general)
•  [2.4 Objetivos Específicos](#24-objetivos-específicos)
•  [2.5 Alcance y Módulos Funcionales del Sistema](#25-alcance-y-módulos-funcionales-del-sistema)
•  [3. Arquitectura del Sistema](#3-arquitectura-del-sistema)
•  [3.1 Backend – Clean Architecture](#31-backend--clean-architecture)
•  [3.2 Frontend – Arquitectura Basada en Componentes (Component-Based Architecture) y Diseño Centrado en el Usuario (UI/UX)](#32-frontend--arquitectura-basada-en-componentes-component-based-architecture-y-diseño-centrado-en-el-usuario-uiux)
•  [3.3 Comunicación entre Componentes](#33-comunicación-entre-componentes)
•  [4. Stack Tecnológico](#4-stack-tecnológico)
•  [4.1 Backend](#41-backend)
•  [4.2 Frontend](#42-frontend)
•  [4.3 Patrones de Diseño](#43-patrones-de-diseño)
•  [4.4 Herramientas de Desarrollo, Pruebas y Base de Datos](#44-herramientas-de-desarrollo-pruebas-y-base-de-datos)
•  [Referencias Bibliográficas](#referencias-bibliográficas)
1. INTRODUCCIÓN
1.1 Antecedentes
En el sector gastronómico contemporáneo, la eficiencia de las operaciones en los establecimientos de comida criolla y tradicional —como el restaurante "Girasoles"— depende críticamente de la velocidad, precisión y sincronía con la que interactúan las tres áreas operativas fundamentales: el salón comedor, la cocina y la caja registradora. Tradicionalmente, este tipo de negocios ha sustentado su gestión en procesos manuales y analógicos caracterizados por el uso de comandas físicas de papel autocopiativo, el cálculo manual de importes en notas de venta provisionales y la coordinación verbal directa entre el personal de servicio (mozos) y el personal de cocina [1].
Dicho esquema operativo tradicional presenta deficiencias sistemáticas ampliamente estudiadas por la Ingeniería de Software. Como señalan Pressman y Maxim [1], los procesos basados en registros manuales y carentes de automatización transaccional introducen tasas críticas de error humano, redundancia informativa y una pérdida irreversible de trazabilidad temporal. En el entorno real de un restaurante en horas de máxima afluencia (rush hours), el extravío de notas físicas de pedido, la caligrafía ilegible del personal de salón y la ausencia de una cola de preparación estructurada bajo el principio First-In, First-Out (FIFO) derivan en retrasos severos en los tiempos de despacho, preparación duplicada de platos y descontento directo del comensal [2].
Asimismo, Sommerville [2] subraya que la desconexión entre la captura de requerimientos de servicio y los sistemas de liquidación monetaria constituye un factor determinante en la fuga inadvertida de capital. En el restaurante "Girasoles", la interacción manual entre mozos y cajeros propiciaba discrepancias entre lo efectivamente servido a la mesa y lo liquidado al cliente, cobros erróneos de productos pertenecientes a menús compuestos del día (los cuales contemplan componentes fijos sin sobrecosto individual) y descuadres crónicos en los arqueos de caja al final de cada turno [1], [2].
Frente a este escenario, la transición hacia un sistema transaccional de información y Punto de Venta (POS) resulta imperativa. No obstante, para garantizar su viabilidad práctica, el software debe ser diseñado bajo estándares rigurosos de ingeniería que respondan a la alta concurrencia, tolerancia a fallos y exigencias ergonómicas del personal operativo. Por ende, la concepción del sistema GirasolesRes se fundamenta en la formalización de procesos de negocio, adoptando paradigmas modernos de arquitectura cliente-servidor desacoplada para sustituir integralmente el papel y proveer una plataforma digital unificada [1], [3].
1.2 Objetivo del Documento
El presente documento técnico tiene por objetivo exponer de manera exhaustiva, formal y estructurada la fundamentación teórica, el diseño arquitectónico, el stack tecnológico de desarrollo y los mecanismos de interacción humano-computadora (HCI) implementados en la plataforma web GirasolesRes (Versión 1.0).
Este informe técnico documenta formalmente cómo el sistema satisface los requerimientos funcionales y de calidad operativa del restaurante "Girasoles", sirviendo como memoria descriptiva de referencia académica e ingenieril para auditorías de software, homologación de estándares de calidad y mantenimiento evolutivo del sistema bajo lineamientos universitarios e internacionales [3], [4].
1.3 Alcance
El alcance del presente documento comprende la especificación arquitectónica y tecnológica integral de la Versión 1.0 del software GirasolesRes, estructurado rigurosamente bajo el estándar internacional de calidad ISO/IEC 25010 (Systems and software engineering — Systems and software Quality Requirements and Evaluation - SQuaRE) [3]. En virtud de dicho modelo, el documento aborda y justifica cómo la ingeniería del sistema garantiza los siguientes atributos de calidad:
•  Adecuación Funcional: Cobertura rigurosa, integridad y pertinencia de los Casos de Uso (CUS01 al CUS15), desde el control de acceso y gestión de carta hasta la facturación y cierre financiero de caja [3].
•  Usabilidad: Implementación de interfaces intuitivas y de alto rendimiento cognitivo basadas en las 10 Heurísticas de Usabilidad de Jakob Nielsen [6], las 8 Reglas de Oro de Ben Shneiderman [7] y los principios de Diseño Centrado en el Usuario de Don Norman [8].
•  Fiabilidad y Tolerancia a Fallos: Robustez transaccional respaldada por transacciones ACID en base de datos PostgreSQL y una suite de pruebas automatizadas formuladas bajo el estándar ISO/IEC/IEEE 29119 [11].
•  Eficiencia de Desempeño: Tiempos de respuesta de sub-segundo en APIs REST y renderizado ultrarrápido en el cliente mediante empaquetado optimizado con Vite y React 19 [9], [10].
•  Seguridad: Autenticación robusta basada en tokens criptográficos JWT Bearer y derivación de credenciales mediante PBKDF2 con HMAC-SHA256 bajo 100,000 iteraciones [4], [9].
•  Mantenibilidad: Separación estricta de responsabilidades mediante Clean Architecture en el backend [4] y Arquitectura Basada en Componentes (Component-Based Architecture) en el cliente web [10].
2. DESCRIPCIÓN GENERAL DEL PROYECTO
2.1 Nombre del Proyecto
Sistema Web de Gestión Gastronómica, Punto de Venta (POS) y Control Operativo para el Restaurante Girasoles (GirasolesRes)*.
2.2 Problema
El restaurante "Girasoles", establecimiento especializado en gastronomía peruana, experimentaba una problemática operativa multidimensional derivada de la ejecución analógica de sus flujos de trabajo cotidianos:
1. Cuellos de Botella en Salón y Toma de Pedidos: Los mozos realizaban la toma de pedidos en comandas de papel. Este proceso requería desplazamientos físicos constantes desde el salón hacia la cocina para depositar las notas, incrementando innecesariamente la latencia de atención, retrasando la rotación de mesas y generando confusiones cuando se producían modificaciones o adiciones de platos a mesas ya activas [1].
2. Descoordinación Crítica en Cocina y Carencia de KDS: La cocina carecía de un Sistema de Visualización de Cocina (Kitchen Display System - KDS). Las comandas de papel sufrían deterioro físico por contacto con grasa o líquidos, desorden cronológico en el tablero de pedidos y extravíos inadvertidos. Los cocineros no contaban con cronómetros de preparación ni visibilidad sobre qué platos pertenecían a mesas de comensales impacientes o a pedidos prioritarios para llevar [2].
3. Ambigüedad en la Valorización de Menús Compuestos: La oferta culinaria diaria del restaurante se divide en platos a la carta y "Menús Completos del Día" (paquetes con precio cerrado que incluyen partes parametrizables: entrada/sopa, plato segundo y refresco). El personal registraba en ocasiones las partes como ítems a la carta individuales, alterando el importe final o, por el contrario, omitiendo componentes obligatorios, lo que generaba constantes quejas de clientes y distorsiones contables [1].
4. Descuadres Financieros y Vulnerabilidad en Arqueos de Caja: La recaudación en caja dependía de anotaciones en libretas y comprobantes manuales. Al finalizar el turno, la conciliación entre el efectivo real en gaveta y los pagos electrónicos (transferencias bancarias, billeteras móviles como Yape y Plin, y tarjetas POS) registraba diferencias no justificadas (faltantes o sobrantes), sin una auditoría que vinculara qué cajero o usuario realizó cada cobro [2].
5. Incumplimiento y Demoras en la Emisión de Comprobantes Fiscales: La confección manual de comprobantes físicos retardaba la liberación de las mesas y generaba inconsistencias frente a la normativa de la administración tributaria nacional (SUNAT) [12], particularmente respecto al tope legal de boletas de venta simples sin identificación (límite de S/ 700.00 que exige DNI obligatorio) y la obligatoriedad de consignar RUC y Razón Social en facturas comerciales.
6. Inexistencia de Información Analítica Consolidada: La administración carecía de indicadores en tiempo real respecto al volumen de ventas diarias, rendimiento operativo de mozos, rotación de platos de mayor margen de contribución y métricas de cuadratura entre ventas y dinero recibido en caja [3].
2.3 Objetivo General
Diseñar, desarrollar e implementar un sistema web transaccional integral de punto de venta (POS), gestión de salón comedor, visualización de cocina (KDS) y control financiero de turnos de caja para el restaurante "Girasoles", basado en una arquitectura desacoplada de alto rendimiento y código limpio, que optimice el ciclo operativo de atención al comensal, garantice la trazabilidad integral de pedidos y asegure la cuadratura financiera bajo los lineamientos del modelo de calidad ISO/IEC 25010 [1]–[4].
2.4 Objetivos Específicos
1. Sistematizar el control de acceso y seguridad perimetral mediante un esquema de Control de Acceso Basado en Roles (RBAC), asegurando la autenticación mediante tokens criptográficos JWT y el almacenamiento seguro de contraseñas con PBKDF2 [4], [9].
2. Implementar un módulo interactivo de gestión de salón que permita mapear en tiempo real el estado físico de las mesas (Libre, Ocupada, Reservada) y registrar pedidos asociados a mesas físicas o bajo modalidad para llevar [6], [8].
3. Parametrizar la carta digital y el motor de "Menú Completo del Día", permitiendo vincular productos componentes de precio cero a paquetes cerrados, con validación estricta de partes obligatorias en el momento de la comanda [3].
4. Desplegar una pantalla interactiva de cocina (KDS) que suprima el uso de papel, ordenando automáticamente las comandas de forma cronológica, controlando los estados de preparación (Pendiente, En Preparación, Listo) y semaforizando los tiempos de despacho [7], [8].
5. Construir un motor de cobranza multicanal y emisión de comprobantes (Ticket de Venta, Boleta Electrónica y Factura Electrónica) con validación automática de padrones de DNI y RUC y generación de representaciones impresas en PDF vectorial [12].
6. Automatizar el ciclo de vida de la caja registradora mediante la apertura con monto inicial, registro de ingresos/egresos extraordinarios, arqueo físico con desglose monetario y cierre de turno con acta de conciliación en PDF [3].
7. Proveer un panel de control gerencial (Dashboard) y reportes analíticos de cuadratura, ventas por turno y desempeño de mozos para sustentar la toma de decisiones estratégicas del negocio [1], [3].
8. Validar la calidad del software mediante una batería de pruebas unitarias y de integración automatizadas bajo el estándar ISO/IEC/IEEE 29119, verificando la consistencia transaccional y la usabilidad del sistema [11].
2.5 Alcance y Módulos Funcionales del Sistema
La Versión 1.0 de GirasolesRes abarca de manera integral los procesos que sustentan el ciclo de vida de la orden gastronómica. Cada requerimiento operativo ha sido formalizado en Casos de Uso del Sistema (CUS01 al CUS15).
A continuación, la Tabla 2.1 describe la matriz completa de los 11 módulos funcionales que componen la solución, especificando los controladores backend en ASP.NET Core, las vistas cliente en React y las funcionalidades clave que materializan el dominio del restaurante.
TABLA 2.1 — MÓDULOS FUNCIONALES DEL SISTEMA GIRASOLESRES

<!-- tabla 2 -->
| Módulo Funcional | Casos de Uso | Controlador Backend (.NET) | Página Frontend (.tsx) | Funcionalidades Clave Implementadas |
|---|---|---|---|---|
| 1. Seguridad, Autenticación y Control de Accesos | CUS01, CUS01.1, CUS01.2 | AuthController.cs, UsuariosController.cs, PerfilController.cs | LoginPage.tsx, ForgotPasswordPage.tsx, UsersPage.tsx | Autenticación basada en JWT Bearer y PBKDF2; control estricto de roles (Administrador, Cajero, Mozo, Cocinero); caducidad automática de sesión por inactividad tras 30 min (con aviso previo a los 28 min); revocación y lista negra de tokens en base de datos; recuperación de credenciales vía código temporal por correo. |
| 2. Gestión de Salón y Ocupación de Mesas | CUS02 | MesasController.cs | MesasPage.tsx | Mapeo visual y matricial de mesas del establecimiento; transición dinámica de estados de ocupación (Libre, Ocupada, Reservada); capacidad de comensales por mesa; bloqueo de eliminación sobre mesas con pedidos activos; historial de auditoría de cambios de estado. |
| 3. Gestión de Carta, Categorías y Productos | CUS04 | ProductosController.cs | ProductsPage.tsx | Mantenimiento de categorías gastronómicas (Entradas, Segundos, Sopas, Bebidas, etc.); catálogo de productos con precio unitario, código interno y control de disponibilidad operativa (Activo/Inactivo); soporte para clasificación de productos de venta directa o componentes de menú. |
| 4. Menú del Día y Menús Completos Compuestos | CUS04.1, CUS05 | MenuDiaController.cs, MenusCompletosController.cs | MenuDiaPage.tsx | Parametrización diaria de la oferta gastronómica; estructuración de "Menús Completos" con precio global cerrado; configuración de partes obligatorias (Entrada, Segundo, Refresco); asociación de platos componentes sin costo adicional; activación/desactivación de la carta diaria. |
| 5. Toma de Pedidos en Salón y Armado de Menús | CUS07 | PedidosController.cs | PedidoMesaPage.tsx | Interfaz táctil ergonómica para mozos; selección guiada de menús completos (validación estricta de selección de componentes requeridos antes de añadir al pedido); adición de platos a la carta; especificación de observaciones personalizadas por plato ("sin sal", "bien cocido"); cálculo dinámico de subtotales. |
| 6. Registro de Pedidos Para Llevar y Mostrador | CUS08 | PedidosController.cs | PedidoLlevarPage.tsx | Flujo acelerado de atención en mostrador sin asignación de mesa física; captura de datos de identificación del cliente (nombre/contacto); armado de pedidos mixtos (carta y menús del día); derivación directa a caja y cocina con etiqueta de empaque. |
| 7. Monitoreo y Gestión de Pedidos Activos | CUS06 | PedidosController.cs | PedidosPage.tsx | Tablero unificado de pedidos en curso; visualización del estado del pedido (Pendiente, En Preparación, Listo, Pagado, Anulado); filtro por estado operativo, fecha y tipo de pedido; anulación controlada con registro obligatorio de motivo de cancelación y liberación atómica de mesa. |
| 8. KDS de Cocina y Despacho de Comandas | CUS09, CUS10 | ComandasController.cs, AvisosController.cs | CocinaPage.tsx | Sistema de visualización de cocina interactivo; generación automática de comandas divididas al confirmar el pedido; cronómetro de preparación en tiempo real con semáforo visual según SLA de cocina; cambio de estado a "Listo" con notificación sonora y visual al salón. |
| 9. Caja, Cobros y Facturación Electrónica | CUS11 | CobrosController.cs, ConsultasController.cs | CobrosPage.tsx | Liquidación multicanal de pedidos (Efectivo con cálculo de vuelto, Yape, Plin, Tarjeta); consulta en línea de padrones de DNI (RENIEC) y RUC (SUNAT); validación fiscal estricta (DNI obligatorio en montos ≥ S/ 700.00; RUC y Razón Social en Facturas); generación de PDF vectorial de comprobantes. |
| 10. Arqueo, Control de Turnos y Cierre de Caja | CUS13 | CajaController.cs | HistorialCierresPage.tsx | Ciclo integral de caja: apertura con monto inicial; registro auditado de egresos extraordinarios; arqueo de turno con conteo físico desglosado por denominación de billetes/monedas; cálculo automático de faltantes/sobrantes; emisión de acta oficial de cierre en PDF. |
| 11. Auditoría de Ventas, Reportes y Dashboard | CUS12, CUS14, CUS15 | VentasController.cs, ReportesController.cs, InicioController.cs | VentasPage.tsx, ReportesPage.tsx, DashboardPage.tsx | Consulta histórica de ventas y comprobantes emitidos; reporte de cuadratura de caja cruzando ventas registradas frente a pagos declarados; ranking de platos más vendidos; consolidado de productividad por mozo; dashboard gerencial con métricas en tiempo real. |

A continuación se insertan los marcadores correspondientes a las evidencias visuales de los once módulos funcionales del sistema GirasolesRes, ilustrando la materialización de los Casos de Uso en interfaces de producción:

<!-- tabla 3 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Vista de inicio de sesión con diseño corporativo 60/40 y selector de accesos demo |
|---|

Fig. 2.1. Módulo de Seguridad y Control de Acceso: interfaz de inicio de sesión (LoginPage.tsx).

<!-- tabla 4 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Panel de salón comedor con matriz de mesas y badges de ocupación en tiempo real |
|---|

Fig. 2.2. Módulo de Salón: mapa interactivo de mesas con estados dinámicos (MesasPage.tsx).

<!-- tabla 5 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Catálogo administrativo de productos y categorías gastronómicas |
|---|

Fig. 2.3. Módulo de Productos: mantenimiento de la carta gastronómica (ProductsPage.tsx).

<!-- tabla 6 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Interfaz de configuración del Menú del Día y composición de partes de Menú Completo |
|---|

Fig. 2.4. Módulo de Menú del Día: parametrización de paquetes culinarios compuestos (MenuDiaPage.tsx).

<!-- tabla 7 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Pantalla de toma de pedidos para mesas con asistente de selección de componentes |
|---|

Fig. 2.5. Módulo de Pedidos en Mesa: captura táctil y validación de componentes del menú (PedidoMesaPage.tsx).

<!-- tabla 8 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Formulario de registro de pedidos para llevar y mostrador |
|---|

Fig. 2.6. Módulo de Pedidos Para Llevar: interfaz de atención rápida en mostrador (PedidoLlevarPage.tsx).

<!-- tabla 9 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Bandeja general de monitoreo y administración de pedidos activos |
|---|

Fig. 2.7. Módulo de Monitoreo de Pedidos: grilla centralizada con filtros operativos (PedidosPage.tsx).

<!-- tabla 10 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Pantalla KDS de cocina con tarjetas de comandas y cronómetros de preparación |
|---|

Fig. 2.8. Módulo KDS de Cocina: comandas digitales con semáforos de tiempo de despacho (CocinaPage.tsx).

<!-- tabla 11 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Módulo de cobranza, desglose de métodos de pago y validación de comprobante |
|---|

Fig. 2.9. Módulo de Caja y Cobros: pasarela de facturación y validación DNI/RUC (CobrosPage.tsx).

<!-- tabla 12 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Pantalla de arqueo de caja con desglose de efectivo y cierre de turno |
|---|

Fig. 2.10. Módulo de Turnos de Caja: arqueo y generación de acta de conciliación (HistorialCierresPage.tsx).

<!-- tabla 13 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Dashboard general de inicio con KPIs operacionales y gráficos de ventas |
|---|

Fig. 2.11. Módulo de Auditoría y Reportes: tablero de control gerencial (DashboardPage.tsx).
3. ARQUITECTURA DEL SISTEMA
El sistema GirasolesRes ha sido concebido bajo un paradigma de Arquitectura Cliente-Servidor Desacoplada (Decoupled Client-Server Architecture), estableciendo una división nítida entre la capa de presentación que se ejecuta en el navegador web del cliente y la capa de servicios lógicos y persistencia alojada en el servidor [4], [9], [10].
Esta separación física y conceptual se concreta mediante una Aplicación de Página Única (Single Page Application - SPA) construida sobre React 19 y una Interfaz de Programación de Aplicaciones de Transferencia de Estado Representacional (RESTful Web API) implementada en ASP.NET Core 8.0. Ambos subsistemas se comunican de forma asíncrona a través del protocolo HTTPS utilizando el formato estándar JSON (JavaScript Object Notation) como mecanismo de serialización de datos y tokens criptográficos JWT (JSON Web Tokens) para la gestión de identidad sin estado (stateless) [4], [9].

<!-- tabla 14 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Diagrama de arquitectura global cliente-servidor desacoplada de GirasolesRes |
|---|

Fig. 3.1. Arquitectura general cliente-servidor desacoplada del sistema GirasolesRes.
3.1 Backend – Clean Architecture
Para la construcción del backend del sistema, se adoptaron rigurosamente los principios de Clean Architecture (Arquitectura Limpia) y Clean Code formulados por Robert C. Martin ("Uncle Bob") [4], [5].
3.1.1 Fundamentación Teórica y Regla de Dependencia
El principio nuclear de la Arquitectura Limpia establece que las reglas de negocio de la empresa deben residir en el núcleo del sistema, completamente aisladas de detalles volátiles como los motores de base de datos, las librerías de interfaz de usuario, los frameworks de comunicación y los dispositivos periféricos [4]. Esta separación se gobierna mediante la Regla de Dependencia (The Dependency Rule): las dependencias del código fuente únicamente pueden apuntar hacia adentro, hacia las políticas de alto nivel [4], [5].
En GirasolesRes, el código se estructuró en cuatro proyectos fuertemente cohesivos organizados en capas concéntricas, satisfaciendo el Principio de Inversión de Dependencias (DIP) de SOLID:
1. Las entidades del negocio no conocen la existencia de la base de datos ni de Entity Framework Core [4].
2. Los casos de uso manipulan contratos abstractos de repositorios e interfaces de servicios (Interfaces/Persistence/, Interfaces/Services/), desacoplando la lógica transaccional de su implementación concreta en PostgreSQL o librerías externas [4], [9].

<!-- tabla 15 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Diagrama conceptual de capas concéntricas de Clean Architecture aplicado al backend |
|---|

Fig. 3.2. Diagrama de capas concéntricas de Clean Architecture en el backend de GirasolesRes.
3.1.2 Beneficios Aplicados al Restaurante Girasoles
•  Independencia del Framework: La lógica de negocio gastronómica (cálculo de importes de comandas, validación de menús completos del día y reglas de bloqueo de cobranza) permanece desacoplada de ASP.NET Core, posibilitando migraciones o ejecuciones en contextos de prueba independientes [4].
•  Testabilidad Aislada: Permite ejecutar suites de pruebas unitarias sobre los casos de uso y servicios de aplicación utilizando implementaciones simuladas (mocks con Moq y EF Core InMemory) sin requerir una conexión activa a PostgreSQL, alcanzando tiempos de ejecución de pruebas de sub-segundo [11].
•  Mantenibilidad y Alta Cohesión: Cualquier modificación en la normativa de facturación de SUNAT o en los esquemas de tablas de base de datos se confina exclusivamente a la capa de infraestructura, sin afectar las reglas de negocio nucleares [4].
A continuación, la Tabla 3.1 sintetiza la responsabilidad técnica y componentes arquitectónicos de cada proyecto de la solución backend:
TABLA 3.1 — RESPONSABILIDAD DE CADA PROYECTO DE LA SOLUCIÓN BACKEND

<!-- tabla 16 -->
| Proyecto de la Solución | Capa Arquitectónica | Responsabilidad Técnica y Componentes Principales |
|---|---|---|
| GirasolesRes.Domain | Núcleo de Dominio (Enterprise Business Rules) | Contiene las entidades POCO puras del dominio gastronómico (Usuario, Mesa, Producto, MenuCompleto, MenuDia, Pedido, DetallePedido, Comanda, Caja, Venta, Comprobante), enums tipados de estado y reglas invariantes del negocio. Carece absolutamente de dependencias hacia frameworks externos o librerías de persistencia. |
| GirasolesRes.Application | Casos de Uso (Application Business Rules) | Orquesta los flujos de trabajo de los casos de uso (CUS01 al CUS15). Define los contratos de interfaces de persistencia (ICajaRepository, IPedidoRepository, IUsuarioRepository, etc.), interfaces de servicios (ICobroService, IPedidoService, ICajaService), contratos criptográficos (IJwtGenerator, IPasswordHasherService) y los Objetos de Transferencia de Datos (DTOs) de entrada y salida con sus respectivas validaciones. |
| GirasolesRes.Infrastructure | Adaptadores e Infraestructura (Interface Adapters & Frameworks) | Implementa el acceso a datos mediante Entity Framework Core 9.0 y Npgsql sobre PostgreSQL 18. Contiene la clase ApplicationDbContext, las implementaciones concretas de repositorios (PedidoRepository, CajaRepository, etc.), servicios de seguridad (PasswordHasherService con PBKDF2, JwtGenerator con HMAC-SHA256), clientes HTTP externos (ConsultaDocumentoService) y el motor vectorial nativo de generación de PDF (PdfCanvasBuilder, PdfComprobanteService, PdfCierreService). |
| GirasolesRes.API | Puntos de Entrada y Presentación (Frameworks & Drivers) | Expone los endpoints HTTP a través de controladores REST (PedidosController, CobrosController, CajaController, AuthController, etc.). Gestiona la tubería (pipeline) de middleware: enrutamiento, autenticación y autorización mediante JWT Bearer, serialización JSON, manejo global de excepciones y generación de especificaciones OpenAPI con Swagger. |
| GirasolesRes.Tests | Suite de Aseguramiento de Calidad | Proyecto de pruebas automatizadas formulado con el framework xUnit, Moq y Microsoft.EntityFrameworkCore.InMemory. Contiene las suites de pruebas unitarias y de integración de casos de uso (91 pruebas automatizadas sin fallos) que validan la lógica de negocio y consistencia de datos bajo ISO/IEC/IEEE 29119. |

A continuación se insertan los marcadores correspondientes a las evidencias de código y estructura arquitectónica del backend:

<!-- tabla 17 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Explorador de soluciones con la estructura limpia de los 4 proyectos backend en Visual Studio / VS Code |
|---|

Fig. 3.3. Organización de proyectos de la solución backend conforme a Clean Architecture.

<!-- tabla 18 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Archivo DependencyInjection.cs configurando la inyección de repositorios y servicios |
|---|

Fig. 3.4. Configuración de inversión de dependencias en GirasolesRes.Infrastructure/DependencyInjection.cs.

<!-- tabla 19 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Código fuente de PedidosController.cs o CobrosController.cs mostrando atributos REST y autorización |
|---|

Fig. 3.5. Implementación de controlador REST en GirasolesRes.API/Controllers/CobrosController.cs.
3.2 Frontend – Arquitectura Basada en Componentes (Component-Based Architecture) y Diseño Centrado en el Usuario (UI/UX)
3.2.1 Arquitectura Basada en Componentes sobre React 19 y TypeScript
El cliente web de GirasolesRes fue desarrollado adoptando una Arquitectura Basada en Componentes (Component-Based Architecture) modular y jerárquica, sobre el ecosistema compuesto por React 19.2.8, TypeScript 6.0.2, Vite 8.3.0 y el framework de estilos de última generación Tailwind CSS 4.3.3 (integrado mediante el compilador nativo @tailwindcss/vite) [10].
Esta arquitectura técnica aplica el principio de separación de intereses en el cliente, estructurando el código de frontend/src/ en componentes presentacionales desacoplados, organizados en componentes base de interfaz (components/ui/), componentes estructurales de marco (components/layout/) y componentes de dominio gastronómico por contexto delimitado (components/<dominio>/ tales como mesas/, menu-dia/, pedidos/, cocina/, caja/, cobros/, ventas/, productos/, usuarios/, reportes/ y dashboard/). Las páginas (pages/*.tsx) actúan estrictamente como orquestadores o contenedores (Container / Presentational Pattern), articulados a través de Custom Hooks (hooks/) que encapsulan el ciclo de vida de los datos y la lógica asíncrona, y un cliente HTTP base centralizado (services/apiClient.ts) con servicios fuertemente tipados (services/) [10].

<!-- tabla 20 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Árbol de carpetas de frontend/src/components/ mostrando la estructura jerárquica por dominio y UI base |
|---|

Fig. 3.6. Estructura modular del frontend organizada bajo Arquitectura Basada en Componentes en frontend/src/.
A continuación, la Tabla 3.2 describe la responsabilidad asignada a cada carpeta y submódulo de la arquitectura frontend:
TABLA 3.2 — RESPONSABILIDAD MODULAR EN `frontend/src/` (ARQUITECTURA BASADA EN COMPONENTES)

<!-- tabla 21 -->
| Carpeta / Módulo | Capa / Rol Frontend | Responsabilidad Técnica y Contenido |
|---|---|---|
| components/ui/ | UI Reutilizable Base | Componentes atómicos de diseño puro (Button, ActionButton, InputField, FormMessage, StatusBadge, StatCard, EmptyState, FilterBar, ModalWrapper, ConfirmModal, DiscardChangesModal). No poseen acoplamiento con la lógica de negocio ni llamadas directas de red. |
| components/layout/ | Estructura y Navegación | Componentes de marco global (Header, Sidebar, PageHeader, PageContainer, InactivityModal, LogoutModal) que definen la coherencia visual y navegación de la aplicación. |
| components/<dominio>/ | Componentes de Dominio | Bloques visuales específicos de cada contexto gastronómico (mesas/, menu-dia/, pedidos/, cocina/, caja/, cobros/, ventas/, productos/, usuarios/, reportes/, dashboard/). Implementan tarjetas, vistas de rol y modales de operación (ComandaCard, MesaCard, ArmarMenuCompletoModal, CobroModal, DashboardAdminView, etc.). |
| pages/ | Vistas Contenedoras (Containers) | Orquestadores de página (LoginPage, MesasPage, PedidoMesaPage, CocinaPage, CobrosPage, DashboardPage, etc.). Coordinan la inyección de datos desde los custom hooks y servicios, delegando toda la representación visual a los componentes de dominio y UI base. |
| hooks/ | Lógica de Estado y Comportamiento | Custom Hooks de React que encapsulan la lógica de interacción, consumo de APIs, suscripciones a temporizadores e intervalos de refresco (cocina en tiempo real), aislando a las vistas de la complejidad asíncrona. |
| services/ | Capa de Acceso a Datos y Red | Módulos de infraestructura HTTP tipados (apiClient.ts, authService.ts, pedidoService.ts, cobroService.ts, cajaService.ts, etc.) basados en fetch nativo con inyección automática de tokens JWT. |
| layouts/ | Plantillas Estructurales | Layouts envolventes (AuthLayout.tsx para vistas no autenticadas con distribución 60/40; MainLayout.tsx con navegación lateral persistente, header contextual y control de roles). |
| types/ | Contratos de Tipado TypeScript | Definiciones de tipos, interfaces y enums de TypeScript que replican los DTOs del backend, asegurando consistencia estricta en tiempo de compilación. |
| utils/ | Utilidades y Funciones Puras | Funciones utilitarias transversales sin efectos secundarios (formateo monetario en Soles peruanos con Intl.NumberFormat, conversión de fechas locales, validadores). |
| assets/ | Recursos Estáticos | Logotipos institucionales, iconos vectoriales y material gráfico estático. |

3.2.2 Fundamentación Teórica de Diseño UI/UX e Interacción Humano-Computadora (HCI)
La interfaz de usuario de GirasolesRes no responde a decisiones estéticas arbitrarias, sino a un riguroso marco de Interacción Humano-Computadora (HCI) sustentado en tres pilares teóricos fundamentales de la literatura científica:
A. Las 10 Heurísticas de Usabilidad de Jakob Nielsen
Formuladas por Nielsen [6], estas heurísticas permiten evaluar y mitigar los rozamientos cognitivos del usuario en sistemas interactivos:
1. H1: Visibilidad del estado del sistema: El sistema informa constantemente al operador de forma visual y en tiempo real. En el módulo de salón, las mesas exhiben insignias semánticas (badges) de color verde (Libre), ámbar (Ocupada) y azul (Reservada). En el KDS de cocina, cada comanda incorpora un cronómetro dinámico en minutos que cambia de color según el umbral de preparación. En la barra superior, un badge permanente indica si la caja registradora está "Abierta" o "Cerrada" [6].
2. H2: Correspondencia entre el sistema y el mundo real: La terminología empleada prescinde de jerga técnica de base de datos o códigos SQL. Los elementos reflejan el léxico gastronómico real del personal de salón y cocina: "Mesa", "Comanda", "Mozo", "Entrada", "Segundo", "Bebida", "Ticket", "Boleta" y "Factura" [6].
3. H5: Prevención de errores: Se implementan restricciones lógicas preventivas antes de que el usuario cometa una equivocación. En la toma de pedidos, el botón "Agregar Menú" permanece inhabilitado hasta que el mozo haya seleccionado obligatoriamente la entrada y el segundo del menú completo. En cobranza, el sistema bloquea la emisión de boletas simples sin DNI si el monto es igual o superior a S/ 700.00 (tope de SUNAT) y deshabilita el cobro de pedidos que aún se encuentren "En Preparación" en cocina [6], [12].
4. H8: Diseño estético y minimalista: Las interfaces reducen la densidad de elementos irrelevantes para disminuir la carga cognitiva. El inicio de sesión adopta una división de pantalla 60/40 que prioriza el acceso visual corporativo y un formulario sin elementos distractores. Las tablas de datos presentan alta densidad de información estructurada sin duplicidad de etiquetas [6].
B. Las 8 Reglas de Oro de Ben Shneiderman
Formuladas por Shneiderman et al. [7], estas reglas guían la eficiencia y predictibilidad en sistemas de interacción de alta frecuencia como los terminales de punto de venta:
1. Esforzarse por la consistencia: Se estableció una paleta cromática homogénea anclada en el marrón corporativo (#3A2211) y el naranja de acento (#D35400), componentes de botones con jerarquía visual idéntica en toda la aplicación, y tipografía tabular (tabular-nums) para la alineación precisa de importes decimales [7].
2. Ofrecer retroalimentación informativa: Ante cada acción crítica, el sistema responde visualmente: estados de carga (isSubmitting) en botones primarios que previenen dobles envíos, alertas modales de confirmación al anular pedidos o cerrar turnos de caja, y notificaciones flotantes (toasts) que confirman la impresión o registro exitoso [7].
3. Diseñar diálogos para producir un cierre: Los procesos de múltiples pasos (como el armado de menús completos o el proceso de cobro en caja con selección de método, cálculo de vuelto y emisión de comprobante) están diseñados como flujos delimitados con inicio, desarrollo y confirmación final de cierre explícito [7].
C. Principios de Diseño Centrado en el Usuario de Don Norman
Formulados por Norman en The Design of Everyday Things [8], estos conceptos aseguran que la interfaz comunique de forma natural sus capacidades operativas:
1. Affordances (Percepciones de Uso): Las tarjetas de selección de mesas, productos y métodos de pago presentan bordes, sombras y microinteracciones de elevación (:hover y :active) que comunican inequívocamente su naturaleza presionable. La altura mínima de los botones e inputs es de 44–48 px, garantizando ergonomía táctil en pantallas POS o tablets de mozos [8].
2. Signifiers (Significantes Claros): Se incorporan iconos semánticos reconocibles de la librería lucide-react (como candados en campos de clave, impresoras en generación de comprobantes y campanas de aviso en comandas) acompañados de etiquetas textuales claras que eliminan ambigüedades operativas [8].
3. Natural Mapping (Mapeo Natural): La disposición espacial de las mesas en la interfaz de salón emula la distribución física del establecimiento. Asimismo, el formulario de selección del menú completo sigue el orden cronológico real del servicio culinario: Entrada → Segundo → Bebida [8].
4. Constraints (Restricciones): Restricciones lógicas y físicas aplicadas en los componentes de entrada: los campos de importe admiten exclusivamente números y dos decimales, los inputs de DNI restringen su longitud a 8 dígitos numéricos, y los productos agotados muestran un estado desactivado con badge "Agotado", impidiendo su selección accidental [8].
A continuación, la Tabla 3.3 sistematiza el mapeo entre los fundamentos teóricos de HCI y su materialización concreta en GirasolesRes:
TABLA 3.3 — MAPEO DE PRINCIPIOS TEÓRICOS DE USABILIDAD E INTERACCIÓN (HCI) EN GIRASOLESRES

<!-- tabla 22 -->
| Marco Teórico | Principio / Heurística | Implementación Real en Pantallas y Componentes de GirasolesRes |
|---|---|---|
| Jakob Nielsen [6] | H1: Visibilidad del estado del sistema | Badges semánticos en tiempo real en Mesas (Verde, Ámbar, Azul); cronómetros de minutos en tarjetas KDS de cocina; indicador de caja "Abierta / Cerrada" en barra superior. |
| Jakob Nielsen [6] | H2: Correspondencia con el mundo real | Vocabulario culinario directo ("Mozo", "Comanda", "Mesa", "Entrada", "Segundo", "Ticket", "Boleta") sin tecnicismos informáticos en la interfaz de usuario. |
| Jakob Nielsen [6] | H5: Prevención de errores | Botón "Agregar" bloqueado hasta completar las partes del menú compuesto; bloqueo de cobro de pedidos en preparación; validación de DNI obligatorio en boletas ≥ S/ 700.00. |
| Jakob Nielsen [6] | H8: Diseño estético y minimalista | Split-screen 60/40 en Login; encabezados compactos; tablas con alta densidad de datos sin texto redundante; eliminación de marcas de agua distractores. |
| Ben Shneiderman [7] | Esforzarse por la consistencia | Sistema de diseño uniforme: paleta #3A2211 y #D35400; tipografía tabular (tabular-nums) para importes; modales con anatomía idéntica (título, cuerpo, botones). |
| Ben Shneiderman [7] | Ofrecer retroalimentación informativa | Estados isSubmitting con indicadores de carga en botones; alertas flotantes contextuales; retroalimentación sonora y visual al despachar comandas desde cocina. |
| Ben Shneiderman [7] | Diseñar diálogos para producir un cierre | Asistente de cobro en caja estructurado paso a paso (Selección de Pedido → Tipo de Comprobante → Método de Pago → Confirmación y Emisión de PDF). |
| Don Norman [8] | Affordances (Capacidades de acción) | Botones y tarjetas de selección táctil con altura mínima ergonómica ≥ 48 px, efectos de elevación y transiciones de sombreado al interactuar. |
| Don Norman [8] | Signifiers (Significantes) | Iconografía semántica (lucide-react) asociada a cada acción; asteriscos rojos y textos de ayuda en campos mandatorios de formularios. |
| Don Norman [8] | Natural Mapping (Mapeo Natural) | Disposición matricial de mesas que refleja la disposición del salón; flujo secuencial de armado de menú: Entrada → Segundo → Bebida. |
| Don Norman [8] | Constraints (Restricciones lógicas) | Máscaras de entrada para DNI (8 dígitos) y RUC (11 dígitos); bloqueo de eliminación de categorías con productos asignados o mesas con pedidos activos. |

3.3 Comunicación entre Componentes
La interacción integral entre el cliente y el servidor responde a un flujo transaccional estrictamente controlado:
1. Petición del Cliente (SPA): Una acción del usuario en un componente contenedor (ej. confirmar un pedido en PedidoMesaPage.tsx) invoca la función asíncrona correspondiente en services/pedidoService.ts.
2. Encapsulamiento y Seguridad HTTP: La solicitud es canalizada por services/apiClient.ts, el cual extrae el token JWT almacenado en memoria o almacenamiento local seguro y lo inyecta en la cabecera Authorization: Bearer <token>, serializando el cuerpo en formato JSON.
3. Recepción en Backend y Pipeline de Middleware: La petición llega a GirasolesRes.API, donde el middleware de ASP.NET Core intercepta la cabecera, valida la firma criptográfica y la vigencia temporal del JWT, e inspecciona los reclamos de rol (Claims) mediante políticas RBAC ([Authorize(Roles = "Mozo,Administrador")]).
4. Ejecución del Caso de Uso: El controlador (PedidosController.cs) delega la ejecución en la interfaz de servicio de aplicación (IPedidoService). El servicio aplica las validaciones de dominio gastronómico (verificación de stock, estado de la mesa y congruencia de componentes).
5. Persistencia Transaccional: La capa de infraestructura (PedidoRepository.cs) interactúa con el ApplicationDbContext de Entity Framework Core 9.0, ejecutando la operación dentro de una transacción atómica gestionada por Npgsql sobre la base de datos PostgreSQL 18.
6. Respuesta Serializada y Desacoplamiento: La API retorna una respuesta con código de estado HTTP semántico (200 OK, 201 Created, 400 Bad Request) y un DTO JSON limpio, que es recibido por el cliente React para actualizar el estado inmutable de la interfaz de usuario.

<!-- tabla 23 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Diagrama de secuencia del flujo de comunicación REST entre React SPA y ASP.NET Core API con autenticación JWT |
|---|

Fig. 3.7. Diagrama de secuencia del flujo de comunicación REST con autenticación JWT.

<!-- tabla 24 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Diagrama de persistencia y mapeo relacional entre Entity Framework Core y la base de datos PostgreSQL |
|---|

Fig. 3.8. Flujo de persistencia y mapeo relacional con Entity Framework Core y PostgreSQL.
4. STACK TECNOLÓGICO
4.1 Backend
El backend de GirasolesRes fue desarrollado utilizando el framework de alto rendimiento ASP.NET Core Web API 8.0 sobre el lenguaje tipado C# 12. Las tecnologías y librerías que conforman el entorno de servidor han sido seleccionadas bajo rigurosos criterios de eficiencia, robustez y seguridad industrial [9].
La Tabla 4.1 detalla las tecnologías reales integradas en la solución de backend:
TABLA 4.1 — TECNOLOGÍAS Y DEPENDENCIAS DEL BACKEND

<!-- tabla 25 -->
| Componente Tecnológico | Versión Exacta | Rol Arquitectónico y Justificación Técnica |
|---|---|---|
| .NET SDK / Runtime | net8.0 (LTS) | Plataforma de ejecución de alto rendimiento con compilación Just-In-Time (JIT) optimizada y gestión eficiente de memoria para entornos transaccionales concurrentes [9]. |
| C# | 12.0 | Lenguaje de programación fuertemente tipado; aprovecha características modernas como tipos de registro (records), coincidencia de patrones avanzada y tipos de referencia anulables (nullable reference types) para prevenir excepciones NullReferenceException. |
| ASP.NET Core Web API | 8.0.6 | Framework para la exposición de endpoints RESTful con pipeline de middleware modular, inyección de dependencias nativa y alto rendimiento de I/O asíncrono [9]. |
| Entity Framework Core | 9.0.0 / 9.0.2 | Mapeador Objeto-Relacional (ORM) moderno que permite modelar consultas tipadas mediante LINQ, control de migraciones y seguimiento de cambios de estado con transacciones ACID [9]. |
| Npgsql.EntityFrameworkCore.PostgreSQL | 9.0.2 | Proveedor oficial de acceso a datos para PostgreSQL, optimizado para operaciones de alta concurrencia y mapeo de tipos complejos nativos de PostgreSQL [9]. |
| PostgreSQL | 18.0 | Sistema de gestión de bases de datos relacional de grado empresarial, que garantiza durabilidad transaccional estricta, integridad referencial y aislamiento ACID. |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.6 | Middleware para la validación de tokens Bearer en peticiones entrantes, verificando firma, emisor, audiencia y expiración criptográfica. |
| System.IdentityModel.Tokens.Jwt | 8.2.1 | Librería para la creación, serialización y validación de tokens JWT bajo algoritmo criptográfico simétrico HMAC-SHA256 [9]. |
| Microsoft.AspNetCore.Cryptography.KeyDerivation | 9.0.0 | Implementación del algoritmo estándar PBKDF2 (Password-Based Key Derivation Function 2) con pseudorandom function HMAC-SHA256, 100,000 iteraciones y salt criptográfico de 128 bits para el almacenamiento seguro de contraseñas de usuarios. |
| PdfCanvasBuilder | Nativo C# (Interno) | Motor vectorial propio de bajo nivel para la generación de documentos binarios en formato PDF 1.4 sin dependencias externas pesadas, asegurando renderizado determinista de comprobantes fiscales y actas de cierre de caja en menos de 10 milisegundos. |
| Swashbuckle.AspNetCore (Swagger / OpenAPI) | 6.6.2 | Generador automático de documentación técnica y explorador interactivo de endpoints REST bajo el estándar OpenAPI v3. |
| xUnit | 2.9.2 | Framework líder de pruebas unitarias para el ecosistema .NET [11]. |
| Moq | 4.20.72 | Librería para la creación de objetos simulados (mocking) que permite aislar dependencias de infraestructura durante las pruebas de aplicación. |

A continuación se insertan los marcadores correspondientes a las evidencias de configuración y ejecución del backend:

<!-- tabla 26 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Archivo Program.cs configurando el pipeline de ASP.NET Core y autenticación JWT |
|---|

Fig. 4.1. Configuración del pipeline de middleware y seguridad en backend/GirasolesRes.API/Program.cs.

<!-- tabla 27 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Archivo ApplicationDbContext.cs mostrando las entidades y configuración de Fluent API |
|---|

Fig. 4.2. Mapeo de entidades relacionales en backend/GirasolesRes.Infrastructure/Data/ApplicationDbContext.cs.

<!-- tabla 28 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Implementación de PasswordHasherService.cs con PBKDF2 y salt criptográfico |
|---|

Fig. 4.3. Servicio criptográfico de hashing en backend/GirasolesRes.Infrastructure/Security/PasswordHasherService.cs.

<!-- tabla 29 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Código fuente de PdfCanvasBuilder.cs generando vectores PDF directos |
|---|

Fig. 4.4. Motor nativo de generación vectorial de comprobantes en backend/GirasolesRes.Infrastructure/Common/PdfCanvasBuilder.cs.

<!-- tabla 30 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Interfaz de Swagger UI documentando los endpoints REST de GirasolesRes.API |
|---|

Fig. 4.5. Documentación interactiva de la API con Swagger UI (/swagger).
4.2 Frontend
El subsistema cliente fue implementado como una Aplicación de Página Única (SPA) de alto rendimiento, empleando las tecnologías más avanzadas del ecosistema de desarrollo web contemporáneo [10].
La Tabla 4.2 presenta las tecnologías y librerías del cliente web extraídas formalmente del archivo de configuración frontend/package.json:
TABLA 4.2 — TECNOLOGÍAS Y DEPENDENCIAS DEL FRONTEND

<!-- tabla 31 -->
| Componente Tecnológico | Versión Exacta | Rol Arquitectónico y Justificación Técnica |
|---|---|---|
| React | 19.2.8 | Librería principal para la construcción de interfaces de usuario declarativas mediante componentes basados en funciones, aprovechando las optimizaciones del compilador de React 19 y gestión granular del Virtual DOM [10]. |
| React DOM | 19.2.8 | Adaptador oficial de React para la manipulación y renderizado eficiente sobre el árbol DOM del navegador web [10]. |
| TypeScript | ~6.0.2 | Superset tipado de JavaScript que garantiza seguridad estricta de tipos en tiempo de compilación, previniendo errores de contrato entre el frontend y los DTOs del backend. |
| Vite | ^8.3.0 | Herramienta de construcción (bundler) y servidor de desarrollo ultrarrápido basado en módulos ES nativos (ESM), con tiempos de compilación y empaquetado para producción inferiores a 1.1 segundos. |
| Tailwind CSS | ^4.3.3 | Framework de diseño CSS basado en clases de utilidad de última generación (utility-first), que genera estilos optimizados con zero-runtime overhead. |
| @tailwindcss/vite | ^4.3.3 | Plugin oficial de Tailwind CSS para Vite que ejecuta la compilación de estilos de forma integrada y nativa dentro del pipeline de Vite. |
| Lucide React | ^1.57.0 | Conjunto completo de iconos vectoriales SVG de alta consistencia visual y soporte para accesibilidad. |
| Oxlint | ^1.81.0 | Linter estático ultrarrápido basado en Rust que analiza la calidad del código fuente TypeScript y detecta malas prácticas de programación. |
| Cliente HTTP Nativo (Fetch API) | Nativo ECMAScript | Implementación de cliente HTTP centralizado en services/apiClient.ts basado en window.fetch nativo del navegador, eliminando dependencias pesadas de terceros (como Axios) y garantizando ligereza absoluta en el bundle final. |

A continuación se insertan los marcadores correspondientes a las evidencias del frontend:

<!-- tabla 32 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Archivo package.json de frontend mostrando dependencias de React 19, Tailwind CSS 4 y Vite |
|---|

Fig. 4.6. Especificación de dependencias y scripts en frontend/package.json.

<!-- tabla 33 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Archivo vite.config.ts configurando el compilador de React y Tailwind CSS |
|---|

Fig. 4.7. Configuración de empaquetado en frontend/vite.config.ts.

<!-- tabla 34 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Código fuente de apiClient.ts mostrando manejo de fetch y tokens JWT |
|---|

Fig. 4.8. Cliente HTTP centralizado y manejo de credenciales en frontend/src/services/apiClient.ts.

<!-- tabla 35 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Código del componente App.tsx gestionando el enrutamiento y sesión de usuario |
|---|

Fig. 4.9. Control de navegación basada en estado y ciclo de vida de sesión en frontend/src/App.tsx.

<!-- tabla 36 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Terminal mostrando la compilación de producción exitosa con npm run build |
|---|

Fig. 4.10. Compilación de producción con Vite (tsc -b && vite build) completada en 1.00s.
4.3 Patrones de Diseño
Para garantizar la mantenibilidad, escalabilidad y testabilidad del sistema, se implementaron patrones de diseño consolidados tanto en el backend como en el frontend [4], [5], [10].
4.3.1 Patrones de Diseño en el Backend
La Tabla 4.3 describe los patrones de diseño arquitectónicos y de código aplicados en el servidor:
TABLA 4.3 — PATRONES DE DISEÑO IMPLEMENTADOS EN EL BACKEND

<!-- tabla 37 -->
| Patrón de Diseño | Clasificación | Implementación Concreta en el Código de GirasolesRes |
|---|---|---|
| Repository Pattern | Estructural / Acceso a Datos | Desacopla la lógica de negocio del acceso directo a la base de datos. Se definen contratos en la capa de aplicación (IPedidoRepository, ICajaRepository, IMesaRepository) y se implementan en infraestructura con EF Core (PedidoRepository.cs, CajaRepository.cs), facilitando el reemplazo o simulación de datos [4]. |
| Unit of Work (Transacciones Atómicas) | Comportamiento / Persistencia | Implementado de forma nativa a través de ApplicationDbContext y el método Database.BeginTransactionAsync(). Garantiza que operaciones complejas (como el cobro de un pedido que implica actualizar el pedido a "Pagado", liberar la mesa a "Libre", registrar la venta y crear el comprobante fiscal) se ejecuten bajo una transacción atómica indivisible con soporte para Commit o Rollback. |
| Inversión de Dependencias (Dependency Injection) | Creacional / Arquitectónico | El contenedor nativo de ASP.NET Core registra e inyecta servicios y repositorios con ciclo de vida Scoped a través de constructores en controladores y servicios de aplicación (DependencyInjection.cs), respetando el principio DIP de SOLID [4], [9]. |
| Data Transfer Object (DTO) | Estructural / Distribución | Encapsula y transporta datos entre los controladores de la API y el cliente web (CrearPedidoDto, CobroRequestDto, ComprobanteDetalleDto), ocultando las entidades de base de datos y previniendo vulnerabilidades de sobreexposición de campos (over-posting) [4]. |
| Result / Centralized Exception Handling | Comportamiento / Robustez | Patrón para la gestión homogénea de respuestas y excepciones operativas mediante un middleware que intercepta errores no controlados y devuelve respuestas estructuradas bajo el estándar RFC 7807 (ProblemDetails), evitando fugas de información interna del servidor [9]. |

4.3.2 Patrones de Diseño en el Frontend
La Tabla 4.4 sintetiza los patrones de diseño aplicados en la arquitectura del cliente:
TABLA 4.4 — PATRONES DE DISEÑO IMPLEMENTADOS EN EL FRONTEND

<!-- tabla 38 -->
| Patrón de Diseño | Clasificación | Implementación Concreta en el Código de GirasolesRes |
|---|---|---|
| Component-Based Architecture | Arquitectónico Frontend | Modularización jerárquica de la interfaz en unidades independientes y reutilizables agrupadas por dominios de negocio (mesas/, cocina/, caja/, pedidos/, menu-dia/, cobros/, ventas/, productos/, usuarios/, reportes/, dashboard/) y componentes transversales (ui/, layout/) [10]. |
| Container / Presentational | Arquitectónico UI | Separación rigurosa entre vistas orquestadoras inteligentes (pages/*.tsx) que coordinan estados y lógica asíncrona, y componentes visuales puros (components/ui/ y components/<dominio>/ como MesaCard, ComandaCard, Button, InputField) que solo reciben propiedades y emiten eventos [10]. |
| Custom Hooks Pattern | Comportamiento / Lógica Reutilizable | Encapsulamiento de lógica de negocio, temporizadores de inactividad, intervalos de sondeo y peticiones de red en funciones con prefijo use* (usePedidos, useCocina, useCaja), reutilizando comportamiento sin duplicar código en las vistas [10]. |
| State-Driven Navigation & Session Provider | Comportamiento / Enrutamiento | Gestión centralizada de la navegación mediante estados reactivos en App.tsx y HomePage.tsx. Controla la renderización condicional de vistas según la sesión activa y el rol del usuario, asegurando que perfiles no autorizados sean redirigidos automáticamente [10]. |
| Component Composition Pattern | Creacional / Modularidad | Construcción de interfaces complejas mediante la composición de componentes atómicos más pequeños envueltos en layouts estructurales (MainLayout, AuthLayout), maximizando la reutilización y consistencia de estilos [10]. |

A continuación se insertan los marcadores correspondientes a las evidencias de patrones de diseño:

<!-- tabla 39 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Implementación de la interfaz IPedidoRepository y su clase concreta PedidoRepository.cs |
|---|

Fig. 4.11. Implementación del Repository Pattern en GirasolesRes.Infrastructure/Repositories/PedidoRepository.cs.

<!-- tabla 40 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Transacción atómica de cobro utilizando IDbContextTransaction en CobroService.cs |
|---|

Fig. 4.12. Aplicación del patrón Unit of Work y transacciones atómicas en CobroService.cs.

<!-- tabla 41 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Componente presentacional puro Button.tsx o InputField.tsx recibiendo props tipadas |
|---|

Fig. 4.13. Componente presentacional atómico en frontend/src/components/common/Button.tsx.

<!-- tabla 42 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Custom Hook o servicio desacoplado consumido en PedidoMesaPage.tsx |
|---|

Fig. 4.14. Desacoplamiento de lógica de estado mediante Custom Hooks y servicios en el frontend.
4.4 Herramientas de Desarrollo, Pruebas y Base de Datos
El ciclo de vida del desarrollo de software de GirasolesRes fue respaldado por un conjunto de herramientas profesionales de desarrollo, integración continua, control de versiones y gestión de base de datos [1], [11].
La Tabla 4.5 presenta las herramientas utilizadas y su propósito específico en el proyecto:
TABLA 4.5 — HERRAMIENTAS DEL ENTORNO DE DESARROLLO Y CALIDAD

<!-- tabla 43 -->
| Herramienta | Versión / Entorno | Propósito y Rol en el Ciclo de Desarrollo |
|---|---|---|
| Visual Studio 2022 / VS Code | v17.10 / v1.95+ | Entornos de Desarrollo Integrado (IDE) principales para la edición, depuración interactiva de código C# y TypeScript, refactorización y navegación de soluciones. |
| Git | 2.40+ | Sistema de control de versiones distribuido para la gestión granular del historial de cambios y colaboración del equipo de desarrollo. |
| GitHub | Repositorio Remoto en la Nube | Plataforma de alojamiento remoto del código fuente, control de ramas (main), revisiones de código (pull requests) y trazabilidad de incidencias. |
| GitHub Actions CI | Automatización en la Nube | Tubería de Integración Continua (Continuous Integration) que ejecuta automáticamente la compilación de la solución .NET, la compilación de Vite y la ejecución de la suite de pruebas unitarias ante cada inserción al repositorio. |
| xUnit Test Runner | v2.9.2 | Motor de ejecución de pruebas unitarias que evalúa los 91 casos de prueba del backend en tiempo récord con cobertura de código. |
| Postman / REST Client | v11+ | Herramienta de pruebas de integración de API para la formulación, inspección y validación de endpoints HTTP, verificación de cabeceras JWT y simulación de escenarios de error. |
| pgAdmin 4 / psql | v8+ | Herramientas de administración gráfica y consola para el motor PostgreSQL 18, utilizadas para la creación de esquemas, ejecución de scripts de migración y auditoría de datos. |
| Swagger UI | v6.6.2 (OpenAPI 3.0) | Interfaz visual interactiva generada automáticamente en tiempo de ejecución para la exploración y prueba directa de los contratos de la API REST. |
| Google Chrome / Edge DevTools | Última versión estable | Suite de herramientas de desarrollo en navegador web para la inspección de red (Network), auditoría de accesibilidad, validación del Virtual DOM y medición de métricas de rendimiento Web Vitals (cero Cumulative Layout Shift). |

A continuación se insertan los marcadores correspondientes a las evidencias de las herramientas del entorno de desarrollo:

<!-- tabla 44 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Entorno de trabajo en Visual Studio / VS Code con el proyecto cargado |
|---|

Fig. 4.15. Entorno de desarrollo integrado configurado para el proyecto GirasolesRes.

<!-- tabla 45 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Consola ejecutando comandos de Git (git status / git log) en la rama main |
|---|

Fig. 4.16. Control de versiones local mediante Git y convenciones de commit estandarizadas.

<!-- tabla 46 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Vista principal del repositorio de GirasolesRes en GitHub |
|---|

Fig. 4.17. Repositorio remoto centralizado del proyecto en la plataforma GitHub.

<!-- tabla 47 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Panel de GitHub Actions mostrando la ejecución exitosa de los flujos de CI |
|---|

Fig. 4.18. Flujo automatizado de Integración Continua (CI) en GitHub Actions.

<!-- tabla 48 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Terminal ejecutando dotnet test con los 91 casos de prueba superados al 100% |
|---|

Fig. 4.19. Ejecución de la suite de pruebas automatizadas con xUnit (dotnet test --no-build).

<!-- tabla 49 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Colección de peticiones probadas en Postman contra la API de GirasolesRes |
|---|

Fig. 4.20. Pruebas de integración de endpoints REST y autenticación JWT en Postman.

<!-- tabla 50 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Interfaz de pgAdmin 4 mostrando las tablas y relaciones de la base de datos PostgreSQL |
|---|

Fig. 4.21. Estructura de tablas y esquemas relacionales en PostgreSQL 18 a través de pgAdmin 4.

<!-- tabla 51 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Pestaña Network y Console de Chrome DevTools inspeccionando una llamada a la API |
|---|

Fig. 4.22. Diagnóstico de peticiones asíncronas y rendimiento en Chrome DevTools.

<!-- tabla 52 -->
| 📷  [ÁREA DESIGNADA PARA PEGAR LA CAPTURA DE PANTALLA]
Referencia visual requerida: Vista de la interfaz gráfica de Swagger UI explorando los controladores de la API |
|---|

Fig. 4.23. Catálogo de endpoints y contratos REST expuesto en Swagger UI.
REFERENCIAS BIBLIOGRÁFICAS
•  [1] R. S. Pressman y B. R. Maxim, Ingeniería del Software: Un enfoque práctico, 9.ª ed., Ciudad de México, México: McGraw-Hill Interamericana, 2021.
•  [2] I. Sommerville, Ingeniería de Software, 10.ª ed., Ciudad de México, México: Pearson Educación, 2016.
•  [3] International Organization for Standardization, ISO/IEC 25010:2011 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models, Ginebra, Suiza: ISO, 2011.
•  [4] R. C. Martin, Clean Architecture: A Craftsman's Guide to Software Structure and Design, Boston, MA, EE. UU.: Prentice Hall, 2018.
•  [5] R. C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship, Boston, MA, EE. UU.: Prentice Hall, 2008.
•  [6] J. Nielsen, 10 Usability Heuristics for User Interface Design, Fremont, CA, EE. UU.: Nielsen Norman Group, 1994. [En línea]. Disponible en: https://www.nngroup.com/articles/ten-usability-heuristics/
•  [7] B. Shneiderman, C. Plaisant, M. S. Cohen, S. Jacobs, N. Elmqvist y N. Diakopoulos, Designing the User Interface: Strategies for Effective Human-Computer Interaction, 6.ª ed., Boston, MA, EE. UU.: Pearson, 2016.
•  [8] D. A. Norman, The Design of Everyday Things: Revised and Expanded Edition, Nueva York, NY, EE. UU.: Basic Books, 2013.
•  [9] Microsoft Corporation, .NET Application Architecture Guidance: Clean Architecture with ASP.NET Core, Redmond, WA, EE. UU.: Microsoft Learn Documentation, 2024. [En línea]. Disponible en: https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
•  [10] Meta Platforms & React Open Source Community, React 19 Documentation: Architectural Principles and Concurrent Rendering, Menlo Park, CA, EE. UU.: React Official Docs, 2024. [En línea]. Disponible en: https://react.dev/
•  [11] IEEE Computer Society, ISO/IEC/IEEE 29119-1:2022 Software and systems engineering — Software testing — Part 1: General concepts, Nueva York, NY, EE. UU.: IEEE, 2022.
•  [12] Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT), Resolución de Superintendencia N.° 097-2012/SUNAT y modificatorias: Normativa Técnica sobre Comprobantes de Pago Electrónicos y Facturación en el Perú, Lima, Perú: SUNAT, 2024.