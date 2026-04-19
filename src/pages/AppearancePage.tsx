import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Type, Heart, Save, Layers, Image, SlidersHorizontal, LayoutGrid, List, Grid3X3, Maximize, Megaphone, Video, Crown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_CATEGORIES } from "@/hooks/useHeroAd";
import { ThemeGallery } from "@/components/appearance/ThemeGallery";
import { ThemeLivePreview } from "@/components/appearance/ThemeLivePreview";
import { AssetLayerManager } from "@/components/appearance/AssetLayerManager";
import { AIColorMatcher } from "@/components/appearance/AIColorMatcher";

const AppearancePage = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { isSubscribed, currentPlan } = useSubscription();
  const isPro = isSubscribed && (currentPlan === "starter" || currentPlan === "full" || currentPlan === "pro");
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("minimal-mono");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [productCardSize, setProductCardSize] = useState(100);
  const [productLayout, setProductLayout] = useState<"vertical" | "horizontal">("vertical");
  const [viewMode, setViewMode] = useState<"list" | "tiles" | "xl-icons">("tiles");
  const [announcementText, setAnnouncementText] = useState("");
  const [videoBgUrl, setVideoBgUrl] = useState("");
  const [videoOverlay, setVideoOverlay] = useState(40);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setSelectedTheme(profile.template || "minimal-mono");
      setSelectedInterests(profile.interests || []);
      const config = (profile as any).layout_config || {};
      setProductCardSize(config.product_card_size || 100);
      setProductLayout(config.product_layout || "vertical");
      setViewMode(config.view_mode || "tiles");
      setAnnouncementText((profile as any).announcement_text || "");
      setVideoBgUrl((profile as any).video_background_url || "");
      setVideoOverlay((profile as any).video_overlay_opacity ?? 40);
    }
  }, [profile]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio,
        template: selectedTheme,
        interests: selectedInterests,
        announcement_text: announcementText || null,
        video_background_url: isPro ? (videoBgUrl || null) : null,
        video_overlay_opacity: videoOverlay,
        layout_config: {
          product_card_size: productCardSize,
          product_layout: productLayout,
          view_mode: viewMode,
        },
      } as any);
      toast({ title: "Saved!", description: "Your appearance settings have been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Customized</h1>
            <p className="text-muted-foreground">Design your bio page with explorer layouts, layers & assets</p>
          </div>
          <div className="flex gap-3">
            <GradientButton
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </GradientButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Profile Info</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-secondary/50 border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell visitors about yourself..."
                      className="bg-secondary/50 border-border mt-1 min-h-[100px]"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Theme Gallery (renamed to Customized) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <ThemeGallery
                  selectedThemeId={selectedTheme}
                  onSelect={setSelectedTheme}
                />
              </GlassCard>
            </motion.div>

            {/* Product & Store Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Product Display</h3>
                </div>

                <div className="space-y-5">
                  {/* Card Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Card Size</Label>
                      <span className="text-xs font-mono text-muted-foreground">{productCardSize}%</span>
                    </div>
                    <Slider
                      value={[productCardSize]}
                      onValueChange={([val]) => setProductCardSize(val)}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>

                  {/* Layout Toggle */}
                  <div className="space-y-2">
                    <Label className="text-sm">Layout Direction</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setProductLayout("vertical")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-medium transition-all ${
                          productLayout === "vertical"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        📄 Row-by-Row
                      </button>
                      <button
                        onClick={() => setProductLayout("horizontal")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-medium transition-all ${
                          productLayout === "horizontal"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ↔️ Scroll View
                      </button>
                    </div>
                  </div>

                  {/* View Mode */}
                  <div className="space-y-2">
                    <Label className="text-sm">View</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("xl-icons")}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                          viewMode === "xl-icons"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Maximize className="w-3.5 h-3.5" />
                        Extra Large
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                          viewMode === "list"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        List
                      </button>
                      <button
                        onClick={() => setViewMode("tiles")}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                          viewMode === "tiles"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Grid3X3 className="w-3.5 h-3.5" />
                        Tiles
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Announcement Bar */}
            {isPro && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-3">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-sm">Announcement Bar</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add a scrolling marquee at the top of your profile for urgent updates.
                  </p>
                  <Input
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="e.g. 🔥 New merch drop this Friday!"
                    maxLength={200}
                    className="bg-secondary/50 border-border"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{announcementText.length}/200 — leave empty to hide</p>
                </GlassCard>
              </motion.div>
            )}

            {/* AI Color Matcher (Pro only) */}
            {isPro && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.19 }}
              >
                <AIColorMatcher
                  avatarUrl={profile?.avatar_url || null}
                  onApplyColor={(color) => {
                    // Apply as theme_color
                    updateProfile.mutateAsync({ theme_color: color } as any).then(() => {
                      toast({ title: "Color applied!", description: `Theme color set to ${color}` });
                    });
                  }}
                />
              </motion.div>
            )}

            {/* Custom Asset Uploads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AssetLayerManager />
            </motion.div>


            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Your Interests</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Select your interests to see relevant ads on creator pages
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_CATEGORIES.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedInterests.includes(interest.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {interest.icon} {interest.name}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-6"
            >
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">Live Preview</h3>
                </div>
                <ThemeLivePreview
                  themeId={selectedTheme}
                  displayName={displayName || profile?.username || ""}
                  bio={bio}
                  avatarUrl={profile?.avatar_url}
                />
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppearancePage;