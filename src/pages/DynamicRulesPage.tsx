import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Zap,
  Globe,
  Smartphone,
  Clock,
  ArrowUpDown,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLinks } from "@/hooks/useLinks";
import {
  useLinkDisplayRules,
  useCreateDisplayRule,
  useUpdateDisplayRule,
  useDeleteDisplayRule,
} from "@/hooks/useLinkDisplayRules";
import { Checkbox } from "@/components/ui/checkbox";

const CONDITION_TYPES = [
  { value: "source", label: "Visitor Source", icon: Globe },
  { value: "device", label: "Device Type", icon: Smartphone },
  { value: "time", label: "Time of Day", icon: Clock },
];

const SOURCE_OPTIONS = [
  "instagram", "linkedin", "twitter", "facebook", "youtube",
  "tiktok", "reddit", "google", "whatsapp", "telegram", "direct", "referral",
];

const DEVICE_OPTIONS = ["mobile", "desktop", "tablet"];
const TIME_OPTIONS = ["morning", "afternoon", "evening", "night"];

const DynamicRulesPage = () => {
  const { toast } = useToast();
  const { data: rules = [], isLoading } = useLinkDisplayRules();
  const { data: links = [] } = useLinks();
  const createRule = useCreateDisplayRule();
  const updateRule = useUpdateDisplayRule();
  const deleteRule = useDeleteDisplayRule();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    condition_type: "source",
    condition_value: "",
    action: "show" as "show" | "hide",
    link_ids: [] as string[],
    is_active: true,
    priority: 0,
  });

  const getConditionOptions = (type: string) => {
    switch (type) {
      case "source": return SOURCE_OPTIONS;
      case "device": return DEVICE_OPTIONS;
      case "time": return TIME_OPTIONS;
      default: return [];
    }
  };

  const handleCreate = async () => {
    if (!newRule.name || !newRule.condition_value || newRule.link_ids.length === 0) {
      toast({ title: "Missing fields", description: "Please fill all fields and select at least one link.", variant: "destructive" });
      return;
    }
    try {
      await createRule.mutateAsync({
        ...newRule,
        priority: rules.length,
      });
      toast({ title: "Rule created!" });
      setShowCreateDialog(false);
      setNewRule({ name: "", condition_type: "source", condition_value: "", action: "show", link_ids: [], is_active: true, priority: 0 });
    } catch {
      toast({ title: "Error creating rule", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await updateRule.mutateAsync({ id, is_active: !currentActive });
    } catch {
      toast({ title: "Error updating rule", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRule.mutateAsync(id);
      toast({ title: "Rule deleted" });
    } catch {
      toast({ title: "Error deleting rule", variant: "destructive" });
    }
  };

  const toggleLinkSelection = (linkId: string) => {
    setNewRule((prev) => ({
      ...prev,
      link_ids: prev.link_ids.includes(linkId)
        ? prev.link_ids.filter((id) => id !== linkId)
        : [...prev.link_ids, linkId],
    }));
  };

  const getConditionIcon = (type: string) => {
    const item = CONDITION_TYPES.find((c) => c.value === type);
    return item ? item.icon : Globe;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Dynamic Link Rules
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Show or hide links based on visitor source, device, or time of day
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Display Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="e.g. Show portfolio for LinkedIn visitors"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Condition</Label>
                    <Select
                      value={newRule.condition_type}
                      onValueChange={(v) => setNewRule({ ...newRule, condition_type: v, condition_value: "" })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONDITION_TYPES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Select
                      value={newRule.condition_value}
                      onValueChange={(v) => setNewRule({ ...newRule, condition_value: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {getConditionOptions(newRule.condition_type).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(v) => setNewRule({ ...newRule, action: v as "show" | "hide" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Show only these links</span>
                      </SelectItem>
                      <SelectItem value="hide">
                        <span className="flex items-center gap-2"><EyeOff className="w-4 h-4" /> Hide these links</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Select Links</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                    {links.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No links found. Create links first.</p>
                    ) : (
                      links.map((link) => (
                        <label
                          key={link.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={newRule.link_ids.includes(link.id)}
                            onCheckedChange={() => toggleLinkSelection(link.id)}
                          />
                          <span className="text-sm truncate">{link.title}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <Button onClick={handleCreate} className="w-full gap-2" disabled={createRule.isPending}>
                  <Save className="w-4 h-4" />
                  {createRule.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* How it works */}
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            How Priority Works
          </h3>
          <p className="text-xs text-muted-foreground">
            Rules are evaluated top-to-bottom. Higher priority rules (lower number) are applied first.
            If no rule matches a visitor, all links are shown by default (fallback).
          </p>
        </GlassCard>

        {/* Rules List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No Rules Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first rule to dynamically show or hide links based on visitor context.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create First Rule
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {rules.map((rule, index) => {
                const CondIcon = getConditionIcon(rule.condition_type);
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1 text-muted-foreground">
                          <GripVertical className="w-4 h-4" />
                          <span className="text-xs font-mono min-w-[20px]">#{rule.priority + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{rule.name}</h4>
                            <Badge variant={rule.is_active ? "default" : "secondary"} className="text-xs">
                              {rule.is_active ? "Active" : "Disabled"}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CondIcon className="w-3 h-3" />
                              {rule.condition_type}: <strong>{rule.condition_value}</strong>
                            </span>
                            <span>→</span>
                            <span className="flex items-center gap-1">
                              {rule.action === "show" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {rule.action === "show" ? "Show" : "Hide"} {rule.link_ids.length} link(s)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(rule.id, rule.is_active)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title={rule.is_active ? "Disable" : "Enable"}
                          >
                            {rule.is_active ? (
                              <ToggleRight className="w-5 h-5 text-primary" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DynamicRulesPage;