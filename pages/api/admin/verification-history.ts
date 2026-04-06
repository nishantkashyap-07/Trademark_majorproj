import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { adminAddress } = req.query;

    if (!adminAddress) {
      return res.status(400).json({ success: false, error: 'Admin address required' });
    }

    // Query verification history
    const historyRef = collection(db, 'verificationHistory');
    const q = query(
      historyRef,
      where('adminAddress', '==', adminAddress),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error: any) {
    console.error('Error fetching verification history:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch verification history'
    });
  }
}
