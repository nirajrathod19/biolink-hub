import { useState } from "react";
import { Package, Plus, Trash2, Edit, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDigitalProducts,
  useCreateDigitalProduct,
  useUpdateDigitalProduct,
  useDeleteDigitalProduct,
  DigitalProduct,
} from "@/hooks/useDigitalProducts";
import { toast } from "sonner";

export const DigitalProductsManager = () => {
  const { data: products = [], isLoading } = useDigitalProducts();
  const createProduct = useCreateDigitalProduct();
  const updateProduct = useUpdateDigitalProduct();
  const deleteProduct = useDeleteDigitalProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openNewDialog = () => {
    setEditingProduct(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setFileUrl("");
    setPreviewImage("");
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: DigitalProduct) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setFileUrl(product.file_url || "");
    setPreviewImage(product.preview_image || "");
    setIsActive(product.is_active);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title || !price) {
      toast.error("Title and price are required");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          title,
          description: description || null,
          price: parseFloat(price),
          file_url: fileUrl || null,
          preview_image: previewImage || null,
          is_active: isActive,
        });
        toast.success("Product updated!");
      } else {
        await createProduct.mutateAsync({
          title,
          description: description || null,
          price: parseFloat(price),
          currency: "USD",
          file_url: fileUrl || null,
          preview_image: previewImage || null,
          is_active: isActive,
        });
        toast.success("Product created!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <GlassCard>
        <div className="animate-pulse h-48 bg-secondary/50 rounded" />
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Digital Products</h3>
              <p className="text-sm text-muted-foreground">
                Sell downloadable content
              </p>
            </div>
          </div>
          <Button onClick={openNewDialog} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No digital products yet</p>
            <p className="text-sm">Add your first product to start selling</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {product.preview_image ? (
                    <img
                      src={product.preview_image}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-primary font-semibold">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.is_active 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {product.is_active ? "Active" : "Draft"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Digital Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome E-book"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's included in this product..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Price (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  className="pl-9"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>File URL (download link)</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://example.com/my-file.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label>Preview Image URL</Label>
              <Input
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                placeholder="https://example.com/preview.jpg"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <Label>Active (visible to visitors)</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
