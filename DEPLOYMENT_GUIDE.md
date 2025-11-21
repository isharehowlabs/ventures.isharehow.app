# Wellness Dashboard Deployment Guide

## Phase 1 & 2 Complete ✅

### What's Been Built

**Backend (Flask API):**
- 5 new database models (UserProfile, AuraProgress, WellnessActivity, WellnessGoal, WellnessAchievement)
- 13 new API endpoints under `/api/wellness/*`
- Auto-profile creation from Patreon session
- 7 aura types: Physical, Mental, Spiritual, Nutrition, Sleep, Stress, Energy

**Frontend (Next.js):**
- New AuraBar component with video game styling
- Updated /rise page with 7 aura bars
- API integration with useAuth hook
- Debounced auto-save (1s delay)
- localStorage fallback for unauthenticated users

## Deployment Steps

### 1. Deploy Backend to Render

The backend code is ready in `backend-python/app.py`. Render should auto-deploy on git push, but you may need to:

1. **Commit changes:**
   ```bash
   cd /home/ishaglcy/public_html/ventures.isharehow.app
   git add backend-python/app.py
   git commit -m "Add wellness dashboard backend: 5 models, 13 API endpoints"
   git push origin main
   ```

2. **Verify Render deployment:**
   - Go to https://dashboard.render.com
   - Check your ventures-backend service
   - Wait for deployment to complete (~2-5 minutes)
   - Check logs for: "Database tables created successfully"

3. **Verify database tables created:**
   - The new tables should auto-create via SQLAlchemy's `db.create_all()`
   - Tables: `user_profiles`, `aura_progress`, `wellness_activities`, `wellness_goals`, `wellness_achievements`

### 2. Deploy Frontend

1. **Commit frontend changes:**
   ```bash
   git add src/pages/rise.tsx src/components/wellness/
   git commit -m "Transform RISE page with 7 aura bars and API integration"
   git push origin main
   ```

2. **Build and deploy static export:**
   ```bash
   npm run build
   ```
   This copies the build to the current directory for static hosting.

### 3. Test the Flow

**Unauthenticated Test:**
1. Visit https://ventures.isharehow.app/rise
2. You should see 7 aura bars with default values (50)
3. Values should persist in localStorage

**Authenticated Test:**
1. Login via Patreon at https://ventures.isharehow.app
2. Navigate to /rise
3. Check browser console for:
   - `✓ Loaded auras from API`
   - `✓ Synced auras to API`
4. Verify in Render logs:
   - `✓ Created new user profile: <user_id>`
   - API calls to `/api/wellness/aura`

**Test API Endpoints:**
```bash
# Test available achievements (no auth required)
curl https://api.ventures.isharehow.app/api/wellness/achievements/available | jq

# Test authenticated endpoints (need session cookie)
# 1. Login via browser
# 2. Get session cookie from dev tools
# 3. Test:
curl -H "Cookie: session=<your-cookie>" \
  https://api.ventures.isharehow.app/api/wellness/aura | jq
```

## Troubleshooting

### Backend Issues

**"Database not available" error:**
- Check DATABASE_URL is set in Render environment variables
- Check Render logs for connection errors

**"Not authenticated" error:**
- Verify Patreon OAuth is working
- Check session cookie domain: `.ventures.isharehow.app`
- Check CORS settings in app.py

**Tables not created:**
- Check Render logs for "Database tables created successfully"
- If missing, check PostgreSQL connection
- May need to manually trigger `db.create_all()` via admin endpoint

### Frontend Issues

**Auras not loading:**
- Check browser console for fetch errors
- Verify backend URL in api.ts: `https://api.ventures.isharehow.app`
- Check CORS headers in network tab

**Auras not saving:**
- Check "Synced auras to API" in console
- Verify debounce is working (1s delay)
- Check network tab for PUT requests

## Next Steps: Phase 3

**Activity Tracking:**
- Create ActivityLogger component
- Add "Log Activity" button to dashboard
- Wire up activity → aura updates
- Implement activity feed

**Content Integration:**
- Merge wellness.tsx quiz into /rise
- Merge rise_cycling.tsx content
- Merge spiritual_festivals.tsx quiz
- Add Journey Through Conscious section

## File Manifest

**Modified Files:**
- `backend-python/app.py` - Added 5 models, 13 endpoints
- `src/pages/rise.tsx` - Updated with 7 auras, API integration
- `src/components/wellness/AuraBar.tsx` - New component
- `src/components/wellness/api.ts` - New utilities

**Backup Files Created:**
- `backend-python/app.py.backup.cce21628`
- `src/pages/rise.tsx.backup.<timestamp>`

## Success Criteria

✅ Backend deploys without errors
✅ Database tables auto-create
✅ /rise page loads with 7 aura bars
✅ Auras persist for unauthenticated users (localStorage)
✅ Auras sync to database for authenticated users
✅ No console errors on /rise page
✅ Visual: Aura bars show gradients, animations, glow effects
