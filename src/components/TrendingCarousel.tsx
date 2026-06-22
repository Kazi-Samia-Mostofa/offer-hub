import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/supabaseClient";
import { trendingProducts as mockProducts } from "@/data/mockData";

const TrendingCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, seller_profiles(store_name, store_type)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const transformedDb = (data || []).map(p => ({
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

        setProducts([...transformedDb, ...mockProducts]);
      } catch (error) {
        console.error("Error fetching trending products:", error);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [products.length]);

  const prev = () => setCurrent((c) => (c - 1 + products.length) % products.length);
  const next = () => setCurrent((c) => (c + 1) % products.length);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">🔥 Trending Products</h2>
          <p className="text-muted-foreground mt-2">Most searched and purchased right now</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Desktop: show all cards */}
            <div className="hidden md:grid grid-cols-5 gap-4 overflow-x-auto pb-4">
              {products.map((product, idx) => (
                <ProductCard key={product.id + idx} product={product} />
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <div className="relative">
                <div className="flex justify-center">
                  <div className="w-72">
                    <ProductCard product={products[current]} />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No trending products found.</p>
        )}
      </div>
    </section>
  );
};

export default TrendingCarousel;
