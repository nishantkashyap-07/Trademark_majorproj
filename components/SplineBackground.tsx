import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Spline with no SSR
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading 3D Experience...</p>
      </div>
    </div>
  ),
});

interface SplineBackgroundProps {
  /** Spline scene URL */
  scene?: string;
  /** Opacity of the 3D background (0-100) */
  opacity?: number;
  /** Whether to show gradient overlay for better text readability */
  showGradient?: boolean;
  /** Gradient direction: 'left' | 'right' | 'top' | 'bottom' | 'none' */
  gradientDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  /** Custom gradient opacity (0-100) */
  gradientOpacity?: number;
  /** Z-index for the background */
  zIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

export default function SplineBackground({
  scene = 'https://prod.spline.design/k6SrxX1NR6GApLcG/scene.splinecode',
  opacity = 70,
  showGradient = true,
  gradientDirection = 'right',
  gradientOpacity = 95,
  zIndex = 0,
  className = '',
}: SplineBackgroundProps) {
  // Gradient direction classes
  const gradientClasses = {
    left: `bg-gradient-to-l from-gray-900/${gradientOpacity} via-gray-900/70 to-transparent`,
    right: `bg-gradient-to-r from-gray-900/${gradientOpacity} via-gray-900/70 to-transparent`,
    top: `bg-gradient-to-t from-gray-900/${gradientOpacity} via-gray-900/70 to-transparent`,
    bottom: `bg-gradient-to-b from-gray-900/${gradientOpacity} via-gray-900/70 to-transparent`,
    none: '',
  };

  return (
    <>
      {/* Spline 3D Background */}
      <div 
        className={`absolute inset-0 ${className}`}
        style={{ 
          zIndex,
          opacity: opacity / 100 
        }}
      >
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm">Loading 3D Experience...</p>
              </div>
            </div>
          }
        >
          <Spline
            scene={scene}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {/* Gradient Overlay */}
      {showGradient && gradientDirection !== 'none' && (
        <div
          className={`absolute inset-0 ${gradientClasses[gradientDirection]}`}
          style={{ zIndex: zIndex + 1 }}
        />
      )}
    </>
  );
}
