# Copilot Instructions for ventures.isharehow.app

## Project Architecture
- **Monorepo structure**: Contains backend (Python/Flask), frontend (Next.js/React), and static assets.
- **Backend**: Located in `backend-python/`, main entry is `app.py`. Uses Flask, integrates with Patreon OAuth for authentication, and manages user profiles.
- **Frontend**: Found in `src/` and top-level HTML files. Integrates with backend via REST API endpoints (e.g., `/api/profile`).
- **Deployment**: Managed via `render.yaml` for Render.com. Key environment variables are set in Render dashboard (see `QUICK_FIX_CHECKLIST.md`).

## Developer Workflows
- **Build/Deploy**: Backend is deployed with `pip install -r requirements.txt` and started via `python app.py` (see `render.yaml`).
- **Restart backend**: Use `restart.sh` in `backend-python/`.
- **Database migrations**: Run `migrate_db.py` or use `db_manage.sh` for manual operations.
- **Testing API**: Use `test_wellness_api.sh` for health checks.

## Authentication & Session
- **Patreon OAuth**: All profile endpoints require authentication via Patreon. Session cookies must be scoped correctly (`SESSION_COOKIE_DOMAIN`), see `QUICK_FIX_CHECKLIST.md`.
- **Critical env vars**: `SESSION_COOKIE_DOMAIN`, `FLASK_SECRET_KEY`, `FRONTEND_URL` (see checklist for values).

## API Patterns
- **Profile API**: 
  - `GET /api/profile`: Returns user profile (see `PROFILE_API.md`).
  - `PUT /api/profile`: Updates user profile, validates email/name, syncs session and DB.
  - Graceful fallback if DB unavailable.
- **Patreon callback**: On `/api/auth/patreon/callback`, syncs user data to DB, handles errors gracefully (see `IMPLEMENTATION_SUMMARY.md`).

## Frontend Integration
- **React/Next.js**: Use hooks (see `FRONTEND_INTEGRATION_EXAMPLE.md`) to fetch/update profile via API. Always use `credentials: include` for session cookies.
- **Profile button**: Should be available on all pages for user access.

## Conventions & Patterns
- **Error handling**: Always return JSON error responses with status codes (401, 400, etc.).
- **Graceful degradation**: If DB fails, fallback to session data and continue.
- **Environment setup**: Use `.env.example` as template for local development.

## Key Files & References
- `backend-python/app.py`: Main backend logic and API routes
- `backend-python/PROFILE_API.md`: API contract and examples
- `backend-python/IMPLEMENTATION_SUMMARY.md`: Backend implementation details
- `backend-python/QUICK_FIX_CHECKLIST.md`: Critical deployment/env setup
- `backend-python/FRONTEND_INTEGRATION_EXAMPLE.md`: Frontend usage patterns
- `render.yaml`: Deployment configuration

---
**Review and update this file as project conventions evolve.**
