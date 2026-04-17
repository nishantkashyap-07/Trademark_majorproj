import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/lib/db-service';
import { sendOtpEmail } from '@/lib/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const dbService = new DatabaseService();

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    const saveResult = await dbService.saveOtp(email, otp);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    // Send OTP via email
    const emailResult = await sendOtpEmail(email, otp);
    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
