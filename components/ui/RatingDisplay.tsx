import { useEffect, useState } from 'react';

interface RatingDisplayProps {
  creatorAddress: string;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

interface RatingData {
  averageRating: number;
  totalRatings: number;
  distribution: { [key: number]: number };
}

export default function RatingDisplay({ 
  creatorAddress, 
  size = 'medium',
  showCount = true 
}: RatingDisplayProps) {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRating();
  }, [creatorAddress]);

  const loadRating = async () => {
    try {
      const response = await fetch(`/api/ratings/creator/${creatorAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setRatingData(data.data);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <div className="animate-pulse flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!ratingData || ratingData.totalRatings === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>No ratings yet</span>
      </div>
    );
  }

  const starSize = size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-6 h-6' : 'w-4 h-4';
  const textSize = size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(ratingData.averageRating);
          return (
            <svg
              key={star}
              className={`${starSize} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      <span className={`${textSize} font-semibold text-gray-900`}>
        {ratingData.averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${textSize} text-gray-500`}>
          ({ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
