# Cliente Móvil - Restaurante Girasoles

Aplicación móvil híbrida para la gestión operativa en salón, comandas de cocina, caja, cobranzas, pedidos para llevar y reportes del **Restaurante Girasoles**. Construida con **React 19**, **TypeScript**, **Vite**, **Tailwind CSS 4** y **Capacitor 7** para dispositivos móviles y tabletas Android.

---

## 1. Requisitos Previos

- **Node.js:** Versión 20 LTS o superior.
- **npm:** Versión 10 o superior.
- **Android Studio:** Ladybug (2024.2) o superior (requerido exclusivamente para compilar el paquete `.apk` o `.aab`).
- **Java Development Kit (JDK):** JDK 17 o 21 configurado en `JAVA_HOME`.
- **Android SDK:** API Level 34 (Android 14) / SDK Build-Tools 34.0.0.

---

## 2. Ejecución en Entorno de Desarrollo

Para iniciar el servidor local de desarrollo:

```bash
# Desde la raíz del proyecto
npm --prefix mobile run dev

# O ingresando al directorio mobile/
cd mobile
npm run dev
```

El servidor Vite se inicia por defecto en el puerto **`http://localhost:5174`** y expone el proxy hacia la API de backend en `/api`.

---

## 3. Compilación: Producción vs. Demostración

La aplicación móvil cuenta con dos modos de compilación estrictamente aislados:

### 3.1 Compilación de Producción (`build`)
- **Comando:** `npm --prefix mobile run build`
- **Comportamiento:** Compila contra el entorno real oficial (`.env.production`), verifica que no existan credenciales ni cuentas de demostración en el paquete final, y valida el presupuesto de rendimiento.
- **Uso:** Destinado al despliegue en producción y generación de la APK final para el personal del restaurante.

### 3.2 Compilación de Demostración (`build:demo`)
- **Comando:** `npm --prefix mobile run build:demo`
- **Comportamiento:** Compila con modo demostración habilitado (`.env.demo`). Incluye el bloque de acceso rápido en la pantalla de inicio de sesión con cuentas de prueba para evaluación funcional (Administrador, Cajero, Mozo, Cocinero).
- **Uso:** Evaluaciones de usabilidad, pruebas de interfaz y presentaciones. **Nunca debe publicarse en producción**.

---

## 4. Aseguramiento de Calidad y Pruebas

El proyecto cuenta con verificación automatizada en cadena:

```bash
# Verificación integral completa (Lint + Pruebas unitarias + Build producción + Build demo)
npm --prefix mobile run verify:todo

# Ejecución de pruebas unitarias con Vitest y JSDOM
npm --prefix mobile run test

# Cobertura de código
npm --prefix mobile run test:coverage

# Análisis estático de código y accesibilidad con ESLint 9
npm --prefix mobile run lint

# Verificación de inmutabilidad de conexión y seguridad
npm --prefix mobile run verify:conexion

# Verificación del presupuesto de rendimiento (bundle < 300 KB)
npm --prefix mobile run check:budget
```

---

## 5. Estructura del Proyecto

```text
mobile/
├── android/               # Proyecto nativo de Android (Capacitor)
├── public/                # Activos estáticos públicos (favicon, iconos)
├── scripts/               # Scripts de verificación y presupuesto
│   ├── check-budget.mjs   # Auditoría de peso de bundle y activos
│   └── verify-connection.mjs # Verificación de inmutabilidad de API
├── src/
│   ├── assets/            # Logotipos y emblemas vectoriales / rasterizados
│   ├── components/        # Componentes desacoplados por dominio y UI base
│   │   ├── admin/         # Vistas de métricas y reportería administrativa
│   │   ├── auth/          # Inicio de sesión y configuración de servidor
│   │   ├── caja/          # Control de turnos, arqueo, cierre y pedidos llevar
│   │   ├── cocina/        # Pantalla KDS y tarjetas de comandas
│   │   ├── layout/        # Encabezado, navegación inferior/lateral y avisos
│   │   ├── mesas/         # Salón, distribución y formulario de mesas
│   │   ├── pedidos/       # Toma de pedidos, catálogo y anulación
│   │   ├── perfil/        # Preferencias de usuario, tema y contraseña
│   │   ├── platos/        # Gestión de menú del día y platos agotados
│   │   └── ui/            # Primitivas reutilizables (Botones, Tarjetas, Modales)
│   ├── config/            # Navegación, permisos de usuario y configuración
│   ├── context/           # Proveedores de estado global (Toast)
│   ├── hooks/             # Custom hooks (inactividad, red, haptics, botón atrás)
│   ├── pages/             # Vistas orquestadoras cargadas bajo demanda (lazy)
│   ├── services/          # Cliente HTTP nativo (apiClient) y servicios de API
│   ├── test/              # Utilidades de configuración para pruebas (setup)
│   ├── types/             # Contratos e interfaces TypeScript estrictas
│   └── utils/             # Funciones puras (formato de moneda, validaciones)
├── CONNECTION.md          # Especificación protegida de conexión con el backend
├── DESIGN.md              # Sistema de diseño, tokens de Tailwind y tipografía
├── NAVEGACION.md          # Flujos de navegación y permisos por rol
└── PUBLICACION.md         # Guía de firma y generación de APK de producción
```

---

## 6. Documentación Relacionada

- [Especificación de Conexión y Seguridad (CONNECTION.md)](CONNECTION.md)
- [Sistema de Diseño y Tokens de Interfaz (DESIGN.md)](DESIGN.md)
- [Arquitectura de Navegación y Permisos (NAVEGACION.md)](NAVEGACION.md)
- [Guía de Compilación y Publicación de APK (PUBLICACION.md)](PUBLICACION.md)
