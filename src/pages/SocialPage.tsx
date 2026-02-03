import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Github,
  MessageCircle,
  Send,
  Camera
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocialLinks, useCreateSocialLink, useUpdateSocialLink, useDeleteSocialLink } from "@/hooks/useSocialLinks";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
  { value: "twitter", label: "Twitter / X", icon: Twitter, color: "text-blue-400" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { value: "github", label: "GitHub", icon: Github, color: "text-foreground" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
  { value: "telegram", label: "Telegram", icon: Send, color: "text-blue-400" },
  { value: "snapchat", label: "Snapchat", icon: Camera, color: "text-yellow-400" },
];

const getPlatformIcon = (platform: string) => {
  const found = PLATFORMS.find(p => p.value === platform);
  return found || PLATFORMS[0];
};

const SocialPage = () => {
  const { data: socialLinks = [], isLoading } = useSocialLinks();
  const createSocialLink = useCreateSocialLink();
  const updateSocialLink = useUpdateSocialLink();
  const deleteSocialLink = useDeleteSocialLink();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddLink = async () => {
    if (!newPlatform || !newUrl) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      await createSocialLink.mutateAsync({ platform: newPlatform, url: newUrl });
      setNewPlatform("");
      setNewUrl("");
      setIsAdding(false);
      toast({ title: "Success", description: "Social link added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateSocialLink.mutateAsync({ id, is_active: !isActive });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSocialLink.mutateAsync(id);
      toast({ title: "Success", description: "Social link removed" });
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              Social Media
            </h1>
            <p className="text-muted-foreground">
              Connect your social profiles to your bio page
            </p>
          </div>
          <GradientButton onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Social Link
          </GradientButton>
        </div>

        {/* Add New Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard gradient>
              <h3 className="font-display font-semibold mb-4">Add Social Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Platform</label>
                  <Select value={newPlatform} onValueChange={setNewPlatform}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            <platform.icon className={`w-4 h-4 ${platform.color}`} />
                            <span>{platform.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Profile URL</label>
                  <Input
                    placeholder="https://instagram.com/yourprofile"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex gap-3">
                  <GradientButton onClick={handleAddLink} disabled={createSocialLink.isPending}>
                    {createSocialLink.isPending ? "Adding..." : "Add Link"}
                  </GradientButton>
                  <GradientButton variant="ghost" onClick={() => setIsAdding(false)}>
                    Cancel
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Social Links List */}
        <div className="space-y-3">
          {socialLinks.map((link, index) => {
            const platform = getPlatformIcon(link.platform);
            const Icon = platform.icon;
            
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className={!link.is_active ? "opacity-60" : ""}>
                  <div className="flex items-center gap-4">
                    <button className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-5 h-5" />
                    </button>

                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${platform.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{platform.label}</h3>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={() => handleToggle(link.id, link.is_active)}
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {socialLinks.length === 0 && !isAdding && (
          <GlassCard className="text-center py-12">
            <div className="flex justify-center gap-2 mb-4">
              {PLATFORMS.slice(0, 5).map((platform) => (
                <div key={platform.value} className={`w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center ${platform.color}`}>
                  <platform.icon className="w-5 h-5" />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mb-4">No social profiles connected yet</p>
            <GradientButton onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4" />
              Add Your First Social Link
            </GradientButton>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SocialPage;
