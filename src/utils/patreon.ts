import { getBackendUrl } from './backendUrl';

export interface PatreonUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  patreonId: string;
}

export const patreonAuth = {
  getAuthUrl: (): string => {
    const backendUrl = getBackendUrl();
    return `${backendUrl}/api/auth/patreon`;
  },

  getLogoutUrl: (): string => {
    const backendUrl = getBackendUrl();
    return `${backendUrl}/api/auth/logout`;
  },

  getUser: async (): Promise<PatreonUser | null> => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },
};

