import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  Check, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail,
  MessageCircle 
} from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username: string | undefined;
}

export const ShareDialog = ({ isOpen, onOpenChange, username }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  
  // Construct the full URL
  const baseUrl = window.location.origin;
  const shareUrl = username ? `${baseUrl}/${username}` : baseUrl;
  const shareText = `Check out my bio link!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      color: "hover:text-green-500 hover:bg-green-50",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "hover:text-blue-400 hover:bg-blue-50",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-700 hover:bg-blue-50",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-600 hover:bg-blue-50",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent("Check out this link: " + shareUrl)}`,
      color: "hover:text-gray-600 hover:bg-gray-50",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your Bio Link</DialogTitle>
          <DialogDescription>Share your profile with the world.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center space-x-2">
            <Input readOnly value={shareUrl} className="h-11 bg-secondary/50 font-medium text-muted-foreground" />
            <Button onClick={handleCopy} size="icon" className="h-11 w-11 shrink-0" variant={copied ? "outline" : "default"}>
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2 place-items-center">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-secondary/50 transition-colors ${social.color} group`}
              >
                <social.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};