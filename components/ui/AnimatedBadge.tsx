import { motion } from 'framer-motion';

interface AnimatedBadgeProps {
  text: string;
  color?: 'green' | 'blue' | 'yellow' | 'red';
}

export default function AnimatedBadge({ text, color = 'blue' }: AnimatedBadgeProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${colorClasses[color]}`}
    >
      {text}
    </motion.span>
  );
}
