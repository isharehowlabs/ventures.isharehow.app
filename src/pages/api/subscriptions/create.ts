import { NextApiRequest, NextApiResponse } from 'next';
import { getBackendUrl } from '../../../utils/backendUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      tier,
      billingCycle,
      accountData,
      paymentData,
    } = req.body;

    // Validate required fields
    if (!tier || !billingCycle || !accountData || !paymentData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate account data
    if (!accountData.email || !accountData.password || !accountData.fullName) {
      return res.status(400).json({ message: 'Invalid account data' });
    }

    // Validate payment data
    if (!paymentData.acceptTerms || !paymentData.acceptPrivacy) {
      return res.status(400).json({ message: 'Terms and privacy policy must be accepted' });
    }

    // TODO: Integrate with backend API
    // For now, return a mock response
    // In production, this should:
    // 1. Create user account in database
    // 2. Process payment (PayPal/Stripe)
    // 3. Create subscription record
    // 4. Send welcome email
    // 5. Grant access to tier features

    const backendUrl = getBackendUrl();
    
    // Try to call backend API
    try {
      const response = await fetch(`${backendUrl}/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          billing_cycle: billingCycle,
          account_data: accountData,
          payment_data: paymentData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      } else {
        const error = await response.json();
        return res.status(response.status).json(error);
      }
    } catch (backendError: any) {
      // If backend is not available, return mock success for development
      console.warn('Backend API not available, returning mock response:', backendError.message);
      
      return res.status(200).json({
        success: true,
        subscription: {
          id: `sub_${Date.now()}`,
          tier,
          billing_cycle: billingCycle,
          status: 'active',
          user_id: `user_${Date.now()}`,
          created_at: new Date().toISOString(),
        },
        message: 'Subscription created successfully (mock response - backend integration pending)',
      });
    }
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

