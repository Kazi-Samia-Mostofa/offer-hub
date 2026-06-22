import { Link } from "react-router-dom";
import { Star, Package, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { topStores as mockStores } from "@/data/mockData";

const TopStores = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStores = async () => {
      try {
        const { data: dbStores, error } = await supabase
          .from("seller_profiles")
          .select("*")
          .limit(4);

        if (error) throw error;

        const transformedDbStores = (dbStores || []).map(s => ({
          id: s.id,
          name: s.store_name,
          image: s.logo_url,
          rating: s.rating || "N/A",
          location: s.location || "No Location",
          description: s.description,
          isOffline: s.store_type === "offline"
        }));

        const transformedMockStores = mockStores.map((s, idx) => ({
          ...s,
          isOffline: idx % 2 === 1 // Alternate mock stores for variety
        }));

        setStores([...transformedDbStores, ...transformedMockStores]);
      } catch (error) {
        console.error("Error fetching top stores:", error);
        const transformedMockStores = mockStores.map((s, idx) => ({
          ...s,
          isOffline: idx % 2 === 1 // Alternate mock stores for variety
        }));
        setStores(transformedMockStores);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStores();
  }, []);

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">⭐ Top Stores</h2>
          <p className="text-muted-foreground mt-2">Discover popular and trusted sellers</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stores.map((store, idx) => (
              <Link
                key={store.id + idx}
                to={`/store/${store.id}`}
                className="group bg-card rounded-2xl border border-border p-6 text-center hover:shadow-xl hover:-translate-y-2 transition-all"
              >
                <div className="w-20 h-20 rounded-full mx-auto bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 transition-colors">
                  {store.image ? (
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 font-bold text-card-foreground text-lg">{store.name}</h3>
                
                {/* Online/Offline Badge */}
                <div className="flex justify-center mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    store.isOffline 
                      ? "bg-blue-50 text-blue-600 border border-blue-100" 
                      : "bg-green-50 text-green-600 border border-green-100"
                  }`}>
                    {store.isOffline ? "Offline Store" : "Online Store"}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{store.description || "No description available"}</p>

                <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {store.rating || "0.0"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {`${store.products ?? 0} products`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No stores found.</p>
        )}
      </div>
    </section>
  );
};

export default TopStores;
