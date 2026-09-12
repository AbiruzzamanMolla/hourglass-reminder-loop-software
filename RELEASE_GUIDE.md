# 🚀 Release & Update Workflow Guide

This guide details the exact step-by-step procedure to update the software, compile both 64-bit and 32-bit installers plus the portable executable, and publish the new release to GitHub.

---

## 📋 Checklist Overview

1. [ ] **Code Changes**: Make your features or bugfixes.
2. [ ] **Version Bump**: Update version in `package.json`.
3. [ ] **Changelog**: Add release notes under the new version in `CHANGELOG.md`.
4. [ ] **Build Executables**: Run `npm run dist` to create:
   - `Hourglass-Timer-Setup-v<VERSION>-x64.exe` (64-bit Installer)
   - `Hourglass-Timer-Setup-v<VERSION>-ia32.exe` (32-bit Installer)
   - `Hourglass-Timer-v<VERSION>.exe` (Portable Executable)
5. [ ] **Update README**: Update download URLs in `README.md` if needed.
6. [ ] **Commit & Push**: Push code changes to GitHub `main` branch.
7. [ ] **Publish GitHub Release**: Upload `.exe` files and tag release with `gh release create`.

---

## 🛠️ Step-by-Step Instructions

### Step 1: Bump the Version
Open [package.json](package.json) and update the `"version"` field (e.g. from `0.0.1` to `0.0.2`):
```json
{
  "name": "hourglass-timer",
  "version": "0.0.2"
}
```

---

### Step 2: Update `CHANGELOG.md`
Open [CHANGELOG.md](CHANGELOG.md) and add a new section for the new version right above the previous version:

```markdown
## [0.0.2] - YYYY-MM-DD

### Added / Changed
- Description of new animation or feature
- Bug fixes or sound adjustments
```

---

### Step 3: Build Installers & Portable Executables
Run the automated build script:
```powershell
npm run dist
```

> [!NOTE]
> This single command automatically creates all three Windows targets in the `dist/` folder:
> 1. `dist/Hourglass-Timer-Setup-v<VERSION>-x64.exe` (64-bit NSIS installer)
> 2. `dist/Hourglass-Timer-Setup-v<VERSION>-ia32.exe` (32-bit NSIS installer)
> 3. `dist/Hourglass-Timer-v<VERSION>.exe` (Standalone portable executable)

Verify the files exist in `dist/`:
```powershell
Get-ChildItem -Path "dist\Hourglass-Timer-*.exe" -Exclude "*uninstaller*"
```

---

### Step 4: Update `README.md` Download Links
In [README.md](README.md), replace previous version numbers with your new version (e.g., replace `v0.0.1` with `v0.0.2`).

---

### Step 5: Git Commit & Push
Stage and commit your code and documentation changes:
```powershell
git add .
git commit -m "chore(release): prepare v0.0.2 with changelog and readme updates"
git push origin main
```

---

### Step 6: Create GitHub Release & Upload Binaries
Use GitHub CLI (`gh`) to create the release tag, attach all generated `.exe` binaries, and publish:

```powershell
# Set version variable (replace with your version)
$VERSION = "0.0.2"

# Create release and upload all 3 executables
gh release create "v$VERSION" `
  "dist/Hourglass-Timer-Setup-v$VERSION-x64.exe" `
  "dist/Hourglass-Timer-Setup-v$VERSION-ia32.exe" `
  "dist/Hourglass-Timer-v$VERSION.exe" `
  --title "Hourglass Timer v$VERSION" `
  --notes-file CHANGELOG.md
```

*If you prefer to write custom notes inline:*
```powershell
gh release create "v$VERSION" `
  "dist/Hourglass-Timer-Setup-v$VERSION-x64.exe" `
  "dist/Hourglass-Timer-Setup-v$VERSION-ia32.exe" `
  "dist/Hourglass-Timer-v$VERSION.exe" `
  --title "Hourglass Timer v$VERSION" `
  --notes "### Changes in v$VERSION`n`n- See CHANGELOG.md for full details."
```

---

## ⚡ Quick One-Liner PowerShell Script (Automated Release)

When you've finished updating `package.json` and `CHANGELOG.md`, you can run this single PowerShell block to build, commit, push, and release automatically:

```powershell
$VERSION = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "Building version $VERSION..." -ForegroundColor Cyan

# 1. Build all Windows targets
npm run dist

# 2. Git Commit & Push
git add .
git commit -m "chore(release): v$VERSION"
git push origin main

# 3. Create GitHub Release with all 3 binaries
gh release create "v$VERSION" `
  "dist/Hourglass-Timer-Setup-v$VERSION-x64.exe" `
  "dist/Hourglass-Timer-Setup-v$VERSION-ia32.exe" `
  "dist/Hourglass-Timer-v$VERSION.exe" `
  --title "Hourglass Timer v$VERSION" `
  --notes-file CHANGELOG.md

Write-Host "Release v$VERSION successfully published!" -ForegroundColor Green
```
