import { getBackendUrl } from './backendUrl';

export const mcpApi = {
  linkComponent: async (figmaComponentId: string, codeFilePath: string, codeComponentName: string) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/mcp/figma-to-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ figmaComponentId, codeFilePath, codeComponentName }),
    });
    if (!response.ok) throw new Error('Failed to link component');
    return response.json();
  },

  getCodeLinks: async () => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/mcp/code-links`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get code links');
    return response.json();
  },

  syncTokens: async (tokens: any[]) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/mcp/sync-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tokens }),
    });
    if (!response.ok) throw new Error('Failed to sync tokens');
    return response.json();
  },
};

