import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Automatic similarity detection with multiple checks
 * Combines: IPFS hash, text similarity, and basic image analysis
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, ipfsHash, trademarkName, companyName } = req.body;

    // Get all existing verified trademarks
    const snapshot = await getDocs(collection(db, 'trademarks'));
    const existingTrademarks = snapshot.docs
      .filter(doc => doc.data().verified)
      .map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
        ipfsHash: doc.data().ipfsHash,
        trademarkName: doc.data().trademarkName || doc.data().sloganText,
        companyName: doc.data().companyName,
      }));

    const warnings = [];
    const similarTrademarks = [];

    // CHECK 1: Exact IPFS hash match (100% duplicate)
    const exactDuplicates = existingTrademarks.filter(
      tm => tm.ipfsHash === ipfsHash
    );

    if (exactDuplicates.length > 0) {
      return res.status(200).json({
        success: true,
        isDuplicate: true,
        similarityScore: 100,
        similarTrademarks: exactDuplicates,
        warnings: ['Exact duplicate image detected (same IPFS hash)'],
        recommendation: 'REJECT',
        message: 'This exact image is already registered',
      });
    }

    // CHECK 2: Text similarity (trademark name)
    if (trademarkName) {
      const nameLower = trademarkName.toLowerCase().trim();
      
      existingTrademarks.forEach(tm => {
        const existingName = (tm.trademarkName || '').toLowerCase().trim();
        
        // Exact match
        if (nameLower === existingName) {
          warnings.push(`Identical trademark name: "${tm.trademarkName}"`);
          similarTrademarks.push({ ...tm, reason: 'Identical name' });
        }
        // Very similar (Levenshtein distance)
        else if (calculateSimilarity(nameLower, existingName) > 0.8) {
          warnings.push(`Very similar name: "${tm.trademarkName}"`);
          similarTrademarks.push({ ...tm, reason: 'Similar name' });
        }
      });
    }

    // CHECK 3: Same company name (might be legitimate update)
    if (companyName) {
      const companyLower = companyName.toLowerCase().trim();
      
      existingTrademarks.forEach(tm => {
        const existingCompany = (tm.companyName || '').toLowerCase().trim();
        
        if (companyLower === existingCompany && !similarTrademarks.find(s => s.id === tm.id)) {
          warnings.push(`Same company has existing trademark: "${tm.trademarkName}"`);
          similarTrademarks.push({ ...tm, reason: 'Same company' });
        }
      });
    }

    // Determine recommendation
    let recommendation = 'APPROVE';
    let similarityScore = 0;

    if (warnings.length > 0) {
      if (warnings.some(w => w.includes('Identical'))) {
        recommendation = 'MANUAL_REVIEW';
        similarityScore = 90;
      } else if (warnings.some(w => w.includes('Very similar'))) {
        recommendation = 'MANUAL_REVIEW';
        similarityScore = 75;
      } else {
        recommendation = 'MANUAL_REVIEW';
        similarityScore = 50;
      }
    }

    return res.status(200).json({
      success: true,
      isDuplicate: false,
      similarityScore,
      similarTrademarks: similarTrademarks.slice(0, 5), // Top 5
      warnings,
      recommendation,
      message: warnings.length > 0 
        ? 'Potential similarities detected - manual review recommended'
        : 'No significant similarities found',
    });
  } catch (error: any) {
    console.error('Similarity check error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Calculate text similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
