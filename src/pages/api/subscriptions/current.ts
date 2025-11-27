import { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '../../../utils/backendUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backendUrl = getBackendUrl();

    try {
      const response = await fetch(`${backendUrl}/api/subscriptions/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT authentication
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      } else {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
    } catch (backendError: any) {
      console.warn('Backend API not available:', backendError.message);
      return res.status(404).json({ message: 'No active subscription found' });
    }
  } catch (error: any) {
    console.error('Error fetching current subscription:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

