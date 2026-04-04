import { useState, useEffect } from 'react';

interface SimilarityWarningProps {
  trademarkName: string;
  companyName: string;
  ipfsHash: string;
}

export default function SimilarityWarning({ trademarkName, companyName, ipfsHash }: SimilarityWarningProps) {
  const [similarityData, setSimilarityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSimilarity();
  }, [trademarkName, companyName, ipfsHash]);

  const checkSimilarity = async () => {
    try {
      const response = await fetch('/api/check-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipfsHash,
          trademarkName,
          companyName,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSimilarityData(data);
      }
    } catch (error) {
      console.error('Similarity check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Checking for similarities...</span>
        </div>
      </div>
    );
  }

  if (!similarityData || similarityData.warnings.length === 0) {
    return (
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-900">No Similarities Detected</span>
        </div>
        <p className="text-xs text-green-700 mt-1">Automatic checks passed. Safe to approve.</p>
      </div>
    );
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'REJECT': return 'red';
      case 'MANUAL_REVIEW': return 'yellow';
      default: return 'green';
    }
  };

  const color = getRecommendationColor(similarityData.recommendation);

  return (
    <div className={`bg-${color}-50 rounded-xl p-4 border border-${color}-200`}>
      <div className="flex items-start gap-3">
        <svg className={`w-5 h-5 text-${color}-600 flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-semibold text-${color}-900`}>
              {similarityData.isDuplicate ? '🚫 Duplicate Detected' : '⚠️ Similarity Warning'}
            </h4>
            <span className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs font-medium rounded`}>
              {similarityData.similarityScore}% Similar
            </span>
          </div>

          <div className="space-y-2">
            {similarityData.warnings.map((warning: string, idx: number) => (
              <div key={idx} className={`text-xs text-${color}-800 flex items-start gap-2`}>
                <span className="flex-shrink-0">•</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>

          {similarityData.similarTrademarks && similarityData.similarTrademarks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-${color}-200">
              <p className={`text-xs font-medium text-${color}-900 mb-2`}>Similar Trademarks:</p>
              <div className="space-y-2">
                {similarityData.similarTrademarks.map((tm: any, idx: number) => (
                  <div key={idx} className={`text-xs bg-${color}-100 rounded p-2`}>
                    <div className="font-medium text-${color}-900">{tm.trademarkName}</div>
                    <div className={`text-${color}-700`}>{tm.companyName}</div>
                    <div className={`text-${color}-600 text-[10px] mt-1`}>Reason: {tm.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-3 pt-3 border-t border-${color}-200`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium text-${color}-900`}>Recommendation:</span>
              <span className={`px-2 py-1 bg-${color}-200 text-${color}-900 text-xs font-bold rounded`}>
                {similarityData.recommendation}
              </span>
            </div>
            <p className={`text-xs text-${color}-700 mt-1`}>{similarityData.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
