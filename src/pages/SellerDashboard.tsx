import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Package, Eye, Users, Trash2, Edit, Save, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/supabaseClient";

const MAX_PRODUCT_IMAGES = 5;

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"upload" | "products">("products");
  const [gateLoading, setGateLoading] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeType, setStoreType] = useState<"online" | "offline">("online");
  const [productImages, setProductImages] = useState<{ file: File; preview: string }[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    productUrl: "",
    originalPrice: "",
    discount: "",
    stockStatus: "In Stock",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [existingProductImages, setExistingProductImages] = useState<string[]>([]);
  const productImagesRef = useRef(productImages);
  productImagesRef.current = productImages;
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = descriptionTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(180, textarea.scrollHeight)}px`;
  }, [productForm.description, activeTab]);

  useEffect(() => {
    return () => {
      productImagesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const handleProductFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (incoming.length === 0) {
      toast.error("Please choose image files only.");
      return;
    }
    setProductImages((prev) => {
      const room = MAX_PRODUCT_IMAGES - prev.length;
      if (room <= 0) {
        toast.message(`You can add at most ${MAX_PRODUCT_IMAGES} images.`);
        return prev;
      }
      const toAdd = incoming.slice(0, room);
      if (incoming.length > room) {
        toast.message(`Only ${room} more image(s) added (max ${MAX_PRODUCT_IMAGES} total).`);
      }
      const newEntries = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...newEntries];
    });
  };

  const removeProductImage = (index: number) => {
    setProductImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      fetchMyProducts();
    }
  }, [activeTab]);

  const handleSaveProduct = async (status: "published" | "draft") => {
    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!productForm.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!productForm.category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!productForm.originalPrice) {
      toast.error("Original price is required");
      return;
    }
    // Only require images for new products, or if images were selected for an existing one
    if (!editingProductId && (existingProductImages.length + productImages.length) === 0) {
      toast.error("At least one product image is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let uploadedImageUrls: string[] = [];
      
      // Upload new images if any were selected
      if (productImages.length > 0) {
        for (const item of productImages) {
          const fileExt = item.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `product-images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, item.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);
          
          uploadedImageUrls.push(publicUrl);
        }
      }

      const originalPrice = parseFloat(productForm.originalPrice) || 0;
      const discount = parseFloat(productForm.discount) || 0;
      const finalPrice = originalPrice * (1 - discount / 100);
      const productUrl = productForm.productUrl.trim();
      const normalizedProductUrl = productUrl && !/^https?:\/\//i.test(productUrl)
        ? `https://${productUrl}`
        : productUrl;

      const productData: any = {
        seller_id: user.id,
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        tags: productForm.tags.split(",").map(t => t.trim()).filter(t => t),
        external_url: normalizedProductUrl || null,
        original_price: originalPrice,
        discount_percent: discount,
        final_price: finalPrice,
        stock_status: productForm.stockStatus,
        status: status,
        image_urls: [...existingProductImages, ...uploadedImageUrls],
        is_offline: storeType === "offline",
      };

      if (editingProductId) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProductId);
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        // Insert new product
        const { error } = await supabase
          .from("products")
          .insert({ ...productData, image_urls: productData.image_urls || [] });
        if (error) throw error;
        toast.success(status === "published" ? "Product published!" : "Product saved as draft");
      }
      
      // Reset form and state
      setProductForm({
        name: "",
        description: "",
        category: "",
        tags: "",
        productUrl: "",
        originalPrice: "",
        discount: "",
        stockStatus: "In Stock",
      });
      setProductImages([]);
      setExistingProductImages([]);
      setEditingProductId(null);
      
      // Go to products tab
      setActiveTab("products");
      navigate("/seller/dashboard", { replace: true });
      fetchMyProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setProductForm({
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      tags: product.tags ? product.tags.join(", ") : "",
      productUrl: product.external_url || "",
      originalPrice: product.original_price.toString(),
      discount: product.discount_percent.toString(),
      stockStatus: product.stock_status,
    });
    setExistingProductImages(product.image_urls || []);
    setProductImages([]);
    setEditingProductId(product.id);
    setActiveTab("upload");
    navigate(`/seller/dashboard?edit=${product.id}`);
  };

  useEffect(() => {
    const editId = new URLSearchParams(location.search).get("edit");
    if (!editId && editingProductId) {
      setEditingProductId(null);
      setExistingProductImages([]);
      setProductImages([]);
      setActiveTab("products");
    }
  }, [location.search, editingProductId]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Product deleted successfully");
      fetchMyProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function gate() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (cancelled) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const role = user.user_metadata?.role as string | undefined;
      if (role !== "seller") {
        navigate("/", { replace: true });
        return;
      }

      // Authentication is enough to open My Shop. Store profile details can
      // load in the background without keeping the whole dashboard blocked.
      setStoreName(user.user_metadata?.store_name?.trim() || "My Shop");
      setGateLoading(false);

      const { data, error } = await supabase
        .from("seller_profiles")
        .select("store_name, description, email, phone, location, logo_url, store_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setStoreName(data.store_name?.trim() || "My Shop");
        setStoreLogoUrl((data.logo_url ?? "").trim());
        setStoreType((data.store_type as "online" | "offline") || "online");
      }
    }

    gate();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (gateLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-secondary/30">
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-border bg-secondary overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                {storeLogoUrl ? (
                  <img src={storeLogoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{storeName}</h1>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link to="/seller/setup?edit=true">Edit store profile</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Package, label: "Total Products", value: "24" },
              { icon: Eye, label: "Total Views", value: "12.5k" },
              { icon: Users, label: "Followers", value: "1.2k" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-lg border border-border p-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {(["products", "upload"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "upload" ? "Upload Product" : "My Products"}
              </button>
            ))}
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                {editingProductId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        name: "",
                        description: "",
                        category: "",
                        tags: "",
                        productUrl: "",
                        originalPrice: "",
                        discount: "",
                        stockStatus: "In Stock",
                      });
                      setProductImages([]);
                      setExistingProductImages([]);
                      setActiveTab("products");
                      navigate("/seller/dashboard", { replace: true });
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
              <input
                ref={productFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => {
                  handleProductFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Product images ({(existingProductImages.length + productImages.length)}/{MAX_PRODUCT_IMAGES}) — click the area below to choose from your device.
                </p>
                <button
                  type="button"
                  disabled={(existingProductImages.length + productImages.length) >= MAX_PRODUCT_IMAGES}
                  onClick={() => productFileInputRef.current?.click()}
                  aria-label={`Choose product images, up to ${MAX_PRODUCT_IMAGES} total`}
                  className="w-full min-h-[160px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-sm px-4 text-center">
                    {(existingProductImages.length + productImages.length) >= MAX_PRODUCT_IMAGES
                      ? `Maximum ${MAX_PRODUCT_IMAGES} images selected`
                      : "Click to upload product images"}
                  </span>
                </button>
                {((existingProductImages.length > 0) || (productImages.length > 0)) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {existingProductImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative aspect-square rounded-lg border border-border overflow-hidden bg-secondary group"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {editingProductId && (
                          <button
                            type="button"
                            onClick={() => {
                              setExistingProductImages(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/90 border border-border flex items-center justify-center shadow-sm opacity-90 hover:opacity-100"
                            aria-label={`Remove existing image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {productImages.map((item, index) => (
                      <div
                        key={`new-${item.preview}-${index}`}
                        className="relative aspect-square rounded-lg border border-border overflow-hidden bg-secondary group"
                      >
                        <img src={item.preview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeProductImage(index)}
                          className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/90 border border-border flex items-center justify-center shadow-sm opacity-90 hover:opacity-100"
                          aria-label={`Remove new image ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    placeholder="Product title" 
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    ref={descriptionTextareaRef}
                    placeholder="Describe your product..." 
                    rows={8}
                    className="min-h-[180px] resize-none overflow-hidden leading-6"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      placeholder="e.g., Electronics" 
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input 
                      placeholder="e.g., wireless, bluetooth" 
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Product Website URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/products/your-product"
                    value={productForm.productUrl}
                    onChange={(e) => setProductForm({ ...productForm, productUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add the direct link to this specific product page.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Original Price (৳)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Final Price</Label>
                    <Input 
                      disabled 
                      placeholder="Auto-calculated" 
                      value={
                        productForm.originalPrice 
                          ? (parseFloat(productForm.originalPrice) * (1 - (parseFloat(productForm.discount) || 0) / 100)).toFixed(2)
                          : ""
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={productForm.stockStatus}
                    onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value })}
                  >
                    <option>In Stock</option>
                    <option>Limited Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => handleSaveProduct("published")} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" /> 
                  {isSubmitting ? (editingProductId ? "Updating..." : "Publishing...") : (editingProductId ? "Update Product" : "Publish")}
                </Button>
                {!editingProductId && (
                  <Button variant="outline" onClick={() => handleSaveProduct("draft")} disabled={isSubmitting}>
                    Save as Draft
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {loadingProducts ? (
                <p className="text-center py-8 text-muted-foreground">Loading products...</p>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border border-border">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No products found. Start by uploading one!</p>
                  <Button variant="link" onClick={() => setActiveTab("upload")}>Upload Product</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {myProducts.map((product) => (
                  <div key={product.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="aspect-square bg-secondary overflow-hidden flex items-center justify-center">
                      {product.image_urls?.[0] ? (
                        <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4 pb-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground truncate text-base">{product.name}</h3>
                        {product.status === "draft" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase font-bold shrink-0">Draft</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        ৳{product.final_price.toFixed(2)} · {product.discount_percent}% off · {product.stock_status}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-4 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-1.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
