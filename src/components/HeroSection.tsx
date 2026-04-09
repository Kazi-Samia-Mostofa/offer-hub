import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/30 py-20 md:py-28">
      <div className="container text-center space-y-8">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Discover <span className="text-primary">Amazing Deals</span> from Trusted Sellers
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Browse thousands of products, compare offers, and save big with LookUp — the marketplace that connects buyers and sellers.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by product name or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-28 h-14 text-base rounded-full border-2 border-primary/20 focus-visible:ring-primary bg-background shadow-sm"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-11 px-6"
            >
              Search
            </Button>
          </div>
        </form>

        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span>10,000+ Products</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>500+ Trusted Stores</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
