# One-time: log in to GitHub, enable Pages from main/docs, open your site
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { Write-Host "Install GitHub CLI first."; exit 1 }

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Sign in to GitHub in the browser window..."
  & $gh auth login -h github.com -p https -w -s repo
}

Write-Host "Enabling GitHub Pages (main branch, /docs folder)..."
& $gh api repos/snehadevarakonda/campusMemory/pages -X PUT `
  -f build_type=legacy `
  -f "source[branch]=main" `
  -f "source[path]=/docs"

Write-Host "Waiting for deploy..."
Start-Sleep -Seconds 5
Start-Process "https://snehadevarakonda.github.io/campusMemory/"
