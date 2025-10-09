param(
    [string]$Server = "localhost,1433",
    [string]$Database = "practx_elm",
    [string]$User = "",
    [string]$Password = "",
    [switch]$IntegratedSecurity
)

function Invoke-SqlcmdFile {
    param(
        [string]$SqlFile,
        [string]$Db
    )

    if (-not (Test-Path $SqlFile)) {
        throw "SQL file not found: $SqlFile"
    }

    $sqlcmdArgs = @('-S', $Server, '-d', $Db)

    if ($IntegratedSecurity) {
        $sqlcmdArgs += '-E'
    }
    elseif ($User -and $Password) {
        $sqlcmdArgs += @('-U', $User, '-P', $Password)
    }
    else {
        throw 'Provide -IntegratedSecurity or both -User and -Password.'
    }

    $sqlcmdArgs += @('-b', '-i', $SqlFile)

    & sqlcmd @sqlcmdArgs
    if ($LASTEXITCODE -ne 0) {
        throw "sqlcmd failed for $SqlFile"
    }
}

$masterArgs = @('-S', $Server, '-d', 'master')
if ($IntegratedSecurity) {
    $masterArgs += '-E'
}
elseif ($User -and $Password) {
    $masterArgs += @('-U', $User, '-P', $Password)
}
else {
    throw 'Provide -IntegratedSecurity or both -User and -Password.'
}
$masterArgs += '-b'

& sqlcmd @masterArgs '-Q' "IF DB_ID('$Database') IS NOT NULL BEGIN ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$Database]; END"
if ($LASTEXITCODE -ne 0) {
    throw 'Failed to drop existing database.'
}

& sqlcmd @masterArgs '-Q' "CREATE DATABASE [$Database];"
if ($LASTEXITCODE -ne 0) {
    throw 'Failed to create database.'
}

$schemaPath = Join-Path $PSScriptRoot '..\schema\01_elm_schema.sql'
$seedPath = Join-Path $PSScriptRoot '..\schema\02_seed_minimal.sql'

Invoke-SqlcmdFile -SqlFile $schemaPath -Db $Database
Invoke-SqlcmdFile -SqlFile $seedPath -Db $Database

Write-Host "Database $Database created and seeded successfully."
