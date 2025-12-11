import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ReactFlow, { Background, Controls, MiniMap, addEdge, Connection, Edge, Node, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphData { nodes: Node[]; edges: Edge[] }

// Lightweight admin builder. Non-destructive: only persists to /api/rise-journey/graph.
// Integrates later with Levels/Lessons via node.data mappings.
const JourneyBuilderAdmin: React.FC = () => {
  const [initial, setInitial] = useState<GraphData>({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/rise-journey/graph')
      .then((r) => r.json())
      .then((data: GraphData) => {
        setInitial(data);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      })
      .catch(() => {});
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addLevelNode = () => {
    const id = `level-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: Math.random() * 400, y: Math.random() * 300 },
        data: { label: 'Level', kind: 'level' },
        type: 'default',
      },
    ]);
  };

  const addLessonNode = () => {
    const id = `lesson-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: 200 + Math.random() * 400, y: 100 + Math.random() * 300 },
        data: { label: 'Lesson', kind: 'lesson' },
        type: 'default',
      },
    ]);
  };

  const saveGraph = async () => {
    setSaving(true);
    try {
      await fetch('/api/rise-journey/graph', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>Journey Builder (Admin)</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={addLevelNode}>Add Level</Button>
          <Button variant="outlined" onClick={addLessonNode}>Add Lesson</Button>
          <Button variant="contained" onClick={saveGraph} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </Stack>
      </Stack>
      <Box sx={{ height: 560, borderRadius: 1, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </Box>
    </Paper>
  );
};

export default JourneyBuilderAdmin;
