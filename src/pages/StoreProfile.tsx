import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Users, Package, ExternalLink, UserPlus, MessageCircle, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { topStores, storeProducts } from "@/data/mockData";

const PRODUCTS_PER_PAGE = 10;

const StoreProfile = () => {
  const { storeId } = useParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popular");
  const [following, setFollowing] = useState(false);

  const store = topStores.find((s) => s.id === storeId) || topStores[0];
  const products = storeProducts.filter((p) => p.storeId === store.id);

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price-low": return arr.sort((a, b) => a.offerPrice - b.offerPrice);
      case "price-high": return arr.sort((a, b) => b.offerPrice - a.offerPrice);
      case "discount": return arr.sort((a, b) => b.discount - a.discount);
      default: return arr.sort((a, b) => b.views - a.views);
    }
  }, [products, sortBy]);

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const exclusive = sorted.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Store Header */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/20 py-12">
          <div className="container flex flex-col md:flex-row items-center gap-6">
            <img
              src={store.image}
              alt={store.name}
              className="w-28 h-28 rounded-full border-4 border-primary/30 object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold text-foreground">{store.name}</h1>
                <a href="#" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              <p className="text-muted-foreground mt-1">{store.description}</p>
              <div className="flex items-center justify-center md:justify-start gap-6 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {store.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {(store.followers / 1000).toFixed(0)}k followers
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" /> {store.products} products
                </span>
              </div>
            </div>
            <div className="flex gap-3">
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
        <section className="py-8 bg-accent/10">
          <div className="container">
            <h2 className="text-xl font-bold text-foreground mb-4">✨ Exclusive Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {exclusive.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

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
