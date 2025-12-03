/**
 * Intervals.icu API Service
 * Handles frontend communication with backend Intervals.icu endpoints
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';

export interface IntervalsActivityData {
  id: string;
  activityId: string;
  activityDate: string;
  activityName: string;
  activityType: string;
  rpe?: number;
  feel?: number;
  duration?: number;
  distance?: number;
  powerData?: {
    avgPower?: number;
    maxPower?: number;
    normalizedPower?: number;
    work?: number;
  };
  hrData?: {
    avgHr?: number;
    maxHr?: number;
  };
  syncedAt: string;
}

export interface IntervalsWellnessMetrics {
  id: string;
  metricDate: string;
  hrv?: number;
  restingHr?: number;
  weight?: number;
  sleepSeconds?: number;
  sleepQuality?: number;
  fatigue?: number;
  mood?: number;
  stress?: number;
  soreness?: number;
  syncedAt: string;
}

export interface APIKey {
  id: string;
  serviceName: string;
  hasKey: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save Intervals.icu API key
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/user/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      serviceName: 'intervals_icu',
      apiKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save API key');
  }
}

/**
 * Test connection to Intervals.icu with the saved API key
 */
export async function testConnection(): Promise<boolean> {
  try {
    const keys = await getApiKeys();
    return keys.some(k => k.serviceName === 'intervals_icu' && k.hasKey);
  } catch (error) {
    return false;
  }
}

/**
 * Get list of configured API keys
 */
export async function getApiKeys(): Promise<APIKey[]> {
  const response = await fetch(`${BACKEND_URL}/api/user/api-keys`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get API keys');
  }

  const data = await response.json();
  return data.apiKeys || [];
}

/**
 * Delete an API key
 */
export async function deleteApiKey(serviceName: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/user/api-keys/${serviceName}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete API key');
  }
}

/**
 * Trigger data sync from Intervals.icu
 */
export async function syncData(daysBack: number = 30): Promise<{ activitiesSynced: number; wellnessMetricsSynced: number }> {
  const response = await fetch(`${BACKEND_URL}/api/wellness/intervals/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ daysBack }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync data');
  }

  return await response.json();
}

/**
 * Get imported activity data
 */
export async function getActivities(daysBack: number = 30): Promise<IntervalsActivityData[]> {
  const response = await fetch(`${BACKEND_URL}/api/wellness/intervals/activities?daysBack=${daysBack}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get activities');
  }

  const data = await response.json();
  return data.activities || [];
}

/**
 * Get imported wellness metrics
 */
export async function getWellnessMetrics(daysBack: number = 30): Promise<IntervalsWellnessMetrics[]> {
  const response = await fetch(`${BACKEND_URL}/api/wellness/intervals/wellness?daysBack=${daysBack}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get wellness metrics');
  }

  const data = await response.json();
  return data.metrics || [];
}
