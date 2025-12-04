import { useState, useEffect } from 'react';

interface Level {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  order_index: number;
  icon_name?: string;
  color_code?: string;
}

interface UserProgress {
  recommendedLevel: number;
  completedLevels: number[];
  currentLevel: number;
  levelProgress: { [key: number]: number };
}

interface Lesson {
  id: number;
  level_id: number;
  title: string;
  description: string;
  video_url?: string;
  pdf_url?: string;
  order_index: number;
}

interface JournalEntry {
  id?: number;
  lesson_id: number;
  pillar: 'physical' | 'mental' | 'spiritual' | 'wellness';
  content: string;
  created_at?: string;
}

export const useRiseJourney = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rise-journey/levels');
      if (!response.ok) throw new Error('Failed to fetch levels');
      const data = await response.json();
      setLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rise-journey/progress');
      if (!response.ok) throw new Error('Failed to fetch user progress');
      const data = await response.json();
      setUserProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching user progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: number) => {
    try {
      const response = await fetch(`/api/rise-journey/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to mark lesson complete');
      
      // Refresh user progress after completion
      await fetchUserProgress();
      
      return true;
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchUserProgress();
  }, []);

  return {
    levels,
    userProgress,
    loading,
    error,
    fetchLevels,
    fetchUserProgress,
    markLessonComplete
  };
};

export const useLessonData = (lessonId: number) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [notes, setNotes] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rise-journey/lessons/${lessonId}`);
      if (!response.ok) throw new Error('Failed to fetch lesson');
      const data = await response.json();
      setLesson(data);
    } catch (err) {
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/rise-journey/lessons/${lessonId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.content || '');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const response = await fetch(`/api/rise-journey/lessons/${lessonId}/journal`);
      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    }
  };

  const saveNotes = async (content: string) => {
    try {
      await fetch(`/api/rise-journey/lessons/${lessonId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const saveJournalEntry = async (pillar: string, content: string) => {
    try {
      await fetch(`/api/rise-journey/lessons/${lessonId}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pillar, 
          content, 
          lessonId 
        })
      });
    } catch (err) {
      console.error('Error saving journal entry:', err);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
      fetchNotes();
      fetchJournalEntries();
    }
  }, [lessonId]);

  return {
    lesson,
    notes,
    journalEntries,
    loading,
    setNotes,
    saveNotes,
    saveJournalEntry
  };
};

export const useTasks = (lessonId?: number) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = lessonId 
        ? `/api/tasks?category=Rise Journey&lessonId=${lessonId}`
        : '/api/tasks?category=Rise Journey';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (text: string, lessonId?: number, levelId?: number) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          category: 'Rise Journey',
          lessonId,
          levelId
        })
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        return newTask;
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [lessonId]);

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    refetch: fetchTasks
  };
};
