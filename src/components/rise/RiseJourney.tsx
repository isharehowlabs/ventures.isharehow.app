import React, { useState, useEffect } from 'react';
import { Lock, Play, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

// The 7 Levels defined in the backend
const LEVELS = [
  { id: 1, title: 'Wellness', subtitle: 'Physical Health & Energy', color: 'bg-green-500', borderColor: 'border-green-500', textColor: 'text-green-500' },
  { id: 2, title: 'Mobility', subtitle: 'Foundational Movement', color: 'bg-blue-500', borderColor: 'border-blue-500', textColor: 'text-blue-500' },
  { id: 3, title: 'Accountability', subtitle: 'Self-Love & Power', color: 'bg-indigo-500', borderColor: 'border-indigo-500', textColor: 'text-indigo-500' },
  { id: 4, title: 'Creativity', subtitle: 'Mental Clarity', color: 'bg-purple-500', borderColor: 'border-purple-500', textColor: 'text-purple-500' },
  { id: 5, title: 'Alignment', subtitle: 'Intentional Action', color: 'bg-pink-500', borderColor: 'border-pink-500', textColor: 'text-pink-500' },
  { id: 6, title: 'Mindfulness', subtitle: 'Energy Clearing', color: 'bg-yellow-500', borderColor: 'border-yellow-500', textColor: 'text-yellow-500' },
  { id: 7, title: 'Destiny', subtitle: 'Purpose Activation', color: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-500' },
];

interface UserProgress {
  recommendedLevel: number;
  completedLevels: number[];
  currentLevel: number;
  levelProgress: { [key: number]: number }; // Progress percentage per level
}

const RiseJourney: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(7);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    recommendedLevel: 2,
    completedLevels: [1],
    currentLevel: 2,
    levelProgress: { 1: 100, 2: 15 }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchUserProgress();
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    // TODO: Implement actual API call to get trial days remaining
    // const response = await fetch('/api/user/trial-status');
    // const data = await response.json();
    // setTrialDaysLeft(data.daysRemaining);
  };

  const fetchUserProgress = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/rise-journey/progress');
      // const data = await response.json();
      // setUserProgress(data);
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterPath = (levelId: number) => {
    // Navigate to level detail page
    window.location.href = `/rise/level/${levelId}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header & Trial Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Rise Journey</h1>
          <p className="text-lg text-gray-600">The path to higher consciousness.</p>
        </div>
        <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-lg border-2 border-orange-200 shadow-md">
          <span className="text-orange-800 font-bold text-lg">{trialDaysLeft} Days Remaining</span>
          <span className="text-orange-700 ml-2">in Free Trial</span>
        </div>
      </div>

      {/* The Journey Path */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {LEVELS.map((level, index) => {
          const isLocked = index > userProgress.currentLevel && level.id !== userProgress.recommendedLevel;
          const isRecommended = level.id === userProgress.recommendedLevel;
          const isComplete = userProgress.completedLevels.includes(level.id);
          const progress = userProgress.levelProgress[level.id] || 0;

          return (
            <div 
              key={level.id} 
              className={`relative transition-all duration-300 ${
                isLocked ? 'opacity-60' : 'hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              
              {/* Connector Line */}
              {index !== LEVELS.length - 1 && (
                <div className="absolute left-12 top-20 bottom-[-24px] w-1 bg-gradient-to-b from-gray-300 to-gray-200 -z-10 rounded-full" />
              )}

              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  {/* Visual Strip */}
                  <div className={`w-full md:w-2 h-2 md:h-auto ${level.color}`} />
                  
                  <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
                    {/* Icon/Number */}
                    <div 
                      className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${
                        isComplete 
                          ? `${level.borderColor} ${level.textColor} bg-white` 
                          : 'border-gray-300 text-gray-400 bg-gray-50'
                      } font-bold text-2xl shadow-md flex-shrink-0`}
                    >
                      {isComplete ? <CheckCircle className="w-10 h-10" /> : index + 1}
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
                        {isComplete && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 text-lg">{level.subtitle}</p>
                      
                      {/* Progress Bar within Level */}
                      {!isLocked && (
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                          <div 
                            className={`${level.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {/* Revenue/Product Recommendation */}
                      <div className="flex items-center text-sm text-gray-500 gap-2 mt-2 hover:text-gray-700 cursor-pointer transition-colors">
                        <ShoppingBag size={16} className="text-orange-500" />
                        <span>Pair with: <span className="font-semibold text-gray-700">Rise {level.title} Essentials</span></span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      {isLocked ? (
                        <button 
                          disabled 
                          className="w-full md:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-500 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="h-5 w-5" /> 
                          Locked
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEnterPath(level.id)}
                          className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                            isRecommended 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                              : 'bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {isComplete ? 'Review Path' : 'Enter Path'} 
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 border-2 border-purple-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Transform Your Life?</h3>
          <p className="text-gray-700 mb-4">
            Unlock all 7 levels and gain lifetime access to your personal growth journey.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
            Upgrade to Full Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiseJourney;
