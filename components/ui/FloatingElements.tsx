import { motion } from 'framer-motion';

export default function FloatingElements() {
  const elements = [
    { icon: '🔒', delay: 0, duration: 20 },
    { icon: '⚡', delay: 2, duration: 18 },
    { icon: '🌐', delay: 4, duration: 22 },
    { icon: '💎', delay: 1, duration: 19 },
    { icon: '🚀', delay: 3, duration: 21 },
    { icon: '🔐', delay: 5, duration: 17 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 100 
          }}
          animate={{
            y: -100,
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            rotate: [0, 360],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}
