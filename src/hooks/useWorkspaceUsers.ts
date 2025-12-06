import { useState, useEffect } from 'react';
import axios from 'axios';

interface WorkspaceUser {
  id: string;
  name: string;
  email?: string;
}

export const useWorkspaceUsers = () => {
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        // Use Next.js environment variable or fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const response = await axios.get(
          `${apiUrl}/api/users/workspace`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setUsers(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching workspace users:', err);
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
