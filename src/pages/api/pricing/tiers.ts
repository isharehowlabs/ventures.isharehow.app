import { NextApiRequest, NextApiResponse } from 'next';

const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    priceAnnual: 3830,
    description: 'Perfect for small businesses, startups, and individual creators',
    color: '#22D3EE',
    features: [
      '10-20 requests per month',
      'Standard turnaround (48-72 hours)',
      'Email support',
      'Basic design services',
      'Access to Co-Work Dashboard',
      'Access to Rise Dashboard',
      'Basic CaaS features',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1499,
    priceAnnual: 14390,
    description: 'Ideal for growing businesses, agencies, and projects',
    color: '#8b5cf6',
    popular: true,
    features: [
      'Unlimited requests',
      'Priority turnaround (24-48 hours)',
      'Dedicated project manager',
      'Advanced design services',
      'Full CaaS access',
      'API integrations',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9000,
    priceAnnual: 86400,
    description: 'For large enterprises and agencies with high volume needs',
    color: '#f59e0b',
    features: [
      'Unlimited requests and revisions',
      'Same-day turnaround',
      'Dedicated team',
      'Custom integrations',
      'White-label options',
      'Advanced security features',
      'SLA guarantees',
      'Custom contract terms',
      'Platform/service fee included',
    ],
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (id) {
      const tier = pricingTiers.find((t) => t.id === id);
      if (!tier) {
        return res.status(404).json({ message: 'Tier not found' });
      }
      return res.status(200).json(tier);
    }

    return res.status(200).json(pricingTiers);
  } catch (error: any) {
    console.error('Error fetching pricing tiers:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

