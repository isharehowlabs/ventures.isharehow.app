import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useBoardContext, Stroke, Shape, CanvasAction } from '../../hooks/useBoardContext';

interface CanvasLayerProps {
  width: number;
  height: number;
  currentTool: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser';
  currentColor: string;
  strokeWidth: number;
}

export default function CanvasLayer({
  width,
  height,
  currentTool,
  currentColor,
  strokeWidth,
}: CanvasLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  
  const { canvasState, actions } = useBoardContext();

  // Render canvas state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all actions from state
    canvasState?.actions.forEach((action) => {
      drawAction(ctx, action);
    });
  }, [canvasState, width, height]);

  const drawAction = (ctx: CanvasRenderingContext2D, action: CanvasAction) => {
    if (action.type === 'stroke') {
      drawStroke(ctx, action as Stroke);
    } else {
      drawShape(ctx, action as Shape);
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 4) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0], stroke.points[1]);

    for (let i = 2; i < stroke.points.length; i += 2) {
      ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
    }

    ctx.stroke();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    switch (shape.type) {
      case 'rectangle':
        if (shape.width && shape.height) {
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
        }
        break;
      case 'circle':
        if (shape.radius) {
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        }
        break;
      case 'line':
        if (shape.width !== undefined && shape.height !== undefined) {
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        }
        break;
    }

    ctx.stroke();
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPoints([pos.x, pos.y]);
    }

    // Update presence cursor position
    actions.updatePresence('active', pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Always update cursor position
    if (isDrawing) {
      actions.updatePresence('active', pos);
    }

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      // Add point to current stroke
      setCurrentPoints((prev) => [...prev, pos.x, pos.y]);

      // Draw preview
      ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentPoints.length >= 2) {
        const lastX = currentPoints[currentPoints.length - 2];
        const lastY = currentPoints[currentPoints.length - 1];
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else if (startPos) {
      // Clear and redraw for shape preview
      ctx.clearRect(0, 0, width, height);
      
      // Redraw existing actions
      canvasState?.actions.forEach((action) => {
        drawAction(ctx, action);
      });

      // Draw preview shape
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      switch (currentTool) {
        case 'rectangle':
          const w = pos.x - startPos.x;
          const h = pos.y - startPos.y;
          ctx.rect(startPos.x, startPos.y, w, h);
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          break;
        case 'line':
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(pos.x, pos.y);
          break;
      }

      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    setIsDrawing(false);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      // Save stroke
      if (currentPoints.length >= 4) {
        actions.addStroke({
          type: 'stroke',
          points: currentPoints,
          color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
          width: strokeWidth,
        });
      }
      setCurrentPoints([]);
    } else if (startPos) {
      // Save shape
      const deltaX = pos.x - startPos.x;
      const deltaY = pos.y - startPos.y;

      switch (currentTool) {
        case 'rectangle':
          actions.addShape({
            type: 'rectangle',
            x: startPos.x,
            y: startPos.y,
            width: deltaX,
            height: deltaY,
            color: currentColor,
          });
          break;
        case 'circle':
          const radius = Math.sqrt(deltaX ** 2 + deltaY ** 2);
          actions.addShape({
            type: 'circle',
            x: startPos.x,
            y: startPos.y,
            radius,
            color: currentColor,
          });
          break;
        case 'line':
          actions.addShape({
            type: 'line',
            x: startPos.x,
            y: startPos.y,
            width: deltaX,
            height: deltaY,
            color: currentColor,
          });
          break;
      }
    }

    setStartPos(null);
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentPoints([]);
      setStartPos(null);
    }
    actions.updatePresence('idle');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          border: '1px solid #ccc',
          cursor: currentTool === 'pen' ? 'crosshair' : 'default',
          backgroundColor: '#FFFFFF',
        }}
      />
    </Box>
  );
}
