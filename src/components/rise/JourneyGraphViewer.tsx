import React, { useEffect, useState, useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphData { nodes: Node[]; edges: Edge[] }

// Read-only viewer. Clicking a Level/Lesson node can route to existing UI without removing any functions.
const JourneyGraphViewer: React.FC = () => {
  const [initial, setInitial] = useState<GraphData>({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const onNodeClick = (_: any, node: Node) => {
    // Respect existing navigation: if node has data.levelId / lessonId, deep link to current components
    const levelId = (node.data && (node.data.levelId || node.data.level_id)) as string | number | undefined;
    const lessonId = (node.data && (node.data.lessonId || node.data.lesson_id)) as string | number | undefined;
    if (levelId) {
      // Navigate to RiseJourney and open the level; we rely on existing flow
      window.location.href = `/rise?openLevel=${levelId}`;
      return;
    }
    if (lessonId) {
      window.location.href = `/rise?openLesson=${lessonId}`;
      return;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Journey Map
      </Typography>
      <Box sx={{ height: 500, borderRadius: 1, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <MiniMap />
          <Controls showInteractive={false} />
          <Background gap={16} />
        </ReactFlow>
      </Box>
    </Paper>
  );
};

export default JourneyGraphViewer;
