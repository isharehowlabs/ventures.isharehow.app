# Render.com Deployment Checklist

This checklist ensures all required environment variables are configured on Render.com for the backend API to function properly, especially for Patreon OAuth authentication.

## Critical Environment Variables (Required)

These variables MUST be set for authentication to work:

### 1. SESSION_COOKIE_DOMAIN
```
SESSION_COOKIE_DOMAIN=.ventures.isharehow.app
```
**Purpose:** Enables session cookies to be shared between api.ventures.isharehow.app and ventures.isharehow.app  
**Impact if missing:** Session cookies won't work cross-subdomain, login will fail

### 2. FLASK_SECRET_KEY
```
FLASK_SECRET_KEY=<your-secure-random-256-bit-key>
```
**Purpose:** Signs and encrypts session cookies securely  
**Impact if missing:** Sessions can be forged, security vulnerability  
**Note:** Use the value from backend-python/.env or generate a new one with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. PATREON_CLIENT_ID
```
PATREON_CLIENT_ID=<your-patreon-client-id>
```
**Purpose:** Patreon OAuth application client ID  
**Impact if missing:** OAuth initiation will fail  
**Where to get:** Patreon Developer Portal > Your App > Client ID

### 4. PATREON_CLIENT_SECRET
```
PATREON_CLIENT_SECRET=<your-patreon-client-secret>
```
**Purpose:** Patreon OAuth application client secret  
**Impact if missing:** OAuth token exchange will fail  
**Where to get:** Patreon Developer Portal > Your App > Client Secret

### 5. PATREON_REDIRECT_URI
```
PATREON_REDIRECT_URI=https://api.ventures.isharehow.app/api/auth/patreon/callback
```
**Purpose:** OAuth callback URL after user authorizes  
**Impact if missing:** Patreon won't redirect back correctly  
**Note:** Must match exactly what's configured in Patreon app settings

### 6. FRONTEND_URL
```
FRONTEND_URL=https://ventures.isharehow.app
```
**Purpose:** Frontend URL for OAuth redirects after successful login  
**Impact if missing:** Users won't be redirected back to frontend after login

## Recommended Environment Variables

These improve security and functionality:

### 7. FLASK_ENV
```
FLASK_ENV=production
```
**Purpose:** Sets Flask to production mode  
**Impact if missing:** CORS will allow localhost origins, debug mode might be enabled

### 8. DATABASE_URL
```
DATABASE_URL=postgresql://user:password@host:port/database
```
**Purpose:** PostgreSQL database connection string  
**Impact if missing:** User profiles, goals, activities won't persist to database  
**Note:** Render provides this automatically if you add a PostgreSQL service

## How to Add Environment Variables on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service (api.ventures.isharehow.app)
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Enter **Key** and **Value** for each variable
6. Click **"Save Changes"**
7. Render will automatically redeploy (takes 2-5 minutes)

## Verification Steps

After deployment completes:

### 1. Check Render Logs
Look for these lines in the logs:
```
Session configuration:
  - COOKIE_DOMAIN: .ventures.isharehow.app
  - COOKIE_SECURE: True
  - COOKIE_SAMESITE: None
  - COOKIE_HTTPONLY: True
```

### 2. Test OAuth Flow
1. Clear browser cookies
2. Go to https://ventures.isharehow.app
3. Click login button (AppBar icon or Navigation "Sign In")
4. Should redirect to Patreon (NOT get 404)
5. Authorize on Patreon
6. Should redirect to https://ventures.isharehow.app/labs/?auth=success
7. Check browser console for: `[Auth] ✓ Authentication successful`

### 3. Check Session Persistence
1. After successful login, refresh the page
2. Should remain logged in (user menu shows profile)
3. Navigate to different pages
4. Should stay logged in across all pages

## Troubleshooting

### Login redirects to 404
- **Cause:** PATREON_CLIENT_ID or PATREON_REDIRECT_URI not set
- **Fix:** Add missing variables and redeploy

### Infinite spinner after OAuth
- **Cause:** SESSION_COOKIE_DOMAIN not set
- **Fix:** Set SESSION_COOKIE_DOMAIN=.ventures.isharehow.app and redeploy

### Session doesn't persist across pages
- **Cause:** FLASK_SECRET_KEY changed or not set
- **Fix:** Set consistent FLASK_SECRET_KEY (use same value always)

### All users see same account
- **Cause:** Using default/weak FLASK_SECRET_KEY
- **Fix:** Generate new secure key and set it

## Security Notes

- Never commit FLASK_SECRET_KEY or PATREON_CLIENT_SECRET to Git
- Keep FLASK_SECRET_KEY consistent (changing it invalidates all sessions)
- Use strong random values for FLASK_SECRET_KEY (32+ bytes)
- PATREON_REDIRECT_URI must be HTTPS in production

## Reference

- See notebook context for previous issues and fixes
- Backend session config: backend-python/app.py lines 27-49
- OAuth endpoints: backend-python/app.py lines 2195-2420
