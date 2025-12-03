/**
 * Intervals.icu API Service
 * Uses backend proxy to bypass CORS restrictions
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';
const STORAGE_KEY = 'intervals_icu_api_key';

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

/**
 * Get API key from localStorage
 */
function getApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get API key from localStorage:', error);
    return null;
  }
}

/**
 * Parse API key to get athlete ID
 */
function getAthleteId(): string | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const parts = apiKey.split(':');
  if (parts.length !== 2) return null;
  
  return parts[1];
}

/**
 * Make request through backend proxy
 */
async function proxyRequest<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('No API key configured. Please add your Intervals.icu API key above.');
  }

  const response = await fetch(`${BACKEND_URL}/api/intervals-proxy${endpoint}`, {
    headers: {
      'X-Intervals-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Intervals.icu settings.');
    }
    if (response.status === 403) {
      throw new Error('Access forbidden. Please verify your API key has the correct permissions.');
    }
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  return response.json();
}

/**
 * Get activities from Intervals.icu via backend proxy
 */
export async function getActivities(daysBack: number = 30): Promise<IntervalsActivityData[]> {
  try {
    const athleteId = getAthleteId();
    if (!athleteId) {
      throw new Error('Invalid API key format. Expected: API_KEY_xxxxx:athlete_id');
    }

    const oldest = new Date();
    oldest.setDate(oldest.getDate() - daysBack);
    const oldestStr = oldest.toISOString().split('T')[0];

    const activities = await proxyRequest<any[]>(`/activities?athleteId=${athleteId}&oldest=${oldestStr}`);
    
    return activities.map(a => ({
      id: a.id,
      activityId: a.id,
      activityDate: a.start_date_local?.split('T')[0] || '',
      activityName: a.name || 'Activity',
      activityType: a.type || 'ride',
      rpe: a.icu_rpe,
      feel: a.icu_feel,
      duration: a.moving_time,
      distance: a.distance,
      powerData: {
        avgPower: a.average_power,
        maxPower: a.max_power,
        normalizedPower: a.normalized_power,
        work: a.work,
      },
      hrData: {
        avgHr: a.average_hr,
        maxHr: a.max_hr,
      },
      syncedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    throw error;
  }
}

/**
 * Get wellness metrics from Intervals.icu via backend proxy
 */
export async function getWellnessMetrics(daysBack: number = 30): Promise<IntervalsWellnessMetrics[]> {
  try {
    const athleteId = getAthleteId();
    if (!athleteId) {
      throw new Error('Invalid API key format. Expected: API_KEY_xxxxx:athlete_id');
    }

    const oldest = new Date();
    oldest.setDate(oldest.getDate() - daysBack);
    const oldestStr = oldest.toISOString().split('T')[0];

    const wellness = await proxyRequest<any[]>(`/wellness?athleteId=${athleteId}&oldest=${oldestStr}`);
    
    return wellness.map(w => ({
      id: w.id,
      metricDate: w.id,
      hrv: w.hrv,
      restingHr: w.restingHR,
      weight: w.weight,
      sleepSeconds: w.sleepSecs,
      sleepQuality: w.sleepQuality,
      fatigue: w.fatigue,
      mood: w.mood,
      stress: w.stress,
      soreness: w.soreness,
      syncedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch wellness metrics:', error);
    throw error;
  }
}

/**
 * Sync data from Intervals.icu
 */
export async function syncData(daysBack: number = 30): Promise<{ activitiesSynced: number; wellnessMetricsSynced: number }> {
  try {
    const [activities, wellness] = await Promise.all([
      getActivities(daysBack),
      getWellnessMetrics(daysBack),
    ]);

    return {
      activitiesSynced: activities.length,
      wellnessMetricsSynced: wellness.length,
    };
  } catch (error) {
    console.error('Failed to sync data:', error);
    throw error;
  }
}
