import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/lib/db-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Verify Authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { walletAddress } = req.body;

    console.log(`[Profile Sync] Syncing wallet ${walletAddress} for user ${decoded.id}`);

    if (!walletAddress || !walletAddress.startsWith('0x')) {
      return res.status(400).json({ message: 'Invalid wallet address' });
    }

    const dbService = new DatabaseService();

    // 2. Update user profile
    const result = await dbService.createOrUpdateUser(decoded.id, {
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // 3. Fetch updated user
    const userResult = await dbService.getUser(decoded.id);
    const userData = userResult.data as any;

    if (!userData) {
      throw new Error('User not found after update');
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        walletAddress: userData.walletAddress,
        organization: userData.organization,
      }
    });

  } catch (error: any) {
    console.error('Update Profile API Error:', error);
    return res.status(401).json({ message: 'Invalid token or update failed' });
  }
}