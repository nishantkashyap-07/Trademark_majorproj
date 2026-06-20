/**
 * GET /api/cooldown/check?address=0x...
 * Returns the current cooldown status for the given wallet address.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { cooldownService } from '@/lib/cooldown-service';
import { withApi } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Wallet address is required. Usage: /api/cooldown/check?address=0x...',
    });
  }

  try {
    const status = await cooldownService.getStatus(address);

    return res.status(200).json({
      success: true,
      data: {
        allowed: status.allowed,
        registrationsThisWeek: status.registrationsThisWeek,
        cooldownEndsAt: status.cooldownEndsAt?.toISOString() ?? null,
        remainingMs: status.remainingMs,
        remainingFormatted: status.remainingFormatted,
        isBanned: status.isBanned,
      },
    });
  } catch (error: any) {
    console.error('Cooldown check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to check cooldown status',
    });
  }
}

export default withApi(handler);
