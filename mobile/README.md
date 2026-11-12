# Girasoles Mobile & Tablet (Terminal Operativo)

Módulo cliente independiente para celulares y tabletas del restaurante **GirasolesRes**, optimizado ergonómicamente para pantallas táctiles y empaquetado nativamente con **Capacitor** para generar el archivo instalable **APK** de Android.

---

## 1. Arquitectura del Cliente Móvil

- **Framework Web:** React 19 + TypeScript + Vite.
- **Motor de Estilos:** Tailwind CSS 4 con los tokens corporativos de Girasoles (`#C74E00`, `#482813`, `#FAF7F4`, semántica y soporte nativo de Modo Oscuro).
- **Contenedor Nativo:** Capacitor 7 (`@capacitor/android`, `@capacitor/status-bar`, `@capacitor/haptics`, `@capacitor/splash-screen`).
- **Conectividad Backend:** Conectado directamente a la API de **ASP.NET Core 8** de Girasoles mediante `apiClient.ts` con manejo de tokens JWT y selector dinámico de IP de servidor para pruebas por Wi-Fi.

---

## 2. Ergonomía Táctil y UX/UI por Rol

El diseño mobile/tablet reduce drásticamente el ruido visual de desktop y aplica:
1. **Regla de la Zona del Pulgar (*Thumb Zone*):** Controles críticos (confirmación de comanda, cobro, navegación) situados en el tercio inferior de la pantalla.
2. **Navegación Inferior (*Bottom Navigation Bar*):** Reemplazo del sidebar de desktop para permitir uso con una sola mano.
3. **Modales tipo *Bottom Sheet*:** Paneles deslizables desde la parte inferior para configurar notas de platos y revisar pedidos sin tapar la pantalla.
4. **Targets Táctiles $\ge 48\text{ px}$:** Botones sobredimensionados para evitar toques erróneos en horas pico de atención.
5. **Teclado Numérico en Pantalla (*Numpad POS*):** En caja y cobro rápido, teclado numérico táctil para ingresar montos recibidos y calcular el vuelto al instante sin que el teclado virtual del sistema operativo cubra la interfaz.

### Vistas Especializadas:
- **Mozo:** Salón de Mesas táctil con estado cromático (Libre / Ocupada con tiempo) + Toma de pedido con chips de categorías y carrito flotante.
- **Cocinero (Tablet KDS):** Diseñada para tablet horizontal con tarjetas de comanda grandes (legibles a 2 metros) y botones de 56px ("Empezar preparación", "Listo").
- **Cajero:** Listado de cuentas por cobrar, selección de método de pago (Efectivo / Yape / Plin / Tarjeta) y cálculo automático de vuelto.

---

## 3. Instrucciones de Ejecución y Compilación de APK

### 3.1 Modo Desarrollo Web (Mobile / Tablet Simulator)
```bash
cd mobile
npm install
npm run dev
```
La aplicación iniciará en `http://localhost:5174`. Podés abrir las herramientas de desarrollador (`F12`) y activar la emulación de dispositivos (iPhone 14, Pixel 7, iPad Mini).

### 3.2 Compilación Web y Sincronización con Android
```bash
npm run build
npx cap sync
```

### 3.3 Generación del Archivo APK de Android
Tenés dos opciones:

#### Opción A: Con Android Studio
```bash
npx cap open android
```
Se abrirá Android Studio con el proyecto de `mobile/android/`. Presioná `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

#### Opción B: Por Línea de Comandos (Gradle)
```bash
cd mobile/android
./gradlew assembleDebug
```
El archivo `.apk` se generará en:
`mobile/android/app/build/outputs/apk/debug/app-debug.apk`
Listo para transferir e instalar en cualquier celular o tablet Android.
