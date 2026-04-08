import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function AnimatedButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary' 
}: AnimatedButtonProps) {
  const baseStyles = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold ${baseStyles} ${className}`}
    >
      {children}
    </motion.button>
  );
}
