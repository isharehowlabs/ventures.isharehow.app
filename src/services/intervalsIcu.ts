// Intervals.icu API service with CORS-safe backend proxy

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ventures-isharehow-app.onrender.com';

// Storage keys
const API_KEY_STORAGE = 'intervals_api_key';
const ATHLETE_ID_STORAGE = 'intervals_athlete_id';

// Type definitions
export interface IntervalsActivity {
  id: string;
  start_date_local: string;
  type: string;
  name?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  icu_training_load?: number;
  icu_intensity?: number;
  average_speed?: number;
  max_speed?: number;
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
}

export interface IntervalsWellness {
  id: string;
  date: string;
  weight?: number;
  restingHR?: number;
  hrv?: number;
  mentalEnergy?: number;
  motivation?: number;
  sleep?: {
    duration?: number;
    quality?: number;
  };
  wellness?: {
    fatigue?: number;
    mood?: number;
    stress?: number;
    soreness?: number;
  };
  rpe?: number;
  feel?: number;
}

export interface IntervalsAthlete {
  id: string;
  name?: string;
  ftp?: number;
  ftpHistory?: Array<{
    value: number;
    date: string;
  }>;
  weight?: number;
  max_hr?: number;
  resting_hr?: number;
}

// Storage utilities
export const saveApiCredentials = (apiKey: string, athleteId: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    localStorage.setItem(ATHLETE_ID_STORAGE, athleteId);
  }
};

export const getApiCredentials = (): { apiKey: string | null; athleteId: string | null } => {
  if (typeof window === 'undefined') {
    return { apiKey: null, athleteId: null };
  }
  return {
    apiKey: localStorage.getItem(API_KEY_STORAGE),
    athleteId: localStorage.getItem(ATHLETE_ID_STORAGE),
  };
};

export const clearApiCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(ATHLETE_ID_STORAGE);
  }
};

// API request helper
const makeProxyRequest = async (endpoint: string, params: Record<string, string> = {}) => {
  const { apiKey, athleteId } = getApiCredentials();
  
  if (!apiKey || !athleteId) {
    throw new Error('API credentials not configured');
  }

  const queryParams = new URLSearchParams({ 
    athleteId, 
    ...params 
  }).toString();
  
  const url = `${API_BASE}/api/intervals-proxy/${endpoint}?${queryParams}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Intervals-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Intervals.icu API error: ${response.status} ${errorText}`);
  }

  return response.json();
};

// Fetch athlete profile with FTP
export const getAthleteProfile = async (): Promise<IntervalsAthlete> => {
  const data = await makeProxyRequest('athlete');
  
  return {
    id: data.id,
    name: data.name,
    ftp: data.ftp,
    ftpHistory: data.ftpHistory || [],
    weight: data.weight,
    max_hr: data.max_hr,
    resting_hr: data.resting_hr,
  };
};

// Fetch activities
export const getActivities = async (oldest?: string): Promise<IntervalsActivity[]> => {
  const params: Record<string, string> = {};
  if (oldest) {
    params.oldest = oldest;
  }
  
  const data = await makeProxyRequest('activities', params);
  
  return Array.isArray(data) ? data.map((activity: any) => ({
    id: activity.id,
    start_date_local: activity.start_date_local,
    type: activity.type,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    icu_training_load: activity.icu_training_load,
    icu_intensity: activity.icu_intensity,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    powerData: {
      avgPower: activity.average_watts,
      maxPower: activity.max_watts,
      normalizedPower: activity.weighted_average_watts,
      work: activity.work,
    },
    hrData: {
      avgHr: activity.average_heartrate,
      maxHr: activity.max_heartrate,
    },
  })) : [];
};

// Fetch wellness data
export const getWellness = async (oldest?: string): Promise<IntervalsWellness[]> => {
  const params: Record<string, string> = {};
  if (oldest) {
    params.oldest = oldest;
  }
  
  const data = await makeProxyRequest('wellness', params);
  
  return Array.isArray(data) ? data.map((entry: any) => ({
    id: entry.id,
    date: entry.id, // wellness ID is the date string
    weight: entry.weight,
    restingHR: entry.restingHR,
    hrv: entry.hrv,
    mentalEnergy: entry.mentalEnergy,
    motivation: entry.motivation,
    sleep: {
      duration: entry.sleepSecs ? entry.sleepSecs / 3600 : undefined,
      quality: entry.sleepQuality,
    },
    wellness: {
      fatigue: entry.fatigue,
      mood: entry.mood,
      stress: entry.stress,
      soreness: entry.soreness,
    },
    rpe: entry.ctl,
    feel: entry.atl,
  })) : [];
};

export default {
  saveApiCredentials,
  getApiCredentials,
  clearApiCredentials,
  getAthleteProfile,
  getActivities,
  getWellness,
};
