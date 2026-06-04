import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useReorderLinks,
  Link as LinkRow,
} from "@/hooks/useLinks";
import { useProfile } from "@/hooks/useProfile";
import { LivePhonePreview } from "./LivePhonePreview";

interface RowProps {
  link: LinkRow;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onToggleActive: (link: LinkRow) => void;
  onToggleFeatured: (link: LinkRow) => void;
  onDuplicate: (link: LinkRow) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, patch: Partial<LinkRow>) => Promise<void>;
}

const LinkRowCard = ({
  link,
  selected,
  onSelect,
  onToggleActive,
  onToggleFeatured,
  onDuplicate,
  onDelete,
  onSave,
}: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [thumb, setThumb] = useState(link.icon || "");

  useEffect(() => {
    setTitle(link.title);
    setUrl(link.url);
    setThumb(link.icon || "");
  }, [link.id, link.title, link.url, link.icon]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleSave = async () => {
    await onSave(link.id, { title, url, icon: thumb || null });
    setEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group relative rounded-2xl border bg-card transition-all",
          "border-border hover:border-primary/40 hover:shadow-sm",
          !link.is_active && "opacity-60",
          link.is_highlighted && "ring-1 ring-accent/60",
          isDragging && "shadow-lg ring-2 ring-primary/40"
        )}
      >
        <div className="flex items-center gap-3 p-3 sm:p-4">
          {/* Select */}
          <button
            onClick={() => onSelect(link.id, !selected)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={selected ? "Deselect" : "Select"}
          >
            {selected ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Drag handle */}
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Thumbnail */}
          <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0 grid place-items-center">
            {link.icon ? (
              <img src={link.icon} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Link title"
                  className="h-8"
                />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  className="h-8 text-xs"
                />
                <Input
                  value={thumb}
                  onChange={(e) => setThumb(e.target.value)}
                  placeholder="Thumbnail URL (optional)"
                  className="h-8 text-xs"
                />
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-left w-full"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{link.title}</span>
                  {link.is_highlighted && (
                    <Badge variant="secondary" className="bg-accent/15 text-accent border-0 text-[10px]">
                      <Star className="w-2.5 h-2.5 mr-0.5" /> Featured
                    </Badge>
                  )}
                  {link.badge && (
                    <Badge variant="outline" className="text-[10px]">{link.badge}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
              </button>
            )}
          </div>

          {/* Actions */}
          {editing ? (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 text-primary">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditing(false)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onToggleFeatured(link)}
                className={cn("h-8 w-8", link.is_highlighted && "text-accent")}
                title="Feature link"
              >
                <Star className={cn("w-4 h-4", link.is_highlighted && "fill-current")} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditing(true)}
                className="h-8 w-8"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDuplicate(link)}
                className="h-8 w-8"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(link.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="ml-1 pl-1 border-l border-border">
                <Switch
                  checked={link.is_active}
                  onCheckedChange={() => onToggleActive(link)}
                  aria-label="Toggle link visibility"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfileBuilder = () => {
  const { data: links = [], isLoading } = useLinks();
  const { data: profile } = useProfile();
  const create = useCreateLink();
  const update = useUpdateLink();
  const del = useDeleteLink();
  const reorder = useReorderLinks();
  const { toast } = useToast();

  const [localLinks, setLocalLinks] = useState<LinkRow[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = localLinks.findIndex((l) => l.id === active.id);
    const newIdx = localLinks.findIndex((l) => l.id === over.id);
    const next = arrayMove(localLinks, oldIdx, newIdx);
    setLocalLinks(next);
    try {
      await reorder.mutateAsync(next.map((l, i) => ({ id: l.id, position: i })));
    } catch (err: any) {
      toast({ title: "Reorder failed", description: err.message, variant: "destructive" });
      setLocalLinks(links);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      toast({ title: "Add link", description: "Title and URL are required", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({ title: newTitle.trim(), url: newUrl.trim() });
      setNewTitle("");
      setNewUrl("");
      setAdding(false);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSavePatch = async (id: string, patch: Partial<LinkRow>) => {
    try {
      await update.mutateAsync({ id, ...patch });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDuplicate = async (link: LinkRow) => {
    try {
      await create.mutateAsync({
        title: `${link.title} (copy)`,
        url: link.url,
        badge: link.badge || undefined,
        icon: link.icon || undefined,
      });
    } catch (err: any) {
      toast({ title: "Duplicate failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const bulkAction = async (action: "show" | "hide" | "delete" | "feature" | "unfeature") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        if (action === "delete") await del.mutateAsync(id);
        else if (action === "show") await update.mutateAsync({ id, is_active: true });
        else if (action === "hide") await update.mutateAsync({ id, is_active: false });
        else if (action === "feature") await update.mutateAsync({ id, is_highlighted: true });
        else if (action === "unfeature") await update.mutateAsync({ id, is_highlighted: false });
      }
      setSelectedIds(new Set());
      toast({ title: "Done", description: `${ids.length} link(s) updated` });
    } catch (err: any) {
      toast({ title: "Bulk action failed", description: err.message, variant: "destructive" });
    }
  };

  const featuredCount = useMemo(
    () => localLinks.filter((l) => l.is_highlighted).length,
    [localLinks]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 lg:gap-10">
      {/* LEFT — editor */}
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Build your page
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {localLinks.length} link{localLinks.length === 1 ? "" : "s"} · {featuredCount} featured
            </p>
          </div>
          <Button
            onClick={() => setAdding(true)}
            className="bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add link
          </Button>
        </div>

        {/* Quick-add */}
        <AnimatePresence initial={false}>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Input
                  placeholder="https://"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAdd} disabled={create.isPending}>
                    {create.isPending ? "Adding…" : "Save"}
                  </Button>
                  <Button variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="sticky top-2 z-30 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 backdrop-blur p-2"
            >
              <span className="px-2 text-xs font-medium text-primary">
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="ghost" onClick={() => bulkAction("show")}>
                <Eye className="w-3.5 h-3.5 mr-1" /> Show
              </Button>
              <Button size="sm" variant="ghost" onClick={() => bulkAction("hide")}>
                <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide
              </Button>
              <Button size="sm" variant="ghost" onClick={() => bulkAction("feature")}>
                <Star className="w-3.5 h-3.5 mr-1" /> Feature
              </Button>
              <Button size="sm" variant="ghost" onClick={() => bulkAction("unfeature")}>
                Unfeature
              </Button>
              <div className="ml-auto" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => bulkAction("delete")}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : localLinks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Sparkles className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium">Your page is ready for its first link.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a link to start sharing your world.
            </p>
            <Button className="mt-4" onClick={() => setAdding(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add your first link
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5">
                {localLinks.map((link) => (
                  <LinkRowCard
                    key={link.id}
                    link={link}
                    selected={selectedIds.has(link.id)}
                    onSelect={handleSelect}
                    onToggleActive={(l) => handleSavePatch(l.id, { is_active: !l.is_active })}
                    onToggleFeatured={(l) =>
                      handleSavePatch(l.id, { is_highlighted: !l.is_highlighted })
                    }
                    onDuplicate={handleDuplicate}
                    onDelete={(id) => del.mutate(id)}
                    onSave={handleSavePatch}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* RIGHT — preview */}
      <div className="hidden lg:block">
        <LivePhonePreview profile={profile as any} links={localLinks} />
      </div>
    </div>
  );
};

export default ProfileBuilder;
