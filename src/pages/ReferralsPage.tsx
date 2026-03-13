import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Gift, Copy, Check, DollarSign, TrendingUp, Share2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ReferralsPage = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: referrals = [], isLoading: referralsLoading } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const isLoading = profileLoading || referralsLoading;

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : "";

  const totalEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

  const now = new Date();
  const thisMonthEarnings = referrals
    .filter((r) => {
      const d = new Date(r.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + (r.commission_earned || 0), 0);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: "Copied!", description: "Referral link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            Referral Program
          </h1>
          <p className="text-muted-foreground">
            Invite creators and earn commission from platform revenue
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard gradient>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-display font-bold">{referrals.length}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-display font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-display font-bold">${thisMonthEarnings.toFixed(2)}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Referral Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard gradient className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Your Referral Link</h3>
            </div>
            <div className="flex gap-3">
              <Input
                value={referralLink}
                readOnly
                className="bg-secondary/50 border-border font-mono text-sm"
              />
              <GradientButton onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </GradientButton>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Share this link with creators. When they sign up and start earning, you get a commission!
            </p>
          </GlassCard>
        </motion.div>

        {/* Commission Tiers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Commission Structure</h3>
            </div>
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Direct Referrals</span>
                <span className="text-2xl font-display font-bold text-primary">5%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Earn 5% of the platform's revenue share from creators you directly refer
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Referral List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Your Referrals</h3>
              </div>
              <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                {referrals.length} total
              </span>
            </div>
            
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {(referral.referred_username || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          @{referral.referred_username || "unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(referral.created_at), "MMM d, yyyy")} • Level {referral.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-500">
                        +${(referral.commission_earned || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No referrals yet</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Share your referral link with other creators to start earning commissions!
                </p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ReferralsPage;
