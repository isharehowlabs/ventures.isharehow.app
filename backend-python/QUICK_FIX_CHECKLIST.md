# Quick Fix Checklist for Authentication Issue

## The Problem
"Verifying authentication..." spinner never stops after Patreon login.

## Root Cause
Missing `SESSION_COOKIE_DOMAIN` environment variable on Render.com causes session cookies to be scoped to `api.ventures.isharehow.app` only. The frontend at `ventures.isharehow.app` cannot read these cookies.

## Fix Steps (Do this on Render.com)

### Step 1: Add Environment Variables
Go to Render Dashboard → Your Backend Service → Environment → Add these:

- [ ] `SESSION_COOKIE_DOMAIN` = `.ventures.isharehow.app` **(CRITICAL)**
- [ ] `FLASK_SECRET_KEY` = `32e6ab70212f7e807449da70bf651de3f862b0191ab921de0f3b11cb933803d1`
- [ ] `FLASK_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://ventures.isharehow.app`

### Step 2: Wait for Redeploy
Render will automatically redeploy after you save environment variables (takes 2-5 minutes).

### Step 3: Test
1. Clear browser cookies (or use incognito)
2. Go to https://ventures.isharehow.app/labs
3. Click "Sign in with Patreon"
4. Complete OAuth
5. Should see dashboard (not spinner)

### Step 4: Verify Logs
Check Render logs for:
```
Session Configuration:
  - COOKIE_DOMAIN: .ventures.isharehow.app
```

### Step 5: Check Browser Console
Should see:
```
[Auth] ✓ Authentication successful
```

## If Still Not Working

1. Check browser console for detailed [Auth] logs
2. Check Render logs for "STORING USER IN SESSION" and session config
3. Verify SESSION_COOKIE_DOMAIN starts with a dot: `.ventures.isharehow.app`
4. Try clearing all site data in browser and retry

## Files Changed Locally (For Reference)
- `backend-python/app.py` - Added debug logging to auth endpoints
- `src/hooks/useAuth.ts` - Added detailed console logging
- Both files have detailed logs prefixed with `[Auth]` or `===`

These changes will help diagnose any remaining issues via logs.
