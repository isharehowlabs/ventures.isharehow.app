import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Simple JSON file storage for per-user resources
const DATA_FILE = path.join(process.cwd(), 'backend', 'data', 'resources.json');

const ensureDataFile = () => {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf8');
  }
};

const loadData = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
};

const saveData = (data) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Helper to get the current user id from session/passport
const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.patreonId ||
    req.session?.user?.id ||
    req.session?.user?.patreonId ||
    null
  );
};

// Require authentication middleware (reuse semantics from other routes)
const requireAuth = (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// List resources for current user
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = getUserId(req);
    const data = loadData();
    const resources = data[userId] || [];
    res.json({ resources });
  } catch (error) {
    console.error('Error listing resources:', error);
    res.status(500).json({ error: 'Failed to list resources', message: error.message });
  }
});

// Create a new resource
router.post('/', requireAuth, (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, url } = req.body || {};

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const data = loadData();
    const now = new Date().toISOString();
    const resource = {
      id: crypto.randomBytes(8).toString('hex'),
      title,
      url,
      createdAt: now,
      updatedAt: now,
    };

    if (!data[userId]) data[userId] = [];
    data[userId].push(resource);
    saveData(data);

    res.status(201).json({ resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource', message: error.message });
  }
});

// Update an existing resource
router.put('/:id', requireAuth, (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { title, url } = req.body || {};

    const data = loadData();
    const resources = data[userId] || [];
    const idx = resources.findIndex((r) => r.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const existing = resources[idx];
    const updated = {
      ...existing,
      title: title ?? existing.title,
      url: url ?? existing.url,
      updatedAt: new Date().toISOString(),
    };

    resources[idx] = updated;
    data[userId] = resources;
    saveData(data);

    res.json({ resource: updated });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource', message: error.message });
  }
});

// Delete a resource
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const data = loadData();
    const resources = data[userId] || [];
    const next = resources.filter((r) => r.id !== id);

    data[userId] = next;
    saveData(data);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource', message: error.message });
  }
});

export default router;


