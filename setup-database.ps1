# Script de configuration de la base de donnees
# Usage: .\setup-database.ps1

Write-Host "Configuration de la base de donnees PostgreSQL..." -ForegroundColor Cyan

Set-Location backend

Write-Host "Generation du client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Execution des migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host "Remplissage de la base de donnees avec des donnees de test..." -ForegroundColor Yellow
npm run seed

Write-Host ""
Write-Host "Base de donnees configuree avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Comptes crees:" -ForegroundColor Yellow
Write-Host "   Admin:" -ForegroundColor Cyan
Write-Host "     Email: admin@duralux.com" -ForegroundColor White
Write-Host "     Mot de passe: admin123" -ForegroundColor White
Write-Host ""
Write-Host "   Manager:" -ForegroundColor Cyan
Write-Host "     Email: manager@duralux.com" -ForegroundColor White
Write-Host "     Mot de passe: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Conseil: Utilisez 'npx prisma studio' pour visualiser la base de donnees" -ForegroundColor Magenta

Set-Location ..
