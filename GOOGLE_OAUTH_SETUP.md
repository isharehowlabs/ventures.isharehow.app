# Google OAuth Setup Guide

## Error: "Google OAuth not configured"

This error occurs when the required Google OAuth environment variables are not set.

## Required Environment Variables

You need to set the following environment variables:

1. **GOOGLE_CLIENT_ID** - Your Google OAuth Client ID
2. **GOOGLE_CLIENT_SECRET** - Your Google OAuth Client Secret
3. **GOOGLE_REDIRECT_URI** - (Optional) Defaults to `https://api.ventures.isharehow.app/api/auth/google/callback`

## How to Get Google OAuth Credentials

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity API**)

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `openid`, `email`, `profile`
   - Add test users if needed
4. For Application type, select **Web application**
5. Configure:
   - **Name**: Your app name (e.g., "Ventures iShareHow")
   - **Authorized redirect URIs**: 
     - `https://api.ventures.isharehow.app/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (for local development)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Set Environment Variables

#### For Local Development (.env file)

Add to your `.env` file in the `backend-python` directory:

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

#### For Production (Render.com)

1. Go to your Render.com dashboard
2. Select your service
3. Go to **Environment** tab
4. Add the following environment variables:
   - `GOOGLE_CLIENT_ID` = `your_client_id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET` = `your_client_secret`
   - `GOOGLE_REDIRECT_URI` = `https://api.ventures.isharehow.app/api/auth/google/callback`

#### For Production (Other platforms)

Set the environment variables in your deployment platform's environment configuration.

## Verify Configuration

After setting the environment variables:

1. Restart your application
2. Check the startup logs - you should see: `✓ Google OAuth libraries loaded successfully`
3. Try accessing `/api/auth/google/login` - it should redirect to Google's consent screen

## Troubleshooting

### Error: "Google OAuth not configured"
- **Cause**: `GOOGLE_CLIENT_ID` is not set or is empty
- **Fix**: Set the `GOOGLE_CLIENT_ID` environment variable

### Error: "redirect_uri_mismatch"
- **Cause**: The redirect URI in your Google OAuth credentials doesn't match the one in your environment
- **Fix**: Ensure the redirect URI in Google Cloud Console matches `GOOGLE_REDIRECT_URI` exactly

### Error: "invalid_client"
- **Cause**: `GOOGLE_CLIENT_SECRET` is incorrect
- **Fix**: Verify the client secret in Google Cloud Console matches your environment variable

## Security Notes

- Never commit `GOOGLE_CLIENT_SECRET` to version control
- Use environment variables or secrets management
- Rotate secrets if they're exposed
- Keep your OAuth consent screen up to date

## Testing

Once configured, you can test the OAuth flow:

1. Navigate to: `https://api.ventures.isharehow.app/api/auth/google/login`
2. You should be redirected to Google's consent screen
3. After authorizing, you'll be redirected back with a token

