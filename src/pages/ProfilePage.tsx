import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
import { RecentSalesTicker } from "@/components/profile/RecentSalesTicker";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { getThemeById } from "@/lib/bioThemes";
import { usePublicLayoutElements } from "@/hooks/useLayoutElements";
import { usePublicDisplayRules } from "@/hooks/useLinkDisplayRules";
import { getVisitorContext, applyDisplayRules } from "@/lib/visitorDetection";
import { ProfileModeRouter, resolveCreatorMode } from "@/components/profile/modes/ProfileModeRouter";
import { BriooLogo } from "@/components/brand/BriooLogo";
import {
  FeaturedSection,
  ProfileHeader,
  ContactSection,
  type QuickAction,
} from "@/features/public-profile";

const CONTENT_TRACK_CATEGORY: Record<string, string> = {
  links: "Creator",
  audio: "Musician",
  video: "Video Creator",
  blog: "Writer",
  shop: "Shop Owner",
  services: "Coach",
  developer: "Developer",
  agency: "Agency",
  founder: "Founder",
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

  // 🚀 Global Page Redirect — fires as soon as profile loads. Runs before
  // any storefront rendering so the visitor is bounced to the creator's
  // configured destination (e.g. their podcast, main site, etc.).
  useEffect(() => {
    if (!profile) return;
    const enabled = (profile as any).enable_global_redirect;
    const dest: string | undefined = (profile as any).global_redirect_url;
    if (enabled && dest) {
      try {
        // Validate: only allow http/https to prevent javascript: injection.
        const u = new URL(dest);
        if (u.protocol === "http:" || u.protocol === "https:") {
          window.location.replace(u.toString());
        }
      } catch {
        /* invalid URL — silently ignore, render page normally */
      }
    }
  }, [profile]);

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

  // While the global redirect is firing, render a neutral splash instead of
  // flashing the storefront underneath.
  if ((profile as any).enable_global_redirect && (profile as any).global_redirect_url) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">
        Redirecting…
      </div>
    );
  }

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

        {(() => {
          const lc = (profile as any).layout_config || {};
          const contentTrack = (profile as any).content_track;
          const category =
            lc.creator_category ||
            (contentTrack ? CONTENT_TRACK_CATEGORY[contentTrack] : null);
          const headerActions: QuickAction[] = [];
          const whatsapp = (profile as any).whatsapp_number;
          const websiteSocial = (socialLinks as any[]).find(
            (s) => s.platform.toLowerCase() === "website",
          );
          if (lc.show_contact !== false) {
            headerActions.push({
              kind: "contact",
              label: "Contact",
              href: "#contact",
              primary: true,
            });
          }
          if (whatsapp) {
            headerActions.push({
              kind: "whatsapp",
              label: "Message",
              href: `https://wa.me/${String(whatsapp).replace(/\D/g, "")}`,
            });
          }
          if (lc.book_call_url) {
            headerActions.push({ kind: "book", label: "Book a call", href: lc.book_call_url });
          }
          if (websiteSocial) {
            headerActions.push({ kind: "website", label: "Website", href: websiteSocial.url });
          }
          return (
            <ProfileHeader
              displayName={profile.display_name || `@${profile.username}`}
              username={profile.username || ""}
              bio={profile.bio}
              avatarUrl={profile.avatar_url}
              coverUrl={lc.cover_image_url}
              category={category}
              location={lc.location}
              isVerified={isVerified}
              isPro={!!(profile as any).is_pro}
              socials={socialLinks as any}
              actions={headerActions}
              theme={theme}
            />
          );
        })()}

        {profile.user_id && (
          <div className="mb-6">
            <ProfileStats
              profileId={profile.id!}
              userId={profile.user_id!}
              initialViews={(profile as any).total_clicks || 0}
              initialClicks={(profile as any).unique_clicks || 0}
              theme={theme}
            />
          </div>
        )}


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
        {profile.user_id && (
          <ContactSection
            creatorId={profile.user_id}
            creatorName={profile.display_name || profile.username || undefined}
            email={(profile as any).contact_email}
            whatsapp={(profile as any).whatsapp_number}
            website={
              (socialLinks as any[]).find((s) => s.platform.toLowerCase() === "website")?.url ||
              (profile as any).layout_config?.website_url
            }
            ctas={((profile as any).layout_config?.contact_ctas as any[]) || []}
            theme={theme}
          />
        )}
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