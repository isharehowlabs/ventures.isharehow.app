// Wellness API utility functions

const getBackendUrl = () => {
  if (typeof window === 'undefined') return '';
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';
};

export interface Aura {
  id: string;
  userId: string;
  auraType: string;
  value: number;
  updatedAt: string;
}

export interface AuraUpdate {
  auraType: string;
  value: number;
}

export interface Activity {
  id: string;
  userId: string;
  activityType: string;
  activityName: string;
  completed: boolean;
  completionDate: string;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentProgress: number;
  deadline?: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementKey: string;
  unlockedAt: string;
}

// Fetch all auras for the current user
export const fetchAuras = async (): Promise<Aura[]> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/aura`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auras: ${response.statusText}`);
  }

  const data = await response.json();
  return data.auras || [];
};

// Update auras (batch update)
export const updateAuras = async (updates: AuraUpdate[]): Promise<Aura[]> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/aura`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ auras: updates }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update auras: ${response.statusText}`);
  }

  const data = await response.json();
  return data.auras || [];
};

// Log an activity
export const logActivity = async (
  activityType: string,
  activityName: string,
  notes?: string
): Promise<Activity> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/activities`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activity_type: activityType,
      activity_name: activityName,
      notes: notes || '',
      completed: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to log activity: ${response.statusText}`);
  }

  const data = await response.json();
  return data.activity;
};

// Fetch activities
export const fetchActivities = async (filters?: {
  type?: string;
  limit?: number;
}): Promise<Activity[]> => {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(
    `${getBackendUrl()}/api/wellness/activities?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }

  const data = await response.json();
  return data.activities || [];
};

// Fetch goals
export const fetchGoals = async (): Promise<Goal[]> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/goals`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch goals: ${response.statusText}`);
  }

  const data = await response.json();
  return data.goals || [];
};

// Create goal
export const createGoal = async (goal: {
  title: string;
  description: string;
  category: string;
  targetValue: number;
  deadline?: string;
}): Promise<Goal> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/goals`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    throw new Error(`Failed to create goal: ${response.statusText}`);
  }

  const data = await response.json();
  return data.goal;
};

// Update goal
export const updateGoal = async (
  goalId: string,
  updates: Partial<Goal>
): Promise<Goal> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/goals/${goalId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update goal: ${response.statusText}`);
  }

  const data = await response.json();
  return data.goal;
};

// Delete goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/goals/${goalId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete goal: ${response.statusText}`);
  }
};

// Fetch achievements
export const fetchAchievements = async (): Promise<Achievement[]> => {
  const response = await fetch(`${getBackendUrl()}/api/wellness/achievements`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch achievements: ${response.statusText}`);
  }

  const data = await response.json();
  return data.achievements || [];
};

// Unlock achievement
export const unlockAchievement = async (achievementKey: string): Promise<Achievement> => {
  const response = await fetch(
    `${getBackendUrl()}/api/wellness/achievements/${achievementKey}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to unlock achievement: ${response.statusText}`);
  }

  const data = await response.json();
  return data.achievement;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
