import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/lib/db-service';
import { sendOtpEmail } from '@/lib/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, email, organization, role } = req.body;

  if (!fullName || !email || !organization || !role) {
    return res.status(400).json({ message: 'Missing required onboarding data' });
  }

  const dbService = new DatabaseService();

  try {
    // Check if user already exists
    const userResult = await dbService.getUserByEmail(email);
    if (userResult.success) {
      return res.status(409).json({ message: 'Email already registered. Please login instead.' });
    }

    // Save pending user data
    const savePendingResult = await dbService.savePendingUser(email, { fullName, organization, role });
    if (!savePendingResult.success) {
      throw new Error(savePendingResult.error);
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const saveOtpResult = await dbService.saveOtp(email, otp);
    if (!saveOtpResult.success) {
      throw new Error(saveOtpResult.error);
    }

    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return res.status(200).json({ success: true, message: 'Identity verification code dispatched' });
  } catch (error: any) {
    console.error('Registration Init API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
