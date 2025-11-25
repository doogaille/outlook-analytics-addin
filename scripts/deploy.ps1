# Script PowerShell pour déploiement Exchange on-premise
# Usage: .\scripts\deploy.ps1 -ExchangeServer "mail.domain.com" -ManifestPath ".\dist\manifest.xml"

param(
    [Parameter(Mandatory=$true)]
    [string]$ExchangeServer,
    
    [Parameter(Mandatory=$false)]
    [string]$ManifestPath = ".\dist\manifest.xml",
    
    [Parameter(Mandatory=$false)]
    [string]$Organization = "Default",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

Write-Host "🚀 Déploiement de l'add-in Outlook Analytics" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le manifest existe
if (-not (Test-Path $ManifestPath)) {
    Write-Host "❌ Erreur: Le fichier manifest.xml n'existe pas à $ManifestPath" -ForegroundColor Red
    Write-Host "💡 Exécutez d'abord: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Manifest trouvé: $ManifestPath" -ForegroundColor Green

# Vérifier la connexion Exchange
Write-Host "🔍 Vérification de la connexion à Exchange Server..." -ForegroundColor Cyan
try {
    $session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "http://$ExchangeServer/PowerShell/" -ErrorAction Stop
    Write-Host "✅ Connexion réussie à $ExchangeServer" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion à Exchange Server: $_" -ForegroundColor Red
    Write-Host "💡 Vérifiez que vous êtes connecté au réseau et que Exchange Management Shell est installé" -ForegroundColor Yellow
    exit 1
}

# Importer la session Exchange
Import-PSSession $session -DisableNameChecking | Out-Null

# Vérifier si l'add-in existe déjà
$manifestContent = Get-Content $ManifestPath -Raw
$manifestXml = [xml]$manifestContent
$addinId = $manifestXml.OfficeApp.Id

Write-Host "📦 ID de l'add-in: $addinId" -ForegroundColor Cyan

try {
    $existingAddin = Get-App -OrganizationApp | Where-Object { $_.AppId -eq $addinId }
    
    if ($existingAddin -and -not $Force) {
        Write-Host "⚠️  L'add-in existe déjà. Utilisez -Force pour le remplacer." -ForegroundColor Yellow
        Remove-PSSession $session
        exit 1
    }
    
    if ($existingAddin -and $Force) {
        Write-Host "🔄 Suppression de l'ancienne version..." -ForegroundColor Yellow
        Remove-App -Identity $existingAddin.Identity -Confirm:$false
        Write-Host "✅ Ancienne version supprimée" -ForegroundColor Green
    }
    
    # Installer l'add-in
    Write-Host "📤 Installation de l'add-in..." -ForegroundColor Cyan
    $app = New-App -FileData ([System.IO.File]::ReadAllBytes((Resolve-Path $ManifestPath).Path))
    
    Write-Host "✅ Add-in installé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Informations de l'add-in:" -ForegroundColor Cyan
    Write-Host "   - Nom: $($app.DisplayName)" -ForegroundColor White
    Write-Host "   - Version: $($app.Version)" -ForegroundColor White
    Write-Host "   - État: $($app.Enabled)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Pour activer l'add-in pour tous les utilisateurs:" -ForegroundColor Yellow
    Write-Host "   Set-App -Identity '$($app.Identity)' -DefaultStateForUser Enabled" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Pour activer pour un utilisateur spécifique:" -ForegroundColor Yellow
    Write-Host "   New-AppAssignmentPolicy -App '$($app.Identity)' -User 'user@domain.com' -DefaultStateForUser Enabled" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur lors de l'installation: $_" -ForegroundColor Red
    Remove-PSSession $session
    exit 1
} finally {
    Remove-PSSession $session
}

Write-Host ""
Write-Host "✅ Déploiement terminé avec succès!" -ForegroundColor Green

