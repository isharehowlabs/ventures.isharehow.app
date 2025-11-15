import { useState } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

export interface FigmaFile {
  id: string;
  name: string;
  thumbnail_url?: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description?: string;
}

export interface FigmaToken {
  id: string;
  name: string;
  description?: string;
  styleType: string;
}

export function useFigma() {
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [components, setComponents] = useState<FigmaComponent[]>([]);
  const [tokens, setTokens] = useState<FigmaToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/figma/files`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Authentication required');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch Figma files (${response.status})`);
      }

      const data = await response.json();
      setFiles(data.projects || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching Figma files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFile = async (fileId: string) => {
    // Validate file ID before making request
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '' || fileId === 'undefined' || fileId === 'null') {
      const error = new Error('Invalid file ID: file ID is required and must be a valid string');
      setError(error.message);
      throw error;
    }

    const validFileId = fileId.trim();
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/figma/file/${validFileId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Failed to fetch Figma file (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.file;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch Figma file';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComponents = async (fileId: string) => {
    // Validate file ID before making request
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '' || fileId === 'undefined' || fileId === 'null') {
      const error = new Error('Invalid file ID: file ID is required and must be a valid string');
      setError(error.message);
      throw error;
    }

    const validFileId = fileId.trim();
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/figma/file/${validFileId}/components`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Failed to fetch Figma components (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setComponents(data.components || []);
      return data.components;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch Figma components';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokens = async (fileId: string) => {
    // Validate file ID before making request
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '' || fileId === 'undefined' || fileId === 'null') {
      const error = new Error('Invalid file ID: file ID is required and must be a valid string');
      setError(error.message);
      throw error;
    }

    const validFileId = fileId.trim();
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/figma/file/${validFileId}/tokens`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `Failed to fetch Figma tokens (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setTokens(data.tokens || []);
      return data.tokens;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch Figma tokens';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files,
    components,
    tokens,
    isLoading,
    error,
    fetchFiles,
    fetchFile,
    fetchComponents,
    fetchTokens,
  };
}

