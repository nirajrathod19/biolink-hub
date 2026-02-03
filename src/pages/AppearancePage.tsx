import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Palette, Type, Sparkles, Eye, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { INTEREST_CATEGORIES } from "@/hooks/useHeroAd";

const TEMPLATES = [
  { id: "minimal", name: "Minimal", description: "Clean and simple", color: "#0a0a0f" },
  { id: "dark-neon", name: "Dark Neon", description: "Neon accents", color: "#0f0f1a" },
  { id: "business", name: "Business", description: "Professional style", color: "#1a1a2e" },
  { id: "influencer", name: "Influencer", description: "Bold and colorful", color: "#gradient" },
  { id: "anime", name: "Anime", description: "Playful theme", color: "#1a0a2e" },
  { id: "grid", name: "Grid Layout", description: "Modern grid", color: "#0a0f0a" },
];

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

const AppearancePage = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Update state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setSelectedTemplate(profile.template || "minimal");
      setSelectedColor(profile.theme_color || "#8B5CF6");
      setSelectedInterests(profile.interests || []);
    }
  }, [profile]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(i => i !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio,
        template: selectedTemplate,
        theme_color: selectedColor,
        interests: selectedInterests,
      });
      toast({ title: "Success", description: "Appearance settings saved!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              Appearance
            </h1>
            <p className="text-muted-foreground">
              Customize how your bio page looks
            </p>
          </div>
          <div className="flex gap-3">
            <GradientButton variant="outline">
              <Eye className="w-4 h-4" />
              Preview
            </GradientButton>
            <GradientButton onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </GradientButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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

            {/* Templates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Templates</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="w-full h-20 rounded-lg mb-3"
                        style={{
                          background: template.color === "#gradient"
                            ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                            : template.color,
                        }}
                      />
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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

            {/* Theme Colors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Theme Color</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative w-12 h-12 rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color.value ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <span className="text-xs">+</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-6"
            >
              <GlassCard>
                <h3 className="font-display font-semibold mb-4 text-center">Live Preview</h3>
                <div 
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: TEMPLATES.find(t => t.id === selectedTemplate)?.color === "#gradient"
                      ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                      : TEMPLATES.find(t => t.id === selectedTemplate)?.color || "#0a0a0f",
                  }}
                >
                  <div className="p-6 text-center">
                    {/* Avatar */}
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 p-1"
                      style={{ background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}88)` }}
                    >
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl">
                        👤
                      </div>
                    </div>

                    {/* Name */}
                    <h4 className="font-bold text-lg mb-1" style={{ color: selectedColor }}>
                      {displayName || profile?.username || "Your Name"}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {bio || "Your bio will appear here"}
                    </p>

                    {/* Sample Links */}
                    <div className="space-y-2">
                      {["Link 1", "Link 2", "Link 3"].map((link, i) => (
                        <div
                          key={i}
                          className="py-2 px-4 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: `${selectedColor}20`,
                            borderColor: `${selectedColor}40`,
                            borderWidth: 1,
                          }}
                        >
                          {link}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppearancePage;
