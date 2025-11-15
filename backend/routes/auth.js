import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Patreon OAuth configuration
const PATREON_CLIENT_ID = process.env.PATREON_CLIENT_ID;
const PATREON_CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const PATREON_REDIRECT_URI = process.env.PATREON_REDIRECT_URI || 'http://localhost:3000/api/auth/patreon/callback';
const PATREON_AUTH_URL = 'https://www.patreon.com/oauth2/authorize';
const PATREON_TOKEN_URL = 'https://www.patreon.com/api/oauth2/token';
const PATREON_API_URL = 'https://www.patreon.com/api/oauth2/v2';

// Temporary store for OAuth states (in-memory, cleared after 10 minutes)
const oauthStates = new Map();
const STATE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Clean up expired states periodically
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.createdAt > STATE_TIMEOUT) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Get frontend URL for redirects
const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.split(',')[0].trim();
  }
  // Default to production frontend
  return process.env.NODE_ENV === 'production' 
    ? 'https://ventures.isharehow.app'
    : 'http://localhost:3000';
};

// Initiate Patreon OAuth
router.get('/patreon', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  
  // Store state in both session (for fallback) and in-memory store (primary)
  req.session.oauthState = state;
  oauthStates.set(state, {
    createdAt: Date.now(),
    sessionId: req.sessionID,
  });
  
  console.log('OAuth initiated:', {
    state,
    sessionId: req.sessionID,
    hasSession: !!req.session,
  });
  
  // Save session before redirecting to ensure cookie is set
  req.session.save((err) => {
    if (err) {
      console.error('Session save error before OAuth redirect:', err);
      oauthStates.delete(state); // Clean up
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/?auth=error&message=session_init_failed`);
    }
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: PATREON_CLIENT_ID,
      redirect_uri: PATREON_REDIRECT_URI,
      scope: 'identity identity[email] identity.memberships', // Added memberships scope
      state: state,
    });

    res.redirect(`${PATREON_AUTH_URL}?${params.toString()}`);
  });
});

// Patreon OAuth callback
router.get('/patreon/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // Debug logging
    console.log('OAuth callback received:', {
      hasCode: !!code,
      hasState: !!state,
      sessionState: req.session.oauthState,
      sessionId: req.sessionID,
      storedState: oauthStates.has(state),
    });

    // Verify state - check both in-memory store and session (fallback)
    const storedState = oauthStates.get(state);
    const sessionState = req.session.oauthState;
    
    if (!state || (!storedState && state !== sessionState)) {
      console.error('State mismatch:', {
        received: state,
        inMemoryStore: !!storedState,
        sessionState: sessionState,
        hasSession: !!req.session,
      });
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/?auth=error&message=invalid_state`);
    }

    // Clean up the state from memory store
    if (storedState) {
      oauthStates.delete(state);
    }

    // Exchange code for access token
    const tokenResponse = await fetch(PATREON_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: PATREON_CLIENT_ID,
        client_secret: PATREON_CLIENT_SECRET,
        redirect_uri: PATREON_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/?auth=error&message=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get user info and memberships from Patreon API
    const userResponse = await fetch(`${PATREON_API_URL}/identity?include=memberships&fields[member]=patron_status,currently_entitled_amount_cents`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const frontendUrl = getFrontendUrl();
      return res.redirect(`${frontendUrl}/?auth=error&message=user_fetch_failed`);
    }

    const userData = await userResponse.json();
    const patreonUser = userData.data;

    // Check membership status
    let isPaidMember = false;
    let membershipTier = null;
    let membershipAmount = 0;

    if (userData.included) {
      // Find active memberships
      const memberships = userData.included.filter(item => item.type === 'member');
      const activeMembership = memberships.find(member => 
        member.attributes?.patron_status === 'active_patron'
      );

      if (activeMembership) {
        isPaidMember = true;
        membershipTier = activeMembership.attributes?.patron_status;
        membershipAmount = activeMembership.attributes?.currently_entitled_amount_cents || 0;
      }
    }

    // Regenerate session to prevent session fixation attacks
    // This creates a new session ID after authentication
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        const frontendUrl = getFrontendUrl();
        return res.redirect(`${frontendUrl}/?auth=error&message=session_failed`);
      }

      // Store user in the new session
      req.session.user = {
        id: patreonUser.id,
        patreonId: patreonUser.id,
        name: patreonUser.attributes?.full_name || patreonUser.attributes?.vanity || 'Patreon User',
        email: patreonUser.attributes?.email,
        avatar: patreonUser.attributes?.image_url,
        isPaidMember: isPaidMember,
        membershipTier: membershipTier,
        membershipAmount: membershipAmount,
      };
      
      // Store tokens separately (not in session for security)
      req.session.accessToken = access_token;
      req.session.refreshToken = refresh_token;

      // Save session and ensure cookie is set
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          const frontendUrl = getFrontendUrl();
          return res.redirect(`${frontendUrl}/?auth=error&message=session_failed`);
        }
        
        // Log successful session creation
        console.log('Session saved successfully:', {
          sessionID: req.sessionID,
          userId: req.session.user.id,
          userName: req.session.user.name,
          isPaidMember: req.session.user.isPaidMember,
          hasUser: !!req.session.user,
          sessionKeys: Object.keys(req.session),
        });

        // Check if user is a paid member
        if (!isPaidMember) {
          const frontendUrl = getFrontendUrl();
          return res.redirect(`${frontendUrl}/?auth=error&message=not_paid_member`);
        }
        
        // Set cookie explicitly to ensure it's sent (matching session config)
        res.cookie('ventures.sid', req.sessionID, {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          domain: process.env.NODE_ENV === 'production' ? '.isharehow.app' : undefined,
          path: '/',
        });
        
        const frontendUrl = getFrontendUrl();
        res.redirect(`${frontendUrl}/live?auth=success`);
      });
    });
  } catch (error) {
    console.error('Patreon OAuth error:', error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/?auth=error&message=server_error`);
  }
});

// Get current user
router.get('/me', (req, res) => {
  // Debug logging
  const sessionCookie = req.cookies?.['ventures.sid'] || req.headers.cookie?.match(/ventures\.sid=([^;]+)/)?.[1];
  console.log('Auth check - /me endpoint:', {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    cookieSessionID: sessionCookie,
    sessionIDsMatch: req.sessionID === sessionCookie,
    hasUser: !!req.session?.user,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    cookieHeader: req.headers.cookie,
    allCookies: req.cookies,
  });

  // Validate session ID matches cookie
  if (sessionCookie && req.sessionID !== sessionCookie) {
    console.warn('Session ID mismatch:', {
      sessionID: req.sessionID,
      cookieSessionID: sessionCookie,
    });
  }

  // Check if session exists and has user
  if (req.session && req.session.user) {
    // Touch session to update expiration
    req.session.touch();
    res.json(req.session.user);
  } else {
    // More detailed error response
    console.warn('Unauthorized access attempt:', {
      sessionID: req.sessionID,
      cookieSessionID: sessionCookie,
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      cookiePresent: !!req.headers.cookie,
    });
    res.status(401).json({ 
      error: 'Not authenticated',
      message: 'No valid session found. Please log in again.',
      hasSession: !!req.session,
      sessionID: req.sessionID,
      cookieSessionID: sessionCookie,
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;

