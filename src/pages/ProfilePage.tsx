import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Instagram, Youtube, Twitter, Linkedin, Github, ExternalLink, Sparkles,
  MessageCircle, Send, Camera, Facebook,
} from "lucide-react";
import { usePublicProfile } from "@/hooks/useProfile";
import { usePublicLinks } from "@/hooks/useLinks";
import { usePublicSocialLinks } from "@/hooks/useSocialLinks";
import { GlobalAdBanner } from "@/components/profile/GlobalAdBanner";
import { useTrackProfileView } from "@/hooks/useViewTracking";
import { StoreProductGrid } from "@/components/profile/StoreProductGrid";
import { DigitalProductsGrid } from "@/components/profile/DigitalProductsGrid";
import { ProductStorefront } from "@/components/profile/ProductStorefront";
import { ShoppingCart } from "@/components/profile/ShoppingCart";
import { CartProvider, useCart } from "@/components/profile/CartContext";
import { ProfileSEO } from "@/components/seo/ProfileSEO";
import { AdSenseAd } from "@/components/ads/AdSenseAd";
import { TipJarDisplay } from "@/components/profile/TipJarDisplay";
import { TipJarBlock } from "@/components/profile/TipJarBlock";
import { VideoBackground } from "@/components/profile/VideoBackground";
import { CommunityFeed } from "@/components/profile/CommunityFeed";
import { QABox } from "@/components/profile/QABox";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileNotFound } from "@/components/profile/ProfileNotFound";
import { PublicLinkList } from "@/components/profile/PublicLinkList";
import { EmailCaptureBlock } from "@/components/profile/EmailCaptureBlock";
import { FloatingMusicPlayer } from "@/components/profile/FloatingMusicPlayer";
import { VerifiedBadge } from "@/components/profile/VerifiedBadge";
import { AnnouncementBar } from "@/components/profile/AnnouncementBar";
import { RecentSalesTicker } from "@/components/profile/RecentSalesTicker";
import { ContactMeForm } from "@/components/profile/ContactMeForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { MagneticWrap } from "@/components/profile/MagneticWrap";
import { getThemeById } from "@/lib/bioThemes";
import { usePublicLayoutElements } from "@/hooks/useLayoutElements";
import { usePublicDisplayRules } from "@/hooks/useLinkDisplayRules";
import { getVisitorContext, applyDisplayRules } from "@/lib/visitorDetection";
import { ProfileModeRouter, resolveCreatorMode } from "@/components/profile/modes/ProfileModeRouter";
import { BriooLogo } from "@/components/brand/BriooLogo";
import { FeaturedSection } from "@/features/public-profile";

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram, youtube: Youtube, twitter: Twitter, linkedin: Linkedin,
  facebook: Facebook, github: Github, whatsapp: MessageCircle, telegram: Send, snapchat: Camera,
};

const ProfilePageContent = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { items, activeCreatorId, clearCart } = useCart();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicProfile(username || "");
  const { data: allLinks = [] } = usePublicLinks(profile?.user_id || "");
  const { data: socialLinks = [] } = usePublicSocialLinks(profile?.user_id || "");
  const { data: layoutElements = [] } = usePublicLayoutElements(profile?.user_id || "");
  const { data: displayRules = [] } = usePublicDisplayRules(profile?.user_id || "");

  useEffect(() => {
    if (!profile?.user_id || items.length === 0 || !activeCreatorId) return;

    if (activeCreatorId !== profile.user_id) {
      clearCart();
      toast("Cart cleared", {
        description: "Your previous cart belonged to a different creator, so it was reset for this page.",
      });
    }
  }, [username, profile?.user_id, items.length, activeCreatorId, clearCart]);

  const visitorContext = getVisitorContext();
  const visibleLinkIds = displayRules.length > 0
    ? applyDisplayRules(allLinks.map((l: any) => l.id), displayRules, visitorContext)
    : new Set(allLinks.map((l: any) => l.id));
  const links = allLinks.filter((l: any) => visibleLinkIds.has(l.id));

  useTrackProfileView(profile?.id);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: { id: string; url: string }) => {
    e.preventDefault();
    const params = new URLSearchParams({ url: link.url, link_id: link.id, profile_id: profile?.id || "" });
    navigate(`/ad-redirect?${params.toString()}`);
  };

  if (profileLoading) return <ProfileSkeleton />;
  if (profileError || !profile) return <ProfileNotFound username={username} />;

  const theme = getThemeById(profile.template || "minimal-mono");
  const layoutConfig = (profile as any).layout_config || {};
  const productCardSize = layoutConfig.product_card_size || 100;
  const productLayout = layoutConfig.product_layout || "vertical";

  const bgAssets = layoutElements.filter((e) => e.element_type === "custom_asset" && (e.settings as any)?.role === "background");
  const fgAssets = layoutElements.filter((e) => e.element_type === "custom_asset" && (e.settings as any)?.role === "foreground");

  const audioLinks = links.filter((l: any) => l.link_type === "audio" && l.url).map((l: any) => ({ id: l.id, title: l.title || "Untitled Track", url: l.url }));
  const isAudioLab = (profile as any).content_track === "audio";
  const isVerified = !!(profile as any).is_verified;
  const announcementText = (profile as any).announcement_text;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.background }}>
      <ProfileSEO username={profile.username || ""} displayName={profile.display_name} bio={profile.bio} avatarUrl={profile.avatar_url} />

      {/* Animated mesh gradient — slowly shifts hue + position for depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-40"
          style={{ background: theme.accent }}
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -15, 0], scale: [1, 0.9, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-[26rem] h-[26rem] rounded-full blur-[120px] opacity-30"
          style={{ background: theme.accent }}
        />
        <motion.div
          animate={{ x: [0, 25, -25, 0], y: [0, 20, -20, 0], opacity: [0.18, 0.28, 0.18] }}
          transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] rounded-full blur-[110px]"
          style={{ background: theme.textColor }}
        />
      </div>

      {(profile as any).is_pro && (profile as any).video_background_url && (
        <VideoBackground
          url={(profile as any).video_background_url}
          overlayOpacity={(profile as any).video_overlay_opacity ?? 40}
        />
      )}
      {bgAssets.map((asset) => (
        <div key={asset.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: asset.z_index, opacity: asset.opacity / 100 }}>
          {asset.custom_asset_url && (
            <img src={asset.custom_asset_url} alt="" className="w-full h-full object-cover"
              style={asset.is_absolute ? { position: "absolute", left: `${asset.position_x}%`, top: `${asset.position_y}%`, width: `${asset.width}%`, height: "auto" } : undefined}
            />
          )}
        </div>
      ))}

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-12">
        <GlobalAdBanner themeColor={theme.accent} />
        {/* Announcement now rendered inside FeaturedSection for unified hierarchy */}
        <AdSenseAd slot="header" format="horizontal" className="mb-4" profileId={profile.id} />

        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full p-1" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={`${profile.display_name || profile.username}'s avatar`} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-4xl" style={{ background: theme.cardBg }} role="img" aria-label="Default avatar">👤</div>
              )}
            </div>
            {profile.is_pro && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)` }} aria-label="Pro member">
                <Sparkles className="w-4 h-4" style={{ color: theme.accentText }} aria-hidden="true" />
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-[-0.03em] mb-2 flex items-center justify-center gap-1.5 leading-[1.05]" style={{ color: theme.textColor }}>
            {profile.display_name || `@${profile.username}`}
            {isVerified && <VerifiedBadge size={22} />}
          </h1>
          {profile.display_name && (
            <p className="text-xs font-medium tracking-wide mb-2 opacity-70" style={{ color: theme.bioTextColor }}>
              @{profile.username}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm leading-relaxed max-w-xs mx-auto mb-4 tracking-tight" style={{ color: theme.bioTextColor }}>
              {profile.bio}
            </p>
          )}
          {socialLinks.length > 0 && (
            <nav aria-label="Social media links" className="flex justify-center gap-3 mb-4">
              {socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform] || ExternalLink;
                return (
                  <MagneticWrap key={social.id} strength={10}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        background: theme.socialBg,
                        color: theme.socialText,
                        backdropFilter: theme.socialBg.includes("rgba") ? "blur(8px)" : undefined,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      }}
                      aria-label={`Visit ${social.platform} profile`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </a>
                  </MagneticWrap>
                );
              })}
            </nav>
          )}
          {profile.user_id && <ProfileStats profileId={profile.id!} userId={profile.user_id!} initialViews={(profile as any).total_clicks || 0} initialClicks={(profile as any).unique_clicks || 0} theme={theme} />}
        </motion.header>

        <ProfileModeRouter
          mode={resolveCreatorMode((profile as any).content_track)}
          ctx={{
            displayName: profile.display_name || profile.username || "",
            username: profile.username || "",
            bio: profile.bio,
            avatarUrl: profile.avatar_url,
            socialLinks: socialLinks as any,
            links: links as any,
            themeAccent: theme.accent,
            isPro: !!(profile as any).is_pro,
          }}
        >
        {profile.user_id && <RecentSalesTicker userId={profile.user_id} theme={theme} />}

        <FeaturedSection
          links={links as any}
          announcementText={announcementText}
          theme={theme}
          onLinkClick={handleLinkClick}
        />

        <PublicLinkList
          links={(links as any).filter((l: any) => !l.is_highlighted)}
          theme={theme}
          onLinkClick={handleLinkClick}
          creatorId={profile.user_id}
          creatorName={profile.display_name || profile.username || undefined}
        />

        {profile.user_id && <section aria-label="Community updates"><CommunityFeed userId={profile.user_id} theme={theme} /></section>}
        {profile.user_id && <section aria-label="Questions and answers"><QABox creatorUserId={profile.user_id} creatorName={profile.display_name || profile.username} theme={theme} /></section>}

        {/* Store Products - Category-wise horizontal scroll */}
        {profile.user_id && (
          <ProductStorefront userId={profile.user_id} theme={theme} creatorUsername={username} />
        )}

        <AdSenseAd slot="mid" format="fluid" className="my-6" profileId={profile.id} />

        {/* Digital Products */}
        {profile.user_id && (
          <section aria-label="Digital products" style={{ transform: `scale(${productCardSize / 100})`, transformOrigin: "top center" }} className={productLayout === "horizontal" ? "overflow-x-auto" : ""}>
            <DigitalProductsGrid userId={profile.user_id} theme={theme} creatorUsername={username} />
          </section>
        )}

        {/* Store Integrations */}
        {profile.user_id && (
          <section aria-label="Store products" style={{ transform: `scale(${productCardSize / 100})`, transformOrigin: "top center" }} className={productLayout === "horizontal" ? "overflow-x-auto" : ""}>
            <StoreProductGrid userId={profile.user_id} theme={theme} />
          </section>
        )}

        {profile.user_id && <section aria-label="Support and tips"><TipJarDisplay userId={profile.user_id} theme={theme} /></section>}
        {profile.user_id && <section aria-label="Razorpay tip jar"><TipJarBlock userId={profile.user_id} creatorName={profile.display_name || profile.username || undefined} theme={theme} /></section>}
        {profile.user_id && <section aria-label="Contact form"><ContactMeForm creatorId={profile.user_id} creatorName={profile.display_name || profile.username || undefined} theme={theme} /></section>}
        {profile.user_id && <section aria-label="Subscribe to updates"><EmailCaptureBlock creatorId={profile.user_id} creatorName={profile.display_name || profile.username || undefined} theme={theme} /></section>}
        </ProfileModeRouter>


        <AdSenseAd slot="footer" format="horizontal" className="mt-6" profileId={profile.id} />

        {fgAssets.map((asset) => (
          <div key={asset.id} className="pointer-events-none" style={{ position: asset.is_absolute ? "fixed" : "relative", zIndex: asset.z_index, opacity: asset.opacity / 100, left: asset.is_absolute ? `${asset.position_x}%` : undefined, top: asset.is_absolute ? `${asset.position_y}%` : undefined }}>
            {asset.custom_asset_url && <img src={asset.custom_asset_url} alt="" style={{ width: `${asset.width}%`, height: "auto" }} />}
          </div>
        ))}

        {isAudioLab && audioLinks.length > 0 && <FloatingMusicPlayer tracks={audioLinks} theme={theme} />}

        {/* Floating Shopping Cart */}
        <ShoppingCart theme={theme} creatorUsername={username} />

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-12 text-center">
          <a href="/" className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}25`, color: theme.footerText }}>
            <BriooLogo height={18} />
            <span className="text-xs opacity-70">•</span>
            <span className="text-xs">Create your free page →</span>
          </a>
        </motion.footer>
      </main>
    </div>
  );
};

const ProfilePage = () => (
  <CartProvider>
    <ProfilePageContent />
  </CartProvider>
);

export default ProfilePage;