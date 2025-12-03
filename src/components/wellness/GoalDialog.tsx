import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { Goal } from './api';

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => Promise<void>;
  goal?: Goal | null;
}

const categories = ['Fitness', 'Mental', 'Spiritual', 'Nutrition', 'Career', 'Social', 'Other'];

export default function GoalDialog({ open, onClose, onSave, goal }: GoalDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Fitness',
    targetValue: 10,
    currentProgress: 0,
    deadline: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'Fitness',
        targetValue: goal.targetValue || 10,
        currentProgress: goal.currentProgress || 0,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Fitness',
        targetValue: 10,
        currentProgress: 0,
        deadline: '',
      });
    }
  }, [goal, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      const goalData: Partial<Goal> = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      };
      
      if (goal) {
        goalData.id = goal.id;
      }
      
      await onSave(goalData);
      onClose();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            id="goal-title"
            label="Goal Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            fullWidth
            autoFocus
          />
          
          <TextField
            label="Description"
            id="goal-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          
          <TextField
            select
            id="goal-category"
            label="Category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            fullWidth
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Current Progress"
              type="number"
              value={formData.currentProgress}
            id="goal-target-value"
              onChange={(e) => handleChange('currentProgress', parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0 }}
            />
            
            <TextField
              label="Target Value"
              type="number"
              value={formData.targetValue}
            id="goal-unit"
              onChange={(e) => handleChange('targetValue', parseInt(e.target.value) || 1)}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Box>
          
          <TextField
            label="Deadline"
            type="date"
            value={formData.deadline}
            id="goal-deadline"
            onChange={(e) => handleChange('deadline', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSaving || !formData.title.trim()}
        >
          {isSaving ? 'Saving...' : goal ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
