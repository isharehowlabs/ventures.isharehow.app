import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Simple JSON file storage for team tasks
const DATA_FILE = path.join(process.cwd(), 'backend', 'data', 'tasks.json');

const ensureDataFile = () => {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
  }
};

const loadData = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
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

// Require authentication middleware
const requireAuth = (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// List all tasks
router.get('/', requireAuth, (req, res) => {
  try {
    const tasks = loadData();
    res.json({ tasks });
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Failed to list tasks', message: error.message });
  }
});

// Create a new task
router.post('/', requireAuth, (req, res) => {
  try {
    const { title, description, hyperlinks, status } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const tasks = loadData();
    const now = new Date().toISOString();
    const task = {
      id: crypto.randomBytes(8).toString('hex'),
      title,
      description: description || '',
      hyperlinks: hyperlinks || [],
      status: status || 'pending',
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(task);
    saveData(tasks);

    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

// Update an existing task
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, hyperlinks, status } = req.body || {};

    const tasks = loadData();
    const idx = tasks.findIndex((t) => t.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existing = tasks[idx];
    const updated = {
      ...existing,
      title: title ?? existing.title,
      description: description ?? existing.description,
      hyperlinks: hyperlinks ?? existing.hyperlinks,
      status: status ?? existing.status,
      updatedAt: new Date().toISOString(),
    };

    tasks[idx] = updated;
    saveData(tasks);

    res.json({ task: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

// Delete a task
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const tasks = loadData();
    const next = tasks.filter((t) => t.id !== id);

    if (next.length === tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    saveData(next);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', message: error.message });
  }
});

export default router;


