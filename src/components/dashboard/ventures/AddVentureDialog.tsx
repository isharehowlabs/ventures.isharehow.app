import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  Chip,
  Box,
  Autocomplete,
} from '@mui/material';
import { VentureStatus } from '../../../types/venture';

interface AddVentureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (ventureData: any) => void;
}

const AddVentureDialog: React.FC<AddVentureDialogProps> = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: VentureStatus.PLANNING,
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    clientName: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.budget || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    const ventureData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      progress: 0,
      budget: parseFloat(formData.budget),
      spent: 0,
      startDate: formData.startDate,
      deadline: formData.deadline,
      team: [],
      tasks: [],
      tags: formData.tags,
      clientName: formData.clientName || undefined,
    };

    onSave(ventureData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      status: VentureStatus.PLANNING,
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      clientName: '',
      tags: [],
    });
    setTagInput('');
  };

  // #region agent log
  useEffect(() => {
    if (open) {
      const handleGlobalClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const dialogBackdrop = target.closest('[class*="MuiBackdrop"]') || target.closest('[class*="MuiDialog"]');
        if (dialogBackdrop && target === dialogBackdrop) {
          fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:30',message:'Backdrop click detected',data:{tagName:target.tagName,className:target.className,computedStyle:window.getComputedStyle(target).pointerEvents},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        }
        if (target.closest('button') || target.closest('[role="button"]')) {
          fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:35',message:'Global button click detected',data:{tagName:target.tagName,buttonText:target.textContent?.slice(0,20),computedStyle:window.getComputedStyle(target).pointerEvents},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        }
      };
      document.addEventListener('click', handleGlobalClick, true);
      return () => document.removeEventListener('click', handleGlobalClick, true);
    }
  }, [open]);
  // #endregion

  const handleClose = () => {
    // #region agent log
    fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:86',message:'handleClose called',data:{open},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    handleReset();
    // #region agent log
    fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:89',message:'calling onClose prop',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    onClose();
  };

  return (
    <Dialog open={open} onClose={(event, reason) => {
      // #region agent log
      fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:115',message:'Dialog onClose triggered',data:{reason,eventType:event && 'type' in event ? (event as any).type : 'unknown',eventTarget:event && 'target' in event ? (event as any).target?.tagName : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      handleClose();
    }} maxWidth="md" fullWidth>
      <DialogTitle>Add New Venture</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Venture Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              required
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value={VentureStatus.PLANNING}>Planning</MenuItem>
                <MenuItem value={VentureStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={VentureStatus.ON_HOLD}>On Hold</MenuItem>
                <MenuItem value={VentureStatus.COMPLETED}>Completed</MenuItem>
                <MenuItem value={VentureStatus.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              required
              type="number"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Deadline"
              required
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Client Name (Optional)"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={(_, newValue) => handleChange('tags', newValue)}
              inputValue={tagInput}
              onInputChange={(_, newInputValue) => setTagInput(newInputValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Type and press enter to add tags"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => {
          // #region agent log
          fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVentureDialog.tsx:210',message:'Cancel button clicked',data:{eventType:e.type,currentTarget:e.currentTarget?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          handleClose();
        }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create Venture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVentureDialog;
