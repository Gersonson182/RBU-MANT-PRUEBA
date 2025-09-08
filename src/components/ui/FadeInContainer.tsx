import type { HTMLAttributes, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import type { MotionProps, Transition, Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

const pageVariants: Variants = {
  initial: { x: '2vw' },
  animate: { x: 0 },
  exit: { x: '-2vw' },
};

const pageTransition: Transition = {
  duration: 0.5,
  ease: 'circOut',
};

type FadeInContainerProps = PropsWithChildren &
  MotionProps &
  HTMLAttributes<HTMLDivElement>;

export default function FadeInContainer({
  children,
  ...props
}: FadeInContainerProps) {
  return (
    <motion.div
      initial='initial'
      animate='animate'
      exit='exit'
      variants={{ ...pageVariants, ...props.variants }}
      transition={{ ...pageTransition, ...props.transition }}
      className={cn('overflow-x-hidden', props.className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
