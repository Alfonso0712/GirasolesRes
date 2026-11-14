# Guía de Compilación y Publicación de APK - Restaurante Girasoles

Este documento detalla el procedimiento técnico obligatorio para compilar, firmar digitalmente y generar el paquete final de distribución Android (`.apk` o `.aab`) de la aplicación **Girasoles Mobile**.

---

## 1. Advertencia Crítica de Seguridad

> [!CAUTION]
> **PROHIBIDO PUBLICAR LA DISTRIBUCIÓN DE DEMOSTRACIÓN EN PRODUCCIÓN**
> El comando `npm run build:demo` genera una distribución con cuentas de prueba y credenciales visibles en la interfaz. La distribución para el personal y producción debe compilarse **única y exclusivamente** mediante `npm run build`.

---

## 2. Checklist Previo a la Compilación

Antes de generar el paquete release, verifique rigurosamente:

- [ ] **Árbol de Git limpio:** No deben existir modificaciones sin confirmar en la rama de entrega (`git status`).
- [ ] **Verificación total en verde:** Ejecutar `npm run verify:todo` (debe completar Lint, Pruebas unitarias, Build de producción y Build de demo sin advertencias ni errores).
- [ ] **Presupuesto de rendimiento aprobado:** El bundle JS no debe superar los 300 KB y el total de la distribución debe permanecer por debajo de 1.2 MB (`npm run check:budget`).
- [ ] **Versión actualizada:** `versionCode` debe coincidir con el correlativo de entrega y `versionName` con el release semántico en `mobile/android/app/build.gradle`.
- [ ] **URL oficial inmutable:** La API configurada en `.env.production` debe ser `https://girasoles.astrazynk.pp.ua/api`. Está estrictamente prohibido apuntar a `girasolesres.pp.ua` (sitio institucional sin endpoints REST).

---

## 3. Generación del Almacén de Claves (*Keystore*)

Para producción se requiere una clave criptográfica privada. Si no dispone de una, genérela mediante la utilidad `keytool`:

```bash
keytool -genkey -v -keystore girasoles-release.keystore \
  -alias girasoles-app \
  -keyalg RSA -keysize 2048 -validity 10000
```

> [!WARNING]
> Guarde el archivo `girasoles-release.keystore` y sus contraseñas en una bóveda de secretos segura. **Jamás cometa este archivo en el repositorio de Git**.

---

## 4. Configuración de Firma en Gradle

Cree el archivo `mobile/android/keystore.properties` (incluido en `.gitignore`):

```properties
storePassword=SU_CONTRASENA_DE_KEYSTORE
keyPassword=SU_CONTRASENA_DE_ALIAS
keyAlias=girasoles-app
storeFile=../../girasoles-release.keystore
```

Configure `signingConfigs` en `mobile/android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            def keystorePropsFile = file('../keystore.properties')
            if (keystorePropsFile.exists()) {
                def props = new Properties()
                props.load(new FileInputStream(keystorePropsFile))
                storeFile file(props['storeFile'])
                storePassword props['storePassword']
                keyAlias props['keyAlias']
                keyPassword props['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 5. Procedimiento de Compilación Paso a Paso

### Paso 1: Compilar la Aplicación Web en Modo Producción
```bash
cd mobile
npm run build
```

### Paso 2: Sincronizar los Activos Web con el Proyecto Nativo
```bash
npx cap sync android
```

### Paso 3: Compilar la APK Firmada con Gradle Wrapper
```bash
cd android
./gradlew assembleRelease
```
*(En Windows PowerShell: `.\gradlew.bat assembleRelease`)*

La APK firmada lista para instalación se generará en:
`mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## 6. Verificación Post-Compilación del Paquete

1. Instale la APK de prueba en un dispositivo Android de prueba:
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```
2. Verifique que la pantalla de inicio de sesión no muestre el botón "Acceso rápido" de demostración.
3. Inicie sesión con una cuenta real y compruebe la comunicación fluida con la API de producción.
