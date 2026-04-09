import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { trendingProducts } from "@/data/mockData";

const TrendingCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % trendingProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + trendingProducts.length) % trendingProducts.length);
  const next = () => setCurrent((c) => (c + 1) % trendingProducts.length);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">🔥 Trending Products</h2>
          <p className="text-muted-foreground mt-2">Most searched and purchased right now</p>
        </div>

        {/* Desktop: show all cards */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div className="relative">
            <div className="flex justify-center">
              <div className="w-72">
                <ProductCard product={trendingProducts[current]} />
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
            {trendingProducts.map((_, i) => (
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
      </div>
    </section>
  );
};

export default TrendingCarousel;
