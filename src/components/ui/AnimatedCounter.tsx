import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  formatFn?: (value: number) => string;
  /** Duration of the spring animation in seconds */
  duration?: number;
}

/**
 * Smoothly animates between numeric values using a spring animation.
 */
export const AnimatedCounter = ({
  value,
  className,
  formatFn = (v) => Math.round(v).toLocaleString(),
  duration = 0.8,
}: AnimatedCounterProps) => {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration,
  });

  const display = useTransform(spring, (latest) => formatFn(latest));
  const [displayValue, setDisplayValue] = useState(formatFn(0));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return <span className={className}>{displayValue}</span>;
};
