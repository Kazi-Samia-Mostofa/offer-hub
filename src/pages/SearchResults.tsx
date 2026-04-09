import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { storeProducts, topStores } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Star, Users, Package } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [sortBy, setSortBy] = useState("popular");

  const matchedProducts = useMemo(() => {
    return storeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.storeName.toLowerCase().includes(query)
    );
  }, [query]);

  const matchedStores = useMemo(() => {
    return topStores.filter((s) => s.name.toLowerCase().includes(query));
  }, [query]);

  const sorted = useMemo(() => {
    const arr = [...matchedProducts];
    switch (sortBy) {
      case "price-low": return arr.sort((a, b) => a.offerPrice - b.offerPrice);
      case "price-high": return arr.sort((a, b) => b.offerPrice - a.offerPrice);
      default: return arr.sort((a, b) => b.views - a.views);
    }
  }, [matchedProducts, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Search results for "<span className="text-primary">{searchParams.get("q")}</span>"
          </h1>
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
                    className="bg-card rounded-lg border border-border p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <img src={store.image} alt={store.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-foreground">{store.name}</h3>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{store.rating}</span>
                        <span className="flex items-center gap-1"><Package className="h-3 w-3" />{store.products}</span>
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

          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sorted.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No products found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
