import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocialLinks, useCreateSocialLink } from "@/hooks/useSocialLinks";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500", placeholder: "Enter Instagram username", prefix: "https://instagram.com/" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500", placeholder: "Enter YouTube channel URL", prefix: "https://youtube.com/@" },
  { value: "twitter", label: "Twitter / X", icon: Twitter, color: "text-blue-400", placeholder: "Enter Twitter username", prefix: "https://twitter.com/" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600", placeholder: "Enter LinkedIn URL", prefix: "https://linkedin.com/in/" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500", placeholder: "Enter Facebook username", prefix: "https://facebook.com/" },
  { value: "github", label: "GitHub", icon: Github, color: "text-foreground", placeholder: "Enter GitHub username", prefix: "https://github.com/" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-500", placeholder: "Enter phone number", prefix: "https://wa.me/" },
  { value: "telegram", label: "Telegram", icon: Send, color: "text-blue-400", placeholder: "Enter Telegram username", prefix: "https://t.me/" },
  { value: "snapchat", label: "Snapchat", icon: Camera, color: "text-yellow-400", placeholder: "Enter Snapchat username", prefix: "https://snapchat.com/add/" },
];

interface SocialIconsBarProps {
  isEditable?: boolean;
}

export const SocialIconsBar = ({ isEditable = true }: SocialIconsBarProps) => {
  const { data: socialLinks = [] } = useSocialLinks();
  const createSocialLink = useCreateSocialLink();
  const { toast } = useToast();

  const [selectedPlatform, setSelectedPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [username, setUsername] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get platforms that haven't been added yet
  const availablePlatforms = PLATFORMS.filter(
    platform => !socialLinks.some(link => link.platform === platform.value)
  );

  const handlePlatformClick = (platform: typeof PLATFORMS[0]) => {
    setSelectedPlatform(platform);
    setUsername("");
    setIsDialogOpen(true);
  };

  const handleAddSocialLink = async () => {
    if (!selectedPlatform || !username.trim()) {
      toast({ title: "Error", description: "Please enter a username", variant: "destructive" });
      return;
    }

    const url = selectedPlatform.prefix + username.trim().replace("@", "");

    try {
      await createSocialLink.mutateAsync({ 
        platform: selectedPlatform.value, 
        url 
      });
      setIsDialogOpen(false);
      setSelectedPlatform(null);
      setUsername("");
      toast({ title: "Success", description: `${selectedPlatform.label} added successfully` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Existing social links */}
        {socialLinks.map((link) => {
          const platform = PLATFORMS.find(p => p.value === link.platform);
          if (!platform) return null;
          const Icon = platform.icon;
          
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center ${platform.color} hover:opacity-80 transition-opacity`}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        })}

        {/* Add buttons for available platforms (up to 5 visible) */}
        {isEditable && availablePlatforms.slice(0, 5).map((platform) => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.value}
              onClick={() => handlePlatformClick(platform)}
              className="relative w-10 h-10 rounded-full bg-secondary/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all group"
              title={`Add ${platform.label}`}
            >
              <Icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </button>
          );
        })}

        {/* General add button if there are more platforms */}
        {isEditable && availablePlatforms.length > 5 && (
          <button
            onClick={() => {
              setSelectedPlatform(null);
              setIsDialogOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-secondary/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all"
            title="Add more social links"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Social Link Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlatform ? (
                <>
                  <selectedPlatform.icon className={`w-5 h-5 ${selectedPlatform.color}`} />
                  Add {selectedPlatform.label}
                </>
              ) : (
                "Add Social Link"
              )}
            </DialogTitle>
          </DialogHeader>

          {!selectedPlatform ? (
            <div className="grid grid-cols-3 gap-3 py-4">
              {availablePlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedPlatform(platform)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Icon className={`w-6 h-6 ${platform.color}`} />
                    <span className="text-xs font-medium">{platform.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  {selectedPlatform.label === "WhatsApp" ? "Phone Number" : "Username"}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground bg-secondary px-3 py-2 rounded-l-lg border border-r-0 border-border">
                    {selectedPlatform.prefix}
                  </span>
                  <Input
                    placeholder={selectedPlatform.placeholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-l-none bg-secondary/50 border-border"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: @{selectedPlatform.value === "whatsapp" ? "1234567890" : "yourusername"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleAddSocialLink}
                  disabled={createSocialLink.isPending || !username.trim()}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createSocialLink.isPending ? "Adding..." : "Add"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPlatform(null);
                    setUsername("");
                  }}
                  className="border-border"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
