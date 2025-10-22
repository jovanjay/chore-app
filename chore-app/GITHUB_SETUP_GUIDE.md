# GitHub Repository Setup Guide

This guide will help you create a private GitHub repository for the Chore App project and push your code to it.

## Prerequisites

### 1. Install Git for Windows

If Git is not installed on your system:

1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. After installation, restart your terminal/PowerShell
4. Verify installation:
   ```bash
   git --version
   ```

### 2. Configure Git (First Time Only)

Set your Git user information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. GitHub Account

- Make sure you have a GitHub account: https://github.com/signup
- You may want to set up SSH keys or use a Personal Access Token for authentication

## Option 1: Using GitHub CLI (Recommended)

### Install GitHub CLI

1. Download from: https://cli.github.com/
2. Run the installer
3. Authenticate:
   ```bash
   gh auth login
   ```
   - Select "GitHub.com"
   - Choose your preferred authentication method

### Create Repository and Push

```bash
# Navigate to your project
cd "C:\Users\Budoy\OneDrive\Documents\Personal\Work\PagChore\chore-app"

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Chore App with Rewards Module"

# Create private GitHub repository and push
gh repo create chore-app --private --source=. --remote=origin --push
```

## Option 2: Using GitHub Web Interface

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name:** `chore-app`
   - **Description:** (Optional) "Family chore management app with rewards system"
   - **Visibility:** Select **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **Create repository**

### Step 2: Initialize Git and Push Code

After creating the repository, GitHub will show you commands. Here's what to do:

```bash
# Navigate to your project
cd "C:\Users\Budoy\OneDrive\Documents\Personal\Work\PagChore\chore-app"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: Chore App with Rewards Module"

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chore-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Enter Credentials

When you push for the first time, you'll be prompted for credentials:

**Option A: Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token
5. Use the token as your password when prompted

**Option B: SSH Keys**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your.email@example.com"`
2. Add to SSH agent: `ssh-add ~/.ssh/id_ed25519`
3. Add public key to GitHub: Settings → SSH and GPG keys
4. Use SSH URL: `git remote set-url origin git@github.com:YOUR_USERNAME/chore-app.git`

## What Gets Pushed

Based on your `.gitignore` file, the following will **NOT** be pushed:

- `node_modules/` - Dependencies (will be reinstalled)
- `dist/` - Build output
- `.env` - Environment variables (keep this secret!)
- Database files
- OS-specific files
- IDE settings

The following **WILL** be pushed:

- All source code (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Docker configuration (`Dockerfile`, `docker-compose.yml`)
- Documentation (`*.md` files)
- `.env.example` - Template for environment variables

## Verifying Your Repository

After pushing, verify on GitHub:

1. Go to https://github.com/YOUR_USERNAME/chore-app
2. Check that:
   - The repository is marked as **Private** (lock icon)
   - All your files are present
   - `.env` file is **NOT** visible (it should be gitignored)

## Future Updates

After the initial push, update your repository with:

```bash
# Stage changes
git add .

# Commit with a descriptive message
git commit -m "Add new feature or fix bug"

# Push to GitHub
git push
```

## Common Issues and Solutions

### Issue: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/chore-app.git
```

### Issue: Authentication failed

- For HTTPS: Use a Personal Access Token, not your password
- For SSH: Make sure your SSH key is added to GitHub

### Issue: "rejected - non-fast-forward"

```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Issue: Large files or node_modules being pushed

Check your `.gitignore` file and remove cached files:

```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules from git"
git push
```

## Branch Protection (Optional)

For production, consider setting up branch protection:

1. Go to Repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators (optional)

## Collaborators (Optional)

To add team members:

1. Go to Repository Settings → Collaborators
2. Click "Add people"
3. Enter their GitHub username or email
4. Select permission level (Read, Write, Admin)

## Repository Size

Current project size: ~50-100 MB (without node_modules)
GitHub free plan allows: Unlimited private repositories with 500 MB storage per repo

## Next Steps

1. ✅ Install Git for Windows
2. ✅ Create private repository on GitHub
3. ✅ Initialize git and push code
4. 🔄 Set up GitHub Actions for CI/CD (optional)
5. 🔄 Configure branch protection rules (optional)
6. 🔄 Add collaborators if working with a team (optional)

## Quick Reference Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# View remote URL
git remote -v

# Pull latest changes
git pull

# Push changes
git push
```

## Additional Resources

- Git Documentation: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

