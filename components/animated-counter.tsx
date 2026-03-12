'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedCounter({ end, duration = 1200, prefix = '', suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    // Cancel any ongoing animation
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startValue = count;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (end - startValue) * eased;
      setCount(current);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, end]);

  return (
    <span ref={ref}>
      {prefix}{count?.toFixed?.(decimals) ?? '0'}{suffix}
    </span>
  );
}
