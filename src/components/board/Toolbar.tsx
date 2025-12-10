import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  ButtonGroup,
  Button,
  Slider,
  Typography,
  Paper,
} from '@mui/material';
import {
  Brush as BrushIcon,
  Rectangle as RectangleIcon,
  Circle as CircleIcon,
  Remove as LineIcon,
  Delete as ClearIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from '@mui/icons-material';
import { useBoardContext } from '../../hooks/useBoardContext';

interface ToolbarProps {
  currentTool: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser';
  onToolChange: (tool: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser') => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFFFFF', // White
];

export default function Toolbar({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
}: ToolbarProps) {
  const { actions } = useBoardContext();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Drawing Tools */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Tools
        </Typography>
        <ButtonGroup orientation="vertical" fullWidth>
          <Tooltip title="Pen" placement="right">
            <Button
              variant={currentTool === 'pen' ? 'contained' : 'outlined'}
              onClick={() => onToolChange('pen')}
              startIcon={<BrushIcon />}
            >
              Pen
            </Button>
          </Tooltip>
          <Tooltip title="Rectangle" placement="right">
            <Button
              variant={currentTool === 'rectangle' ? 'contained' : 'outlined'}
              onClick={() => onToolChange('rectangle')}
              startIcon={<RectangleIcon />}
            >
              Rectangle
            </Button>
          </Tooltip>
          <Tooltip title="Circle" placement="right">
            <Button
              variant={currentTool === 'circle' ? 'contained' : 'outlined'}
              onClick={() => onToolChange('circle')}
              startIcon={<CircleIcon />}
            >
              Circle
            </Button>
          </Tooltip>
          <Tooltip title="Line" placement="right">
            <Button
              variant={currentTool === 'line' ? 'contained' : 'outlined'}
              onClick={() => onToolChange('line')}
              startIcon={<LineIcon />}
            >
              Line
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>

      <Divider />

      {/* Colors */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Color
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
          {COLORS.map((color) => (
            <Tooltip key={color} title={color}>
              <IconButton
                onClick={() => onColorChange(color)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: color,
                  border: currentColor === color ? '3px solid #000' : '1px solid #ccc',
                  '&:hover': {
                    bgcolor: color,
                    opacity: 0.8,
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Stroke Width */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Stroke Width: {strokeWidth}px
        </Typography>
        <Slider
          value={strokeWidth}
          onChange={(_, value) => onStrokeWidthChange(value as number)}
          min={1}
          max={20}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider />

      {/* Actions */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Actions
        </Typography>
        <ButtonGroup orientation="vertical" fullWidth>
          <Tooltip title="Undo" placement="right">
            <Button onClick={actions.undo} startIcon={<UndoIcon />}>
              Undo
            </Button>
          </Tooltip>
          <Tooltip title="Redo" placement="right">
            <Button onClick={actions.redo} startIcon={<RedoIcon />}>
              Redo
            </Button>
          </Tooltip>
          <Tooltip title="Clear Board" placement="right">
            <Button
              onClick={actions.clearBoard}
              startIcon={<ClearIcon />}
              color="error"
            >
              Clear
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Paper>
  );
}
