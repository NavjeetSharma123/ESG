# npm install Troubleshooting Guide - Windows

If `npm install` is failing, try these steps in order:

## 1. Check Prerequisites

```powershell
node -v    # Should be v14+ (v16 or v18 recommended)
npm -v     # Should be 6+
```

**If Node.js/npm is not installed:**
- Download from https://nodejs.org/ (LTS version)
- Run the installer and **restart your terminal** after installation

---

## 2. Run from the Correct Directory

**Important:** You must run `npm install` from inside `esg-reporting-website`:

```powershell
cd w:\python\Project\ESGG\ESG\esg-reporting-website
npm install
```

---

## 3. Clean Install (Most Common Fix)

If you get errors, try a clean reinstall:

```powershell
cd esg-reporting-website

# Remove existing install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

---

## 4. Use Legacy Peer Deps

If you see peer dependency conflicts:

```powershell
npm install --legacy-peer-deps
```

---

## 5. Run as Administrator

Sometimes Windows permissions block npm. Try:
- Right-click PowerShell/Command Prompt → "Run as administrator"
- Navigate to the project and run `npm install`

---

## 6. Check Network/Proxy

- If behind a corporate firewall, you may need proxy settings
- Try: `npm config set proxy null` and `npm config set https-proxy null` (if not using a proxy)

---

## 7. Node.js Version Issues

- **Node 18+ with OpenSSL 3.0:** The project uses `--openssl-legacy-provider` (already configured)
- If using **Node 20+**, consider using Node 18 LTS for best compatibility with react-scripts 4.x

---

## After Successful Install

```powershell
npm start
```

The app will open at **http://localhost:3000**

---

## Still Failing? Share the Error

Copy the **full error message** from your terminal when running `npm install` - the specific error helps diagnose the issue.
