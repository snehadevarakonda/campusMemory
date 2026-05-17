# Push Campus Memories to GitHub (run after: gh auth login)
# Usage: .\push-to-github.ps1
# Optional: .\push-to-github.ps1 -Username YOUR_GITHUB_USERNAME

param(
  [string]$Username = ""
)

$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

Write-Host "Checking GitHub login..." -ForegroundColor Cyan
& $gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nRun this first (browser login):" -ForegroundColor Yellow
  Write-Host "  gh auth login" -ForegroundColor White
  exit 1
}

if (-not $Username) {
  $Username = (& $gh api user -q .login 2>$null)
  if (-not $Username) {
    Write-Host "Could not detect username. Pass -Username YOUR_GITHUB_USERNAME" -ForegroundColor Red
    exit 1
  }
}

$repoName = "campus-memories"
Write-Host "Creating public repo $Username/$repoName ..." -ForegroundColor Cyan
& $gh repo create $repoName --public --source=. --remote=origin --push
if ($LASTEXITCODE -eq 0) {
  Write-Host "`nDone! Repo:" -ForegroundColor Green
  & $gh repo view --web
} else {
  Write-Host "`nIf repo already exists, try:" -ForegroundColor Yellow
  Write-Host "  git remote add origin https://github.com/$Username/$repoName.git"
  Write-Host "  git push -u origin main"
}
