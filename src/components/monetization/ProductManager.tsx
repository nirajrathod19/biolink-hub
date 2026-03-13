import { useState, useRef } from "react";
import { Package, Plus, Trash2, Edit, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useProductCategories, Product,
} from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import { CURRENCIES } from "@/hooks/useExchangeRates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";

const getCurrencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const ProductManager = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: existingCategories = [] } = useProductCategories();
  const { data: profile } = useProfile();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showRequiredPopup, setShowRequiredPopup] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [allowCod, setAllowCod] = useState(false);
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle(""); setDescription(""); setPrice(""); setCurrency("INR");
    setCategory(""); setNewCategory(""); setAllowCod(false); setActive(true); setImages([]);
  };

  const openNew = () => { setEditing(null); resetForm(); setIsDialogOpen(true); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setTitle(p.title); setDescription(p.description || ""); setPrice(p.price.toString());
    setCurrency(p.currency || "INR"); setCategory(p.category || ""); setNewCategory("");
    setAllowCod(p.allow_cod || false); setActive(p.active); setImages(p.images || []);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true, fileType: "image/webp",
        });
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
        const { error } = await supabase.storage.from("product-images").upload(fileName, compressed);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
        newUrls.push(urlData.publicUrl);
      } catch (e: any) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const checkCreatorReady = (): boolean => {
    if (!profile) return false;
    
    const whatsapp = profile.whatsapp_number;
    const bank = profile.bank_details;

    // सुनिश्चित करें कि बैंक डिटेल्स और व्हाट्सएप्प दोनों मौजूद हैं
    if (!whatsapp || !bank || !bank.account_no || !bank.ifsc) {
        setShowRequiredPopup(true);
        return false;
    }
    return true;
    };

  const handleSave = async () => {
    if (!title || !price) { toast.error("Title and price are required"); return; }
    if (!checkCreatorReady()) return;

    // पक्का करें कि हमारे पास यूजर की ID है
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("User session not found"); return; }

    const finalCategory = newCategory.trim() || category;
    const uniqueSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
        title,
        description: description || null,
        price: parseFloat(price),
        currency,
        category: finalCategory || null,
        allow_cod: allowCod,
        active,
        images,
        preview_image_url: images[0] || null,
        file_url: null,
        slug: uniqueSlug,
        creator_id: user.id, // <-- यह लाइन जोड़ें! यह Foreign Key Error को रोकेगी।
    };

    try {
        if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, ...payload });
        toast.success("Product updated!");
        } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created!");
        resetForm(); // यह अब सही जगह पर है
        }
        setIsDialogOpen(false);
    } catch (error: any) {
        console.error(error);
        // एरर मैसेज को और भी साफ़ करें
        if (error.message?.includes("profiles")) {
        toast.error("Profile error: Please update your profile settings first.");
        } else {
        toast.error("Failed to save product.");
    }
    }
    };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await deleteProduct.mutateAsync(id); toast.success("Deleted!"); }
    catch { toast.error("Failed to delete"); }
  };

  if (isLoading) return <GlassCard><div className="animate-pulse h-48 bg-secondary/50 rounded" /></GlassCard>;

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Store Products</h3>
              <p className="text-sm text-muted-foreground">Manage your e-commerce store</p>
            </div>
          </div>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(p.images?.[0] || p.preview_image_url) ? (
                    <img src={p.images?.[0] || p.preview_image_url || ""} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-semibold">{getCurrencySymbol(p.currency || "INR")}{p.price}</span>
                      {p.category && <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{p.category}</span>}
                      {p.allow_cod && <span className="text-xs text-green-600">COD</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "Active" : "Draft"}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price *</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="299" step="0.01" min="0" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Category</Label>
              {existingCategories.length > 0 && (
                <Select value={category} onValueChange={(v) => { setCategory(v); setNewCategory(""); }}>
                  <SelectTrigger className="mb-2"><SelectValue placeholder="Select existing..." /></SelectTrigger>
                  <SelectContent>
                    {existingCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Input value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(""); }} placeholder="Or type new category..." />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition-colors"
                  disabled={uploading}
                >
                  {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-[10px] mt-0.5">Upload</span></>}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <Label>Allow Cash on Delivery</Label>
              <Switch checked={allowCod} onCheckedChange={setAllowCod} />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <Label>Active (visible)</Label>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1" disabled={createProduct.isPending || updateProduct.isPending}>
              {(createProduct.isPending || updateProduct.isPending) ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Required Details Popup */}
      <Dialog open={showRequiredPopup} onOpenChange={setShowRequiredPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Action Required
            </DialogTitle>
            <DialogDescription>
              Please add your WhatsApp number and Bank Details in Settings to start selling.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              To receive order notifications and payments, you need to configure:
            </p>
            <ul className="text-sm space-y-1.5 ml-4 list-disc text-muted-foreground">
              <li>WhatsApp Number (for order alerts)</li>
              <li>Bank Account Number &amp; IFSC Code (for payouts)</li>
            </ul>
          </div>
          <Button onClick={() => { setShowRequiredPopup(false); navigate("/dashboard/settings"); }}>
            Go to Settings
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};