import { useState } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

export interface CodeLink {
  componentId: string;
  filePath: string;
  componentName: string;
  linkedAt: string;
}

export interface DesignToken {
  name: string;
  value: string;
  type: string;
  updatedAt: string;
}

export function useMCP() {
  const [links, setLinks] = useState<CodeLink[]>([]);
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkComponentToCode = async (
    figmaComponentId: string,
    codeFilePath: string,
    codeComponentName: string,
    figmaFileId?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/mcp/figma-to-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          figmaComponentId,
          codeFilePath,
          codeComponentName,
          figmaFileId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to link component');
      }

      const data = await response.json();
      await fetchCodeLinks();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCodeLinks = async (figmaFileId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const url = new URL(`${backendUrl}/api/mcp/code-links`);
      if (figmaFileId) {
        url.searchParams.append('figmaFileId', figmaFileId);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch code links');
      }

      const data = await response.json();
      setLinks(data.links || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const syncTokens = async (tokens: DesignToken[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/mcp/sync-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tokens }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync tokens');
      }

      const data = await response.json();
      await fetchTokens();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/mcp/tokens`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data.tokens || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async (componentId: string, language?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/mcp/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ componentId, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    links,
    tokens,
    isLoading,
    error,
    linkComponentToCode,
    fetchCodeLinks,
    syncTokens,
    fetchTokens,
    generateCode,
  };
}

