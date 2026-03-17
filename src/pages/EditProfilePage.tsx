import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  User,
  AtSign,
  FileText,
  Link2,
  Palette,
  Sparkles,
  Eye,
  Save,
  Check,
  Heart,
  Globe,
  Image as ImageIcon,
  Bot,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { INTEREST_CATEGORIES } from "@/hooks/useHeroAd";
import { Link } from "react-router-dom";
import { ThemeGallery } from "@/components/appearance/ThemeGallery";
import { intentOptions } from "@/components/onboarding/IntentSurvey";
import { Switch } from "@/components/ui/switch";

const THEME_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Yellow", value: "#EAB308" },
];

// TEMPLATES removed — now using ThemeGallery with all 29 bio themes

const EditProfilePage = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeIntents, setActiveIntents] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setWhatsappNumber(profile.whatsapp_number || "");
      const bd = profile.bank_details || {};
      setBankAccountNo(bd.account_no || "");
      setBankIfsc(bd.ifsc || "");
      setAvatarUrl(profile.avatar_url);
      setSelectedTemplate(profile.template || "minimal");
      setSelectedColor(profile.theme_color || "#8B5CF6");
      setSelectedInterests(profile.interests || []);
      setActiveIntents(profile.content_track ? profile.content_track.split(",") : []);
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 10MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Compress to WebP
      setUploadStatus("Compressing image...");
      const compressed = await compressImage(file, "avatar");

      setUploadStatus("Uploading...");
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, { upsert: true, contentType: "image/webp" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithTimestamp);
      await updateProfile.mutateAsync({ avatar_url: urlWithTimestamp });
      toast({ title: "Photo updated!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((i) => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast({ title: "Error", description: "Username is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      await updateProfile.mutateAsync({
        display_name: displayName,
        username: cleanUsername,
        bio,
        template: selectedTemplate,
        theme_color: selectedColor,
        interests: selectedInterests,
        whatsapp_number: whatsappNumber || null,
        bank_details: (bankAccountNo || bankIfsc) ? { account_no: bankAccountNo, ifsc: bankIfsc } : null,
        content_track: activeIntents.length > 0 ? activeIntents.join(",") : null,
        user_intent: activeIntents.length > 0 ? { selections: activeIntents, updated_at: new Date().toISOString() } : null,
      } as any);
      setUsername(cleanUsername);
      toast({ title: "Profile saved!", description: "Your changes are live." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              Edit Profile
            </h1>
            <p className="text-muted-foreground text-sm">
              Change how people see you on your bio page
            </p>
          </div>
          <div className="flex gap-2">
            {profile?.username && (
              <Link to={`/${profile.username}`} target="_blank">
                <GradientButton variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </GradientButton>
              </Link>
            )}
          </div>
        </div>

        {/* Profile Photo Section - Instagram style */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full p-0.5 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}88)`,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover bg-background"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-3xl font-bold text-muted-foreground">
                      {displayName?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">
                  {displayName || username || "Your Name"}
                </h3>
                <p className="text-muted-foreground text-sm">@{username || "username"}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: selectedColor }}
                >
                  {uploading ? (uploadStatus || "Uploading...") : "Change profile photo"}
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Basic Info</h3>
            </div>
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-secondary/50 border-border mt-1.5"
                  maxLength={50}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                <div className="relative mt-1.5">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username"
                    className="bg-secondary/50 border-border pl-9"
                    maxLength={30}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  brioo.in/{username || "username"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself ✨"
                  className="bg-secondary/50 border-border mt-1.5 min-h-[100px] resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {bio.length}/300
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">WhatsApp Number (for order notifications)</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-secondary/50 border-border mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Customers will send order details to this number
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Bank Account No.</Label>
                  <Input
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="1234567890"
                    className="bg-secondary/50 border-border mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">IFSC Code</Label>
                  <Input
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="bg-secondary/50 border-border mt-1.5"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Theme Color */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Theme Color</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                  )}
                </button>
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                />
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-xs">+</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Theme / Template */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Page Theme</h3>
            </div>
            <ThemeGallery
              selectedThemeId={selectedTemplate}
              onSelect={(id) => setSelectedTemplate(id)}
            />
          </GlassCard>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTEREST_CATEGORIES.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Manage Your Page</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/dashboard/links"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm"
              >
                <Link2 className="w-4 h-4 text-primary" />
                Edit Links
              </Link>
              <Link
                to="/dashboard/social"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm"
              >
                <Globe className="w-4 h-4 text-primary" />
                Social Media
              </Link>
              <Link
                to="/dashboard/community"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm"
              >
                <FileText className="w-4 h-4 text-primary" />
                Community
              </Link>
              <Link
                to="/dashboard/appearance"
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm"
              >
                <Palette className="w-4 h-4 text-primary" />
                Appearance
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Settings - Feature Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          <GlassCard className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">AI Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which features appear on your dashboard. Re-run your onboarding preferences anytime.
            </p>
            <div className="space-y-3">
              {intentOptions.map((opt) => {
                const isActive = activeIntents.includes(opt.id);
                return (
                  <div key={opt.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <opt.icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.labelHi}</p>
                      </div>
                      {opt.tier === "pro" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground font-semibold uppercase">Pro</span>
                      )}
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => {
                        setActiveIntents((prev) =>
                          checked ? [...prev, opt.id] : prev.filter((i) => i !== opt.id)
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button - Sticky */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sticky bottom-4 z-10"
        >
          <GradientButton
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 text-base"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </GradientButton>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EditProfilePage;