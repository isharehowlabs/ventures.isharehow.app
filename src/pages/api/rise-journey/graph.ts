import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Simple file-backed storage for JourneyGraph (nodes/edges). Non-destructive.
// File lives at project/data/journeyGraph.json
const DATA_FILE = path.join(process.cwd(), 'data', 'journeyGraph.json');

function readGraph() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { nodes: [], edges: [] };
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { nodes: [], edges: [] };
  }
}

function writeGraph(data: any) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // NOTE: Hook into your auth here; keep permissive for now.
  if (req.method === 'GET') {
    const data = readGraph();
    return res.status(200).json(data);
  }
  if (req.method === 'PUT') {
    const { nodes, edges } = req.body || {};
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    writeGraph({ nodes, edges, updatedAt: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  }
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).end('Method Not Allowed');
}
