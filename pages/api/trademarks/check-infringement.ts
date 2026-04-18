import type { NextApiRequest, NextApiResponse } from 'next';
import { runInfringementCheck } from '@/lib/infringement-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { slogan, category } = req.body;

  if (!slogan || typeof slogan !== 'string' || slogan.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'A valid slogan is required (minimum 2 characters)',
    });
  }

  if (!category || typeof category !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'A category is required for category-aware matching',
    });
  }

  try {
    const result = await runInfringementCheck(slogan.trim(), category.trim());
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('[IP Guard API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Infringement check failed. Please try again.',
    });
  }
}
