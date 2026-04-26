import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { ExternalLink, FileText, FolderOpen, Sparkles } from "lucide-react";
import type { BioTheme, LayoutType } from "@/lib/bioThemes";
import { LockedLinkGate } from "./LockedLinkGate";

interface PublicLink {
  id: string;
  title: string | null;
  url: string | null;
  badge?: string | null;
  is_active?: boolean | null;
  is_highlighted?: boolean | null;
  click_count?: number | null;
  lock_type?: string | null;
  lock_password?: string | null;
}

interface PublicLinkListProps {
  links: PublicLink[];
  theme: BioTheme;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, link: { id: string; url: string }) => void;
  creatorId?: string;
  creatorName?: string;
}

/**
 * BentoCard — single link rendered as a glassmorphic tile with optional
 * cursor-following glow on featured (highlighted) links and a press-squish.
 */
const BentoCard = ({
  link,
  theme,
  onLinkClick,
  span,
  index,
}: {
  link: PublicLink;
  theme: BioTheme;
  onLinkClick: PublicLinkListProps["onLinkClick"];
  span: 1 | 2;
  index: number;
}) => {
  const isGlass = theme.cardBg.includes("rgba");
  const isFeatured = !!link.is_highlighted;
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, ${theme.accent}33, transparent 70%)`;

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28, scale: 0.96 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 110, damping: 18 } },
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96, rotate: 0.5 }}
      className={span === 2 ? "col-span-2" : "col-span-1"}
    >
      <a
        ref={cardRef}
        href={link.url || "#"}
        onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
        onMouseMove={isFeatured ? onMove : undefined}
        className="relative block h-full w-full overflow-hidden rounded-2xl p-4 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          color: theme.cardText,
          backdropFilter: isGlass ? "blur(16px) saturate(160%)" : undefined,
          WebkitBackdropFilter: isGlass ? "blur(16px) saturate(160%)" : undefined,
          // Multi-layered shadow + subtle inner highlight for physical depth
          boxShadow: isGlass
            ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.05), 0 8px 24px -6px rgba(0,0,0,0.18), 0 20px 48px -12px rgba(0,0,0,0.22)"
            : "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -4px rgba(0,0,0,0.08), 0 16px 36px -10px rgba(0,0,0,0.10)",
        }}
        role="link"
      >
        {isFeatured && (
          <motion.div
            aria-hidden="true"
            style={{ background: glow }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 flex-shrink-0"
              style={{ background: `${theme.accent}1f`, border: `1px solid ${theme.accent}25` }}
            >
              {isFeatured ? (
                <Sparkles className="w-4 h-4" style={{ color: theme.accent }} aria-hidden="true" />
              ) : (
                <ExternalLink className="w-4 h-4" style={{ color: theme.accent }} aria-hidden="true" />
              )}
            </div>
            <p className="font-semibold tracking-tight truncate">{link.title}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {link.badge && (
              <span
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full tracking-wide"
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
              >
                {link.badge}
              </span>
            )}
            <ExternalLink
              className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
              aria-hidden="true"
              style={{ color: theme.accent }}
            />
          </div>
        </div>
      </a>
    </motion.div>
  );
};

const DefaultLayout = ({ links, theme, onLinkClick, creatorId, creatorName }: PublicLinkListProps) => {
  const [unlockedLinks, setUnlockedLinks] = useState<Set<string>>(new Set());

  // Bento span pattern: highlighted links always span 2 cols on mobile and
  // sm+ (within a 3-col grid) to claim prime visual real estate.
  // Asymmetry: every 5th unhighlighted link also spans 2 for visual rhythm.
  const getSpan = (link: PublicLink, idx: number): 1 | 2 => {
    if (link.is_highlighted) return 2;
    if (idx > 0 && idx % 5 === 0) return 2;
    return 1;
  };

  return (
    <motion.nav
      aria-label="Profile links"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
    >
      {links.map((link, index) => {
        const isLocked = link.lock_type && link.lock_type !== "none" && !unlockedLinks.has(link.id);
        const span = getSpan(link, index);

        if (isLocked) {
          return (
            <motion.div
              key={link.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
              className={span === 2 ? "col-span-2" : "col-span-1"}
            >
              <LockedLinkGate
                linkId={link.id}
                linkTitle={link.title}
                lockType={link.lock_type as "password" | "newsletter"}
                lockPassword={link.lock_password}
                creatorId={creatorId || ""}
                creatorName={creatorName}
                theme={theme}
                onUnlock={() => setUnlockedLinks((prev) => new Set(prev).add(link.id))}
              />
            </motion.div>
          );
        }

        return (
          <BentoCard
            key={link.id}
            link={link}
            theme={theme}
            onLinkClick={onLinkClick}
            span={span}
            index={index}
          />
        );
      })}
    </motion.nav>
  );
};

const FinderLayout = ({ links, theme, onLinkClick }: PublicLinkListProps) => (
  <motion.nav
    aria-label="Profile links"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl overflow-hidden"
    style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
  >
    {/* Finder toolbar */}
    <div className="flex items-center gap-1.5 px-4 py-2" style={{ borderBottom: `1px solid ${theme.cardBorder}`, background: theme.hoverBg }}>
      <div className="w-3 h-3 rounded-full bg-red-400" />
      <div className="w-3 h-3 rounded-full bg-yellow-400" />
      <div className="w-3 h-3 rounded-full bg-green-400" />
      <span className="text-xs ml-3 font-semibold" style={{ color: theme.bioTextColor }}>
        <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
        Links
      </span>
    </div>
    {/* Column header */}
    <div className="flex items-center px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.bioTextColor, borderBottom: `1px solid ${theme.cardBorder}` }}>
      <span className="flex-1">Name</span>
      <span className="w-16 text-right">Kind</span>
    </div>
    {links.map((link, index) => (
      <motion.a
        key={link.id}
        href={link.url || "#"}
        onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all group"
        style={{
          color: theme.cardText,
          borderBottom: `1px solid ${theme.cardBorder}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.hoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
        <span className="font-medium text-sm flex-1">{link.title}</span>
        {link.badge && (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
            {link.badge}
          </span>
        )}
        <span className="text-[10px] w-16 text-right" style={{ color: theme.bioTextColor }}>Link</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.a>
    ))}
  </motion.nav>
);

const GridLayout = ({ links, theme, onLinkClick }: PublicLinkListProps) => (
  <nav aria-label="Profile links" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {links.map((link, index) => (
      <motion.a
        key={link.id}
        href={link.url || "#"}
        onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all group text-center"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          backdropFilter: theme.cardBg.includes("rgba") ? "blur(12px)" : undefined,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.hoverBg; e.currentTarget.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.transform = "scale(1)"; }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${theme.accent}20` }}
        >
          <ExternalLink className="w-5 h-5" style={{ color: theme.accent }} />
        </div>
        <span className="text-xs font-semibold line-clamp-2" style={{ color: theme.cardText }}>{link.title}</span>
        {link.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
            {link.badge}
          </span>
        )}
      </motion.a>
    ))}
  </nav>
);

const KanbanLayout = ({ links, theme, onLinkClick }: PublicLinkListProps) => {
  // Auto-group: first 40% "Featured", next 40% "Links", rest "More"
  const groups = [
    { title: "⭐ Featured", items: links.slice(0, Math.ceil(links.length * 0.4)) },
    { title: "🔗 Links", items: links.slice(Math.ceil(links.length * 0.4), Math.ceil(links.length * 0.8)) },
    { title: "📌 More", items: links.slice(Math.ceil(links.length * 0.8)) },
  ].filter((g) => g.items.length > 0);

  return (
    <nav aria-label="Profile links" className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {groups.map((group, gi) => (
        <motion.div
          key={gi}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
          className="flex-shrink-0 w-48 rounded-xl p-3"
          style={{ background: theme.hoverBg }}
        >
          <div className="text-xs font-bold mb-2 px-1" style={{ color: theme.accent }}>
            {group.title}
          </div>
          <div className="space-y-2">
            {group.items.map((link, li) => (
              <a
                key={link.id}
                href={link.url || "#"}
                onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
                className="block px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                style={{
                  background: theme.cardBg,
                  color: theme.cardText,
                  border: `1px solid ${theme.cardBorder}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = theme.hoverBg; e.currentTarget.style.borderColor = theme.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 line-clamp-1">{link.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      ))}
    </nav>
  );
};

const CarouselLayout = ({ links, theme, onLinkClick }: PublicLinkListProps) => (
  <nav aria-label="Profile links" className="overflow-x-auto pb-3 scrollbar-none">
    <div className="flex gap-3" style={{ width: "max-content" }}>
      {links.map((link, index) => (
        <motion.a
          key={link.id}
          href={link.url || "#"}
          onClick={(e) => onLinkClick(e, { id: link.id, url: link.url || "" })}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className="flex-shrink-0 w-40 rounded-xl p-4 cursor-pointer transition-all group text-center"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
            backdropFilter: theme.cardBg.includes("rgba") ? "blur(12px)" : undefined,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme.hoverBg; e.currentTarget.style.borderColor = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = theme.cardBg; e.currentTarget.style.borderColor = theme.cardBorder; }}
        >
          <div
            className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
            style={{ background: `${theme.accent}20` }}
          >
            <ExternalLink className="w-5 h-5" style={{ color: theme.accent }} />
          </div>
          <span className="text-xs font-semibold line-clamp-2" style={{ color: theme.cardText }}>{link.title}</span>
          {link.badge && (
            <span className="mt-1 inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-full" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
              {link.badge}
            </span>
          )}
        </motion.a>
      ))}
    </div>
  </nav>
);

export const PublicLinkList = ({ links, theme, onLinkClick, creatorId, creatorName }: PublicLinkListProps) => {
  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: theme.bioTextColor }}>No links yet</p>
      </div>
    );
  }

  const layout = theme.layoutType || "default";

  switch (layout) {
    case "list":
      return <FinderLayout links={links} theme={theme} onLinkClick={onLinkClick} creatorId={creatorId} creatorName={creatorName} />;
    case "grid":
      return <GridLayout links={links} theme={theme} onLinkClick={onLinkClick} creatorId={creatorId} creatorName={creatorName} />;
    case "kanban":
      return <KanbanLayout links={links} theme={theme} onLinkClick={onLinkClick} creatorId={creatorId} creatorName={creatorName} />;
    case "carousel":
      return <CarouselLayout links={links} theme={theme} onLinkClick={onLinkClick} creatorId={creatorId} creatorName={creatorName} />;
    default:
      return <DefaultLayout links={links} theme={theme} onLinkClick={onLinkClick} creatorId={creatorId} creatorName={creatorName} />;
  }
};