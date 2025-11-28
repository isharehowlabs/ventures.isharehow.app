'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, Check, Close } from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';

// Figma file embed URL (replace with real document or make dynamic as needed)
const FIGMA_EMBED_URL =
  "https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/xxxxxxxxxxxxxxxxxxxxxxx";

interface TaskListPanelProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}

function TaskListPanel({ tasks, onToggle, onAdd }: TaskListPanelProps) {
  const [newTask, setNewTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAdd(newTask.trim());
      setNewTask("");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Task List</Typography>
      </Box>
      <List dense sx={{ flex: 1, overflowY: "auto" }}>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            button
            onClick={() => onToggle(task.id)}
            sx={{ 
              textDecoration: task.status === 'completed' ? "line-through" : "none",
              opacity: task.status === 'completed' ? 0.7 : 1,
            }}
            disablePadding
          >
            <ListItemText primary={task.title} />
            {task.status === 'completed' ? (
              <IconButton color="success" size="small"><Check /></IconButton>
            ) : (
              <IconButton color="inherit" size="small"><Close /></IconButton>
            )}
          </ListItem>
        ))}
        {tasks.length === 0 && (
          <ListItem>
            <ListItemText 
              primary="No tasks yet" 
              secondary="Add a task to get started"
            />
          </ListItem>
        )}
      </List>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add task…"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  size="small"
                  disabled={!newTask.trim()}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
}

function DesignCodePanel() {
  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Design & Code Document
      </Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 350,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: 'background.paper',
        }}
      >
        {/* Figma embed gives editing/copy code buttons */}
        <iframe
          title="Figma Design Doc"
          width="100%"
          height="100%"
          style={{ minHeight: 340, border: "none" }}
          src={FIGMA_EMBED_URL}
          allowFullScreen
        />
      </Box>
    </Paper>
  );
}

export default function CoworkDashboardPanel() {
  const { tasks, createTask, updateTask, isLoading } = useTasks();

  const handleTaskToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(id, { status: newStatus });
    }
  };

  const handleTaskAdd = async (text: string) => {
    await createTask(text, '', [], 'pending');
  };

  // Layout: left = tasks, large right = design/code
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default", p: { xs: 1, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Task List - left third on desktop, top on mobile */}
        <Grid item xs={12} md={4} lg={3}>
          <TaskListPanel 
            tasks={tasks} 
            onToggle={handleTaskToggle} 
            onAdd={handleTaskAdd} 
          />
        </Grid>

        {/* Design/Code Doc - main area */}
        <Grid item xs={12} md={8} lg={9}>
          <DesignCodePanel />
        </Grid>
      </Grid>
    </Box>
  );
}
