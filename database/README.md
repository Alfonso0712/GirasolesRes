# Base de Datos — Sistema de Restaurante Girasoles

Este directorio contiene el script SQL oficial para inicializar la base de datos PostgreSQL 18.

## Opciones para Inicializar la Base de Datos

### Opción A (Automática con .NET - Recomendada)
El backend utiliza **Entity Framework Core (Code-First)**. 
1. Asegúrate de tener PostgreSQL corriendo y la base de datos `girasoles_db` creada (o configurada en tu `appsettings.json`).
2. Al ejecutar el backend:
   ```bash
   dotnet run --project backend/GirasolesRes.API/GirasolesRes.API.csproj
   ```
3. `Program.cs` ejecutará automáticamente `DatabaseSeeder.SeedAsync()`, creando todas las tablas y sembrando los usuarios iniciales con sus contraseñas hasheadas (`Password123!`).

---

### Opción B (Manual con script SQL / pgAdmin)
Si prefieres importar la base de datos manualmente con tablas y datos de prueba:
1. Abre pgAdmin o tu terminal de PostgreSQL (`psql`).
2. Crea la base de datos:
   ```sql
   CREATE DATABASE girasoles_db;
   ```
3. Ejecuta el script `init_girasoles_db.sql`:
   ```bash
   psql -U postgres -d girasoles_db -f database/init_girasoles_db.sql
   ```

---

## Cuentas Sembradas de Demostración
Todas las cuentas de prueba tienen la contraseña: `Password123!`

| Usuario | Rol | Estado | Correo |
| :--- | :--- | :--- | :--- |
| `admin` | Administrador | Activo | `admin@girasoles.com` |
| `atorres` | Cajero | Activo | `atorres@girasoles.com` |
| `lperez` | Mozo | Activo | `lperez@girasoles.com` |
| `msoto` | Cocinero | Activo | `msoto@girasoles.com` |
| `crojas` | Mozo | Inactivo | `crojas@girasoles.com` |
