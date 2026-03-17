import { Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
}

export const ProUpgradeModal = ({ open, onClose, feature }: ProUpgradeModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-display font-bold">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            <strong>{feature}</strong> is a Pro-only feature. Upgrade your plan to unlock selling products, connecting stores, adding PDFs, and more.
          </DialogDescription>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button
              onClick={() => { onClose(); navigate("/dashboard/settings"); }}
              className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" /> Upgrade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};