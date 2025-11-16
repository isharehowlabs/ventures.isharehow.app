import { useState, useEffect } from 'react';
import { getBackendUrl, fetchWithErrorHandling } from '../utils/backendUrl';

export interface GoogleDoc {
  id: string;
  name: string;
  modifiedTime?: string;
  createdTime?: string;
}

export function useGoogleDocs() {
  const [docs, setDocs] = useState<GoogleDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/docs`, {
        method: 'GET',
      });

      const data = await response.json();
      setDocs(data.documents || []);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch documents';
      setError(message);
      console.error('Error fetching docs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createDoc = async (title: string, content?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/docs`, {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();
      await fetchDocs(); // Refresh list
      return data.document;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDoc = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/docs/${id}`, {
        method: 'GET',
      });

      const data = await response.json();
      return data.document;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return {
    docs,
    isLoading,
    error,
    fetchDocs,
    createDoc,
    getDoc,
  };
}

