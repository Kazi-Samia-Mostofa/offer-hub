import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { storeProducts, topStores } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Star, Package, Loader2 } from "lucide-react";
import { supabase } from "@/supabaseClient";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("popular");
  const [matchedProducts, setMatchedProducts] = useState<any[]>([]);
  const [matchedStores, setMatchedStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const trimmedQuery = query.trim();
      const queryLower = trimmedQuery.toLowerCase();
      
      // 1. Prepare Mock Data immediately so we have a fallback
      const mockMatchedProducts = storeProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.storeName.toLowerCase().includes(queryLower) ||
          p.category?.toLowerCase().includes(queryLower)
      );
      const mockMatchedStores = topStores.filter(
        (s) => 
          s.name.toLowerCase().includes(queryLower) || 
          s.description?.toLowerCase().includes(queryLower)
      );

      if (!trimmedQuery) {
        setMatchedProducts([]);
        setMatchedStores([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryPattern = `%${trimmedQuery}%`;

        // 2. Fetch from Supabase (Separate calls to avoid join errors if SQL wasn't run)
        const { data: dbStores } = await supabase
          .from("seller_profiles")
          .select("*")
          .or(`store_name.ilike."${queryPattern}",description.ilike."${queryPattern}"`);

        const { data: dbProducts } = await supabase
          .from("products")
          .select("*, seller_profiles(store_name, store_type)")
          .or(`name.ilike."${queryPattern}",category.ilike."${queryPattern}",description.ilike."${queryPattern}"`)
          .eq("status", "published");

        // 3. Transform DB Data safely
        const transformedDbProducts = (dbProducts || []).map(p => ({
          id: p.id,
          name: p.name,
          image: p.image_urls?.[0] || "/placeholder.svg",
          price: p.original_price || 0,
          offerPrice: p.final_price || 0,
          discount: p.discount_percent || 0,
          storeName: p.seller_profiles?.store_name || "Unknown Store",
          storeId: p.seller_id,
          rating: p.rating || 0,
          views: p.views || 0,
          isOffline: p.seller_profiles?.store_type === "offline"
        }));

        const transformedDbStores = (dbStores || []).map(s => ({
          id: s.id,
          name: s.store_name,
          image: s.logo_url || "",
          rating: s.rating || "N/A",
          location: s.location || "No Location",
          isDb: true,
          isOffline: s.store_type === "offline"
        }));

        // 4. Merge and Set Data
        setMatchedStores([...transformedDbStores, ...mockMatchedStores]);
        
        const allProducts = [...transformedDbProducts, ...mockMatchedProducts];

        // 5. Sorting
        let sorted = [...allProducts];
        if (sortBy === "price-low") sorted.sort((a, b) => a.offerPrice - b.offerPrice);
        else if (sortBy === "price-high") sorted.sort((a, b) => b.offerPrice - a.offerPrice);
        else sorted.sort((a, b) => (b.views || 0) - (a.views || 0));

        setMatchedProducts(sorted);
      } catch (error) {
        console.error("Search error:", error);
        // Fallback to only mock data if DB fails
        setMatchedStores(mockMatchedStores);
        setMatchedProducts(mockMatchedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Search results for "<span className="text-primary">{query}</span>"
          </h1>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Searching for stores and products...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {matchedProducts.length} product(s) · {matchedStores.length} store(s)
              </p>

              {/* Matched Stores */}
              {matchedStores.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-foreground mb-3">Stores</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {matchedStores.map((store) => (
                      <Link
                        key={store.id}
                        to={`/store/${store.id}`}
                        className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:shadow-lg transition-shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                          {store.image ? (
                            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground">{store.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Online/Offline Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              store.isOffline 
                                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                                : "bg-green-50 text-green-600 border border-green-100"
                            }`}>
                              {store.isOffline ? "Offline Store" : "Online Store"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-warning text-warning" />{store.rating}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package className="h-3 w-3" />{`${store.products ?? 0} products`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Products</h2>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {matchedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {matchedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No products found matching your search.</p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
