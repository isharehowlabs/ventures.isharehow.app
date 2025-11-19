import { useState } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';

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
  const [likedComponents, setLikedComponents] = useState<string[]>([]);
  const [savedComponents, setSavedComponents] = useState<string[]>([]);
  const [componentStatuses, setComponentStatuses] = useState<Record<string, { liked: boolean; saved: boolean }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/files`, {
        method: 'GET',
      });

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
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/file/${validFileId}`, {
        method: 'GET',
      });

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
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/file/${validFileId}/components`, {
        method: 'GET',
      });

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
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/file/${validFileId}/tokens`, {
        method: 'GET',
      });

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

  const likeComponent = async (componentId: string, liked: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/component/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId, liked }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setComponentStatuses((prev) => ({
          ...prev,
          [componentId]: { ...prev[componentId], liked },
        }));
        
        // Update liked components list
        if (liked) {
          setLikedComponents((prev) => (prev.includes(componentId) ? prev : [...prev, componentId]));
        } else {
          setLikedComponents((prev) => prev.filter((id) => id !== componentId));
        }
      }
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to like component';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveComponent = async (componentId: string, saved: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/component/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId, saved }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setComponentStatuses((prev) => ({
          ...prev,
          [componentId]: { ...prev[componentId], saved },
        }));
        
        // Update saved components list
        if (saved) {
          setSavedComponents((prev) => (prev.includes(componentId) ? prev : [...prev, componentId]));
        } else {
          setSavedComponents((prev) => prev.filter((id) => id !== componentId));
        }
      }
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save component';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikedComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/components/liked`, {
        method: 'GET',
      });

      const data = await response.json();
      setLikedComponents(data.componentIds || []);
      return data.componentIds || [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch liked components';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/components/saved`, {
        method: 'GET',
      });

      const data = await response.json();
      setSavedComponents(data.componentIds || []);
      return data.componentIds || [];
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch saved components';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComponentStatus = async (componentId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/figma/component/${componentId}/status`, {
        method: 'GET',
      });

      const data = await response.json();
      setComponentStatuses((prev) => ({
        ...prev,
        [componentId]: { liked: data.liked || false, saved: data.saved || false },
      }));
      return data;
    } catch (err: any) {
      console.error('Error fetching component status:', err);
      return { liked: false, saved: false };
    }
  };

  return {
    files,
    components,
    tokens,
    likedComponents,
    savedComponents,
    componentStatuses,
    isLoading,
    error,
    fetchFiles,
    fetchFile,
    fetchComponents,
    fetchTokens,
    likeComponent,
    saveComponent,
    fetchLikedComponents,
    fetchSavedComponents,
    fetchComponentStatus,
  };
}

