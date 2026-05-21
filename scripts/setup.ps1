# MemoryOS Setup Script (PowerShell)
Write-Host "=== MemoryOS Setup ===" -ForegroundColor Cyan

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js is required. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green

# Install dependencies
Write-Host "`nInstalling npm dependencies..." -ForegroundColor Yellow
npm install
if ($?) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

# Check Ollama (optional)
$ollamaCheck = ollama --version 2>$null
if ($ollamaCheck) {
    Write-Host "✓ Ollama detected" -ForegroundColor Green
    $hasModel = ollama list 2>$null | Select-String "llama3.2"
    if (-not $hasModel) {
        Write-Host "  Tip: Run 'ollama pull llama3.2:3b' and 'ollama pull nomic-embed-text' for AI features" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Tip: Install Ollama from https://ollama.com for local AI features (optional)" -ForegroundColor Yellow
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Run 'npm run dev' to start MemoryOS" -ForegroundColor White
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor White
