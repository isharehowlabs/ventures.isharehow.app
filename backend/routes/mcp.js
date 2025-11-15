import express from 'express';
import mcpServer from '../mcp/mcpServer.js';

const router = express.Router();

// Helper to get io instance
const getIO = (req) => {
  return req.app.get('io');
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Link Figma component to code file
router.post('/figma-to-code', requireAuth, (req, res) => {
  try {
    const { figmaComponentId, codeFilePath, codeComponentName, figmaFileId } = req.body;

    if (!figmaComponentId || !codeFilePath || !codeComponentName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = mcpServer.linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, figmaFileId);

    // Emit socket event for live updates
    const io = getIO(req);
    if (io) {
      io.to('design-tokens').emit('component:linked', {
        componentId: figmaComponentId,
        componentName: codeComponentName,
        filePath: codeFilePath,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error linking component to code:', error);
    res.status(500).json({ error: 'Failed to link component', message: error.message });
  }
});

// Get code links
router.get('/code-links', requireAuth, (req, res) => {
  try {
    const { figmaFileId } = req.query;
    const links = figmaFileId
      ? mcpServer.getCodeLinks(figmaFileId)
      : Array.from(mcpServer.codeLinks.entries()).map(([id, link]) => ({ componentId: id, ...link }));

    res.json({ links });
  } catch (error) {
    console.error('Error fetching code links:', error);
    res.status(500).json({ error: 'Failed to fetch code links', message: error.message });
  }
});

// Sync design tokens
router.post('/sync-tokens', requireAuth, (req, res) => {
  try {
    const { tokens } = req.body;

    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ error: 'Tokens must be an array' });
    }

    const result = mcpServer.syncDesignTokens(tokens);

    // Emit socket events for each token update
    const io = getIO(req);
    if (io) {
      tokens.forEach((token) => {
        io.to('design-tokens').emit('design-token:updated', {
          name: token.name,
          value: token.value,
          type: token.type,
        });
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error syncing tokens:', error);
    res.status(500).json({ error: 'Failed to sync tokens', message: error.message });
  }
});

// Get design tokens
router.get('/tokens', requireAuth, (req, res) => {
  try {
    const tokens = mcpServer.getDesignTokens();
    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens', message: error.message });
  }
});

// Generate code snippet
router.post('/generate-code', requireAuth, (req, res) => {
  try {
    const { componentId, language } = req.body;

    if (!componentId) {
      return res.status(400).json({ error: 'Component ID required' });
    }

    const snippet = mcpServer.generateCodeSnippet(componentId, language);
    if (!snippet) {
      return res.status(404).json({ error: 'Component not linked to code' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate code', message: error.message });
  }
});

export default router;

