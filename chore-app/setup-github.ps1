# PowerShell Script to Setup GitHub Repository
# Run this script after installing Git and creating your GitHub repository

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chore App - GitHub Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking for Git installation..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git for Windows from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git is installed: $(git --version)" -ForegroundColor Green
Write-Host ""

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
    Write-Host ""
    
    # Ask if user wants to use GitHub CLI
    $useGH = Read-Host "Do you want to use GitHub CLI to create the repository? (y/n)"
    
    if ($useGH -eq "y" -or $useGH -eq "Y") {
        Write-Host ""
        Write-Host "Creating private repository 'chore-app' using GitHub CLI..." -ForegroundColor Yellow
        
        # Initialize git if needed
        if (-not (Test-Path ".git")) {
            Write-Host "Initializing Git repository..." -ForegroundColor Yellow
            git init
        }
        
        # Add all files
        Write-Host "Adding files to Git..." -ForegroundColor Yellow
        git add .
        
        # Create commit
        Write-Host "Creating initial commit..." -ForegroundColor Yellow
        git commit -m "Initial commit: Chore App with Rewards Module"
        
        # Create and push repository
        Write-Host "Creating GitHub repository and pushing code..." -ForegroundColor Yellow
        gh repo create chore-app --private --source=. --remote=origin --push
        
        Write-Host ""
        Write-Host "✅ Repository created and code pushed successfully!" -ForegroundColor Green
        Write-Host "Visit: https://github.com/$(gh api user --jq .login)/chore-app" -ForegroundColor Cyan
        exit 0
    }
}

# Manual setup
Write-Host "Setting up Git repository manually..." -ForegroundColor Yellow
Write-Host ""

# Get GitHub username
$username = Read-Host "Enter your GitHub username"

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check Git config
Write-Host ""
Write-Host "Checking Git configuration..." -ForegroundColor Yellow

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host ""
    Write-Host "Git user not configured. Please enter your details:" -ForegroundColor Yellow
    
    if (-not $gitUserName) {
        $name = Read-Host "Enter your name"
        git config --global user.name $name
    }
    
    if (-not $gitUserEmail) {
        $email = Read-Host "Enter your email"
        git config --global user.email $email
    }
    
    Write-Host "✅ Git configured" -ForegroundColor Green
} else {
    Write-Host "✅ Git user: $gitUserName <$gitUserEmail>" -ForegroundColor Green
}

# Add files
Write-Host ""
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added" -ForegroundColor Green

# Check if there are changes to commit
$changes = git status --porcelain
if ($changes) {
    Write-Host ""
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Chore App with Rewards Module"
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ No changes to commit (repository already committed)" -ForegroundColor Green
}

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null

if ($remoteExists) {
    Write-Host ""
    Write-Host "⚠️  Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $updateRemote = Read-Host "Do you want to update it? (y/n)"
    
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        git remote remove origin
        git remote add origin "https://github.com/$username/chore-app.git"
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$username/chore-app.git"
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Rename branch to main if needed
Write-Host ""
Write-Host "Ensuring branch is named 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch set to 'main'" -ForegroundColor Green

# Instructions for manual repository creation
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: chore-app" -ForegroundColor White
Write-Host "3. Select: Private" -ForegroundColor White
Write-Host "4. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "Then run the following command to push your code:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host ""
Write-Host "Note: You may be prompted for credentials." -ForegroundColor Yellow
Write-Host "Use a Personal Access Token (not your password)." -ForegroundColor Yellow
Write-Host ""
Write-Host "To create a token:" -ForegroundColor White
Write-Host "https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""

