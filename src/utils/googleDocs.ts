import { getBackendUrl } from './backendUrl';

export const googleDocsApi = {
  list: async () => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/docs`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to list documents');
    return response.json();
  },

  get: async (id: string) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/docs/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get document');
    return response.json();
  },

  create: async (title: string, content?: string) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },
};

