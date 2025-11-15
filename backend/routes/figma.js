import express from 'express';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API_URL = 'https://api.figma.com/v1';

// List Figma files
router.get('/files', requireAuth, async (req, res) => {
  try {
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const teamId = process.env.FIGMA_TEAM_ID;
    if (!teamId) {
      return res.status(500).json({ error: 'Figma team ID not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/teams/${teamId}/projects`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ projects: data.projects || [] });
  } catch (error) {
    console.error('Error fetching Figma files:', error);
    res.status(500).json({ error: 'Failed to fetch Figma files', message: error.message });
  }
});

// Get file details
router.get('/file/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ file: data });
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    res.status(500).json({ error: 'Failed to fetch Figma file', message: error.message });
  }
});

// Get design components
router.get('/file/:id/components', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    const components = Object.values(data.components || {});
    res.json({ components });
  } catch (error) {
    console.error('Error fetching Figma components:', error);
    res.status(500).json({ error: 'Failed to fetch Figma components', message: error.message });
  }
});

// Get design tokens
router.get('/file/:id/tokens', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract design tokens from styles
    const styles = data.styles || {};
    const tokens = Object.values(styles).map((style: any) => ({
      id: style.key,
      name: style.name,
      description: style.description,
      styleType: style.styleType,
    }));

    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching Figma tokens:', error);
    res.status(500).json({ error: 'Failed to fetch Figma tokens', message: error.message });
  }
});

export default router;

