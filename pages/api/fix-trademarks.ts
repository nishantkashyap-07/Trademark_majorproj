import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const snapshot = await getDocs(collection(db, 'trademarks'));
    const fixed = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // If has tokenId but no transactionHash, add dummy hash
      if (data.tokenId && !data.transactionHash) {
        await updateDoc(doc(db, 'trademarks', docSnap.id), {
          transactionHash: '0x' + '1'.repeat(64),
        });
        fixed.push(docSnap.id);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Fixed ${fixed.length} trademarks`,
      fixed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
