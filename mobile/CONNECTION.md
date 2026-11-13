# Conexión al Servidor y Modo Demostración (Mobile)

## 1. Dirección Oficial de la API
- **API real:** `https://girasoles.astrazynk.pp.ua/api` (backend ASP.NET Core 8).
- **Sitio web:** `https://girasolesres.pp.ua` (portal institucional, no expone la API).

## 2. Modos de Compilación y Comandos
- **Producción:** `npm --prefix mobile run build` (genera bundle sin demo ni secretos).
- **Demostración:** `npm --prefix mobile run build:demo` (incluye acceso rápido y selector de host).
- **Verificación:** `npm --prefix mobile run verify:conexion` (auditoría previa de configuración).

## 3. Actualización de Dominio o Túnel
1. Actualizar `VITE_API_BASE_URL` en `mobile/.env.demo` y `mobile/.env.production`.
2. Actualizar `URL_API_POR_DEFECTO` en `mobile/src/config/serverConfig.ts`.
3. Actualizar la constante `URL_ESPERADA` en `mobile/scripts/verify-connection.mjs`.

## 4. Archivos Protegidos
- `mobile/src/config/serverConfig.ts`
- `mobile/src/config/appConfig.ts`
- `mobile/src/config/demoAccounts.ts`
- `mobile/src/components/auth/ServidorConfigSheet.tsx`
- `mobile/src/services/apiClient.ts`
- `mobile/scripts/verify-connection.mjs`

## 5. Pruebas Manuales Obligatorias
1. **Producción ignora URL guardada:** Iniciar con `GIRASOLES_API_BASE` en localStorage; la app lo elimina y conecta a la API oficial.
2. **Demostración descarta sitio web:** Ingresar `https://girasolesres.pp.ua`; el sistema lo bloquea y avisa que es el sitio web.
3. **Demostración usa URL válida:** Ingresar una URL de API válida; se guarda y se usa en peticiones.
4. **URL inválida se descarta:** Ingresar texto sin `http://` o sin formato de URL; el sistema muestra error y no la guarda.
5. **Probar conexión con sitio web:** Al pulsar "Probar conexión" con `girasolesres.pp.ua` o URL que retorne HTML, avisa que parece un sitio web.
6. **Login con acceso rápido:** En demo, pulsar botón de rol (Mozo, Cajero, Admin, Cocinero); el login autentica correctamente contra la API.
