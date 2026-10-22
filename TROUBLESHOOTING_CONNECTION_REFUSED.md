# 🔧 Connection Refused - Troubleshooting Steps

**Error:** `ERR_CONNECTION_REFUSED` on http://localhost:5173/login

This means the frontend server (Vite) is not running.

---

## Quick Fix - Try These In Order

### 1. Run Full Diagnostic
Double-click: **`diagnose_all.bat`**

This checks:
- Are Java, Maven, Node, PostgreSQL installed?
- Are ports 8080 and 5173 free?
- Does the database exist?
- Are configuration files present?

**Copy and paste the ENTIRE output here.**

---

### 2. Run Frontend Only Test
Double-click: **`FIX_FRONTEND.bat`**

This will:
- Check Node.js and npm
- Install dependencies if missing
- Create .env.local if missing
- Start the frontend server
- Show any errors

**If you see an error, copy the ENTIRE error message.**

---

### 3. Check What Went Wrong

**Did the batch file windows close immediately?**
- Right-click the .bat file → "Edit" to see what's inside
- Open Command Prompt manually and run the commands

**Is Node.js installed?**
Open Command Prompt and run:
```bash
node -v
npm -v
```
If "command not found", install Node.js from https://nodejs.org/

**Is something using port 5173?**
Open Command Prompt and run:
```bash
netstat -ano | findstr ":5173"
```
If you see output, something is using that port.

---

## Manual Frontend Startup

If the batch files don't work, open Command Prompt:

```bash
cd "C:\Users\Raj Ratan\Desktop\KTA\frontend"
node -v
npm -v
npm install
npm run dev
```

**Leave this Command Prompt window open.** Copy any errors you see.

Expected output:
```
VITE v5.x.x ready in XXXms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Common Errors and Fixes

### "node is not recognized"
**Fix:** Install Node.js from https://nodejs.org/ (download LTS version)

### "npm ERR! code ENOENT"
**Fix:** You're in the wrong directory
```bash
cd "C:\Users\Raj Ratan\Desktop\KTA\frontend"
```

### "Port 5173 already in use"
**Fix:** Change the port in [frontend/vite.config.ts](frontend/vite.config.ts:14):
```typescript
server: {
  port: 5174,  // Change from 5173 to 5174
  host: true,
},
```
Then update [frontend/.env.local](frontend/.env.local) (backend URL stays the same)

### "Cannot find module"
**Fix:** Reinstall dependencies:
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## What to Send Me

Run `diagnose_all.bat` and `FIX_FRONTEND.bat`, then send me:

1. ✅ Output of `diagnose_all.bat` (all of it)
2. ✅ Output of `FIX_FRONTEND.bat` (all of it)
3. ✅ What you see when you run `node -v` in Command Prompt

I'll fix the exact issue immediately!
