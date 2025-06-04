import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'none';
type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate';

interface ScrollAnimationProps {
  children: ReactNode;
  animationType?: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const ScrollAnimation = ({
  children,
  animationType = 'fade',
  direction = 'up',
  duration = 0.6,
  delay = 0,
  className = '',
  threshold = 0.2,
  once = true,
}: ScrollAnimationProps) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold,
  });

  // Initial and animation states based on animation type and direction
  const getAnimationVariants = () => {
    // Base animation properties
    let initial: any = {};
    let animate: any = { opacity: 1 };

    // Add fade effect for all animations
    if (animationType === 'fade' || animationType === 'slide') {
      initial = { ...initial, opacity: 0 };
    }

    // Add slide effect
    if (animationType === 'slide') {
      switch (direction) {
        case 'up':
          initial = { ...initial, y: 50 };
          animate = { ...animate, y: 0 };
          break;
        case 'down':
          initial = { ...initial, y: -50 };
          animate = { ...animate, y: 0 };
          break;
        case 'left':
          initial = { ...initial, x: 50 };
          animate = { ...animate, x: 0 };
          break;
        case 'right':
          initial = { ...initial, x: -50 };
          animate = { ...animate, x: 0 };
          break;
        default:
          break;
      }
    }

    // Add scale effect
    if (animationType === 'scale') {
      initial = { opacity: 0, scale: 0.9 };
      animate = { opacity: 1, scale: 1 };
    }

    // Add rotate effect
    if (animationType === 'rotate') {
      initial = { opacity: 0, rotate: -10 };
      animate = { opacity: 1, rotate: 0 };
    }

    return {
      initial,
      animate,
    };
  };

  const { initial, animate } = getAnimationVariants();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : initial}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};