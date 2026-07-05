import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, Tag } from "lucide-react";
import type { BioTheme } from "@/lib/bioThemes";

export interface AffiliateItem {
  id: string;
  title: string;
  image_url?: string | null;
  price?: string | null;
  original_price?: string | null;
  url: string;
  tracking_tag?: string | null;
}

interface Props {
  items: AffiliateItem[];
  theme: BioTheme;
  creatorId: string;
  heading?: string;
}

export const AffiliateCarousel = ({ items, theme, creatorId, heading = "Recommended" }: Props) => {
  if (!items || items.length === 0) return null;

  const buildUrl = (it: AffiliateItem) => {
    try {
      const u = new URL(it.url);
      u.searchParams.set("utm_source", "brioo");
      u.searchParams.set("utm_medium", "affiliate");
      u.searchParams.set("utm_campaign", creatorId);
      if (it.tracking_tag) u.searchParams.set("tag", it.tracking_tag);
      return u.toString();
    } catch {
      return it.url;
    }
  };

  return (
    <section aria-label="Affiliate picks" className="my-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <ShoppingBag className="w-4 h-4" style={{ color: theme.accent }} />
        <h3 className="text-sm font-semibold" style={{ color: theme.textColor }}>
          {heading}
        </h3>
      </div>
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((it, idx) => (
          <motion.a
            key={it.id}
            href={buildUrl(it)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="snap-start shrink-0 w-40 rounded-2xl overflow-hidden backdrop-blur-md transition-transform hover:scale-[1.03]"
            style={{
              background: `${theme.accent + "10"}`,
              border: `1px solid ${theme.accent}25`,
            }}
          >
            <div className="aspect-square bg-black/10 relative">
              {it.image_url ? (
                <img src={it.image_url} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full grid place-items-center opacity-40">
                  <ShoppingBag className="w-8 h-8" style={{ color: theme.textColor }} />
                </div>
              )}
              {it.original_price && it.price && (
                <div
                  className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: theme.accent, color: theme.background }}
                >
                  Deal
                </div>
              )}
            </div>
            <div className="p-2.5">
              <div className="text-xs font-medium line-clamp-2 mb-1" style={{ color: theme.textColor }}>
                {it.title}
              </div>
              <div className="flex items-baseline gap-1.5">
                {it.price && (
                  <span className="text-sm font-bold" style={{ color: theme.accent }}>
                    {it.price}
                  </span>
                )}
                {it.original_price && (
                  <span className="text-[10px] line-through opacity-60" style={{ color: theme.textColor }}>
                    {it.original_price}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] opacity-70" style={{ color: theme.textColor }}>
                <Tag className="w-2.5 h-2.5" /> Sponsored
                <ExternalLink className="w-2.5 h-2.5 ml-auto" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};
