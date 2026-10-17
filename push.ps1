# GeoPulse GitHub Push Helper
Write-Host "Syncing GeoPulse with GitHub repository..." -ForegroundColor Cyan

Set-Location "c:\SEO Tool"

# Check git status
git status

# Push commits
Write-Host "`nPushing to https://github.com/Searchmetrics-ui/seo-tool.git..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`nStandard push required authentication. If you have a GitHub Personal Access Token (PAT):" -ForegroundColor Magenta
    $token = Read-Host "Paste your GitHub Token (or press Enter to cancel)"
    if ($token) {
        git push "https://${token}@github.com/Searchmetrics-ui/seo-tool.git" main
    }
}
