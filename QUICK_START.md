# Quick Start Guide - Step by Step

## The Issue
You're seeing "ERR_CONNECTION_REFUSED" because the development server hasn't been started yet.

## Step-by-Step Solution

### Step 1: Open Command Prompt (or PowerShell)

Press `Windows Key + R`, type `cmd`, and press Enter

### Step 2: Navigate to the Frontend Folder

```bash
cd C:\Users\Raj Ratan\Desktop\KTA\frontend
```

### Step 3: Install Dependencies (First Time Only)

```bash
npm install
```

**This will take 2-3 minutes.** You should see progress as packages download.

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s
```

**If npm install fails**, please tell me the exact error message.

### Step 4: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.2.11  ready in 823 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: Open in Browser

Open your browser and go to: **http://localhost:5173**

The KTA ERP application should now load!

## Important Notes

⚠️ **Keep the Command Prompt window open** - The server runs in that window. Closing it stops the server.

⚠️ **Don't have Node.js?** First install it from: https://nodejs.org/en/download/ (download the LTS version)

## Quick Checklist

- [ ] Node.js installed (run `node --version` to check)
- [ ] Navigated to frontend folder
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run dev` successfully
- [ ] Command prompt shows "ready" message
- [ ] Opened http://localhost:5173 in browser

## If It Still Doesn't Work

### Check if Node.js is installed:
```bash
node --version
npm --version
```

If you get "command not found", install Node.js first.

### Try a different port (if 5173 is busy):
```bash
npm run dev -- --port 3000
```
Then open: http://localhost:3000

### Still stuck?

Tell me:
1. What happens when you run `npm install`?
2. What happens when you run `npm run dev`?
3. Any error messages?

I'll help you fix it!
