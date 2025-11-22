import { useState, useEffect } from 'react';
import { trackJournalEntry } from '../../utils/analytics';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  AutoStories as JournalIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'challenging';
  tags: string[];
}

export default function MindsetJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentMood, setCurrentMood] = useState<JournalEntry['mood']>('good');

  useEffect(() => {
    const stored = localStorage.getItem('mindset_journal');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentEntry,
      mood: currentMood,
      tags: ['gratitude', 'reflection'],
    };

    const updated = [newEntry, ...entries].slice(0, 30); // Keep last 30
    setEntries(updated);
    localStorage.setItem('mindset_journal', JSON.stringify(updated));
    
    // Track journal entry
    trackJournalEntry(currentMood, 'rise');
    
    setCurrentEntry('');
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great':
        return 'success';
      case 'good':
        return 'primary';
      case 'okay':
        return 'warning';
      case 'challenging':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <JournalIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Mindset Journal</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Daily reflections and gratitude
      </Typography>

      <Box sx={{ my: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="What are you grateful for today? What did you learn?"
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ width: '100%', mb: 1 }}>
            How are you feeling?
          </Typography>
          {(['great', 'good', 'okay', 'challenging'] as const).map((mood) => (
            <Chip
              key={mood}
              label={mood}
              onClick={() => setCurrentMood(mood)}
              color={currentMood === mood ? getMoodColor(mood) as any : 'default'}
              variant={currentMood === mood ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!currentEntry.trim()}
          fullWidth
        >
          Save Entry
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Recent Entries
      </Typography>

      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Start your mindset journey by writing your first entry
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {entries.slice(0, 5).map((entry) => (
            <ListItem key={entry.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.date).toLocaleDateString()}
                </Typography>
                <Chip label={entry.mood} size="small" color={getMoodColor(entry.mood) as any} />
              </Box>
              <Typography variant="body2">{entry.content}</Typography>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
