import { Link } from "react-router-dom";
import { Star, Users, Package } from "lucide-react";
import { topStores } from "@/data/mockData";

const TopStores = () => {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">⭐ Top Stores</h2>
          <p className="text-muted-foreground mt-2">Discover popular and trusted sellers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topStores.map((store) => (
            <Link
              key={store.id}
              to={`/store/${store.id}`}
              className="group bg-card rounded-lg border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <img
                src={store.image}
                alt={store.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary/50 transition-colors"
                loading="lazy"
              />
              <h3 className="mt-4 font-bold text-card-foreground text-lg">{store.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{store.description}</p>

              <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {store.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {(store.followers / 1000).toFixed(0)}k
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {store.products}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopStores;
