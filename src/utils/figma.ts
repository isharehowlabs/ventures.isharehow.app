import { getBackendUrl } from './backendUrl';

export const figmaApi = {
  getFiles: async () => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/figma/files`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch Figma files');
    return response.json();
  },

  getFile: async (fileId: string) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/figma/file/${fileId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch Figma file');
    return response.json();
  },
};

