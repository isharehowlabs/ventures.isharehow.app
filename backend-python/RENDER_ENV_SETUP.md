# Render.com Environment Variables Setup

## CRITICAL: Session Configuration Issue

The "Verifying authentication..." infinite spinner is caused by missing environment variables on Render.com. The backend cannot create session cookies that work across subdomains without these variables.

## Required Environment Variables

Go to your Render.com dashboard → Select your backend service → Environment tab → Add the following:

### 1. Session & Security (CRITICAL)

```
FLASK_SECRET_KEY=32e6ab70212f7e807449da70bf651de3f862b0191ab921de0f3b11cb933803d1
```
**Purpose:** Used to sign session cookies. Without this, Flask uses a default insecure key.
**Impact:** Session cookies will not be properly signed and validated.

```
SESSION_COOKIE_DOMAIN=.ventures.isharehow.app
```
**Purpose:** Allows session cookies to be shared between api.ventures.isharehow.app and ventures.isharehow.app
**Impact:** Without this, cookies are scoped to api.ventures.isharehow.app only and the frontend cannot read them.
**Critical:** This is the PRIMARY cause of the authentication spinner issue.

```
FLASK_ENV=production
```
**Purpose:** Sets Flask to production mode
**Impact:** Affects CORS configuration and debug settings

```
FRONTEND_URL=https://ventures.isharehow.app
```
**Purpose:** Used for OAuth redirects back to frontend
**Impact:** After successful Patreon auth, users need to be redirected here

### 2. Patreon OAuth (Already Set)

These should already be configured on Render (verified by curl test):

```
PATREON_CLIENT_ID=<your_client_id>
PATREON_CLIENT_SECRET=<your_client_secret>
PATREON_REDIRECT_URI=https://api.ventures.isharehow.app/api/auth/patreon/callback
```

### 3. Optional (Add if needed)

```
DATABASE_URL=<your_postgresql_url>
GOOGLE_AI_API_KEY=<your_api_key>
FIGMA_ACCESS_TOKEN=<your_figma_token>
```

## How to Add Environment Variables on Render

1. Log in to https://dashboard.render.com
2. Select your backend service (likely named something like "ventures-backend" or "api")
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. For each variable above:
   - Enter the **Key** (e.g., SESSION_COOKIE_DOMAIN)
   - Enter the **Value** (e.g., .ventures.isharehow.app)
   - Click "Save Changes"
6. After adding all variables, Render will automatically redeploy your service

## Verification Steps

After adding the environment variables and redeploying:

1. Check Render logs for startup messages showing correct configuration:
   ```
   Session Configuration:
     - COOKIE_DOMAIN: .ventures.isharehow.app
     - COOKIE_SECURE: True
     - COOKIE_SAMESITE: None
     - COOKIE_HTTPONLY: True
   ```

2. Test the login flow:
   - Go to https://ventures.isharehow.app/labs
   - Click "Sign in with Patreon"
   - Complete OAuth on Patreon
   - You should be redirected back and authenticated

3. Check browser console for logs:
   - Should see `[Auth] ✓ Authentication successful` after redirect
   - Should NOT see repeated 401 errors

4. Check Render logs for authentication:
   - Should see "STORING USER IN SESSION" with session config
   - Should see "✓ Session stored successfully"
   - When frontend checks auth, should see "✓ Session retrieved for user"

## Troubleshooting

### Still seeing spinner after adding variables?

1. **Verify variables are set:** Check Render dashboard Environment tab
2. **Ensure redeploy happened:** Render should auto-redeploy after env changes
3. **Clear browser cookies:** Old invalid cookies might interfere
4. **Check Render logs:** Look for the debug output we added
5. **Check browser console:** Look for detailed [Auth] logs

### Session cookie not being set?

- Verify FLASK_SECRET_KEY is set (not using default)
- Verify SESSION_COOKIE_DOMAIN starts with a dot: `.ventures.isharehow.app`
- Check that CORS is working (should see correct Origin header in logs)

### Backend not starting after adding variables?

- Check Render logs for any Python errors
- Verify there are no typos in variable names
- Ensure FLASK_SECRET_KEY doesn't contain special characters that need escaping

## Security Note

The FLASK_SECRET_KEY shown above is from your local .env file. You can either:
- Use the same key (easier, makes sessions compatible)
- Generate a new one for Render (more secure, but local and Render sessions won't be compatible)

To generate a new secret key:
```python
import secrets
print(secrets.token_hex(32))
```

Using the existing key is fine since this is already in your codebase and just for session signing (not storing sensitive data).
