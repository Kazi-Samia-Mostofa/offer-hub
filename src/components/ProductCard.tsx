import { Link } from "react-router-dom";
import { Heart, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  offerPrice: number;
  discount: number;
  storeName: string;
  storeId: string;
  rating: number;
  views: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-bold">
              {product.discount}% OFF
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-card-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <Link to={`/store/${product.storeId}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
          {product.storeName}
        </Link>

        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">${product.offerPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
