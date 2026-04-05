import { Suspense } from 'react';

// Spline disabled for production build - can be re-enabled later
const Spline = ({ scene, style }: any) => null;

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
      {/* Spline 3D Background - Disabled */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}
        style={{ 
          zIndex,
          opacity: opacity / 100 
        }}
      />

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
