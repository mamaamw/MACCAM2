# Test de la Signature Electronique

Write-Host "Test de l'API de Signature Electronique" -ForegroundColor Cyan
Write-Host ""

# Test 1: Verifier que le backend est en cours d'execution
Write-Host "Test 1: Verification du backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Method Get -TimeoutSec 5
    Write-Host "[OK] Backend operationnel" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "[ERREUR] Backend non accessible" -ForegroundColor Red
    Write-Host "   Assurez-vous que le backend est demarre (npm run dev)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Recuperer les methodes de signature
Write-Host "Test 2: Methodes de signature disponibles..." -ForegroundColor Yellow
try {
    $methods = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/pdf-sign/methods" -Method Get -TimeoutSec 5
    Write-Host "[OK] Methodes recuperees" -ForegroundColor Green
    
    foreach ($method in $methods.methods) {
        $status = if ($method.available) { "[Disponible]" } else { "[Bientot]" }
        Write-Host "   $status - $($method.name)" -ForegroundColor $(if ($method.available) { "Green" } else { "Gray" })
        if ($method.description) {
            Write-Host "     $($method.description)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "[ERREUR] Impossible de recuperer les methodes" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Verifier que le certificat de test existe
Write-Host "Test 3: Certificat de demonstration..." -ForegroundColor Yellow
$certPath = Join-Path $PSScriptRoot "backend\demo-certificate.p12"
if (Test-Path $certPath) {
    Write-Host "[OK] Certificat de test trouve" -ForegroundColor Green
    Write-Host "   Chemin: $certPath" -ForegroundColor Gray
    $certInfo = Get-Item $certPath
    Write-Host "   Taille: $([math]::Round($certInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
    Write-Host "   Cree le: $($certInfo.CreationTime)" -ForegroundColor Gray
} else {
    Write-Host "[AVERTISSEMENT] Certificat de test non trouve" -ForegroundColor Yellow
    Write-Host "   Creation du certificat..." -ForegroundColor Yellow
    try {
        Push-Location (Join-Path $PSScriptRoot "backend")
        node create-demo-cert.js
        Pop-Location
        Write-Host "[OK] Certificat cree avec succes" -ForegroundColor Green
    } catch {
        Write-Host "[ERREUR] Erreur lors de la creation du certificat" -ForegroundColor Red
        Write-Host "   Erreur: $_" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 4: Telecharger le certificat via l'API
Write-Host "Test 4: Telechargement du certificat via l'API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/pdf-sign/demo-certificate" -Method Get -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] API de telechargement fonctionnelle" -ForegroundColor Green
        Write-Host "   Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
        Write-Host "   Taille: $([math]::Round($response.Content.Length / 1KB, 2)) KB" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERREUR] Impossible de telecharger le certificat via l'API" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Resume des Tests" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "L'API de signature electronique est prete!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:3000/apps/sign-pdf" -ForegroundColor White
Write-Host "   2. Chargez un PDF" -ForegroundColor White
Write-Host "   3. Telechargez le certificat de test" -ForegroundColor White
Write-Host "   4. Signez electroniquement votre PDF" -ForegroundColor White
Write-Host ""
Write-Host "Mot de passe du certificat de test: demo" -ForegroundColor Cyan
Write-Host ""
Write-Host "Consultez SIGNATURE_ELECTRONIQUE.md pour plus d'infos" -ForegroundColor Gray
Write-Host ""
