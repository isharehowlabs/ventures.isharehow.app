import React, { useState, useEffect } from 'react';
import { Lock, Play, CheckCircle, ShoppingBag, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import RiseJourneyQuiz from './RiseJourneyQuiz';
import RiseJourneyLevelSubpanel from './RiseJourneyLevelSubpanel';

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

interface Trial {
  id: string;
  isActive: boolean;
  daysRemaining: number;
  expiresAt: string;
}

const levelColors: Record<string, { bg: string; border: string; text: string }> = {
  wellness: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500' },
  mobility: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
  accountability: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500' },
  creativity: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
  alignment: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-500' },
  mindfulness: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-500' },
  destiny: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' },
};

const RiseJourney: React.FC = () => {
  const [levels, setLevels] = useState<JourneyLevel[]>([]);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JourneyLevel | null>(null);
  const [showRetakeQuiz, setShowRetakeQuiz] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';

  useEffect(() => {
    loadData();
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setAccessLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/access`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setHasFullAccess(data.hasFullAccess || false);
      }
    } catch (err) {
      console.error('Failed to check access:', err);
    } finally {
      setAccessLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if quiz is completed
      const quizResponse = await fetch(`${backendUrl}/api/rise-journey/quiz`, {
        credentials: 'include',
      });
      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        if (quizData.quiz) {
          setQuizCompleted(true);
          setRecommendedLevel(quizData.quiz.recommendedLevel);
        } else {
          setQuizCompleted(false);
        }
      } else if (quizResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
        setLoading(false);
        return;
      }

      // Get trial status
      const trialResponse = await fetch(`${backendUrl}/api/rise-journey/trial`, {
        credentials: 'include',
      });
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        if (trialData.trial) {
          const expiresAt = new Date(trialData.trial.expiresAt);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setTrial({
            id: trialData.trial.id,
            isActive: trialData.trial.isActive && daysRemaining > 0,
            daysRemaining,
            expiresAt: trialData.trial.expiresAt,
          });
        }
      } else if (trialResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
        setLoading(false);
        return;
      }

      // Get levels
      const levelsResponse = await fetch(`${backendUrl}/api/rise-journey/levels`, {
        credentials: 'include',
      });
      if (levelsResponse.ok) {
        const levelsData = await levelsResponse.json();
        setLevels(levelsData.levels || []);
      } else if (levelsResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
      } else {
        throw new Error('Failed to load journey levels');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load journey data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (level: string, scores: Record<string, number>) => {
    setQuizCompleted(true);
    setRecommendedLevel(level);
    setShowQuiz(false);
    setShowRetakeQuiz(false);
    await loadData();
  };

  const handleLevelClick = async (level: JourneyLevel) => {
    // Allow access to all levels regardless of lock status
    // If locked, start it automatically, then show the level
    if (level.progress.state === 'locked') {
      try {
        const response = await fetch(`${backendUrl}/api/rise-journey/levels/${level.id}/start`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          await loadData();
          // After starting, show the level
          const updatedLevel = { ...level, progress: { ...level.progress, state: 'in-progress' as const } };
          setSelectedLevel(updatedLevel);
        } else {
          // Even if start fails, allow access to view content
          setSelectedLevel(level);
        }
      } catch (err) {
        console.error('Failed to start level:', err);
        // Even if start fails, allow access to view content
        setSelectedLevel(level);
      }
    } else {
      setSelectedLevel(level);
    }
  };

  const handleBackToJourney = () => {
    setSelectedLevel(null);
    loadData(); // Refresh data when returning
  };

  // Show quiz if not completed or if user wants to retake
  if (!quizCompleted || showRetakeQuiz) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {showRetakeQuiz && (
            <button
              onClick={() => {
                setShowRetakeQuiz(false);
                setShowQuiz(false);
              }}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Journey
            </button>
          )}
          <RiseJourneyQuiz onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  // Show level subpanel if one is selected
  if (selectedLevel) {
    return (
      <RiseJourneyLevelSubpanel
        level={selectedLevel}
        onBack={handleBackToJourney}
        backendUrl={backendUrl}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main journey view with cards
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header & Trial Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Rise Journey</h1>
          <p className="text-lg text-gray-600">The path to higher consciousness.</p>
        </div>
        <div className="flex items-center gap-4">
          {trial && trial.isActive && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-lg border-2 border-orange-200 shadow-md">
              <span className="text-orange-800 font-bold text-lg">{trial.daysRemaining} Days Remaining</span>
              <span className="text-orange-700 ml-2">in Free Trial</span>
            </div>
          )}
          <button
            onClick={() => setShowRetakeQuiz(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Retake Assessment
          </button>
        </div>
      </div>

      {recommendedLevel && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Recommended Starting Point:</strong>{' '}
              {levels.find(l => l.levelKey === recommendedLevel)?.title || recommendedLevel}
            </p>
          </div>
        </div>
      )}

      {/* The Journey Path - Card Layout */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {levels.map((level, index) => {
          const colors = levelColors[level.levelKey] || levelColors.wellness;
          const isRecommended = level.levelKey === recommendedLevel;
          const isLocked = level.progress.state === 'locked';
          const isCompleted = level.progress.state === 'completed';
          const isInProgress = level.progress.state === 'in-progress';

          // Calculate progress percentage (simplified - could be based on lessons completed)
          const progress = isCompleted ? 100 : isInProgress ? 50 : 0;

          return (
            <div
              key={level.id}
              className="relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Connector Line */}
              {index !== levels.length - 1 && (
                <div className="absolute left-12 top-20 bottom-[-24px] w-1 bg-gradient-to-b from-gray-300 to-gray-200 -z-10 rounded-full" />
              )}

              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Visual Strip */}
                  <div className={`w-full md:w-2 h-2 md:h-auto ${colors.bg}`} />

                  <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
                    {/* Icon/Number */}
                    <div
                      className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${
                        isCompleted
                          ? `${colors.border} ${colors.text} bg-white`
                          : 'border-gray-300 text-gray-400 bg-gray-50'
                      } font-bold text-2xl shadow-md flex-shrink-0`}
                    >
                      {isCompleted ? <CheckCircle className="w-10 h-10" /> : index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-800">{level.title}</h3>
                        {isRecommended && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                            ✨ Recommended Start
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                            ✓ Complete
                          </span>
                        )}
                        {isInProgress && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-200">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 text-lg">{level.focus || level.description}</p>
                      <p className="text-gray-500 mb-4 text-sm">{level.description}</p>

                      {/* Progress Bar within Level */}
                      {!isLocked && (
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                          <div
                            className={`${colors.bg} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {/* Revenue/Product Recommendation */}
                      {level.revenueProducts && level.revenueProducts.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500 gap-2 mt-2 hover:text-gray-700 cursor-pointer transition-colors">
                          <ShoppingBag size={16} className="text-orange-500" />
                          <span>
                            Pair with:{' '}
                            <span className="font-semibold text-gray-700">
                              {level.revenueProducts.join(', ')}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleLevelClick(level)}
                        className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                          isRecommended
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            : isLocked
                            ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isCompleted ? 'Review Path' : isLocked ? 'Explore Path' : 'Enter Path'}
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      {!hasFullAccess && (
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 border-2 border-purple-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Transform Your Life?</h3>
            <p className="text-gray-700 mb-4">
              Unlock all 7 levels and gain lifetime access to your personal growth journey.
            </p>
            <button
              onClick={() => {
                // Redirect to Patreon VIP/Vanity Tier2 ($43.21/month)
                window.open('https://www.patreon.com/isharehow', '_blank');
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Upgrade to Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiseJourney;
