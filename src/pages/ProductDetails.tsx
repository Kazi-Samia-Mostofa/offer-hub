import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Star, 
  Package, 
  ChevronLeft, 
  Loader2, 
  Heart, 
  Share2, 
  Store,
  MapPin,
  Globe,
  Info,
  Phone,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { storeProducts, trendingProducts, topStores } from "@/data/mockData";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      console.log("Fetching product with ID:", productId);
      console.log("All mock products:", storeProducts);
      
      try {
        // First try fetching from Supabase
        let foundProduct = null;
        let foundStore = null;

        if (supabase) {
          const { data: dbProduct, error: productError } = await supabase
            .from("products")
            .select("*, seller_profiles!inner(store_name, logo_url, location, phone, website_url, facebook_url, store_type)")
            .eq("id", productId)
            .maybeSingle();

          if (!productError && dbProduct) {
            foundProduct = dbProduct;
            foundStore = dbProduct.seller_profiles;
          }
        }
        
        // If no Supabase product, try localStorage
        if (!foundProduct) {
          const storedProducts = JSON.parse(localStorage.getItem("lookup_products") || "{}");
          const storedStores = JSON.parse(localStorage.getItem("lookup_stores") || "{}");
          
          for (const [sellerId, products] of Object.entries(storedProducts)) {
            const p = (products as any[]).find(p => p.id === productId);
            if (p) {
              foundProduct = p;
              foundStore = storedStores[sellerId];
              break;
            }
          }
        }
        
        // Then check mock data
        const allMockProducts = [...trendingProducts, ...storeProducts];
        const mockProduct = allMockProducts.find(p => p.id === productId);
        const matchingStore = topStores.find(s => s.id === mockProduct?.storeId);
        console.log("Found mock product:", mockProduct);
        console.log("Found matching store:", matchingStore);

        if (foundProduct && foundStore) {
          const productData = foundProduct.image_urls ? {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.original_price,
            offerPrice: foundProduct.final_price,
            discount: foundProduct.discount_percent,
            images: foundProduct.image_urls && foundProduct.image_urls.length > 0 ? foundProduct.image_urls : ["/placeholder.svg"],
            category: foundProduct.category,
            stockStatus: foundProduct.stock_status,
            isOffline: foundStore.store_type === "offline",
            store: {
              id: foundStore.id,
              name: foundStore.store_name,
              logo: foundStore.logo_url || "",
              location: foundStore.location || "Dhaka, Bangladesh",
              phone: foundStore.phone || "No Contact",
              type: foundStore.store_type || "online",
              website: foundStore.website_url || "https://example.com",
              facebook: foundStore.facebook_url || "https://facebook.com/example"
            },
            rating: foundProduct.rating || 0,
            views: foundProduct.views || 0,
            tags: foundProduct.tags || []
          } : {
            id: foundProduct.id,
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.original_price,
            offerPrice: foundProduct.final_price,
            discount: foundProduct.discount_percent,
            images: foundProduct.image_urls && foundProduct.image_urls.length > 0 ? foundProduct.image_urls : ["/placeholder.svg"],
            category: foundProduct.category,
            stockStatus: foundProduct.stock_status,
            isOffline: foundProduct.is_offline,
            store: {
              id: foundProduct.seller_id,
              name: foundStore?.store_name || "Unknown Store",
              logo: foundStore?.logo_url || "",
              location: foundStore?.location || "Dhaka, Bangladesh",
              phone: foundStore?.phone || "No Contact",
              type: foundStore?.store_type || "online",
              website: foundStore?.website_url || "https://example.com",
              facebook: foundStore?.facebook_url || "https://facebook.com/example"
            },
            rating: foundProduct.rating || 0,
            views: foundProduct.views || 0,
            tags: foundProduct.tags || []
          };
          setProduct(productData);
        } else if (mockProduct && matchingStore) {
          // Transform mock product to match our state structure with full store data
          setProduct({
            ...mockProduct,
            images: [mockProduct.image, mockProduct.image], // Add multiple images for demo
            isOffline: matchingStore.isOffline,
            description: "This is a great product with amazing features!",
            category: "General",
            stockStatus: "In Stock",
            store: {
              id: matchingStore.id,
              name: matchingStore.name,
              logo: matchingStore.image,
              location: matchingStore.location || "Dhaka, Bangladesh",
              type: matchingStore.isOffline ? "offline" : "online",
              website: matchingStore.website,
              facebook: matchingStore.facebook
            }
          });
        } else if (mockProduct) {
          // Fallback with minimal data
          setProduct({
            ...mockProduct,
            images: [mockProduct.image],
            description: "This is a great product!",
            category: "General",
            stockStatus: "In Stock",
            store: {
              id: mockProduct.storeId,
              name: mockProduct.storeName,
              logo: "",
              location: "Dhaka, Bangladesh",
              type: mockProduct.isOffline ? "offline" : "online",
              website: "https://example.com",
              facebook: "https://facebook.com/example"
            }
          });
        } else {
          console.log("No product found anywhere");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">The product you are looking for does not exist or has been removed.</p>
          <Button className="mt-6" onClick={() => navigate("/")}>Back to Home</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/10 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-card rounded-2xl border border-border p-6 shadow-sm">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border relative">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {product.discount}% OFF
                  </span>
                )}
                {product.isOffline && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> OFFLINE
                    </span>
                  </div>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        activeImage === idx ? "border-primary shadow-md" : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col h-full">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {product.isOffline ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                        <MapPin className="h-3 w-3" /> OFFLINE STORE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold border border-green-100">
                        <Globe className="h-3 w-3" /> ONLINE STORE
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-bold text-sm">{(product.rating || 0).toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">(124 reviews)</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm text-muted-foreground">{product.views || 0} views</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-extrabold text-primary">৳{(product.offerPrice || 0).toFixed(2)}</span>
                    {product.discount > 0 && (
                      <span className="text-2xl text-muted-foreground line-through decoration-destructive/50">
                        ৳{(product.price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-base text-green-600 font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4" /> 
                    {product.stockStatus === "In Stock" ? "In stock, ready to ship" : product.stockStatus}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" /> Sold by
                  </h3>
                  <div className="flex items-center justify-between">
                    <Link to={`/store/${product.store.id}`} className="flex items-center gap-3 group">
                      <div className="h-10 w-10 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center shadow-sm group-hover:border-primary transition-colors">
                        {product.store.logo ? (
                          <img src={product.store.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-none">{product.store.name}</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary" /> {product.store.location}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-primary" /> {product.store.phone}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/store/${product.store.id}`}>Visit Store</Link>
                    </Button>
                  </div>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium border border-border">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="pt-0 space-y-4">
                {!product.isOffline ? (
                  product.store.website ? (
                    <Button className="h-12 w-full text-lg font-bold rounded-xl" asChild>
                      <a href={product.store.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-5 w-5 mr-2" /> Visit Website
                      </a>
                    </Button>
                  ) : product.store.facebook ? (
                    <Button className="h-12 w-full text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700" asChild>
                    <a href={product.store.facebook} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="h-5 w-5 mr-2" /> Visit Facebook Page
                    </a>
                  </Button>
                  ) : null
                ) : (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5" /> Physical Store Address
                    </h4>
                    <p className="text-blue-700">{product.store.location}</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-xl">
                    <Heart className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-xl">
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
