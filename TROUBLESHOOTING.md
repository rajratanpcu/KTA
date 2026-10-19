# Troubleshooting npm Installation

## Issue: Cannot Install npm Packages

If you're getting errors when running `npm install`, try these solutions:

### Solution 1: Check npm and Node.js

```bash
node --version    # Should be 18+
npm --version     # Should be 9+
```

If not installed, download from: https://nodejs.org/

### Solution 2: Clear npm Cache

```bash
npm cache clean --force
npm install
```

### Solution 3: Delete node_modules and package-lock

```bash
cd C:\Users\Raj Ratan\Desktop\KTA\frontend
rm -rf node_modules package-lock.json
npm install
```

### Solution 4: Try Different Registry

```bash
# Use official registry
npm config set registry https://registry.npmjs.org/

# Or try Yarn instead
npm install -g yarn
yarn install
```

### Solution 5: Install Behind Proxy/Firewall

If you're behind a corporate firewall:

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
npm install
```

### Solution 6: Install Offline

If you have another computer with internet access:

1. On connected computer:
   ```bash
   npm install
   ```

2. Copy entire `node_modules` folder to your KTA project

3. Run directly:
   ```bash
   npm run dev
   ```

### Solution 7: Check Permissions

On Windows, run Command Prompt as Administrator:

```bash
cd C:\Users\Raj Ratan\Desktop\KTA\frontend
npm install
```

### Solution 8: Use npx to bypass cache

```bash
npx create-vite@latest temp-test --template react-ts
# If this works, your npm is fine - try clearing KTA cache
```

## Common Error Messages

### "403 Forbidden"
- Registry is blocked by firewall
- Try different registry or use VPN

### "EACCES: permission denied"
- Run as administrator (Windows)
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

### "ETIMEDOUT" or "ENOTFOUND"
- Network/DNS issue
- Check internet connection
- Try different network

### "Cannot find module"
- Incomplete installation
- Delete node_modules and retry

## Still Not Working?

### Alternative: Use Minimal Setup

I can create a simplified version that uses CDN links instead of npm packages. Let me know if you want this option.

### Share Error Message

Please share the exact error message you're getting and I can provide a specific solution.

## What Error Are You Seeing?

Please paste the error message from npm and I'll help you fix it!
