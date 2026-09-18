# Generate k8s/configmap.yaml and k8s/secret.yaml from the repo-root .env
# (same source of truth as Docker Compose). Run via: make k8s-sync-env

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root ".env"
$OutConfig = Join-Path $PSScriptRoot "configmap.yaml"
$OutSecret = Join-Path $PSScriptRoot "secret.yaml"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Missing $EnvFile - copy .env.example to .env first."
}

function Read-DotEnv([string]$Path) {
    $map = @{}
    Get-Content -Path $Path -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        $i = $line.IndexOf("=")
        if ($i -lt 1) { return }
        $key = $line.Substring(0, $i).Trim()
        $val = $line.Substring($i + 1).Trim()
        if (
            ($val.StartsWith('"') -and $val.EndsWith('"')) -or
            ($val.StartsWith("'") -and $val.EndsWith("'"))
        ) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        $map[$key] = $val
    }
    return $map
}

function Yaml-Escape([string]$Value) {
    if ($null -eq $Value) { $Value = "" }
    $escaped = $Value.Replace("\", "\\").Replace('"', '\"')
    return "`"$escaped`""
}

function Get-OrDefault($Map, [string]$Key, [string]$Default = "") {
    if ($Map.ContainsKey($Key) -and $null -ne $Map[$Key] -and $Map[$Key] -ne "") {
        return [string]$Map[$Key]
    }
    return $Default
}

$envMap = Read-DotEnv $EnvFile

# In-cluster service DNS name for Django ALLOWED_HOSTS
$allowed = Get-OrDefault $envMap "ALLOWED_HOSTS" "localhost,127.0.0.1"
if ($allowed -notmatch '(?i)(^|,)backend(,|$)') {
    $allowed = "$allowed,backend"
}

$secretKeys = @(
    "SECRET_KEY",
    "DATABASE_PASSWORD",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD"
)

$configKeys = @(
    "DEBUG",
    "DATABASE_NAME",
    "DATABASE_USER",
    "DATABASE_HOST",
    "DATABASE_PORT",
    "CORS_ALLOWED_ORIGINS",
    "CSRF_TRUSTED_ORIGINS",
    "ADMIN_UI_ORIGINS",
    "VITE_API_BASE_URL",
    "CLIENT_UI_PORT",
    "ADMIN_UI_PORT",
    "CLIENT_UI_ORIGIN",
    "EMAIL_BACKEND",
    "DEFAULT_FROM_EMAIL",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USE_TLS",
    "AUTH_RATE_LIMIT",
    "PASSWORD_RESET_RATE_LIMIT",
    "PUBLIC_DOMAIN"
)

$configDefaults = @{
    DEBUG                     = "True"
    DATABASE_NAME             = "researchhub"
    DATABASE_USER             = "researchhub"
    DATABASE_HOST             = "postgres"
    DATABASE_PORT             = "5432"
    CORS_ALLOWED_ORIGINS      = "http://localhost:5173,http://localhost:5175"
    CSRF_TRUSTED_ORIGINS      = "http://localhost:5173,http://localhost:5175"
    ADMIN_UI_ORIGINS          = "http://localhost:5175"
    VITE_API_BASE_URL         = "http://localhost:8000/api"
    CLIENT_UI_PORT            = "5173"
    ADMIN_UI_PORT             = "5175"
    CLIENT_UI_ORIGIN          = "http://localhost:5173"
    EMAIL_BACKEND             = "django.core.mail.backends.console.EmailBackend"
    DEFAULT_FROM_EMAIL        = 'ResearchHub <noreply@example.com>'
    EMAIL_HOST                = "smtp.example.com"
    EMAIL_PORT                = "587"
    EMAIL_USE_TLS             = "True"
    AUTH_RATE_LIMIT           = "5/m"
    PASSWORD_RESET_RATE_LIMIT = "2/m"
    PUBLIC_DOMAIN             = "localhost"
}

$secretDefaults = @{
    SECRET_KEY          = "change-me-in-development"
    DATABASE_PASSWORD   = "changeme"
    EMAIL_HOST_USER     = ""
    EMAIL_HOST_PASSWORD = ""
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# AUTO-GENERATED from repo-root .env - do not edit by hand.")
[void]$sb.AppendLine("# Regenerate: make k8s-sync-env")
[void]$sb.AppendLine("apiVersion: v1")
[void]$sb.AppendLine("kind: ConfigMap")
[void]$sb.AppendLine("metadata:")
[void]$sb.AppendLine("  name: researchhub-config")
[void]$sb.AppendLine("  namespace: researchhub")
[void]$sb.AppendLine("data:")
[void]$sb.AppendLine("  ALLOWED_HOSTS: $(Yaml-Escape $allowed)")
foreach ($key in $configKeys) {
    $def = [string]$configDefaults[$key]
    $val = Get-OrDefault $envMap $key $def
    [void]$sb.AppendLine("  ${key}: $(Yaml-Escape $val)")
}
[System.IO.File]::WriteAllText($OutConfig, $sb.ToString())

$sb2 = New-Object System.Text.StringBuilder
[void]$sb2.AppendLine("# AUTO-GENERATED from repo-root .env - do not edit by hand.")
[void]$sb2.AppendLine("# Regenerate: make k8s-sync-env (gitignored)")
[void]$sb2.AppendLine("apiVersion: v1")
[void]$sb2.AppendLine("kind: Secret")
[void]$sb2.AppendLine("metadata:")
[void]$sb2.AppendLine("  name: researchhub-secret")
[void]$sb2.AppendLine("  namespace: researchhub")
[void]$sb2.AppendLine("type: Opaque")
[void]$sb2.AppendLine("stringData:")
foreach ($key in $secretKeys) {
    $def = [string]$secretDefaults[$key]
    $val = Get-OrDefault $envMap $key $def
    [void]$sb2.AppendLine("  ${key}: $(Yaml-Escape $val)")
}
[System.IO.File]::WriteAllText($OutSecret, $sb2.ToString())

Write-Host "Synced from .env -> k8s/configmap.yaml + k8s/secret.yaml"
