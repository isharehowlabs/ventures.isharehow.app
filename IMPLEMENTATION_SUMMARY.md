# AI Agent Development Plan: Updating App Bar, Navigation, and Menu Layout

## Overview
This Markdown file provides a detailed plan for the AI agent to update the app bar, navigation, and menu layouts in the AI Dashboard system (including AI Mentor Journal, Analytics, Ministry, Health and Wellness features) to exactly match the MUI dashboard template at https://mui.com/material-ui/getting-started/templates/dashboard/. The goal is to create a modern, responsive interface that supports co-work collaboration, community building, and agency goals for client support. The layout emphasizes a clean, widget-based design with a persistent sidebar for navigation, a top app bar for actions, and a flexible main content area.

This update aligns with the system's mission by improving usability for mentors and mentees, facilitating seamless access to features like Rise Dashboard (mental/physical/spiritual growth) and Co-Work Dashboard (professional ventures). The agent should focus on modular React components using Material-UI (MUI) v5+, ensuring responsiveness, dark mode support, and integration with existing files like AppShell.tsx, RiseDashboard.tsx, and authentication via useAuth.

**Key Directives for AI Agent:**
- Analyze the current AppShell.tsx (or equivalent wrapper) and update it to mirror the MUI template's structure.
- Use exact MUI components and styles from the template for fidelity.
- Maintain existing features (e.g., aura tracking, activity logging) while enhancing navigation.
- Test for mobile responsiveness (drawer toggles on small screens).
- Handle theming consistently (e.g., primary color from existing gradients like #4ecdc4).
- Commit changes with messages like "Update AppShell to match MUI dashboard template layout".

## Requirements
### Functional Requirements
1. **App Bar (Top Navigation)**:
   - Fixed position at the top.
   - Includes: Menu icon (hamburger) to toggle sidebar on mobile, dashboard title/search bar, icons for notifications, settings, and user avatar/menu.
   - User menu: Dropdown with profile, settings, logout (integrate with useAuth for sign-out).
   - Search: Optional global search field that filters dashboard content (e.g., tasks, journals).

2. **Sidebar Navigation (Drawer)**:
   - Persistent on desktop (left side, width ~240px), temporary on mobile (slides in from left).
   - Navigation items: List with icons and text for key sections (e.g., Dashboard, Rise (Wellness), Co-Work, Analytics, Ministry, Health, Journal, Settings).
   - Active item highlighting based on route (use React Router if present, or state).
   - Collapsible sections for sub-menus (e.g., under Rise: Mental, Physical, Spiritual).

3. **Main Content Area**:
   - Shifts right when drawer is open on desktop.
   - Full-width on mobile when drawer is closed.
   - Container for dashboard-specific content (e.g., RiseDashboard.tsx renders inside).

4. **Menu Fixes and Enhancements**:
   - Fix any current overlaps, responsiveness issues, or auth-related bugs in menus.
   - Add tooltips to icons.
   - Integrate with principles: Add quick links to "Community Build" (Co-Work) and "Client Help" (Agency tools).

### Non-Functional Requirements
- **Responsiveness**: Use MUI's useMediaQuery for breakpoints (e.g., drawer variant="permanent" on md+).
- **Theming**: Custom theme with rounded corners, gradients (e.g., from #ff6b6b to #45b7d1), and accessible colors.
- **Performance**: Lazy load sub-components; use memoization for lists.
- **Accessibility**: ARIA labels for icons/menus; keyboard navigation.
- **Integration**: Ensure sync with Render backend (as per previous plans); no Firebase remnants.

## Technical Specifications
### Tech Stack
- **Frontend**: React, TypeScript, Material-UI (MUI v5+).
- **Dependencies**: Ensure @mui/material, @mui/icons-material, @emotion/react, @emotion/styled are installed. Add if needed: react-router-dom for routing.
- **Files to Update**: AppShell.tsx (main wrapper), add Navigation.tsx for sidebar content.
- **Backend**: No changes; use existing api.ts for data if menus fetch dynamic items.

### Component Architecture
- **AppShell.tsx** (Updated Wrapper):
  - Wrap the app with ThemeProvider and CssBaseline.
  - Structure:
    ```tsx
    import { useState } from 'react';
    import { ThemeProvider, createTheme } from '@mui/material/styles';
    import { CssBaseline, Box, Toolbar, AppBar, Drawer, IconButton, Typography } from '@mui/material';
    import MenuIcon from '@mui/icons-material/Menu';
    import Navigation from './Navigation'; // New component for sidebar

    const drawerWidth = 240;
    const theme = createTheme({
      palette: { primary: { main: '#4ecdc4' } },
      components: { MuiDrawer: { styleOverrides: { paper: { width: drawerWidth } } } },
    });

    function AppShell({ children, active }) {
      const [mobileOpen, setMobileOpen] = useState(false);
      const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  AI Dashboard
                </Typography>
                {/* Add search, notifications, user menu here */}
              </Toolbar>
            </AppBar>
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
              >
                <Navigation active={active} />
              </Drawer>
              <Drawer
                variant="permanent"
                sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
                open
              >
                <Navigation active={active} />
              </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
              <Toolbar />
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      );
    }
    ```
- **Navigation.tsx** (New for Sidebar):
  - Use List, ListItemButton, ListItemIcon, ListItemText.
  - Icons from @mui/icons-material (e.g., DashboardIcon, FitnessCenterIcon for Rise).
  - Snippet:
    ```tsx
    import { List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
    import DashboardIcon from '@mui/icons-material/Dashboard';

    function Navigation({ active }) {
      return (
        <div>
          <Toolbar /> {/* Spacer */}
          <Divider />
          <List>
            {['Dashboard', 'Rise', 'Co-Work', 'Analytics', 'Ministry', 'Health', 'Journal'].map((text) => (
              <ListItemButton key={text} selected={active === text.toLowerCase()}>
                <ListItemIcon><DashboardIcon /></ListItemIcon> {/* Customize icons */}
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </div>
      );
    }
    ```

## Integration with Principles and Gen Z Fixes
| Principle/Gen Z Issue | Integration |
|-----------------------|-------------|
| Family / Spiritual | Sidebar links to Rise sections for easy access to journaling and growth tools. |
| Gaming / Battle Games | Navigation highlights progress areas like auras/stats. |
| Together Events | Quick link to Co-Work for collaboration. |
| Gen Z Flexibility/Balance | Responsive design supports mobile use for work-life balance. |
| Mentorship Guidance | Menu items for Journal and Accountability features. |

## Required Code Fixes
- Fix any current menu overlaps by adding zIndex to AppBar.
- Resolve auth errors in navigation (e.g., hide items if not logged in).
- Update backend (Render-hosted) if menus fetch user-specific items.

## Development Roadmap
1. **Analyze Current Code**: Review AppShell.tsx for existing layout; backup files.
2. **Setup Theme**: Implement custom theme matching gradients.
3. **Build Components**: Create/update AppBar, Drawer, Navigation.
4. **Integrate**: Wrap Rise/Co-Work in updated AppShell; pass 'active' prop.
5. **Test**: Check responsiveness, navigation routing, dark mode.
6. **Deploy**: Push to Render; verify in production.

---

# User Profile Management Implementation Summary

## Overview
Successfully implemented user profile management functionality in app.py, allowing users to view and update their email and name with automatic database synchronization.

## Changes Made

### 1. Patreon OAuth Callback Enhancement (Line ~2192)
**File:** `app.py`
**Location:** `/api/auth/patreon/callback` route

Added automatic database synchronization after successful Patreon authentication:
- Creates new UserProfile record if user doesn't exist
- Updates existing profile with latest Patreon data
- Syncs email, name, avatar, membership tier, and paid member status
- Includes error handling with rollback on failure
- Continues even if database sync fails (graceful degradation)

### 2. GET /api/profile Endpoint (Line ~1110)
**File:** `app.py`

New endpoint to retrieve user profile:
- Returns user profile from database if available
- Falls back to session data if database unavailable
- Requires authentication (401 if not logged in)
- Returns JSON with: id, email, name, avatarUrl, patreonId, membershipTier, isPaidMember

### 3. PUT /api/profile Endpoint (Line ~1143)
**File:** `app.py`

New endpoint to update user profile:
- Accepts optional email and/or name in request body
- Validates email format (must contain @)
- Validates name (cannot be empty)
- Updates UserProfile database record
- Syncs changes to session data
- Updates `updated_at` timestamp
- Returns updated profile
- Graceful fallback if database unavailable

## File Changes Summary

```
Modified: app.py
  - Added 162 lines
  - 3 new functions: database sync in Patreon callback, get_profile(), update_profile()
  - No breaking changes

Created: PROFILE_API.md
  - Complete API documentation
  - Request/response examples
  - Error codes and validation rules

Created: FRONTEND_INTEGRATION_EXAMPLE.md
  - React/Next.js integration examples
  - Vanilla JavaScript examples
  - CSS styling examples
  - Best practices and notes

Created: app.py.backup.20251121_055449
  - Backup of original app.py before changes
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | /api/profile | Get user profile | Yes |
| PUT | /api/profile | Update email/name | Yes |

## Database Schema

The implementation uses the existing `user_profiles` table:
- id (VARCHAR, primary key)
- email (VARCHAR, unique)
- name (VARCHAR)
- avatar_url (TEXT)
- patreon_id (VARCHAR)
- membership_tier (VARCHAR)
- is_paid_member (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## Testing

### Syntax Validation
✅ Python syntax validated successfully
✅ App imports without errors

### Manual Testing Required
Before deploying to production, test:
1. GET /api/profile with authenticated user
2. PUT /api/profile to update email
3. PUT /api/profile to update name
4. PUT /api/profile with invalid email (should return 400)
5. PUT /api/profile with empty name (should return 400)
6. Profile endpoints without authentication (should return 401)
7. Patreon login flow to verify database sync

## Deployment Steps

1. **Backup Verification**
   ```bash
   ls -l app.py.backup.20251121_055449
   ```

2. **Restart Flask App**
   ```bash
   # Find the process
   ps aux | grep "python.*app.py"
   
   # Kill the old process
   kill <PID>
   
   # Start new process (or use your restart script)
   python3 app.py
   # OR
   ./restart.sh
   ```

3. **Test Endpoints**
   ```bash
   # Test that app is running
   curl http://localhost:5000/api/auth/me
   
   # Test profile endpoint (requires auth)
   curl http://localhost:5000/api/profile -H "Cookie: session=..."
   ```

4. **Monitor Logs**
   ```bash
   tail -f backend.log
   ```

## Frontend Integration

To use these endpoints in your frontend:

1. **Add profile button to all pages** - See `FRONTEND_INTEGRATION_EXAMPLE.md`
2. **Fetch user profile on page load** - Use GET /api/profile
3. **Show profile modal/dropdown** - Display email, name, and allow editing
4. **Update profile** - Send PUT request with changes
5. **Always include credentials** - Use `credentials: 'include'` in fetch requests

## Error Handling

The implementation includes comprehensive error handling:
- Authentication errors (401)
- Validation errors (400)
- Database errors (503)
- Graceful degradation when database unavailable
- Transaction rollback on database failures

## Security Considerations

✅ Authentication required for all profile operations
✅ Session-based authentication via Patreon OAuth
✅ Input validation (email format, name not empty)
✅ Database transactions with rollback
✅ Session synchronization after updates
✅ Secure cookie settings (HTTPONLY, SECURE, SAMESITE)

## Rollback Plan

If issues occur:
```bash
# Restore backup
cp app.py.backup.20251121_055449 app.py

# Restart app
kill <PID>
python3 app.py
```

## Next Steps

1. ✅ Code implementation complete
2. ⏳ Restart Flask application
3. ⏳ Test endpoints manually
4. ⏳ Integrate with frontend
5. ⏳ Deploy to production

## Support Documentation

- **API Documentation:** `PROFILE_API.md`
- **Frontend Guide:** `FRONTEND_INTEGRATION_EXAMPLE.md`
- **This Summary:** `IMPLEMENTATION_SUMMARY.md`
