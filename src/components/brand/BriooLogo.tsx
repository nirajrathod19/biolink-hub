import logoAsset from "@/assets/brioo-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface BriooLogoProps {
  className?: string;
  /** Height in pixels. Width auto. */
  height?: number;
  alt?: string;
}

/**
 * Official Brioo wordmark — uses the user-provided logo asset.
 * Maintains aspect ratio and crisp rendering across sizes.
 */
export const BriooLogo = ({ className, height = 28, alt = "Brioo" }: BriooLogoProps) => {
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      style={{ height }}
      className={cn("w-auto select-none", className)}
      draggable={false}
    />
  );
};

export default BriooLogo;
