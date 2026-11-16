# Estrategia de Respaldo y Recuperación — GirasolesRes (PostgreSQL 18)

Este directorio contiene los scripts oficiales para respaldar y restaurar la base de datos `girasoles_db` sin exponer credenciales en código ni registros.

---

## 1. Política y Frecuencia Recomendada

- **Respaldo diario automatizado (RPO objetivo: 24 horas):** Ejecutar `respaldar.ps1` o `respaldar.sh` todos los días fuera del horario de atención del restaurante (por ejemplo, `02:00` a. m.).
- **Respaldo previo a cambios:** Ejecutar un respaldo manual inmediatamente antes de aplicar cualquier script `database/migrate_*.sql` o actualización mayor del backend.
- **Retención:** `14` días locales por defecto (`RetentionDays` / `RETENCION_DIAS`), más copia semanal fuera del servidor (almacenamiento externo cifrado).
- **Formato:** Formato personalizado comprimido de PostgreSQL (`pg_dump --format=custom`), que permite restauración selectiva o completa mediante `pg_restore`.

---

## 2. Autenticación Segura (`PGPASSFILE`)

Nunca guarde contraseñas en estos scripts ni en el Programador de tareas o `crontab`.

- **Linux / macOS (`~/.pgpass` con permisos `0600`):**
  ```text
  localhost:5432:girasoles_db:postgres:<SU_PASSWORD_POSTGRES>
  ```
  ```bash
  chmod 600 ~/.pgpass
  export PGPASSFILE=~/.pgpass
  ```
- **Windows (`%APPDATA%\postgresql\pgpass.conf` o archivo dedicado vía `$env:PGPASSFILE`):**
  ```text
  localhost:5432:girasoles_db:postgres:<SU_PASSWORD_POSTGRES>
  ```
  Restrinja los permisos NTFS del archivo únicamente al usuario que ejecuta la tarea programada.

---

## 3. Verificación Periódica de la Restauración (Base de Prueba)

Un respaldo que nunca se ha restaurado no garantiza recuperación. Ejecute esta prueba semanal o mensualmente sobre una base aislada (`girasoles_db_prueba`):

### En Linux
```bash
# 1. Generar respaldo de prueba
PGPASSFILE=~/.pgpass ./database/respaldo/respaldar.sh ./respaldos_tmp 14

# 2. Crear base temporal y restaurar
createdb -h localhost -U postgres girasoles_db_prueba
PGPASSFILE=~/.pgpass ./database/respaldo/restaurar.sh ./respaldos_tmp/respaldo_girasoles_db_<FECHA>.dump girasoles_db_prueba

# 3. Verificar tablas clave y conteos
psql -h localhost -U postgres -d girasoles_db_prueba -c "SELECT count(*) AS usuarios FROM usuarios; SELECT count(*) AS ventas FROM ventas;"

# 4. Eliminar base temporal tras comprobar
dropdb -h localhost -U postgres girasoles_db_prueba
```

### En Windows (PowerShell)
```powershell
$env:PGPASSFILE = "C:\ruta\segura\pgpass.conf"
.\database\respaldo\respaldar.ps1 -OutputDir "C:\respaldos_girasoles" -RetentionDays 14
createdb -h localhost -U postgres girasoles_db_prueba
.\database\respaldo\restaurar.ps1 -DumpFile "C:\respaldos_girasoles\respaldo_girasoles_db_<FECHA>.dump" -TargetDatabase "girasoles_db_prueba"
psql -h localhost -U postgres -d girasoles_db_prueba -c "SELECT count(*) FROM usuarios; SELECT count(*) FROM ventas;"
dropdb -h localhost -U postgres girasoles_db_prueba
```

---

## 4. Programación Automática

### Windows (Programador de Tareas)
Crear tarea diaria a las `02:00` con la cuenta del servicio (usando `PGPASSFILE` configurado en las variables del usuario):
```powershell
schtasks /Create /TN "GirasolesRes_Respaldo_Diario" /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File E:\ruta\GirasolesRes\database\respaldo\respaldar.ps1 -OutputDir D:\respaldos_girasoles -RetentionDays 14" /SC DAILY /ST 02:00
```

### Linux (`cron`)
Editar `crontab -e` para ejecutar a las `02:00` a. m. diariamente:
```cron
0 2 * * * PGPASSFILE=/home/usuario/.pgpass /opt/girasoles/database/respaldo/respaldar.sh /var/backups/girasoles 14 >> /var/log/girasoles-backup.log 2>&1
```
