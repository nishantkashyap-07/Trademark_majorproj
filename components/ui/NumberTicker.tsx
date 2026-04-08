import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface NumberTickerProps {
  value: number;
  className?: string;
}

export default function NumberTicker({ value, className = '' }: NumberTickerProps) {
  const spring = useSpring(0, { damping: 50, stiffness: 100 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
