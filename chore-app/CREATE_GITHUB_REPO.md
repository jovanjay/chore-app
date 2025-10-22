# Create GitHub Repository - Step by Step

## ⚠️ Prerequisites Check

Git is currently **not installed** on your system. Follow these steps:

## Step 1: Install Git for Windows

1. Download Git from: **https://git-scm.com/download/win**
2. Run the installer
3. Use default settings (or customize if you prefer)
4. Restart PowerShell after installation
5. Verify installation:
   ```powershell
   git --version
   ```

## Step 2: Configure Git (First Time Only)

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create GitHub Repository

### Option A: Using Automated Script (Easier)

After installing Git, run the provided PowerShell script:

```powershell
cd "C:\Users\Budoy\OneDrive\Documents\Personal\Work\PagChore\chore-app"
.\setup-github.ps1
```

The script will:
- ✅ Initialize Git repository
- ✅ Add all files
- ✅ Create initial commit
- ✅ Set up remote origin
- ✅ Guide you through creating the GitHub repository

### Option B: Manual Setup (More Control)

#### 3.1: Initialize Git

```powershell
cd "C:\Users\Budoy\OneDrive\Documents\Personal\Work\PagChore\chore-app"
git init
```

#### 3.2: Add Files

```powershell
git add .
```

#### 3.3: Create First Commit

```powershell
git commit -m "Initial commit: Chore App with Rewards Module"
```

#### 3.4: Create Repository on GitHub

1. Go to: **https://github.com/new**
2. Fill in the form:
   - **Repository name:** `chore-app`
   - **Description:** (Optional) "Family chore management app with rewards system"
   - **Visibility:** Select **Private** ✅
   - **DO NOT** check "Initialize this repository with:"
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
3. Click **Create repository**

#### 3.5: Connect Local Repository to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/chore-app.git
git branch -M main
```

#### 3.6: Push to GitHub

```powershell
git push -u origin main
```

**Note:** You'll be prompted for credentials.

## Step 4: Authentication

When you push, Windows will prompt for GitHub credentials.

### Recommended: Personal Access Token

**DO NOT** use your GitHub password. Use a Personal Access Token instead:

1. Go to: **https://github.com/settings/tokens**
2. Click **Generate new token** → **Generate new token (classic)**
3. Set:
   - **Note:** "Chore App Repository Access"
   - **Expiration:** 90 days (or custom)
   - **Scopes:** Check ✅ `repo` (Full control of private repositories)
4. Click **Generate token**
5. **Copy the token** (you won't see it again!)
6. Use this token as your password when Git prompts

### Alternative: GitHub CLI (Optional)

Install GitHub CLI for easier authentication:

1. Download: **https://cli.github.com/**
2. Install and run:
   ```powershell
   gh auth login
   ```
3. Then use the automated script or:
   ```powershell
   gh repo create chore-app --private --source=. --remote=origin --push
   ```

## Step 5: Verify Repository

1. Go to: `https://github.com/YOUR_USERNAME/chore-app`
2. Check:
   - ✅ Repository shows **Private** (lock icon)
   - ✅ All your code is there
   - ✅ README.md is displaying correctly
   - ✅ `.env` file is **NOT** visible (it's gitignored)

## What Gets Pushed

### ✅ Included (will be pushed)
- Source code (`src/` directory)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Docker files (`Dockerfile`, `docker-compose.yml`)
- Documentation (all `.md` files)
- `.gitignore` and `.env.example`
- Setup scripts

### ❌ Excluded (gitignored)
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.env` - Your secrets (IMPORTANT!)
- `mysql-data/` - Database files
- IDE settings (`.vscode/`)
- Log files

## Troubleshooting

### "git: command not found"
→ Git is not installed or not in PATH. Install Git and restart PowerShell.

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/chore-app.git
```

### "Authentication failed"
→ You're using your GitHub password. Use a Personal Access Token instead.

### "Permission denied"
→ Repository might not exist or you don't have access. Verify the repository was created.

### Files are taking too long to push
→ This is normal for first push. The project is ~50-100 MB without node_modules.

## Future Updates

After initial push, update your repository with:

```powershell
# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

## Quick Commands Reference

```powershell
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline

# Create branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Pull latest changes
git pull

# Push changes
git push
```

## Next Steps After Creating Repository

1. ✅ Add collaborators (if working with a team)
   - Go to Settings → Collaborators
2. ✅ Set up branch protection (optional)
   - Go to Settings → Branches
3. ✅ Add repository description and topics
4. ✅ Consider setting up GitHub Actions for CI/CD

## Support

- Git Documentation: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- GitHub CLI: https://cli.github.com/manual/

---

**Need Help?** Check `GITHUB_SETUP_GUIDE.md` for more detailed instructions.

