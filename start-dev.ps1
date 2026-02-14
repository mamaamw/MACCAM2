# Script de demarrage rapide pour Windows PowerShell
# Usage: .\start-dev.ps1

Write-Host "Demarrage de Duralux CRM..." -ForegroundColor Cyan

# Verifier si les dependances sont installees
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installation des dependances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installation des dependances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Verifier si .env existe
if (-not (Test-Path "backend\.env")) {
    Write-Host "Fichier .env manquant dans backend/" -ForegroundColor Red
    Write-Host "Copie de .env.example vers .env..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "N'oubliez pas de configurer vos variables d'environnement dans backend\.env" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Fichier .env manquant dans frontend/" -ForegroundColor Red
    Write-Host "Copie de .env.example vers .env..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
}

Write-Host ""
Write-Host "Demarrage du backend sur http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Demarrage du frontend sur http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Application demarree avec succes!" -ForegroundColor Green
Write-Host "   - Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Compte de test:" -ForegroundColor Yellow
Write-Host "   Email: admin@duralux.com" -ForegroundColor White
Write-Host "   Mot de passe: admin123" -ForegroundColor White
