#!/usr/bin/env bash
set -euo pipefail

# Respaldo lógico en formato personalizado (pg_dump -Fc) con retención configurable.
# Autenticación mediante PGPASSFILE (~/.pgpass) o variables de entorno PGPASSWORD/PG*.
# Nunca incluya contraseñas dentro de este archivo.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-girasoles_db}"
RESPALDO_DIR="${1:-${RESPALDO_DIR:-${SCRIPT_DIR}/salidas}}"
RETENCION_DIAS="${2:-${RETENCION_DIAS:-14}}"

if ! command -v pg_dump >/dev/null 2>&1; then
    echo "Error: no se encontró 'pg_dump' en el PATH. Instale postgresql-client-18." >&2
    exit 1
fi

mkdir -p "$RESPALDO_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVO_SALIDA="${RESPALDO_DIR}/respaldo_${PGDATABASE}_${TIMESTAMP}.dump"

echo "Iniciando respaldo de '${PGDATABASE}' en '${ARCHIVO_SALIDA}'..."

if ! pg_dump \
    --format=custom \
    --no-owner \
    --no-acl \
    --host="$PGHOST" \
    --port="$PGPORT" \
    --username="$PGUSER" \
    --dbname="$PGDATABASE" \
    --file="$ARCHIVO_SALIDA"; then
    rm -f "$ARCHIVO_SALIDA"
    echo "Error: pg_dump falló durante el respaldo." >&2
    exit 1
fi

if [ ! -s "$ARCHIVO_SALIDA" ]; then
    rm -f "$ARCHIVO_SALIDA"
    echo "Error: el archivo de respaldo generado está vacío." >&2
    exit 1
fi

TAMANO_BYTES="$(wc -c < "$ARCHIVO_SALIDA")"
echo "Respaldo completado (${TAMANO_BYTES} bytes): ${ARCHIVO_SALIDA}"

if [ "$RETENCION_DIAS" -gt 0 ] 2>/dev/null; then
    find "$RESPALDO_DIR" -maxdepth 1 -type f \( -name "respaldo_*.dump" -o -name "*.backup" \) -mtime +"$RETENCION_DIAS" -print -delete
fi
