import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Trash2,
  Plus,
  Upload,
  Loader2,
  Image,
  FileText,
  Video,
  Eye,
  EyeOff,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
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
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useAllGuidePages,
  useCreateGuidePage,
  useUpdateGuidePage,
  useDeleteGuidePage,
  useReorderGuidePages,
  useUploadGuideFile,
  useDeleteGuideFile,
  GuidePage,
} from "@/hooks/useGuidePages";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SortableGuideItemProps {
  page: GuidePage;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (page: GuidePage) => void;
  onEdit: (page: GuidePage) => void;
}

const SortableGuideItem = ({ page, onToggle, onDelete, onEdit }: SortableGuideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const getFileIcon = () => {
    switch (page.file_type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard
        className={cn(
          "p-3",
          !page.is_active && "opacity-60",
          isDragging && "shadow-lg ring-2 ring-primary/50"
        )}
      >
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Thumbnail */}
          <div className="w-16 h-12 rounded-lg bg-secondary overflow-hidden flex items-center justify-center shrink-0">
            {page.file_type === "image" ? (
              <img
                src={page.file_url}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground">
                {getFileIcon()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{page.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {page.file_type.toUpperCase()} • Page {page.position + 1}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(page)}
              className="h-8 w-8"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <button
              className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
              onClick={() => onDelete(page)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Switch
              checked={page.is_active}
              onCheckedChange={() => onToggle(page.id, page.is_active)}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Admin Preview Component - shows exactly what users will see
const GuidePreview = ({ pages, onClose }: { pages: GuidePage[]; onClose: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const activePages = pages.filter((p) => p.is_active);

  if (activePages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No active pages to preview.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Enable some pages to see how users will view the guide.
        </p>
      </div>
    );
  }

  const page = activePages[currentPage];

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % activePages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + activePages.length) % activePages.length);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={page.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col items-center"
          >
            {/* Title */}
            <h3 className="text-lg font-display font-bold mb-2 text-center">
              {page.title}
            </h3>
            {page.description && (
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                {page.description}
              </p>
            )}

            {/* Content */}
            <div className="flex-1 w-full max-w-2xl rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center">
              {page.file_type === "image" ? (
                <img
                  src={page.file_url}
                  alt={page.title}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : page.file_type === "video" ? (
                <video
                  src={page.file_url}
                  controls
                  className="max-w-full max-h-[400px]"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 p-8">
                  <FileText className="w-16 h-16 text-muted-foreground" />
                  <a
                    href={page.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Open PDF in new tab
                  </a>
                  <iframe
                    src={page.file_url}
                    className="w-full h-[300px] rounded-lg border border-border"
                    title={page.title}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevPage}
          disabled={activePages.length <= 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentPage + 1} / {activePages.length}
          </span>
          <div className="flex gap-1">
            {activePages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === index
                    ? "bg-primary w-4"
                    : "bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextPage}
          disabled={activePages.length <= 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const GuideManager = () => {
  const { toast } = useToast();
  const { data: pages = [], isLoading } = useAllGuidePages();
  const createPage = useCreateGuidePage();
  const updatePage = useUpdateGuidePage();
  const deletePage = useDeleteGuidePage();
  const reorderPages = useReorderGuidePages();
  const uploadFile = useUploadGuideFile();
  const deleteFile = useDeleteGuideFile();

  const [localPages, setLocalPages] = useState<GuidePage[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPage, setEditingPage] = useState<GuidePage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setLocalPages(pages);
  }, [pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localPages.findIndex((p) => p.id === active.id);
      const newIndex = localPages.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(localPages, oldIndex, newIndex);
      setLocalPages(newOrder);

      const orderedPages = newOrder.map((page, index) => ({
        id: page.id,
        position: index,
      }));

      try {
        await reorderPages.mutateAsync(orderedPages);
        toast({ title: "Success", description: "Pages reordered" });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setLocalPages(pages);
      }
    }
  };

  const getFileType = (file: File): "image" | "pdf" | "video" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("video/")) return "video";
    return "image";
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        const fileUrl = await uploadFile.mutateAsync(file);
        const fileType = getFileType(file);

        await createPage.mutateAsync({
          title: newTitle || file.name.split(".")[0],
          description: newDescription || undefined,
          file_url: fileUrl,
          file_type: fileType,
        });
      }

      setNewTitle("");
      setNewDescription("");
      setIsAdding(false);
      toast({ title: "Success", description: "Guide page(s) added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [newTitle, newDescription]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updatePage.mutateAsync({ id, is_active: !isActive });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (page: GuidePage) => {
    try {
      // Delete file from storage first
      await deleteFile.mutateAsync(page.file_url);
      // Then delete the database record
      await deletePage.mutateAsync(page.id);
      toast({ title: "Success", description: "Guide page deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    if (!editingPage) return;

    try {
      await updatePage.mutateAsync({
        id: editingPage.id,
        title: editingPage.title,
        description: editingPage.description,
      });
      toast({ title: "Success", description: "Guide page updated" });
      setEditingPage(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            How to Use Guide
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload and manage guide pages shown to all users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            disabled={localPages.length === 0}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            Preview as User
          </Button>
          <GradientButton onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Page
          </GradientButton>
        </div>
      </div>

      {/* Add New Page Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard gradient>
            <h3 className="font-display font-semibold mb-4">Add New Guide Page</h3>
            <div className="space-y-4">
              <div>
                <Label>Title (optional - defaults to filename)</Label>
                <Input
                  placeholder="e.g., Getting Started"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Brief description of this page..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                  dragOver
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                {uploadingFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Supports: Images, PDFs, Videos (Max 50MB)
                    </p>
                    <label>
                      <input
                        type="file"
                        accept="image/*,application/pdf,video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <Button variant="outline" asChild>
                        <span>Or browse files</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <GradientButton
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle("");
                    setNewDescription("");
                  }}
                >
                  Cancel
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Pages List */}
      {localPages.length === 0 && !isAdding ? (
        <GlassCard className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No guide pages yet. Add your first page!
          </p>
          <GradientButton onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Page
          </GradientButton>
        </GlassCard>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localPages.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SortableGuideItem
                    page={page}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={setEditingPage}
                  />
                </motion.div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Guide Page</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden bg-secondary aspect-video flex items-center justify-center">
                {editingPage.file_type === "image" ? (
                  <img
                    src={editingPage.file_url}
                    alt={editingPage.title}
                    className="w-full h-full object-contain"
                  />
                ) : editingPage.file_type === "video" ? (
                  <video
                    src={editingPage.file_url}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-12 h-12" />
                    <a
                      href={editingPage.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View PDF
                    </a>
                  </div>
                )}
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={editingPage.title}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, title: e.target.value })
                  }
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingPage.description || ""}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, description: e.target.value })
                  }
                  className="bg-secondary/50 border-border mt-1"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditingPage(null)}>
                  Cancel
                </Button>
                <GradientButton onClick={handleEditSave}>
                  Save Changes
                </GradientButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog - Shows exactly what users will see */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              Preview: How to Use Guide
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full">
                Admin Preview
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px]">
            <GuidePreview pages={localPages} onClose={() => setIsPreviewOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
