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
