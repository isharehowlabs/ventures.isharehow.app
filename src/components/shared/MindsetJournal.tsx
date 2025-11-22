import { useState, useEffect } from 'react';
import { trackJournalEntry } from '../../utils/analytics';
import { logActivity } from '../wellness/api';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Stack,
  Divider,
} from '@mui/material';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'challenging';
  tags: string[];
}

interface MindsetJournalProps {
  location?: string;
}

export default function MindsetJournal({ location = 'rise' }: MindsetJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentMood, setCurrentMood] = useState<'great' | 'good' | 'okay' | 'challenging'>('good');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('mindset_journal');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(parsed.slice(0, 30)); // Keep last 30 entries
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentEntry,
      mood: currentMood,
      tags: ['gratitude', 'reflection'],
    };

    const updatedEntries = [newEntry, ...entries].slice(0, 30);
    setEntries(updatedEntries);
    localStorage.setItem('mindset_journal', JSON.stringify(updatedEntries));

    // Track analytics
    trackJournalEntry(currentMood, location as 'cowork' | 'rise');

    // Save to backend if authenticated
    if (isAuthenticated) {
      try {
        await logActivity(
          'journal',
          'Journal Entry',
          currentEntry
        );
      } catch (error) {
        console.error('Failed to save journal entry to backend:', error);
      }
    }

    setCurrentEntry('');
  };

  const getMoodColor = (mood: string): 'success' | 'primary' | 'warning' | 'error' => {
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
        return 'primary';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mindset Journal
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Reflect on your day and track your mindset
      </Typography>

      <Box sx={{ my: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="What's on your mind? What are you grateful for today?"
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            How are you feeling?
          </Typography>
          <Stack direction="row" spacing={1}>
            {(['great', 'good', 'okay', 'challenging'] as const).map((mood) => (
              <Chip
                key={mood}
                label={mood}
                color={getMoodColor(mood)}
                variant={currentMood === mood ? 'filled' : 'outlined'}
                onClick={() => setCurrentMood(mood)}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Stack>
        </Box>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!currentEntry.trim()}
          fullWidth
        >
          Save Entry
        </Button>
      </Box>

      {entries.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Recent Entries
          </Typography>
          <Stack spacing={2}>
            {entries.slice(0, 5).map((entry) => (
              <Paper key={entry.id} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={entry.mood}
                    size="small"
                    color={getMoodColor(entry.mood)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                <Typography variant="body2">
                  {entry.content}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}
