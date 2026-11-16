#!/usr/bin/env bash
set -euo pipefail

# Restaura un respaldo (.dump generado con pg_dump -Fc) en la base de datos indicada.
# Uso: ./restaurar.sh <ruta_archivo.dump> <base_destino> [--confirmado]
# Autenticación mediante PGPASSFILE (~/.pgpass) o variables de entorno PGPASSWORD/PG*.

if [ "$#" -lt 2 ]; then
    echo "Uso: $0 <archivo.dump> <base_destino> [--confirmado]" >&2
    exit 1
fi

ARCHIVO_DUMP="$1"
BASE_DESTINO="$2"
MODO_CONFIRMADO="${3:-}"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"

if ! command -v pg_restore >/dev/null 2>&1; then
    echo "Error: no se encontró 'pg_restore' en el PATH. Instale postgresql-client-18." >&2
    exit 1
fi

if [ ! -f "$ARCHIVO_DUMP" ]; then
    echo "Error: no existe el archivo de respaldo '$ARCHIVO_DUMP'." >&2
    exit 1
fi

if [ "$MODO_CONFIRMADO" != "--confirmado" ]; then
    echo "ADVERTENCIA: se limpiarán y restaurarán objetos en '${BASE_DESTINO}' (${PGHOST}:${PGPORT})."
    read -r -p "Escriba 'CONFIRMAR' para continuar: " RESPUESTA
    if [ "$RESPUESTA" != "CONFIRMAR" ]; then
        echo "Restauración cancelada."
        exit 0
    fi
fi

echo "Iniciando restauración de '${ARCHIVO_DUMP}' sobre '${BASE_DESTINO}'..."

pg_restore \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --exit-on-error \
    --host="$PGHOST" \
    --port="$PGPORT" \
    --username="$PGUSER" \
    --dbname="$BASE_DESTINO" \
    "$ARCHIVO_DUMP"

echo "Restauración completada sobre '${BASE_DESTINO}'."
