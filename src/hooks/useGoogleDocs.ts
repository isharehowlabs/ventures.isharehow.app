import { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

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
      const response = await fetch(`${backendUrl}/api/docs`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocs(data.documents || []);
    } catch (err: any) {
      setError(err.message);
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
      const response = await fetch(`${backendUrl}/api/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

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
      const response = await fetch(`${backendUrl}/api/docs/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

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

