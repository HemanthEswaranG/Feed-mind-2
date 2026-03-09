# FeedMind Setup Script
# This script helps set up the separated frontend and backend structure

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Cyan
Write-Host "║       FeedMind Project Setup                      ║" -ForegroundColor Cyan
Write-Host "║       Separated Frontend & Backend                ║" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check Python (optional)
if (Test-Command "python") {
    $pythonVersion = python --version
    Write-Host "  ✓ Python: $pythonVersion (for NLP model)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Python not found (optional - needed for NLP model)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Setting up Backend..." -ForegroundColor Yellow
Write-Host ""

# Backend setup
Set-Location "$projectRoot\backend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Backend dependencies already installed" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "  Creating backend .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created .env - Please edit with your configuration" -ForegroundColor Green
} else {
    Write-Host "  ✓ Backend .env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎨 Setting up Frontend..." -ForegroundColor Yellow
Write-Host ""

# Frontend setup
Set-Location "$projectRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "  Creating frontend .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created .env - Please edit with your configuration" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend .env already exists" -ForegroundColor Green
}

Set-Location $projectRoot

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "║         ✨ Setup Complete! ✨                     ║" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Configure your environment:" -ForegroundColor Cyan
Write-Host "     - Edit backend/.env with database URL and API keys"
Write-Host "     - Edit frontend/.env with backend URL"
Write-Host ""
Write-Host "  2. Setup database:" -ForegroundColor Cyan
Write-Host "     cd backend"
Write-Host "     npm run prisma:generate"
Write-Host "     npm run prisma:migrate"
Write-Host ""
Write-Host "  3. Start the servers:" -ForegroundColor Cyan
Write-Host ""
Write-Host "     Terminal 1 (Backend):" -ForegroundColor Magenta
Write-Host "     cd backend"
Write-Host "     npm run dev"
Write-Host ""
Write-Host "     Terminal 2 (Frontend):" -ForegroundColor Magenta
Write-Host "     cd frontend"
Write-Host "     npm run dev"
Write-Host ""
Write-Host "  4. Optional - Start NLP model:" -ForegroundColor Cyan
Write-Host "     cd nlp_model"
Write-Host "     python -m venv venv"
Write-Host "     venv\Scripts\activate"
Write-Host "     pip install -r requirements.txt"
Write-Host "     python run_api.py"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "  - QUICKSTART.md - Quick start guide"
Write-Host "  - PROJECT_README.md - Complete documentation"
Write-Host "  - MIGRATION_GUIDE.md - TypeScript to JavaScript guide"
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "  - Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - NLP API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
