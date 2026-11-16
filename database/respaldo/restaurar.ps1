<#
.SYNOPSIS
    Restaura un archivo de respaldo (.dump generado con pg_dump -Fc) en la base de datos indicada.
.NOTES
    Solicita confirmación interactiva explícita salvo que se especifique -Force.
    Utilice PGPASSFILE, %APPDATA%\postgresql\pgpass.conf o PGPASSWORD en el entorno.
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$DumpFile,

    [Parameter(Mandatory = $true)]
    [string]$TargetDatabase,

    [string]$HostName = $(if ($env:PGHOST) { $env:PGHOST } else { "localhost" }),
    [int]$Port = $(if ($env:PGPORT) { [int]$env:PGPORT } else { 5432 }),
    [string]$User = $(if ($env:PGUSER) { $env:PGUSER } else { "postgres" }),
    [switch]$Force
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) {
    throw "No se encontró 'pg_restore' en el PATH del sistema. Instale las herramientas cliente de PostgreSQL 18."
}

if (-not (Test-Path $DumpFile -PathType Leaf)) {
    throw "No existe el archivo de respaldo indicado: $DumpFile"
}

if (-not $Force) {
    Write-Warning "Esta operación limpiará y sobrescribirá objetos en la base de datos '$TargetDatabase' ($HostName`:$Port)."
    $confirmacion = Read-Host "Escriba 'CONFIRMAR' exactamente para continuar"
    if ($confirmacion -ne "CONFIRMAR") {
        Write-Host "Restauración cancelada por el usuario."
        exit 0
    }
}

Write-Host "Restaurando '$DumpFile' en la base '$TargetDatabase'..."

& pg_restore `
    --clean `
    --if-exists `
    --no-owner `
    --no-acl `
    --exit-on-error `
    --host="$HostName" `
    --port="$Port" `
    --username="$User" `
    --dbname="$TargetDatabase" `
    "$DumpFile"

if ($LASTEXITCODE -ne 0) {
    throw "pg_restore finalizó con código de error $LASTEXITCODE."
}

Write-Host "Restauración finalizada correctamente sobre '$TargetDatabase'."
