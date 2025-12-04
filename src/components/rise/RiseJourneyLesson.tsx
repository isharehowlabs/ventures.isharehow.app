import React, { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, PenTool, FileText, Check, Plus, X } from 'lucide-react';

interface LessonData {
  levelId: number;
  levelName: string;
  lessonId: number;
  lessonTitle: string;
  videoUrl: string;
  pdfUrl?: string;
  pdfTitle?: string;
}

interface JournalEntry {
  physical: string;
  mental: string;
  spiritual: string;
  wellness: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const RiseJourneyLesson: React.FC<{ lessonData?: LessonData }> = ({ lessonData }) => {
  // Default lesson data for demonstration
  const defaultLesson: LessonData = {
    levelId: 1,
    levelName: 'Wellness',
    lessonId: 3,
    lessonTitle: 'The Morning Routine',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: '/documents/The_Science_of_Wellness.pdf',
    pdfTitle: 'The_Science_of_Wellness.pdf'
  };

  const lesson = lessonData || defaultLesson;
  
  const [activeTab, setActiveTab] = useState<'notes' | 'journal' | 'tasks'>('notes');
  const [notes, setNotes] = useState('');
  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    physical: '',
    mental: '',
    spiritual: '',
    wellness: ''
  });
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Drink 1L water during lesson', completed: false },
    { id: '2', text: 'Setup yoga mat', completed: true }
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved data when component mounts
    loadLessonData();
  }, [lesson.lessonId]);

  const loadLessonData = async () => {
    // TODO: Implement API calls to load existing notes, journal entries, and tasks
    try {
      // const notesResponse = await fetch(`/api/rise-journey/lessons/${lesson.lessonId}/notes`);
      // const notesData = await notesResponse.json();
      // setNotes(notesData.content);

      // const journalResponse = await fetch(`/api/rise-journey/lessons/${lesson.lessonId}/journal`);
      // const journalData = await journalResponse.json();
      // setJournalEntry(journalData);

      // const tasksResponse = await fetch(`/api/tasks?category=Rise Journey&lessonId=${lesson.lessonId}`);
      // const tasksData = await tasksResponse.json();
      // setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    }
  };

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to mark lesson as complete
      // await fetch(`/api/rise-journey/lessons/${lesson.lessonId}/complete`, {
      //   method: 'POST'
      // });
      alert('Lesson marked as complete! 🎉');
      // Redirect or update UI
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async (content: string) => {
    try {
      // TODO: Implement auto-save for notes
      // await fetch(`/api/rise-journey/lessons/${lesson.lessonId}/notes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content })
      // });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const saveJournalEntry = async (pillar: keyof JournalEntry, content: string) => {
    const updated = { ...journalEntry, [pillar]: content };
    setJournalEntry(updated);
    
    try {
      // TODO: Save to rise_journey_notes table with pillar categorization
      // await fetch(`/api/rise-journey/lessons/${lesson.lessonId}/journal`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pillar, content, lessonId: lesson.lessonId })
      // });
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');

    try {
      // TODO: POST to existing Task API with category="Rise Journey"
      // await fetch('/api/tasks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     text: newTask.text,
      //     category: 'Rise Journey',
      //     lessonId: lesson.lessonId,
      //     levelId: lesson.levelId
      //   })
      // });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    try {
      // TODO: Update task completion status
      // await fetch(`/api/tasks/${taskId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ completed: !task.completed })
      // });
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));

    try {
      // TODO: Delete task from API
      // await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-gray-700 flex items-center px-6 justify-between bg-gray-800 shadow-lg flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-100">
          Level {lesson.levelId}: {lesson.levelName} / Lesson {lesson.lessonId}: {lesson.lessonTitle}
        </h2>
        <button 
          onClick={handleMarkComplete}
          disabled={saving}
          className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? 'Saving...' : (
            <>
              <Check className="h-4 w-4" />
              Mark Lesson Complete
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Content Consumption (Video) */}
        <div className="w-full md:w-2/3 flex flex-col border-r border-gray-700">
          {/* Video Player */}
          <div className="relative flex-1 bg-black">
             <iframe 
               src={lesson.videoUrl} 
               className="w-full h-full" 
               title="Lesson Video" 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen 
             />
          </div>
          
          {/* PDF Resource Link Bar */}
          {lesson.pdfUrl && (
            <a 
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-16 bg-gray-800 flex items-center px-6 border-t border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            >
              <FileText className="text-blue-400 mr-3 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-sm text-gray-100">Required Reading</p>
                <p className="text-xs text-gray-400">{lesson.pdfTitle || 'Download PDF'}</p>
              </div>
            </a>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Dashboard */}
        <div className="w-full md:w-1/3 bg-gray-800 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700 flex-shrink-0">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'notes' 
                  ? 'border-b-2 border-blue-500 text-white bg-gray-750' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BookOpen className="inline-block mr-1 h-4 w-4" />
              Notes
            </button>
            <button 
              onClick={() => setActiveTab('journal')}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'journal' 
                  ? 'border-b-2 border-purple-500 text-white bg-gray-750' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <PenTool className="inline-block mr-1 h-4 w-4" />
              Journal
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'tasks' 
                  ? 'border-b-2 border-green-500 text-white bg-gray-750' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckSquare className="inline-block mr-1 h-4 w-4" />
              Tasks
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            
            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col">
                <p className="text-xs text-gray-400 mb-2">Collaborative Class Notes</p>
                <textarea 
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    saveNotes(e.target.value);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all duration-200"
                  placeholder="Take notes on the lecture here...

• Key insights
• Action items
• Questions to explore"
                />
              </div>
            )}

            {/* JOURNAL TAB (The 4 Pillars) */}
            {activeTab === 'journal' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-300 italic mb-4">
                  Reflect on this lesson through the 4 pillars:
                </p>
                
                <div>
                  <label className="text-xs font-bold text-green-400 uppercase mb-1 block">
                    💪 Physical Body
                  </label>
                  <textarea 
                    value={journalEntry.physical}
                    onChange={(e) => saveJournalEntry('physical', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm h-24 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-300 resize-none" 
                    placeholder="How does this apply to your body? Energy levels? Physical sensations?"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-blue-400 uppercase mb-1 block">
                    🧠 Mental State
                  </label>
                  <textarea 
                    value={journalEntry.mental}
                    onChange={(e) => saveJournalEntry('mental', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm h-24 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-300 resize-none" 
                    placeholder="What mental blocks arose? New insights? Clarity gained?"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-purple-400 uppercase mb-1 block">
                    ✨ Spiritual Connection
                  </label>
                  <textarea 
                    value={journalEntry.spiritual}
                    onChange={(e) => saveJournalEntry('spiritual', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm h-24 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-300 resize-none" 
                    placeholder="How does this align with your spirit? Intuitive feelings?"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-yellow-400 uppercase mb-1 block">
                    🌿 Wellness & Balance
                  </label>
                  <textarea 
                    value={journalEntry.wellness}
                    onChange={(e) => saveJournalEntry('wellness', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm h-24 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-gray-300 resize-none" 
                    placeholder="Overall wellbeing? Self-care insights? Balance reflections?"
                  />
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add new task..." 
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-300" 
                  />
                  <button 
                    onClick={addTask}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No tasks yet. Add your first task above!
                    </p>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.id}
                        className={`flex items-center gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700 transition-all duration-200 ${
                          task.completed ? 'opacity-60' : 'hover:border-green-500'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="rounded text-green-500 focus:ring-0 bg-gray-800 border-gray-600 cursor-pointer w-5 h-5" 
                        />
                        <span className={`text-sm text-gray-300 flex-1 ${task.completed ? 'line-through' : ''}`}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiseJourneyLesson;
