# Alternative: Utiliser SQLite pour debuter (pas besoin de PostgreSQL)

Write-Host "Configuration avec SQLite (base de donnees locale)..." -ForegroundColor Cyan

Set-Location backend

# Modifier le schema pour SQLite
$schemaPath = "prisma\schema.prisma"
$content = Get-Content $schemaPath -Raw
$content = $content -replace 'provider = "postgresql"', 'provider = "sqlite"'
Set-Content $schemaPath $content

# Modifier .env pour SQLite
$envContent = @"
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET=changez_moi_en_production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
"@
Set-Content ".env" $envContent

Write-Host "Generation du client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Execution des migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host "Remplissage de la base de donnees..." -ForegroundColor Yellow
npm run seed

Write-Host ""
Write-Host "Configuration SQLite terminee!" -ForegroundColor Green
Write-Host "La base de donnees se trouve dans: backend/dev.db" -ForegroundColor Cyan

Set-Location ..
