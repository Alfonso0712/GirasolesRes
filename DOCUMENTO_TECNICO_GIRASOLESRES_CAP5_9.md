# DOCUMENTO TÉCNICO DE PRESENTACIÓN DEL SOFTWARE
## Sistema Web GirasolesRes para la Gestión Operativa y Control de Ventas del Restaurante Girasoles

---

### DATOS INFORMATIVOS
* **Institución:** Universidad Peruana Los Andes
* **Facultad:** Facultad de Ingeniería
* **Escuela Profesional:** Ingeniería de Sistemas y Computación
* **Asignatura:** Construcción de Software
* **Docente / Asesor:** Ing. Jorge Alberto Vega Flores
* **Proyecto:** Software GirasolesRes para el control de ventas y gestión integral del restaurante Girasoles
* **Estudiante / Responsable:** CHUQUI CONTRERAS Jazztin William
* **Versión del documento:** 1.0 (Capítulos 5 al 9)
* **Fecha:** Octubre de 2026

---

# 5. Cumplimiento del Modelo de Calidad ISO/IEC 25010

La norma internacional ISO/IEC 25010 (Systems and software Quality Requirements and Evaluation - SQuaRE) establece un modelo jerárquico para la evaluación de la calidad del producto software compuesto por ocho características principales y múltiples subcaracterísticas asociadas. Durante la concepción, diseño e implementación del sistema web **GirasolesRes**, se adoptaron patrones arquitectónicos, principios de Clean Architecture y rigurosas prácticas de desarrollo orientadas a satisfacer cada uno de estos atributos de calidad, asegurando una plataforma robusta, segura y altamente adaptada a la dinámica comercial de un restaurante gastronómico peruano.

---

## 5.1 Adecuación Funcional (Functional Suitability)

La adecuación funcional evalúa la capacidad del producto software para proporcionar funciones que satisfacen las necesidades declaradas e implícitas bajo condiciones especificadas. Se desglosa en tres subcaracterísticas:

### 5.1.1 Completitud Funcional
El sistema **GirasolesRes** implementa la totalidad de los requisitos funcionales requeridos para la operación del restaurante, cubriendo el ciclo completo del servicio a través de 15 Casos de Uso del Sistema (CUS):
* **Gestión de Acceso y Perfiles (CUS01, CUS02, CUS03):** Autenticación de usuarios por credenciales, gestión del personal con asignación estricta de roles y actualización de perfil/cambio de contraseña con modal de validación.
* **Carta, Menús y Disponibilidad Diaria (CUS04, CUS05):** Catálogo de platos, bebidas y componentes con precio unitario, configuración de menús completos (Entrada + Segundo + Bebida) y planificación del menú diario con control dinámico de platos agotados.
* **Gestión de Salón y Toma de Pedidos (CUS06, CUS07, CUS08):** Mapa interactivo de mesas con visualización de estado (Libre, Ocupada, Inactiva), comanda digital en mesa y pedidos express para llevar.
* **Seguimiento y Cocina KDS (CUS09, CUS10):** Monitor de pedidos en tiempo real y pantalla de visualización de cocina (Kitchen Display System) con alertas sonoras, control de preparación y opción de deshacer en 10 segundos.
* **Caja, Facturación Electrónica y Ventas (CUS11, CUS12, CUS13):** Proceso de cobro de cuentas con cálculo automático de cambio, emisión de comprobantes autorizados (Ticket T001, Boleta B001 con consulta RENIEC, Factura F001 con consulta SUNAT), auditoría de ventas, apertura y cierre de caja con arqueo físico de billetes y monedas.
* **Analítica y Control Gerencial (CUS14, CUS15):** Reportes detallados de ventas y platos vendidos con exportación en PDF (A4) y Excel (CSV UTF-8), complementado con un panel de control (Dashboard) con métricas financieras y operativas del día.

### 5.1.2 Corrección Funcional
El sistema entrega resultados matemáticos y lógicos exactos según las normas tributarias y operativas:
* Cálculo preciso de subtotales, Impuesto General a las Ventas (IGV 18%) y total a pagar.
* Redondeo monetario comercial a dos decimales y desglose de montos en efectivo y billeteras digitales (Yape / Plin).
* Generación secuencial y correlativa ininterrumpida de series de comprobantes (T001-XXXXXX, B001-XXXXXX, F001-XXXXXX).
* Cálculo automatizado de la diferencia de caja durante el arqueo (`Diferencia = Saldo Real Físico - Saldo Esperado en Sistema`), alertando sobre faltantes o sobrantes.

### 5.1.3 Pertinencia Funcional
Cada flujo y pantalla del sistema fue diseñado para asistir de manera directa y oportuna las tareas específicas de cada colaborador según su rol en el restaurante (Mozo, Cocinero, Cajero, Administrador), eliminando pasos innecesarios y optimizando el tiempo de atención al cliente.

**Evidencias:**

*Figura 5.1. Dashboard principal con indicadores operativos del restaurante.*
![Figura 5.1](screenshots/fig-5-1.png)

*Figura 5.2. Gestión y distribución del salón de mesas.*
![Figura 5.2](screenshots/fig-5-2.png)

*Figura 5.3. Monitor de comandas de cocina KDS con tiempos de preparación.*
![Figura 5.3](screenshots/fig-5-3.png)

*Figura 5.4. Módulo de cobro de pedidos con desglose de métodos de pago.*
![Figura 5.4](screenshots/fig-5-4.png)

---

## 5.2 Eficiencia de Desempeño (Performance Efficiency)

Esta característica evalúa el rendimiento del software en relación con la cantidad de recursos utilizados bajo condiciones determinadas:

### 5.2.1 Comportamiento Temporal
* **Tiempos de Respuesta (RNF-01):** Las transacciones críticas (apertura de comanda, cobro de cuenta y emisión de comprobante) se procesan en un tiempo inferior a 1.2 segundos en red local, superando el umbral máximo de 2 segundos estipulado en los requisitos no funcionales.
* **Sincronización en Tiempo Real:** El sistema implementa sondeos periódicos asíncronos y silenciosos (*silent polling*) que actualizan las pantallas operativas sin recargar la página ni congelar la interfaz:
  * Cocina KDS: sondeo cada 3 segundos para captura inmediata de nuevas comandas.
  * Cobros de Caja y Mesas: sondeo cada 10 segundos para refrescar pedidos listos y estado del salón.
  * Temporizador de frescura visible (`Actualizado hace X s`) con botón de actualización manual bajo demanda.

### 5.2.2 Utilización de Recursos
* **Backend Optimizado (.NET 9):** Implementación integral de programación asíncrona (`async/await`) en controladores, servicios y repositorios, liberando hilos del pool de servidores IIS/Kestrel.
* **Entity Framework Core 9:** Uso de consultas de solo lectura con `AsNoTracking()` para listados masivos, paginación obligatoria por base de datos (`Skip()` y `Take()`) e índices optimizados en tablas transaccionales (`pedidos`, `ventas`, `cierres_caja`).
* **Frontend Ligero (Vite + React 19):** Empaquetado optimizado mediante *tree-shaking*, compresión Gzip en assets y carga condicional de modales pesados mediante lazy loading.

### 5.2.3 Capacidad
La arquitectura stateless del backend y la persistencia en PostgreSQL permiten soportar holgadamente la concurrencia simultánea de más de 20 dispositivos (tablets de mozos, pantalla de cocina y puestos de caja) sin degradación de rendimiento.

**Evidencias:**

*Figura 5.5. Temporizador de frescura y actualización manual en barra operativa.*
![Figura 5.5](screenshots/fig-5-5.png)

*Figura 5.6. Historial de cierres de caja y auditoría financiera de turnos.*
![Figura 5.6](screenshots/fig-5-6.png)

---

## 5.3 Compatibilidad (Compatibility)

Evalúa la capacidad de dos o más sistemas o componentes para intercambiar información y realizar sus funciones compartiendo el mismo entorno hardware o software:

### 5.3.1 Coexistencia
El cliente web de **GirasolesRes** se ejecuta de manera independiente en el navegador sin generar interferencias con controladores de impresoras térmicas (EPSON ESC/POS), software de monitoreo de red ni aplicaciones ofimáticas instaladas en el puesto de trabajo.

### 5.3.2 Interoperabilidad
* **Integración con Servicios Externos:** El módulo de cobros se comunica mediante clientes HTTP tipados con APIs de verificación de identidad:
  * Validación de DNI de 8 dígitos para Boletas electrónicas mediante servicio RENIEC.
  * Validación de RUC de 11 dígitos y razón social para Facturas electrónicas mediante servicio SUNAT.
* **Exportación Estándar de Datos:** Capacidad de interoperar con software de contabilidad mediante exportación estructurada en CSV (UTF-8 con delimitador punto y coma) y documentos portables PDF estándar para arqueos de caja y balances de venta.

**Evidencias:**

*Figura 5.7. Modal de cobro con consulta e integración de DNI / Boleta.*
![Figura 5.7](screenshots/fig-5-7.png)

*Figura 5.8. Modal de cobro con validación de RUC y razón social para Factura.*
![Figura 5.8](screenshots/fig-5-8.png)

---

## 5.4 Usabilidad (Usability)

La usabilidad cuantifica el grado en que el software puede ser utilizado por usuarios específicos para lograr metas definidas con eficacia, eficiencia y satisfacción. El diseño de interfaz de **GirasolesRes** fue homologado rigurosamente bajo los diez principios heurísticos de Jakob Nielsen:

1. **Visibilidad del estado del sistema (Heurística 1):** Indicadores visuales claros en todo momento: estados de mesa por colores, temporizadores de cocina en minutos y segundos transcurridos, alertas visuales en caso de desconexión y contadores de pedidos pendientes.
2. **Correspondencia entre el sistema y el mundo real (Heurística 2):** Lenguaje culinario y administrativo natural para el personal: *Mesa*, *Salón*, *Para Llevar*, *Comanda*, *Entrada*, *Segundo*, *Plato Agotado*, *Boleta*, *Factura* y *Arqueo de Denominaciones*.
3. **Control y libertad del usuario (Heurística 3):** Opción de "Deshacer" con temporizador visible de 10 segundos en cocina si una comanda se marcó como lista por error accidental (RV-88), y modales de confirmación con cancelación limpia que no alteran la base de datos.
4. **Consistencia y estándares (Heurística 4):** Sistema de diseño corporativo homologado en toda la aplicación:
   * Modales estándar en fondo blanco (`bg-white rounded-2xl border-neutral-200/80 shadow-2xs`) con cabecera diferenciada y botón de cierre universal (`.modal-close-btn`).
   * Barras de herramientas con buscador a la izquierda, botón de borrado rápido `<X>` y filtros segmentados en color café oscuro `#2C1A0E` para ítems activos.
   * Botones de acción principal en color naranja corporativo institucional (`#D35400` / `#B84600`).
5. **Prevención de errores (Heurística 5):** Bloqueo reactivo de botones de acción cuando existen formularios inválidos, desactivación del botón de cobro si la comanda sigue en preparación en cocina, y confirmación obligatoria para anular ventas con motivo exigido.
6. **Reconocimiento antes que recuerdo (Heurística 6):** Código semántico de colores intuitivo en toda la plataforma:
   * **Ámbar / Naranja:** Pendiente de atención o preparación.
   * **Azul:** En preparación en cocina.
   * **Verde:** Listo para servir o entregado.
   * **Gris:** Cuenta pagada o mesa libre.
   * **Rojo:** Anulado o alerta crítica.
7. **Flexibilidad y eficiencia de uso (Heurística 7):** Atajos rápidos de selección de fechas (`Hoy`, `Ayer`, `7 días`, `30 días`), contador rápido de denominaciones con botones de incremento/decremento (`+` / `-`) y filtros de un clic para pedidos de salón o para llevar.
8. **Diseño estético y minimalista (Heurística 8):** Eliminación de elementos decorativos innecesarios; paneles limpios con tipografía clara y jerarquizada (*Inter / Sans-serif*) y bordes redondeados modernos.
9. **Ayudar a reconocer, diagnosticar y recuperarse de errores (Heurística 9):** Mensajes de error en lenguaje claro y comprensible (ej: *"El saldo final no puede ser menor a cero"*, *"Ingrese un RUC válido de 11 dígitos que comience con 10 o 20"*), con botones de acción directa como *"Reintentar"* o *"Quitar filtros"*.
10. **Ayuda y documentación (Heurística 10):** Textos guía de soporte (*placeholders* descriptivos, subtítulos contextuales bajo cada cabecera y tooltips informativos en botones de icono).

**Evidencias:**

*Figura 5.9. Barra de filtros unificada con estilo café oscuro y buscador con botón de limpieza.*
![Figura 5.9](screenshots/fig-5-5.png)

*Figura 5.10. Modal estandarizado para apertura de caja con fondo inicial.*
![Figura 5.10](screenshots/fig-5-10.png)

*Figura 5.11. Arqueo de denominaciones monetarias con controles táctiles.*
![Figura 5.11](screenshots/fig-5-11.png)

*Figura 5.12. Modal de cierre definitivo de caja con balance y cuadre de efectivo.*
![Figura 5.12](screenshots/fig-5-12.png)

---

## 5.5 Fiabilidad (Reliability)

Mide la capacidad del sistema para mantener un nivel determinado de rendimiento bajo condiciones establecidas durante un período de tiempo:

### 5.5.1 Madurez
El código del sistema fue sometido a ciclos iterativos de pruebas unitarias y de integración que eliminaron errores tempranos en los cálculos financieros y transiciones de estado.

### 5.5.2 Disponibilidad (RNF-03)
La plataforma está diseñada para una disponibilidad ininterrumpida durante la jornada de atención del restaurante (100% de operatividad en horario de servicio). La sesión del usuario se mantiene activa de forma persistente mientras exista actividad comercial.

### 5.5.3 Tolerancia a Fallos
* **Protección ante Desconexión de Red (RV-90 / MSG-132):** Si el servidor o la red Wi-Fi experimenta una caída temporal, el monitor de cocina y la vista de mesas no se bloquean ni pierden la información en pantalla; despliegan una franja de advertencia visual color ámbar/rojo con contador de reconexión y reintentos silenciosos automáticos.
* **Control de Idempotencia (RV-89):** Las acciones críticas en cocina y caja bloquean el botón durante el procesamiento para evitar doble cobro o doble cambio de estado ante pulsaciones repetidas del usuario.

### 5.5.4 Recuperabilidad
Las operaciones de cobro y cierre de caja se ejecutan bajo transacciones de base de datos (`IDbContextTransaction` en PostgreSQL). Si ocurre una falla antes de confirmar el comprobante o asentar el movimiento de caja, se ejecuta un `Rollback()` automático, impidiendo registros incompletos o inconsistencias contables.

**Evidencias:**

*Figura 5.13. Manejo controlado de errores con alerta semántica de credenciales.*
![Figura 5.13](screenshots/fig-5-13.png)

*Figura 5.14. Control de acceso y protección ante cuenta de usuario inactivo.*
![Figura 5.14](screenshots/fig-5-14.png)

---

## 5.6 Seguridad (Security)

Evalúa la capacidad de proteger la información y los datos para que personas o sistemas no autorizados no puedan leerlos ni modificarlos:

### 5.6.1 Confidencialidad
* **Autenticación mediante JWT:** Tokens seguros generados con algoritmo simétrico HMAC-SHA256, con tiempo de expiración controlado y enviados mediante cabecera HTTP `Authorization: Bearer <token>`.
* **Cifrado de Contraseñas:** Las contraseñas de los usuarios no se almacenan en texto plano; son procesadas con el algoritmo criptográfico **BCrypt** con factor de trabajo (*work factor*) seguro y salting aleatorio irreversible.

### 5.6.2 Integridad y Validación
* Validación estricta en dos capas: validación reactiva en cliente mediante React y validación obligatoria en servidor mediante Data Annotations y validadores en la capa de Aplicación de .NET.
* Sanitización contra inyección SQL gracias a consultas 100% parametrizadas a través del ORM Entity Framework Core.
* Prevención de ataques Cross-Site Scripting (XSS) y falsificación de peticiones.

### 5.6.3 No Repudio y Auditoría
* **Auditoría de Operaciones Sensibles (RN-101 / RN-114):** Toda anulación de pedidos o ventas exige un motivo obligatorio y almacena el identificador del usuario responsable, la fecha exacta y la estación desde la cual se ejecutó.
* **Trazabilidad de Caja:** El historial de cierres almacena tanto el balance teórico del sistema como el conteo físico declarado por el cajero con nombre de usuario y marca de tiempo inmutable.

### 5.6.4 Autenticidad y Autorización (RBAC)
Control de Acceso Basado en Roles (Role-Based Access Control) con 4 perfiles estrictamente segmentados:
* `Administrador`: Acceso total (usuarios, productos, menú del día, reportes, anulación de ventas y cierres).
* `Cajero`: Gestión de caja, cobros, facturación, consulta de ventas y anulación de pedidos no pagados.
* `Mozo`: Gestión de salón, apertura de mesas y comanda de pedidos (salón y para llevar).
* `Cocinero`: Acceso exclusivo al monitor KDS de preparación de comandas y reporte de platos agotados.

**Evidencias:**

*Figura 5.15. Pantalla de inicio de sesión con autenticación y perfiles de demostración.*
![Figura 5.15](screenshots/fig-5-15.png)

*Figura 5.16. Modal de cambio de contraseña con validación de reglas de seguridad.*
![Figura 5.16](screenshots/fig-5-16.png)

*Figura 5.17. Pantalla de gestión de usuarios con asignación de roles RBAC.*
![Figura 5.17](screenshots/fig-5-17.png)

*Figura 5.18. Modal de registro de nuevo usuario con controles de acceso.*
![Figura 5.18](screenshots/fig-5-18.png)

*Figura 5.19. Modal de detalle y auditoría de venta con motivo obligatorio de anulación.*
![Figura 5.19](screenshots/fig-5-19.png)

---

## 5.7 Mantenibilidad (Maintainability)

Representa la eficacia y eficiencia con la que el producto de software puede ser modificado por los desarrolladores para mejorarlo, corregirlo o adaptarlo:

### 5.7.1 Modularidad y Arquitectura Limpia (Clean Architecture)
El backend está organizado en cuatro capas estrictamente desacopladas siguiendo la regla de dependencia de Clean Architecture:
1. **Domain Layer:** Entidades de negocio (`Usuario`, `Mesa`, `Pedido`, `Venta`, `Comprobante`, `CierreCaja`), tipos enumerados y reglas puras sin dependencias tecnológicas.
2. **Application Layer:** Casos de uso, interfaces de servicios, DTOs de entrada/salida y validadores lógicos.
3. **Infrastructure Layer:** Acceso a datos con Entity Framework Core 9, repositorios PostgreSQL, migraciones de esquema y servicios de cifrado BCrypt.
4. **API Layer (Presentation):** Controladores RESTful, middleware de manejo global de excepciones y configuración de políticas de seguridad.

### 5.7.2 Reutilizabilidad en Frontend
El cliente web está estructurado bajo una arquitectura orientada a características (*Feature-Based Architecture*) con principios de Atomic Design:
* Componentes desacoplados en `components/`: modales reutilizables, inputs formateados, tablas con scroll virtual y selectores de fecha.
* Lógica de estado encapsulada en Custom Hooks (`useVentasManagement`, `useCobrosManagement`, `usePedidosManagement`, `useProductsManagement`).

### 5.7.3 Capacidad de Modificación y Prueba
La inyección de dependencias nativa de .NET (`IServiceCollection`) permite sustituir implementaciones de servicios o repositorios por *mocks* de prueba sin alterar la lógica de negocio ni romper controladores existentes.

**Evidencias:**

*Figura 5.20. Catálogo general de productos y carta con conmutadores de disponibilidad.*
![Figura 5.20](screenshots/fig-5-20.png)

*Figura 5.21. Modal de registro y categorización de nuevos productos.*
![Figura 5.21](screenshots/fig-5-21.png)

*Figura 5.22. Módulo de planificación y publicación del Menú del Día.*
![Figura 5.22](screenshots/fig-5-22.png)

---

## 5.8 Portabilidad (Portability)

Capacidad del sistema de ser transferido de un entorno de hardware, software u operativo a otro:

### 5.8.1 Adaptabilidad
El backend desarrollado en **.NET 9** es completamente multiplataforma, capaz de compilarse y ejecutarse de forma nativa en sistemas operativos **Windows Server**, **Linux (Ubuntu, Alpine, Debian)** y entornos de contenedores **Docker**.

### 5.8.2 Facilidad de Instalación y Despliegue
* Base de datos relacional estándar **PostgreSQL**, ejecutable en servidores locales o servicios gestionados en la nube (AWS RDS, Azure Database, Supabase).
* Frontend generado como una Single Page Application (SPA) con activos estáticos HTML/JS/CSS optimizados por Vite, desplegable en servidores web como Nginx, Apache o plataformas de borde (*Edge Networks*).

### 5.8.3 Capacidad de Reemplazo
La arquitectura basada en API REST y comunicación en formato JSON estandarizado garantiza que el cliente web pueda coexistir o ser reemplazado en el futuro por aplicaciones móviles nativas (iOS / Android) o terminales de autoservicio para clientes sin requerir modificaciones en la API central.

**Evidencias:**

*Figura 5.23. Panel analítico de reportes operativos y distribución horaria de ventas.*
![Figura 5.23](screenshots/fig-5-23.png)

*Figura 5.24. Interfaz responsiva para toma de pedidos express para llevar.*
![Figura 5.24](screenshots/fig-5-24.png)

---

# 6. Estándares y Proceso de Pruebas

Para asegurar la calidad, estabilidad y precisión comercial de **GirasolesRes**, el proceso de verificación y validación del software se fundamentó en estándares internacionales de la industria: el **Modelo en V**, las directrices de diseño de pruebas de **ISTQB** y el estándar de gestión de pruebas **ISO/IEC/IEEE 29119**.

---

## 6.1 Modelo en V

El Modelo en V se utilizó como marco metodológico para garantizar la correspondencia biunívoca entre cada etapa de diseño/especificación y su respectivo nivel de evaluación y pruebas:

| Fase de Especificación / Diseño | Nivel de Prueba Asociado | Aplicación en el Proyecto GirasolesRes |
| :--- | :--- | :--- |
| **Requisitos del Negocio (CUS01 - CUS15)** | **Pruebas de Aceptación (UAT)** | Validación de flujos comerciales completos por roles reales (Mozo, Cajero, Cocinero, Administrador). |
| **Diseño de Arquitectura del Sistema** | **Pruebas de Sistema** | Evaluación de rendimiento, concurrencia, tolerancia a fallos de red y seguridad integral. |
| **Diseño de APIs y Servicios** | **Pruebas de Integración** | Comunicación Frontend ↔ Web API ↔ PostgreSQL vía contratos REST y Swagger UI. |
| **Implementación de Código y Reglas** | **Pruebas Unitarias** | Validación aislada de algoritmos de cálculo, restricciones de dominio y servicios con xUnit. |

---

## 6.2 Aplicación de ISTQB

Las técnicas de diseño de pruebas fueron seleccionadas siguiendo el estándar del *International Software Testing Qualifications Board* (ISTQB):
* **Partición de Equivalencia:** División de clases de entrada válidas e inválidas (ejemplo: montos de apertura de caja positivos válidos vs montos negativos o cero inválidos; estados de pedidos que admiten anulación vs estados finales cerrados).
* **Análisis de Valores Límite (BVA):** Evaluación en los extremos permitidos:
  * Campo de búsqueda: cadenas vacías, de 1 caracter, de 50 caracteres (límite) y mayores a 50 (rechazadas).
  * Longitud de documento: DNI exactamente de 8 dígitos numéricos; RUC exactamente de 11 dígitos numéricos comenzando en 10 o 20.
  * Porcentaje de stock y límites monetarios de platos hasta S/ 999.99.
* **Pruebas de Transición de Estados:** Verificación de las máquinas de estado finitas del restaurante:
  * Mesa: `Libre` → `Ocupada` → `Libre`.
  * Pedido: `Pendiente` → `EnPreparacion` → `Listo` → `Pagado` (o `Anulado`).
  * Caja: `Cerrada` → `Abierta` → `Cerrada`.

---

## 6.3 Aplicación de la Norma ISO/IEC/IEEE 29119

El ciclo de aseguramiento de calidad adoptó la estructura formal de procesos de la norma ISO/IEC/IEEE 29119:
1. **Plan de Pruebas (Test Plan):** Definición de objetivos de calidad (cero discrepancias contables en cobros, cero fallos críticos en comanda de cocina), alcance funcional, recursos y cronograma.
2. **Diseño de Casos de Prueba (Test Cases):** Especificación de precondiciones, pasos de ejecución, datos de prueba y resultados esperados para cada CUS.
3. **Criterios de Entrada y Salida:** 
   * *Entrada:* Compilación limpia sin advertencias críticas y base de datos con semillas operativas.
   * *Salida:* 100% de casos de prueba críticos aprobados y cero defectos de severidad alta pendientes.
4. **Registro y Trazabilidad:** Mapeo de cada caso de prueba contra su regla de negocio correspondiente (RN) y reporte de incidencias documentado.

---

## 6.4 Pruebas Unitarias

Implementadas en el backend mediante el framework **xUnit** y librerías de aserciones de .NET, enfocándose en la lógica de negocio pura de las capas *Domain* y *Application*:
* **Cálculo de Totales y Redondeos:** Verificación matemática de que la sumatoria de ítems de pedido coincida exactamente con el total liquidado en la venta y comprobante.
* **Validación de Reglas de Anulación (RN-80 / RN-101):** Validación de que un pedido con estado `Pagado` no pueda ser anulado a través del flujo de pedidos ordinarios, exigiendo el flujo formal de anulación de venta.
* **Correlatividad de Comprobantes:** Verificación del generador de numeración para asegurar que no se produzcan saltos ni comprobantes duplicados ante transacciones concurrentes.
* **Validación de Arqueo:** Verificación del cálculo de diferencias en denominaciones de billetes (S/ 200, 100, 50, 20, 10) y monedas (S/ 5, 2, 1, 0.50, 0.20, 0.10).

**Evidencias:**

*Figura 6.1. Monitor de trazabilidad de estados y comandas en Gestión de Pedidos.*
![Figura 6.1](screenshots/fig-6-1.png)

---

## 6.5 Pruebas de Integración

Evaluaron la interacción continua entre los componentes del ecosistema tecnológico:
* **Frontend ↔ API REST:** Comprobación del intercambio de payloads JSON, cabeceras HTTP de autenticación JWT y tratamiento unificado de códigos de estado HTTP (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error).
* **API REST ↔ PostgreSQL con EF Core:** Validación de operaciones CRUD, inserción de detalles de pedido en cascada y persistencia de auditorías.
* **Pruebas Interactivas con Swagger UI:** Verificación manual y automatizada de los endpoints expuestos mediante la documentación interactiva OpenAPI/Swagger.

**Evidencias:**

*Figura 6.2. Documentación y prueba interactiva de endpoints RESTful en Swagger UI (/swagger).*
![Figura 6.2](screenshots/fig-6-2.png)

*Figura 6.3. Validación de restricciones de integridad relacional en creación de mesas.*
![Figura 6.3](screenshots/fig-6-3.png)

---

## 6.6 Pruebas Funcionales

Validaron el comportamiento del sistema frente a las necesidades operativas del restaurante, cubriendo tanto escenarios exitosos como condiciones de error:
1. **Flujo de Acceso:** Login correcto por rol, bloqueo por credenciales erróneas (MSG-02) y detección de usuario inactivo (MSG-04).
2. **Flujo de Apertura de Caja:** Validación de saldo inicial obligatorio mayor a cero y bloqueo de operaciones de cobro si la caja está cerrada.
3. **Flujo de Menú del Día:** Definición de opciones del día, habilitación de menús completos y control de platos agotados con confirmación modal.
4. **Flujo de Toma de Comanda:** Creación de comanda de mesa con selección de entradas y segundos, envío instantáneo a cocina y bloqueo de mesa asignada.
5. **Flujo de Cocina KDS:** Recepción con aviso sonoro, paso a "En preparación" con temporizador de advertencia a los 10 minutos (RV-93) y despacho a "Listo".
6. **Flujo de Cobro y Facturación:** Cobro con cálculo de cambio en tiempo real, emisión de Boleta con DNI verificado y Factura con RUC validado.
7. **Flujo de Cierre de Caja:** Conteo físico en modal de denominaciones, cálculo de descuadre y emisión de reporte de cierre.

**Evidencias:**

*Figura 6.4. Registro interactivo de comanda en mesa con catálogo y cálculo en carrito.*
![Figura 6.4](screenshots/fig-6-4.png)

*Figura 6.5. Emisión de comprobante de pago electrónico con cálculo de cambio en caja.*
![Figura 6.5](screenshots/fig-6-5.png)

---

## 6.7 Pruebas de Aceptación (UAT)

Las Pruebas de Aceptación en Entorno de Usuario fueron ejecutadas simulando una jornada de servicio completa del restaurante Girasoles con los actores reales del negocio:
* **Escenario 1 (Administrador):** Ingreso a las 8:00 AM, verificación de usuarios activos, registro de precios en catálogo y publicación del Menú del Día de hoy.
* **Escenario 2 (Cajero):** Apertura de caja del turno mañana con S/ 150.00 de fondo sencillo.
* **Escenario 3 (Mozo):** Recepción de clientes en Mesa 4, registro de 2 menús completos y 1 bebida extra, envío de comanda a cocina.
* **Escenario 4 (Cocinero):** Recepción de comanda en pantalla KDS, inicio de preparación de platos y notificación de comanda lista.
* **Escenario 5 (Cajero):** Solicitud de cuenta de Mesa 4, cobro en efectivo de S/ 45.00 con entrega de S/ 50.00 (vuelto S/ 5.00), emisión de Boleta electrónica B001 y liberación automática de la mesa a estado Libre.
* **Escenario 6 (Cierre de Turno):** Cierre de caja al finalizar el servicio, conteo de billetes y monedas en el contador modal, validación de balance conforme sin descuadre y descarga del reporte en PDF.

**Resultado:** El 100% de los escenarios se completó satisfactoriamente con tiempos óptimos y aprobación del usuario.

---

## 6.8 Pruebas de Regresión

Tras cada refactorización o mejora visual del frontend (como la homologación de modales blancos, la unificación del estilo café oscuro en filtros y la estandarización del botón Actualizar), se ejecutaron baterías de pruebas de regresión para garantizar que ninguna funcionalidad previa se viera afectada.
Se comprobaron nuevamente los cálculos de caja, la emisión de comprobantes, la respuesta del polling en tiempo real y la compatibilidad móvil de los componentes actualizados.

---

## 6.9 Matriz Resumen de Pruebas

| Tipo de Prueba | Objetivo Técnico | Alcance en GirasolesRes | Herramienta |
| :--- | :--- | :--- | :--- |
| **Unitarias** | Validar algoritmos y reglas de negocio aisladas. | Cálculo de totales, IGV, reglas de anulación, series correlativas y balance de caja. | xUnit, .NET Test Runner |
| **Integración** | Validar comunicación entre capas y servicios. | Intercambio Frontend ↔ Web API ↔ PostgreSQL, consultas EF Core y contratos REST. | Swagger UI, Postman, PgAdmin |
| **Funcionales** | Validar cumplimiento de requisitos de usuario. | Flujo de login, mesas, pedidos, cocina KDS, cobros, catálogo, ventas y reportes. | Pruebas manuales estructuradas |
| **Aceptación (UAT)** | Validar idoneidad comercial en entorno real. | Simulación de jornada gastronómica completa por roles de usuario. | Entorno de preproducción |
| **Regresión** | Asegurar estabilidad tras refactorizaciones de UI. | Revalidación de pantallas, modales homologados y barras de filtros unificadas. | Scripts de build y pruebas cruzadas |

---

# 7. Seguridad del Sistema

La seguridad de **GirasolesRes** constituye un pilar estructural diseñado para salvaguardar la confidencialidad de las credenciales, la integridad de los balances financieros y el no repudio de las transacciones operativas del restaurante.

---

## 7.1 Autenticación mediante JWT (JSON Web Token)

La autenticación de usuarios se implementa bajo el estándar abierto RFC 7519:
* **Firma Criptográfica:** Cada token emitido por la Web API está firmado digitalmente con el algoritmo simétrico **HMAC-SHA256** utilizando una clave secreta robusta de 256 bits almacenada en variables de entorno.
* **Estructura del Payload:** El token encapsula claims estandarizados:
  * `nameid`: Identificador único UUID del usuario.
  * `unique_name`: Nombre de usuario (username).
  * `role`: Rol asignado (`Administrador`, `Cajero`, `Mozo`, `Cocinero`).
  * `nbf` y `exp`: Marcas de tiempo de vigencia (validez máxima de 12 horas).
* **Manejo de Sesión en Cliente:** El token se almacena de forma segura en memoria o almacenamiento local controlado, inyectándose automáticamente en el encabezado `Authorization: Bearer <token>` de cada petición HTTP.
* **Control de Inactividad:** Modal preventivo que advierte al usuario a los 15 minutos de inactividad antes de forzar el cierre de sesión y purga de credenciales para evitar accesos no autorizados en terminales compartidas.

---

## 7.2 Autorización Basada en Roles (RBAC)

El Control de Acceso Basado en Roles (Role-Based Access Control) restringe el acceso a módulos, vistas y endpoints de acuerdo con las responsabilidades contractuales de cada empleado:

| Módulo / Funcionalidad | Administrador | Cajero | Mozo | Cocinero |
| :--- | :---: | :---: | :---: | :---: |
| **Inicio de Sesión y Perfil** | Sí | Sí | Sí | Sí |
| **Dashboard Gerencial (CUS15)** | Sí | Sí (Vista turno) | No | No |
| **Gestión de Salón y Mesas (CUS06)** | Sí | Lectura | Sí | No |
| **Toma de Pedidos Salón / Llevar (CUS07, 08)** | Sí | Sí | Sí | No |
| **Monitor de Cocina KDS (CUS10)** | Lectura | No | No | Sí |
| **Declarar Plato Agotado (CUS05)** | Sí | No | No | Sí |
| **Módulo de Cobros y Caja (CUS11, 13)** | Sí | Sí | No | No |
| **Historial de Ventas y Comprobantes (CUS12)**| Sí | Sí | No | No |
| **Anulación de Ventas (RN-101)** | Sí | No | No | No |
| **Gestión de Usuarios y Roles (CUS02)** | Sí | No | No | No |
| **Catálogo de Productos y Precios (CUS04)** | Sí | No | No | No |
| **Reportes y Exportación PDF/Excel (CUS14)** | Sí | No | No | No |

En el backend, cada controlador está protegido con atributos declarativos `[Authorize(Roles = "Administrador,Cajero")]`, rechazando inmediatamente con código HTTP 403 Forbidden cualquier intento de invocación ilegítima.

---

## 7.3 Hash de Contraseñas con BCrypt

Las contraseñas de acceso nunca se almacenan en texto plano:
* **Algoritmo Adaptativo BCrypt:** Emplea una función de derivación de claves basada en el cifrador Blowfish con salt criptográfico único autogenerado por cada usuario.
* **Factor de Costo (Work Factor):** Configurado a un nivel computacional que garantiza una resistencia absoluta frente a ataques por diccionario o fuerza bruta basada en tablas arcoíris (*rainbow tables*).
* **Verificación Unidireccional:** Durante el inicio de sesión, el texto plano ingresado es verificado contra el hash almacenado mediante `BCrypt.Verify()`, asegurando que nadie (ni administradores ni desarrolladores) pueda reconstruir la contraseña original.

---

## 7.4 Validación y Sanitización de Datos

Para garantizar la integridad de los datos y evitar corrupciones en base de datos:
* **Frontend (React + TypeScript):** Validación inmediata con tipado estricto. Los inputs de búsqueda restringen caracteres especiales, los campos de DNI aceptan únicamente 8 dígitos numéricos, los campos de RUC aceptan 11 dígitos y los montos de caja rechazan valores negativos o mayores a dos decimales.
* **Backend (.NET Data Annotations):** DTOs fuertemente tipados con atributos `[Required]`, `[StringLength]`, `[RegularExpression]` y `[Range]`. El middleware del framework intercepta cualquier payload mal formado antes de transferirlo a los casos de uso.
* **Prevención de Inyección SQL:** El uso estricto del ORM Entity Framework Core con consultas LINQ parametrizadas elimina completamente el riesgo de inyección de código SQL malicioso.

---

## 7.5 Protección de Endpoints y Manejo de Excepciones

* **Middleware de Excepciones Global:** Captura cualquier error no controlado en el servidor, registra el incidente con fines de depuración interna y retorna al cliente un mensaje seguro y genérico en formato JSON, evitando exponer trazas de pila (*stacktraces*) o detalles del esquema de la base de datos al exterior.
* **Control de Cors (Cross-Origin Resource Sharing):** La API solo acepta peticiones provenientes del dominio y puerto autorizados para el frontend del restaurante, bloqueando llamadas originadas en scripts de dominios no reconocidos.

---

## 7.6 Auditoría de Operaciones Críticas

El sistema incorpora un mecanismo de trazabilidad inmutable para eventos sensibles:
* **Anulación de Pedidos y Ventas:** Se almacena el ID del pedido/venta, el monto anulado, el usuario que autorizó, la fecha y hora exacta (`America/Lima`) y el motivo obligatorio ingresado por el operador.
* **Apertura y Cierre de Caja:** Registro obligatorio de la fecha de apertura, monto inicial, fecha de cierre, total calculado por el sistema, total físico declarado en el arqueo, diferencia (faltante/sobrante) y usuario responsable.

---

## 7.7 Buenas Prácticas de Seguridad Implementadas

1. Principio de menor privilegio aplicado a usuarios y credenciales de conexión de base de datos.
2. Uso de variables de entorno y archivos `appsettings.json` excluidos del control de versiones público para secretos de conexión y claves JWT.
3. Desconexión automática de sesión por inactividad prolongada (15 minutos) para proteger terminales desatendidas en el salón.
4. Comunicación cifrada bajo protocolo HTTPS en entornos de producción.

---

# 8. Integración Continua (CI)

La Integración Continua (Continuous Integration) es una práctica esencial de la ingeniería de software que consiste en automatizar la compilación, verificación de calidad y ejecución de pruebas cada vez que un miembro del equipo realiza cambios en el repositorio compartido.

---

## 8.1 Repositorio en GitHub

El proyecto **GirasolesRes** se encuentra versionado y centralizado en un repositorio privado en la plataforma GitHub:
* **URL del Repositorio:** `https://github.com/Alfonso0712/GirasolesRes`
* **Estructura del Proyecto:**
  * `/backend`: Solución integral en .NET 9 estructurada en 4 capas de Clean Architecture (`GirasolesRes.Domain`, `GirasolesRes.Application`, `GirasolesRes.Infrastructure`, `GirasolesRes.API`).
  * `/frontend`: Aplicación SPA desarrollada en React 19, TypeScript y Tailwind CSS con empaquetador Vite.
  * `/.github/workflows`: Definición declarativa de pipelines automatizados de Integración Continua.

---

## 8.2 Estrategia de Ramas y Convención de Commits

* **Rama Principal (`main`):** Almacena únicamente código validado, estable y listo para despliegue en producción.
* **Commits Semánticos (Conventional Commits):** Cada cambio incorporado al historial sigue una estructura estandarizada que facilita la trazabilidad y auditoría de cambios:
  * `feat:` Nuevas funcionalidades operativas.
  * `fix:` Corrección de defectos o validaciones.
  * `style:` Mejoras estéticas, homologación visual y ajustes de diseño sin alterar lógica.
  * `refactor:` Optimización y limpieza de código existente.
  * `test:` Incorporación o ajuste de pruebas unitarias y de integración.

---

## 8.3 Configuración de GitHub Actions

Se implementó un flujo de trabajo automatizado (*workflow*) mediante **GitHub Actions** alojado en el archivo `.github/workflows/ci.yml`. El pipeline se dispara automáticamente ante dos eventos:
1. Evento `push` sobre la rama `main`.
2. Apertura o sincronización de un `pull_request` con destino a la rama `main`.

### Etapas del Pipeline de CI:
1. **Ambiente de Ejecución:** Servidor virtualizado `ubuntu-latest`.
2. **Descarga de Código:** Acción oficial `actions/checkout@v4`.
3. **Configuración de Entornos:**
   * Instalación y configuración de **.NET SDK 9.0**.
   * Instalación y configuración de **Node.js 20.x**.
4. **Restauración de Dependencias:**
   * Backend: Ejecución de `dotnet restore` sobre la solución completa.
   * Frontend: Ejecución de `npm ci --prefix frontend` para asegurar dependencias exactas desde `package-lock.json`.
5. **Compilación de la Solución Backend:**
   * Ejecución de `dotnet build --no-restore --configuration Release`.
6. **Ejecución Automatizada de Pruebas Unitarias:**
   * Ejecución de `dotnet test --no-build --configuration Release --verbosity normal` garantizando que el 100% de las pruebas unitarias pasen sin fallos.
7. **Verificación de Tipos y Construcción del Frontend:**
   * Ejecución de `npm run build` (`tsc -b && vite build`) garantizando que no existan errores de TypeScript ni advertencias bloqueantes de empaquetado.

---

## 8.4 Beneficios de la Integración Continua en GirasolesRes

* **Detección Inmediata de Errores:** Cualquier fallo de compilación, inconsistencia de tipos en TypeScript o ruptura de reglas de negocio en pruebas unitarias es detectado en minutos por el runner de GitHub.
* **Garantía de Código Funcional:** Ningún cambio defectuoso o con errores de sintaxis puede integrarse a la rama principal de producción.
* **Alineación del Equipo de Desarrollo:** Permite a múltiples desarrolladores integrar su código diariamente con confianza absoluta en la estabilidad del sistema global.

---

# 9. Conclusión

El desarrollo del sistema web **GirasolesRes** representa una solución integral, moderna y altamente especializada para la gestión comercial y operativa del restaurante Girasoles. 

Desde la perspectiva arquitectónica, la aplicación de **Clean Architecture** en el backend y una arquitectura basada en componentes en el frontend asegura un desacoplamiento efectivo entre la lógica del negocio gastronómico, los servicios web y la persistencia de datos. Esta estructura garantiza una alta mantenibilidad y prepara a la plataforma para futuras expansiones, tales como facturación electrónica directa con SUNAT vía PSE/OSE, comandas móviles para clientes o integración con pasarelas de pago digitales.

El cumplimiento sistemático de las ocho características del modelo de calidad **ISO/IEC 25010** evidencia que el sistema no solo satisface los requisitos funcionales demandados (mesas, pedidos, cocina KDS, cobros, caja y reportes), sino que lo hace con altos niveles de eficiencia, usabilidad homologada bajo principios de Nielsen, fiabilidad transaccional ante fallos de red y estrictos estándares de seguridad mediante autenticación JWT, cifrado BCrypt y control de acceso basado en roles (RBAC).

Asimismo, la adopción del **Modelo en V**, los principios de **ISTQB** y la norma **ISO/IEC/IEEE 29119** dotó al proyecto de una estrategia de pruebas estructurada y rigurosa, complementada por un flujo de **Integración Continua con GitHub Actions** que automatiza la compilación y ejecución de pruebas unitarias xUnit en cada entrega. 

En definitiva, **GirasolesRes** consolida una plataforma de software robusta, confiable y con calidad de nivel profesional, lista para transformar la productividad y el control financiero del restaurante.
