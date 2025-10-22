#!/bin/bash

# Bash Script to Setup GitHub Repository
# For Git Bash on Windows or Unix-like systems

echo "========================================"
echo "  Chore App - GitHub Setup Script"
echo "========================================"
echo ""

# Check if Git is installed
echo "Checking for Git installation..."
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo ""
    echo "Please install Git from: https://git-scm.com/download"
    echo "After installation, restart your terminal and run this script again."
    exit 1
fi

echo "✅ Git is installed: $(git --version)"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI is installed"
    echo ""
    
    # Ask if user wants to use GitHub CLI
    read -p "Do you want to use GitHub CLI to create the repository? (y/n): " use_gh
    
    if [[ "$use_gh" == "y" || "$use_gh" == "Y" ]]; then
        echo ""
        echo "Creating private repository 'chore-app' using GitHub CLI..."
        
        # Initialize git if needed
        if [ ! -d ".git" ]; then
            echo "Initializing Git repository..."
            git init
        fi
        
        # Add all files
        echo "Adding files to Git..."
        git add .
        
        # Create commit
        echo "Creating initial commit..."
        git commit -m "Initial commit: Chore App with Rewards Module"
        
        # Create and push repository
        echo "Creating GitHub repository and pushing code..."
        gh repo create chore-app --private --source=. --remote=origin --push
        
        echo ""
        echo "✅ Repository created and code pushed successfully!"
        echo "Visit: https://github.com/$(gh api user --jq .login)/chore-app"
        exit 0
    fi
fi

# Manual setup
echo "Setting up Git repository manually..."
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " username

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo ""
    echo "Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo ""
    echo "✅ Git already initialized"
fi

# Check Git config
echo ""
echo "Checking Git configuration..."

git_user_name=$(git config user.name)
git_user_email=$(git config user.email)

if [ -z "$git_user_name" ] || [ -z "$git_user_email" ]; then
    echo ""
    echo "Git user not configured. Please enter your details:"
    
    if [ -z "$git_user_name" ]; then
        read -p "Enter your name: " name
        git config --global user.name "$name"
    fi
    
    if [ -z "$git_user_email" ]; then
        read -p "Enter your email: " email
        git config --global user.email "$email"
    fi
    
    echo "✅ Git configured"
else
    echo "✅ Git user: $git_user_name <$git_user_email>"
fi

# Add files
echo ""
echo "Adding files to Git..."
git add .
echo "✅ Files added"

# Check if there are changes to commit
if ! git diff-index --quiet HEAD 2>/dev/null; then
    echo ""
    echo "Creating initial commit..."
    git commit -m "Initial commit: Chore App with Rewards Module"
    echo "✅ Commit created"
else
    echo ""
    echo "✅ No changes to commit (repository already committed)"
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo ""
    echo "⚠️  Remote 'origin' already exists: $(git remote get-url origin)"
    read -p "Do you want to update it? (y/n): " update_remote
    
    if [[ "$update_remote" == "y" || "$update_remote" == "Y" ]]; then
        git remote remove origin
        git remote add origin "https://github.com/$username/chore-app.git"
        echo "✅ Remote updated"
    fi
else
    echo ""
    echo "Adding GitHub remote..."
    git remote add origin "https://github.com/$username/chore-app.git"
    echo "✅ Remote added"
fi

# Rename branch to main if needed
echo ""
echo "Ensuring branch is named 'main'..."
git branch -M main
echo "✅ Branch set to 'main'"

# Instructions for manual repository creation
echo ""
echo "========================================"
echo "  Next Steps"
echo "========================================"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: chore-app"
echo "3. Select: Private"
echo "4. DO NOT initialize with README, .gitignore, or license"
echo "5. Click 'Create repository'"
echo ""
echo "Then run the following command to push your code:"
echo ""
echo "   git push -u origin main"
echo ""
echo "Note: You may be prompted for credentials."
echo "Use a Personal Access Token (not your password)."
echo ""
echo "To create a token:"
echo "https://github.com/settings/tokens"
echo ""

