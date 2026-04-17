import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/lib/db-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  const dbService = new DatabaseService();

  try {
    // 1. Verify OTP
    const verifyResult = await dbService.verifyOtp(email, otp);
    if (!verifyResult.success) {
      return res.status(401).json({ message: verifyResult.error });
    }

    let user: any = null;

    // 2. Determine if it's a Login or Finalizing Registration
    const userResult = await dbService.getUserByEmail(email);
    
    if (userResult.success) {
      // It's a login
      user = userResult.data;
    } else {
      // Check if there's a pending registration
      const pendingResult = await dbService.getPendingUser(email);
      if (pendingResult.success) {
        // It's a new registration - create the user
        const pendingData = pendingResult.data;
        
        // Generate a pseudo-random wallet address placeholder if not provided, 
        // or let the user link it later. For now, we'll use email hash as ID.
        const userId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        const createResult = await dbService.createOrUpdateUser(userId, {
          email: email.toLowerCase(),
          name: pendingData.fullName,
          organization: pendingData.organization,
          role: pendingData.role,
          emailVerified: true,
        });

        if (!createResult.success) {
          throw new Error('Failed to finalize user registration');
        }

        // Fetch the newly created user
        const newUserResult = await dbService.getUser(userId);
        user = newUserResult.data;

        // Cleanup pending data
        await dbService.deletePendingUser(email);
      } else {
        return res.status(404).json({ message: 'No active session or registration found for this email' });
      }
    }

    // 3. Generate JWT Session
    const token = jwt.sign(
      { 
        id: user.id || user.address, 
        email: user.email, 
        role: user.role,
        organization: user.organization 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Return user and token
    return res.status(200).json({
      success: true,
      user: {
        id: user.id || user.address,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
      },
      token
    });

  } catch (error: any) {
    console.error('Verify Auth API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
