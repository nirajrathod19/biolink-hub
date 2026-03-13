import { getThemeById, type BioTheme } from "@/lib/bioThemes";
import { ExternalLink, Sparkles, FileText, FolderOpen, LayoutGrid, Columns3, ArrowLeftRight } from "lucide-react";

interface ThemeLivePreviewProps {
  themeId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
}

const DefaultLinksPreview = ({ theme }: { theme: BioTheme }) => (
  <div className="space-y-2">
    {["My Website", "Latest Video", "Shop Now"].map((link, i) => (
      <div
        key={i}
        className="py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-300"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          color: theme.cardText,
          backdropFilter: theme.cardBg.includes("rgba") ? "blur(12px)" : undefined,
        }}
      >
        <span>{link}</span>
        <ExternalLink className="w-3 h-3 opacity-50" />
      </div>
    ))}
  </div>
);

const FinderListPreview = ({ theme }: { theme: BioTheme }) => (
  <div
    className="rounded-lg overflow-hidden"
    style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
  >
    <div
      className="flex items-center gap-1.5 px-3 py-1.5"
      style={{ borderBottom: `1px solid ${theme.cardBorder}`, background: theme.hoverBg }}
    >
      <div className="w-2 h-2 rounded-full bg-red-400" />
      <div className="w-2 h-2 rounded-full bg-yellow-400" />
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span className="text-[8px] ml-2 font-medium" style={{ color: theme.bioTextColor }}>Links</span>
    </div>
    {["My Website", "Latest Video", "Shop Now"].map((link, i) => (
      <div
        key={i}
        className="flex items-center gap-2 px-3 py-2 text-xs"
        style={{
          color: theme.cardText,
          borderBottom: i < 2 ? `1px solid ${theme.cardBorder}` : undefined,
        }}
      >
        <FileText className="w-3 h-3 flex-shrink-0" style={{ color: theme.accent }} />
        <span className="font-medium flex-1">{link}</span>
        <span className="text-[9px]" style={{ color: theme.bioTextColor }}>—</span>
      </div>
    ))}
  </div>
);

const WindowsGridPreview = ({ theme }: { theme: BioTheme }) => (
  <div className="grid grid-cols-3 gap-2">
    {[
      { icon: "🌐", label: "Website" },
      { icon: "🎬", label: "Video" },
      { icon: "🛍️", label: "Shop" },
      { icon: "📸", label: "Photos" },
      { icon: "📝", label: "Blog" },
      { icon: "💬", label: "Contact" },
    ].map((item, i) => (
      <div
        key={i}
        className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          backdropFilter: theme.cardBg.includes("rgba") ? "blur(12px)" : undefined,
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: `${theme.accent}20` }}
        >
          {item.icon}
        </div>
        <span className="text-[8px] font-medium" style={{ color: theme.cardText }}>{item.label}</span>
      </div>
    ))}
  </div>
);

const KanbanPreview = ({ theme }: { theme: BioTheme }) => (
  <div className="flex gap-2 overflow-hidden">
    {[
      { title: "Links", items: ["Site", "Blog"] },
      { title: "Media", items: ["Video", "Photos"] },
      { title: "Shop", items: ["Store"] },
    ].map((col, i) => (
      <div
        key={i}
        className="flex-1 min-w-0 rounded-lg p-1.5"
        style={{ background: theme.hoverBg }}
      >
        <div className="text-[8px] font-bold mb-1 px-1" style={{ color: theme.accent }}>
          {col.title}
        </div>
        {col.items.map((item, j) => (
          <div
            key={j}
            className="px-1.5 py-1 rounded text-[8px] font-medium mb-1"
            style={{
              background: theme.cardBg,
              color: theme.cardText,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const CarouselPreview = ({ theme }: { theme: BioTheme }) => (
  <div className="overflow-hidden">
    <div className="flex gap-1.5" style={{ transform: "translateX(-8px)" }}>
      {["Website", "Video", "Shop", "Blog"].map((item, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-16 rounded-lg p-2 text-center"
          style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <div
            className="w-6 h-6 rounded mx-auto mb-1 flex items-center justify-center"
            style={{ background: `${theme.accent}20` }}
          >
            <ExternalLink className="w-2.5 h-2.5" style={{ color: theme.accent }} />
          </div>
          <span className="text-[7px] font-medium" style={{ color: theme.cardText }}>{item}</span>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-center gap-1 mt-1.5">
      <ArrowLeftRight className="w-2.5 h-2.5" style={{ color: theme.bioTextColor }} />
      <span className="text-[7px]" style={{ color: theme.bioTextColor }}>swipe</span>
    </div>
  </div>
);

export const ThemeLivePreview = ({ themeId, displayName, bio, avatarUrl }: ThemeLivePreviewProps) => {
  const theme = getThemeById(themeId);
  const layout = theme.layoutType || "default";

  const layoutLabels: Record<string, { icon: typeof FolderOpen; label: string }> = {
    list: { icon: FolderOpen, label: "Finder" },
    grid: { icon: LayoutGrid, label: "Grid" },
    kanban: { icon: Columns3, label: "Kanban" },
    carousel: { icon: ArrowLeftRight, label: "Carousel" },
  };

  const layoutInfo = layoutLabels[layout];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-500"
      style={{ background: theme.background }}
    >
      <div className="p-6 text-center">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 p-1"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Preview avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-2xl"
              style={{ background: theme.cardBg }}
            >
              👤
            </div>
          )}
        </div>

        {/* Name */}
        <h4 className="font-bold text-lg mb-1 transition-colors duration-300" style={{ color: theme.textColor }}>
          {displayName || "Your Name"}
        </h4>
        <p className="text-xs mb-2 line-clamp-2 transition-colors duration-300" style={{ color: theme.bioTextColor }}>
          {bio || "Your bio will appear here"}
        </p>

        {/* Layout badge */}
        {layoutInfo && (
          <div className="flex items-center justify-center gap-1 mb-3">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: `${theme.accent}20`, color: theme.accent }}
            >
              <layoutInfo.icon className="w-2.5 h-2.5" />
              {layoutInfo.label}
            </span>
          </div>
        )}

        {/* Social icons preview */}
        <div className="flex justify-center gap-2 mb-4">
          {["IG", "YT", "X"].map((s) => (
            <div
              key={s}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors duration-300"
              style={{ background: theme.socialBg, color: theme.socialText }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Layout-specific link preview */}
        {layout === "list" && <FinderListPreview theme={theme} />}
        {layout === "grid" && <WindowsGridPreview theme={theme} />}
        {layout === "kanban" && <KanbanPreview theme={theme} />}
        {layout === "carousel" && <CarouselPreview theme={theme} />}
        {layout === "default" && <DefaultLinksPreview theme={theme} />}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" style={{ color: theme.footerText }} />
          <span className="text-[10px] font-semibold" style={{ color: theme.footerText }}>
            Brioo
          </span>
        </div>
      </div>
    </div>
  );
};