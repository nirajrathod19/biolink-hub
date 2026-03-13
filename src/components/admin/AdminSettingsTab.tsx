import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Lock, Fingerprint, Eye, EyeOff, KeyRound, Save, Megaphone, DollarSign, AlertTriangle, CheckCircle, Loader2, Wrench } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useAdSenseSettings, useUpdateAdSenseSettings } from "@/hooks/useAdSense";
import { useHeroAd, useUpsertHeroAd, INTEREST_CATEGORIES } from "@/hooks/useHeroAd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const AdminSettingsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { setupPassword, verifyPassword } = useAdminAuth();
  const { isBiometricAvailable, isBiometricEnabled, isMobile, enableBiometric, disableBiometric, isLoading: biometricLoading } = useBiometricAuth(user?.id);

  // Password dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Global settings
  const { data: globalSettings } = useQuery({
    queryKey: ["admin-global-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("admin_settings").select("setting_key, setting_value");
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.setting_key] = s.setting_value || ""; });
      return map;
    },
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minPayout, setMinPayout] = useState("3");

  useEffect(() => {
    if (globalSettings) {
      setMaintenanceMode(globalSettings.maintenance_mode === "true");
      setMinPayout(globalSettings.min_payout_threshold || "3");
    }
  }, [globalSettings]);

  const saveGlobalSetting = async (key: string, value: string) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    await supabase.from("admin_settings").upsert({
      setting_key: key,
      setting_value: value,
      updated_at: new Date().toISOString(),
      updated_by: currentUser?.id,
    }, { onConflict: "setting_key" });
    queryClient.invalidateQueries({ queryKey: ["admin-global-settings"] });
  };

  // AdSense
  const { data: adsenseSettings } = useAdSenseSettings();
  const updateAdSense = useUpdateAdSenseSettings();
  const [adsensePublisherId, setAdsensePublisherId] = useState("");
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);

  useEffect(() => {
    if (adsenseSettings) {
      setAdsensePublisherId(adsenseSettings.publisherId);
      setAdsenseEnabled(adsenseSettings.enabled);
    }
  }, [adsenseSettings]);

  // Hero Ad
  const { data: heroAd } = useHeroAd();
  const upsertHeroAd = useUpsertHeroAd();
  const [adTitle, setAdTitle] = useState("");
  const [adUrl, setAdUrl] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adActive, setAdActive] = useState(true);
  const [adCategory, setAdCategory] = useState("general");

  useEffect(() => {
    if (heroAd) {
      setAdTitle(heroAd.title);
      setAdUrl(heroAd.url);
      setAdImageUrl(heroAd.image_url || "");
      setAdActive(heroAd.is_active);
      setAdCategory(heroAd.category || "general");
    }
  }, [heroAd]);

  const handleResetPassword = async () => {
    if (!currentPw) { toast({ title: "Error", description: "Enter current password", variant: "destructive" }); return; }
    if (newPw.length < 6) { toast({ title: "Error", description: "Min 6 characters", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Error", description: "Passwords don't match", variant: "destructive" }); return; }
    setPwLoading(true);
    try {
      const result = await verifyPassword.mutateAsync(currentPw);
      if (!result.verified) { toast({ title: "Error", description: "Current password incorrect", variant: "destructive" }); setPwLoading(false); return; }
      await setupPassword.mutateAsync(newPw);
      toast({ title: "Updated", description: "Admin password changed" });
      setShowPasswordDialog(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          System Settings
        </h1>
        <p className="text-muted-foreground text-sm">Global platform configuration and security</p>
      </div>

      <div className="space-y-5">
        {/* Global Platform Settings */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-primary" />
            Platform Controls
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/15 border border-border/30 rounded-lg">
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Maintenance Mode
                </p>
                <p className="text-xs text-muted-foreground">Take the platform offline for updates</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={async (val) => {
                setMaintenanceMode(val);
                await saveGlobalSetting("maintenance_mode", val ? "true" : "false");
                toast({ title: val ? "Maintenance On" : "Maintenance Off" });
              }} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/15 border border-border/30 rounded-lg">
              <div>
                <p className="font-medium text-sm">Minimum Payout Threshold</p>
                <p className="text-xs text-muted-foreground">Minimum $ for creator withdrawals</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input type="number" value={minPayout} onChange={e => setMinPayout(e.target.value)} className="w-20 h-8 text-center bg-card/50" />
                <GradientButton size="sm" variant="outline" onClick={async () => {
                  await saveGlobalSetting("min_payout_threshold", minPayout);
                  toast({ title: "Updated", description: `Min payout set to $${minPayout}` });
                }}>
                  <Save className="w-3 h-3" />
                </GradientButton>
              </div>
            </div>
          </div>
        </div>

        {/* AdSense */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> AdSense Integration</h3>
            <Switch checked={adsenseEnabled} onCheckedChange={setAdsenseEnabled} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Publisher ID</Label>
              <Input value={adsensePublisherId} onChange={e => setAdsensePublisherId(e.target.value)} placeholder="ca-pub-XXX" className="mt-1 bg-card/50 font-mono text-sm" />
            </div>
            <div className="flex items-end">
              <GradientButton size="sm" onClick={async () => {
                try {
                  await updateAdSense.mutateAsync({ publisherId: adsensePublisherId, enabled: adsenseEnabled });
                  toast({ title: "AdSense Saved" });
                } catch { toast({ title: "Error", variant: "destructive" }); }
              }} disabled={updateAdSense.isPending}>
                {updateAdSense.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Save</>}
              </GradientButton>
            </div>
          </div>
        </div>

        {/* Ad Slot Controls */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-4"><Megaphone className="w-4 h-4 text-primary" /> Ad Slot Placement</h3>
          <div className="space-y-3">
            {[
              { key: "ad_slot_header", label: "Header Ad", desc: "Above profile section" },
              { key: "ad_slot_mid", label: "Mid-page Ad", desc: "Between links and products" },
              { key: "ad_slot_footer", label: "Footer Ad", desc: "Bottom of page" },
            ].map((slot) => (
              <div key={slot.key} className="flex items-center justify-between p-3 bg-muted/15 border border-border/30 rounded-lg">
                <div><p className="font-medium text-sm">{slot.label}</p><p className="text-xs text-muted-foreground">{slot.desc}</p></div>
                <Switch defaultChecked onCheckedChange={async (checked) => {
                  await saveGlobalSetting(slot.key, checked ? "true" : "false");
                  toast({ title: `${slot.label} ${checked ? "Enabled" : "Disabled"}` });
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Global Ad Banner */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Global Ad Banner</h3>
            <Switch checked={adActive} onCheckedChange={async (checked) => {
              setAdActive(checked);
              if (heroAd || adTitle) {
                await upsertHeroAd.mutateAsync({ title: adTitle, url: adUrl, image_url: adImageUrl || null, is_active: checked, category: adCategory });
                toast({ title: checked ? "Ad Enabled" : "Ad Disabled" });
              }
            }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div><Label className="text-xs">Title</Label><Input value={adTitle} onChange={e => setAdTitle(e.target.value)} placeholder="Check out our sponsor!" className="mt-1 bg-card/50" /></div>
            <div><Label className="text-xs">URL</Label><Input value={adUrl} onChange={e => setAdUrl(e.target.value)} placeholder="https://sponsor.com" className="mt-1 bg-card/50" /></div>
            <div><Label className="text-xs">Image URL</Label><Input value={adImageUrl} onChange={e => setAdImageUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-card/50" /></div>
            <div><Label className="text-xs">Category</Label>
              <Select value={adCategory} onValueChange={setAdCategory}>
                <SelectTrigger className="mt-1 bg-card/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">🌐 General</SelectItem>
                  {INTEREST_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <GradientButton size="sm" onClick={async () => {
            await upsertHeroAd.mutateAsync({ title: adTitle, url: adUrl, image_url: adImageUrl || null, is_active: adActive, category: adCategory });
            toast({ title: "Ad Saved" });
          }} disabled={upsertHeroAd.isPending || !adTitle || !adUrl}>
            {upsertHeroAd.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Save Ad</>}
          </GradientButton>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-4"><KeyRound className="w-4 h-4 text-primary" /> Admin Security</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <GradientButton variant="outline" onClick={() => setShowPasswordDialog(true)}>
              <Lock className="w-4 h-4 mr-2" /> Change Admin Password
            </GradientButton>
          </div>
          {isMobile && isBiometricAvailable && (
            <div className="flex items-center justify-between mt-4 p-3 bg-muted/15 border border-border/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Biometric Login</p>
                  <p className="text-xs text-muted-foreground">{isBiometricEnabled ? "Enabled" : "Enable for faster access"}</p>
                </div>
              </div>
              <Switch checked={isBiometricEnabled} onCheckedChange={async (val) => val ? await enableBiometric() : disableBiometric()} disabled={biometricLoading} />
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>Enter current password, then set a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Current Password</Label>
              <div className="relative mt-1">
                <Input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" className="pr-10" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative mt-1">
                <Input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm" className="mt-1" />
            </div>
            <GradientButton onClick={handleResetPassword} disabled={pwLoading || !currentPw || newPw.length < 6} className="w-full">
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Update Password</>}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};