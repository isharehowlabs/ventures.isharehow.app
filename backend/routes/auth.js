import express from 'express';

const router = express.Router();

// Patreon OAuth configuration
const PATREON_CLIENT_ID = process.env.PATREON_CLIENT_ID;
const PATREON_CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const PATREON_REDIRECT_URI = process.env.PATREON_REDIRECT_URI || 'http://localhost:3000/api/auth/patreon/callback';
const PATREON_AUTH_URL = 'https://www.patreon.com/oauth2/authorize';
const PATREON_TOKEN_URL = 'https://www.patreon.com/api/oauth2/token';
const PATREON_API_URL = 'https://www.patreon.com/api/oauth2/v2';

// Initiate Patreon OAuth
router.get('/patreon', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  req.session.oauthState = state;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: PATREON_CLIENT_ID,
    redirect_uri: PATREON_REDIRECT_URI,
    scope: 'identity identity[email]',
    state: state,
  });

  res.redirect(`${PATREON_AUTH_URL}?${params.toString()}`);
});

// Patreon OAuth callback
router.get('/patreon/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // Verify state
    if (state !== req.session.oauthState) {
      return res.redirect('/?auth=error&message=invalid_state');
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
      return res.redirect('/?auth=error&message=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get user info from Patreon API
    const userResponse = await fetch(`${PATREON_API_URL}/identity`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.redirect('/?auth=error&message=user_fetch_failed');
    }

    const userData = await userResponse.json();
    const patreonUser = userData.data;

    // Store user in session directly (not using Passport's req.login)
    req.session.user = {
      id: patreonUser.id,
      patreonId: patreonUser.id,
      name: patreonUser.attributes?.full_name || patreonUser.attributes?.vanity || 'Patreon User',
      email: patreonUser.attributes?.email,
      avatar: patreonUser.attributes?.image_url,
    };
    
    // Store tokens separately (not in session for security)
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/?auth=error&message=session_failed');
      }
      res.redirect('/live?auth=success');
    });
  } catch (error) {
    console.error('Patreon OAuth error:', error);
    res.redirect('/?auth=error&message=server_error');
  }
});

// Get current user
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
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

