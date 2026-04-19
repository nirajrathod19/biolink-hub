import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, GripVertical, Trash2, ExternalLink, Loader2, Clock, Sparkles, Lock, Crown } from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink, useReorderLinks, Link } from "@/hooks/useLinks";
import { useToast } from "@/hooks/use-toast";
import { LinkScheduleDialog } from "@/components/links/LinkScheduleDialog";
import { getLinkAnimationClass } from "@/hooks/useLinkScheduling";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { LiveMobilePreview } from "@/components/dashboard/LiveMobilePreview";
import { ThemeQuickSwitcher } from "@/components/dashboard/ThemeQuickSwitcher";
import { LinkPriorityBadge } from "@/components/dashboard/LinkPriorityBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortableLinkItemProps {
  link: Link;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onSchedule: (link: Link) => void;
  onUpdateAnimation: (id: string, animation: string | null) => void;
  onUpdateLockType: (id: string, lockType: string | null, lockPassword?: string) => void;
  isPro: boolean;
  maxClicks: number;
  totalClicks: number;
}

const SortableLinkItem = ({ link, onToggle, onDelete, onSchedule, onUpdateAnimation, onUpdateLockType, isPro, maxClicks, totalClicks }: SortableLinkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isScheduled = link.scheduled_start || link.scheduled_end;
  const hasAnimation = link.animation && link.animation !== 'none';
  const hasLock = (link as any).lock_type && (link as any).lock_type !== 'none';

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard 
        className={cn(
          !link.is_active && "opacity-60",
          link.is_highlighted && "ring-2 ring-primary",
          hasAnimation && getLinkAnimationClass(link.animation || null),
          isDragging && "shadow-lg ring-2 ring-primary/50"
        )}
      >
        <div className="flex items-center gap-4">
          <button 
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-medium truncate">{link.title}</h3>
              {link.badge && (
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  {link.badge}
                </Badge>
              )}
              {isScheduled && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Badge>
              )}
              {hasAnimation && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {link.animation}
                </Badge>
              )}
              {hasLock && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                  <Lock className="w-3 h-3 mr-1" />
                  {(link as any).lock_type === "password" ? "Password" : "Newsletter"}
                </Badge>
              )}
              <LinkPriorityBadge clicks={link.click_count || 0} maxClicks={maxClicks} totalClicks={totalClicks} />
            </div>
            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm hidden sm:inline">{link.click_count || 0} clicks</span>
          </div>

          {/* Animation Selector */}
          <Select 
            value={link.animation || "none"}
            onValueChange={(val) => onUpdateAnimation(link.id, val === "none" ? null : val)}
          >
            <SelectTrigger className="w-24 h-8 text-xs bg-secondary/50 hidden sm:flex">
              <SelectValue placeholder="Animate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="shake">Shake</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
              <SelectItem value="wobble">Wobble</SelectItem>
            </SelectContent>
          </Select>

          {/* Lock Type Selector - Pro Only */}
          {isPro && (
            <Select
              value={(link as any).lock_type || "none"}
              onValueChange={(val) => onUpdateLockType(link.id, val === "none" ? null : val)}
            >
              <SelectTrigger className="w-24 h-8 text-xs bg-secondary/50 hidden sm:flex">
                <SelectValue placeholder="Lock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Open</SelectItem>
                <SelectItem value="password">🔒 Password</SelectItem>
                <SelectItem value="newsletter">📧 Newsletter</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSchedule(link)}
              className="text-muted-foreground hover:text-primary h-8 w-8"
            >
              <Clock className="w-4 h-4" />
            </Button>
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
              onClick={() => onDelete(link.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Switch
              checked={link.is_active}
              onCheckedChange={() => onToggle(link.id, link.is_active)}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const LinksPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: links = [], isLoading } = useLinks();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const reorderLinks = useReorderLinks();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();
  const { data: profile } = useProfile();

  const [localLinks, setLocalLinks] = useState<Link[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [schedulingLink, setSchedulingLink] = useState<Link | null>(null);

  // Sync local state with fetched data
  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localLinks.findIndex((link) => link.id === active.id);
      const newIndex = localLinks.findIndex((link) => link.id === over.id);
      
      const newOrder = arrayMove(localLinks, oldIndex, newIndex);
      setLocalLinks(newOrder);

      // Update positions in database
      const orderedLinks = newOrder.map((link, index) => ({
        id: link.id,
        position: index,
      }));

      try {
        await reorderLinks.mutateAsync(orderedLinks);
        toast({ title: "Success", description: "Links reordered" });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        // Revert on error
        setLocalLinks(links);
      }
    }
  };

  const toggleLink = async (id: string, isActive: boolean) => {
    try {
      await updateLink.mutateAsync({ id, is_active: !isActive });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id);
      toast({ title: "Success", description: "Link deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addLink = async () => {
    if (!newTitle || !newUrl) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      await createLink.mutateAsync({ 
        title: newTitle, 
        url: newUrl,
        badge: newBadge || undefined,
      });
      setNewTitle("");
      setNewUrl("");
      setNewBadge("");
      setIsAdding(false);
      toast({ title: "Success", description: "Link added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-8">
        {/* Left: Editor */}
        <div className="flex-1 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
                My Links
              </h1>
              <p className="text-muted-foreground">
                Drag to reorder • Toggle to enable/disable • Click clock to schedule
              </p>
            </div>
            <GradientButton onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4" />
              Add New Link
            </GradientButton>
          </div>

        {/* Add New Link Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard gradient>
              <h3 className="font-display font-semibold mb-4">Add New Link</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                  <Input
                    placeholder="e.g., 🎵 My Latest Song"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">URL</label>
                  <Input
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Badge (optional)</label>
                  <Select value={newBadge} onValueChange={setNewBadge}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select a badge" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="none">No badge</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="HOT">HOT</SelectItem>
                      <SelectItem value="SALE">SALE</SelectItem>
                      <SelectItem value="FREE">FREE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <GradientButton onClick={addLink} disabled={createLink.isPending}>
                    {createLink.isPending ? "Adding..." : "Save Link"}
                  </GradientButton>
                  <GradientButton variant="ghost" onClick={() => setIsAdding(false)}>
                    Cancel
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Links List with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localLinks.map(link => link.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {(() => {
                const counts = localLinks.map((l) => l.click_count || 0);
                const maxClicks = counts.length ? Math.max(...counts) : 0;
                const totalClicks = counts.reduce((a, b) => a + b, 0);
                return localLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SortableLinkItem
                    link={link}
                    onToggle={toggleLink}
                    onDelete={handleDeleteLink}
                    onSchedule={setSchedulingLink}
                    isPro={isSubscribed}
                    maxClicks={maxClicks}
                    totalClicks={totalClicks}
                    onUpdateAnimation={async (id, animation) => {
                      try {
                        await updateLink.mutateAsync({ id, animation: animation as any });
                      } catch (e: any) {
                        toast({ title: "Error", description: e.message, variant: "destructive" });
                      }
                    }}
                    onUpdateLockType={async (id, lockType, lockPassword) => {
                      try {
                        const updates: any = { id, lock_type: lockType };
                        if (lockType === "password") {
                          const pw = prompt("Enter the password visitors will need:");
                          if (!pw) return;
                          updates.lock_password = pw;
                        } else {
                          updates.lock_password = null;
                        }
                        await updateLink.mutateAsync(updates);
                        toast({ title: "Success", description: lockType ? "Link locked" : "Link unlocked" });
                      } catch (e: any) {
                        toast({ title: "Error", description: e.message, variant: "destructive" });
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Schedule Dialog */}
        {schedulingLink && (
          <LinkScheduleDialog
            isOpen={!!schedulingLink}
            onClose={() => setSchedulingLink(null)}
            link={schedulingLink}
          />
        )}

          {localLinks.length === 0 && !isAdding && (
            <GlassCard className="text-center py-12">
              <p className="text-muted-foreground mb-4">No links yet. Add your first link!</p>
              <GradientButton onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4" />
                Add New Link
              </GradientButton>
            </GlassCard>
          )}
        </div>

        {/* Right: Live Preview (desktop only) */}
        <div className="hidden xl:block w-[340px] flex-shrink-0">
          <ThemeQuickSwitcher />
          <div className="mt-4">
            <LiveMobilePreview profile={profile || null} links={localLinks} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LinksPage;