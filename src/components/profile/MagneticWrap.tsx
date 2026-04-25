import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface MagneticWrapProps {
  children: ReactNode;
  strength?: number; // px of pull
  className?: string;
}

/**
 * Wraps children with a smooth magnetic hover effect — element follows
 * the cursor by `strength` pixels and springs back on leave.
 */
export const MagneticWrap = ({ children, strength = 14, className }: MagneticWrapProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setPos({ x: relX * strength, y: relY * strength });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
