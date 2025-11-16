import { useState, useEffect } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';

export interface ExternalResource {
  id: string;
  title: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

// Generic hook for per-user external resources (replaces Google Docs usage)
export function useExternalResources() {
  const [resources, setResources] = useState<ExternalResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/resources`, {
        method: 'GET',
      });

      const data = await response.json();
      setResources(data.resources || []);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch documents';
      setError(message);
      console.error('Error fetching docs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createResource = async (title: string, url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/resources`, {
        method: 'POST',
        body: JSON.stringify({ title, url }),
      });

      const data = await response.json();
      await fetchResources(); // Refresh list
      return data.resource;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateResource = async (id: string, updates: Partial<Pick<ExternalResource, 'title' | 'url'>>) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/resources/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      await fetchResources();
      return data.resource;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      await fetchWithErrorHandling(`${backendUrl}/api/resources/${id}`, {
        method: 'DELETE',
      });
      await fetchResources();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    isLoading,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
  };
}

