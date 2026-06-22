import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Package, ExternalLink, UserPlus, MessageCircle, Share2, ChevronLeft, ChevronRight, Loader2, Globe, Link as LinkIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { topStores, storeProducts } from "@/data/mockData";
import { supabase } from "@/supabaseClient";

const PRODUCTS_PER_PAGE = 10;

const StoreProfile = () => {
  const { storeId } = useParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popular");
  const [following, setFollowing] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      setLoading(true);
      try {
        // 1. Check if it's a mock store first
        const mockStore = topStores.find((s) => s.id === storeId);
        
        // 2. Fetch from Supabase
        const { data: profile, error: profileError } = await supabase
          .from("seller_profiles")
          .select("*")
          .eq("id", storeId)
          .single();

        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*, seller_profiles!inner(store_type)")
          .eq("seller_id", storeId)
          .eq("status", "published");

        if (profile) {
          setStoreData({
            id: profile.id,
            name: profile.store_name,
            image: profile.logo_url || "",
            description: profile.description,
            rating: profile.rating || "N/A",
            location: profile.location || "Dhaka, Bangladesh",
            isDb: true,
            isOffline: profile.store_type === "offline",
            website: profile.website_url || "https://example.com",
            facebook: profile.facebook_url || "https://facebook.com/example"
          });
        } else if (mockStore) {
          setStoreData({
            ...mockStore,
            website: mockStore.website || "https://example.com",
            facebook: mockStore.facebook || "https://facebook.com/example"
          });
        }

        if (products) {
          const transformed = products.map(p => ({
            id: p.id,
            name: p.name,
            image: p.image_urls?.[0] || "/placeholder.svg",
            price: p.original_price || 0,
            offerPrice: p.final_price || 0,
            discount: p.discount_percent || 0,
            storeName: profile?.store_name || "Unknown Store",
            storeId: p.seller_id,
            rating: p.rating || 0,
            views: p.views || 0,
            isOffline: p.seller_profiles?.store_type === "offline"
          }));
          setDbProducts(transformed);
        }
      } catch (error) {
        console.error("Error fetching store profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndProducts();
  }, [storeId]);

  const allProducts = useMemo(() => {
    const mockFiltered = storeProducts.filter((p) => p.storeId === storeId);
    return [...dbProducts, ...mockFiltered];
  }, [dbProducts, storeId]);

  const sorted = useMemo(() => {
    const arr = [...allProducts];
    switch (sortBy) {
      case "price-low": return arr.sort((a, b) => a.offerPrice - b.offerPrice);
      case "price-high": return arr.sort((a, b) => b.offerPrice - a.offerPrice);
      case "discount": return arr.sort((a, b) => b.discount - a.discount);
      default: return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
  }, [allProducts, sortBy]);

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const exclusive = sorted.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Store not found</h2>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Store Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/20 py-12">
          <div className="container flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary/30 shrink-0">
              {storeData.image ? (
                <img src={storeData.image} alt={storeData.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold text-foreground">{storeData.name}</h1>
                {/* Online/Offline Badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                  storeData.isOffline 
                    ? "bg-blue-50 text-blue-600 border border-blue-100" 
                    : "bg-green-50 text-green-600 border border-green-100"
                }`}>
                  {storeData.isOffline ? "Offline Store" : "Online Store"}
                </span>
                <a href="#" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2">{storeData.description || "No description available"}</p>
              <div className="flex items-center justify-center md:justify-start gap-6 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {storeData.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" /> {allProducts.length} products
                </span>
                {storeData.location && (
                  <span className="text-muted-foreground italic">{storeData.location}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* CTA Buttons */}
              {!storeData.isOffline ? (
                storeData.website ? (
                  <Button asChild>
                    <a href={storeData.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" /> Visit Website
                    </a>
                  </Button>
                ) : storeData.facebook ? (
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <a href={storeData.facebook} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="h-4 w-4 mr-2" /> Visit Facebook Page
                    </a>
                  </Button>
                ) : null
              ) : (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MapPin className="h-4 w-4" /> {storeData.location}
                </div>
              )}
              
              {/* Follow/Contact Buttons */}
              <Button
                variant={following ? "secondary" : "default"}
                onClick={() => setFollowing(!following)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {following ? "Following" : "Follow"}
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" /> Contact
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Exclusive Products */}
        {exclusive.length > 0 && (
          <section className="py-8 bg-accent/10">
            <div className="container">
              <h2 className="text-xl font-bold text-foreground mb-4">✨ Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {exclusive.map((p, idx) => (
                  <ProductCard key={p.id + idx} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Products */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">All Products</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="discount">Biggest Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paginated.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginated.map((p, idx) => (
                  <ProductCard key={p.id + idx} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-muted-foreground">No products found for this store.</p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StoreProfile;
