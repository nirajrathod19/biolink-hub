import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge = ({ size = 18, className = "" }: VerifiedBadgeProps) => (
  <BadgeCheck
    className={`inline-block text-blue-500 ${className}`}
    style={{ width: size, height: size }}
    aria-label="Verified"
  />
);