import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Play, Lock, FileText, PenTool, CheckSquare, Plus, X, GraduationCap, ExternalLink } from 'lucide-react';
import RiseJourneyLesson from './RiseJourneyLesson';

interface JourneyLevel {
  id: string;
  levelKey: string;
  title: string;
  description: string;
  focus: string;
  revenueProducts: string[];
  order: number;
  progress: {
    state: 'locked' | 'in-progress' | 'completed';
    startedAt: string | null;
    completedAt: string | null;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  order: number;
  progress: {
    completed: boolean;
    completedAt: string | null;
  };
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface RiseJourneyLevelSubpanelProps {
  level: JourneyLevel;
  onBack: () => void;
  backendUrl: string;
}

const RiseJourneyLevelSubpanel: React.FC<RiseJourneyLevelSubpanelProps> = ({
  level,
  onBack,
  backendUrl,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'tasks' | 'journal' | 'learning'>('lessons');

  useEffect(() => {
    loadLevelData();
  }, [level.id]);

  const loadLevelData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load lessons
      const lessonsResponse = await fetch(
        `${backendUrl}/api/rise-journey/levels/${level.id}/lessons`,
        { credentials: 'include' }
      );
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.lessons || []);
      }

      // Load tasks for this level
      const tasksResponse = await fetch(
        `${backendUrl}/api/tasks?category=Rise Journey&levelId=${level.id}`,
        { credentials: 'include' }
      );
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load level data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async () => {
    if (selectedLesson) {
      try {
        await fetch(`${backendUrl}/api/rise-journey/lessons/${selectedLesson.id}/complete`, {
          method: 'POST',
          credentials: 'include',
        });
        await loadLevelData(); // Refresh lessons
        setSelectedLesson(null);
      } catch (err) {
        console.error('Failed to mark lesson complete:', err);
      }
    }
  };

  const addTask = async (text: string) => {
    if (!text.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text,
          category: 'Rise Journey',
          levelId: level.id,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`${backendUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !completed }),
      });

      setTasks(tasks.map(task => (task.id === taskId ? { ...task, completed: !completed } : task)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`${backendUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // If a lesson is selected, show the lesson view
  if (selectedLesson) {
    return (
      <RiseJourneyLesson
        lessonData={{
          levelId: parseInt(level.id),
          levelName: level.title,
          lessonId: parseInt(selectedLesson.id),
          lessonTitle: selectedLesson.title,
          videoUrl: selectedLesson.videoUrl || '',
          pdfUrl: selectedLesson.pdfUrl || undefined,
          pdfTitle: selectedLesson.pdfUrl ? selectedLesson.pdfUrl.split('/').pop() : undefined,
        }}
        onBack={() => setSelectedLesson(null)}
        onComplete={handleLessonComplete}
        backendUrl={backendUrl}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading level content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Journey
          </button>
        </div>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => l.progress.completed).length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Journey
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{level.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{level.focus || level.description}</p>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Level Progress</span>
              <span className="text-sm text-gray-600">
                {completedLessons} of {totalLessons} lessons completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'lessons'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen className="inline-block mr-2 h-5 w-5" />
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CheckSquare className="inline-block mr-2 h-5 w-5" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'journal'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PenTool className="inline-block mr-2 h-5 w-5" />
            Journal
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'learning'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <GraduationCap className="inline-block mr-2 h-5 w-5" />
            Learning Hub
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div>
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No lessons available for this level yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-500">Lesson {index + 1}</span>
                            {lesson.progress.completed && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                <CheckCircle className="inline-block h-3 w-3 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                          <p className="text-gray-600 mb-3">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {lesson.videoUrl && (
                              <span className="flex items-center gap-1">
                                <Play className="h-4 w-4" />
                                Video
                              </span>
                            )}
                            {lesson.pdfUrl && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                PDF
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {lesson.progress.completed ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          ) : (
                            <Play className="h-8 w-8 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTask(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a new task..."]') as HTMLInputElement;
                    if (input && input.value) {
                      addTask(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks yet. Add your first task above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg ${
                        task.completed ? 'bg-gray-50 opacity-60' : 'bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span
                        className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Journal Tab */}
          {activeTab === 'journal' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 italic mb-4">
                Reflect on your journey through the 4 pillars:
              </p>
              <div>
                <label className="text-xs font-bold text-green-600 uppercase mb-2 block">
                  💪 Physical Body
                </label>
                <textarea
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="How does this level apply to your body? Energy levels? Physical sensations?"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">
                  🧠 Mental State
                </label>
                <textarea
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What mental blocks arose? New insights? Clarity gained?"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-600 uppercase mb-2 block">
                  ✨ Spiritual Connection
                </label>
                <textarea
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="How does this align with your spirit? Intuitive feelings?"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-yellow-600 uppercase mb-2 block">
                  🌿 Wellness & Balance
                </label>
                <textarea
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  placeholder="Overall wellbeing? Self-care insights? Balance reflections?"
                />
              </div>
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Save Journal Entry
              </button>
            </div>
          )}

          {/* Learning Hub Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Learning Hub Classes</h3>
                </div>
                <p className="text-gray-700 mb-6">
                  Access comprehensive video classes and courses to deepen your understanding of this journey level.
                </p>
                
                {/* Learning Hub Content Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Classes Card */}
                  <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Play className="h-6 w-6 text-indigo-600" />
                        <h4 className="text-xl font-bold text-gray-800">Video Classes</h4>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                      A comprehensive collection of video classes covering various topics and learning paths.
                    </p>
                    <button
                      onClick={() => {
                        window.open('https://www.youtube.com/embed/videoseries?list=PLwyVPJ9qE2K-g5CQgIYtOfnrfl7ebWRkp', '_blank');
                      }}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Watch Video Classes
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  {/* AI Development Course Card */}
                  <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                        <h4 className="text-xl font-bold text-gray-800">AI Development</h4>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                      Learn the fundamentals of AI development including machine learning, neural networks, and data processing.
                    </p>
                    <button
                      onClick={() => {
                        window.open('https://www.youtube.com/playlist?list=PLwyVPJ9qE2K8vj0Wfb4rxAmZntkysHPlE', '_blank');
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Start Course
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Resources</h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      For more learning resources, visit the full Learning Hub in the Creative Dashboard.
                    </p>
                    <button
                      onClick={() => {
                        // Navigate to Creative Dashboard with Learning Hub tab
                        window.location.href = '/creative?tab=learning';
                      }}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold flex items-center gap-2"
                    >
                      <GraduationCap className="h-5 w-5" />
                      Open Full Learning Hub
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiseJourneyLevelSubpanel;

