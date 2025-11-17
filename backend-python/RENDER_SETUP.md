# Render Deployment Setup

This directory contains the Python Flask backend service for Render.

## Important: Render Configuration

**Make sure in Render Dashboard:**
1. Service Type: **Web Service**
2. Environment: **Python 3**
3. Root Directory: **backend-python** (CRITICAL - this tells Render to ignore the root package.json)
4. Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
5. Start Command: `python app.py`

## Why Root Directory Matters

The root directory contains Next.js files (`package.json`, `next.config.js`, etc.) which Render might auto-detect as a Node.js service. By setting the Root Directory to `backend-python`, Render will:
- Only look in this directory for Python files
- Ignore the root `package.json` and Next.js files
- Use the `requirements.txt` in this directory
- Run `app.py` from this directory

## Environment Variables Required

Set these in Render Dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Usually auto-set by Render (default: 5000)
- `SHOPIFY_STORE_URL` - Shopify API endpoint
- `SHOPIFY_ACCESS_TOKEN` - Shopify API token
- `FIGMA_ACCESS_TOKEN` - (Optional) Figma API token
- `FIGMA_TEAM_ID` - (Optional) Figma team ID
- `PATREON_CLIENT_ID` - Patreon OAuth client ID
- `PATREON_CLIENT_SECRET` - Patreon OAuth secret
- `PATREON_REDIRECT_URI` - Must be: `https://your-service.onrender.com/api/auth/patreon/callback`

## Troubleshooting

If Render tries to start Next.js instead of Python:
1. Check that Root Directory is set to `backend-python` in Render dashboard
2. Verify `render.yaml` exists in the repository root
3. Make sure the service is configured as Python, not Node.js
4. Delete any auto-detected Node.js services in Render

