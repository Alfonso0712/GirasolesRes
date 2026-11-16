<#
.SYNOPSIS
    Ejecuta un respaldo lógico comprimido (formato personalizado pg_dump -Fc) de PostgreSQL
    y aplica rotación automática según los días de retención configurados.
.NOTES
    No almacena contraseñas: utilice la variable PGPASSFILE, %APPDATA%\postgresql\pgpass.conf
    o la variable de entorno PGPASSWORD antes de invocar el script.
#>
param(
    [string]$HostName = $(if ($env:PGHOST) { $env:PGHOST } else { "localhost" }),
    [int]$Port = $(if ($env:PGPORT) { [int]$env:PGPORT } else { 5432 }),
    [string]$User = $(if ($env:PGUSER) { $env:PGUSER } else { "postgres" }),
    [string]$Database = $(if ($env:PGDATABASE) { $env:PGDATABASE } else { "girasoles_db" }),
    [string]$OutputDir = $(if ($env:RESPALDO_DIR) { $env:RESPALDO_DIR } else { Join-Path $PSScriptRoot "salidas" }),
    [int]$RetentionDays = $(if ($env:RETENCION_DIAS) { [int]$env:RETENCION_DIAS } else { 14 })
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    throw "No se encontró 'pg_dump' en el PATH del sistema. Instale las herramientas cliente de PostgreSQL 18."
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = "respaldo_${Database}_${timestamp}.dump"
$outputPath = Join-Path $OutputDir $fileName

Write-Host "Iniciando respaldo de '$Database' en '$outputPath'..."

& pg_dump `
    --format=custom `
    --no-owner `
    --no-acl `
    --host="$HostName" `
    --port="$Port" `
    --username="$User" `
    --dbname="$Database" `
    --file="$outputPath"

if ($LASTEXITCODE -ne 0) {
    if (Test-Path $outputPath) {
        Remove-Item $outputPath -Force -ErrorAction SilentlyContinue
    }
    throw "pg_dump finalizó con código de error $LASTEXITCODE."
}

$fileInfo = Get-Item $outputPath
if ($fileInfo.Length -le 0) {
    throw "El archivo de respaldo generado está vacío: $outputPath"
}

Write-Host "Respaldo completado correctamente ($($fileInfo.Length) bytes): $outputPath"

if ($RetentionDays -gt 0) {
    $limite = (Get-Date).AddDays(-$RetentionDays)
    $antiguos = Get-ChildItem -Path $OutputDir -File | Where-Object {
        ($_.Name -like "respaldo_*.dump" -or $_.Extension -eq ".backup") -and $_.LastWriteTime -lt $limite
    }

    foreach ($archivo in $antiguos) {
        Remove-Item $archivo.FullName -Force
        Write-Host "Respaldo antiguo eliminado por retención ($RetentionDays días): $($archivo.Name)"
    }
}
