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
  isOffline?: boolean;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
            {product.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <h3 className="font-bold text-card-foreground leading-tight line-clamp-3 group-hover:text-primary transition-colors text-base">
          {product.name}
        </h3>

        <div className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-2 font-medium">
          {product.storeName}
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            product.isOffline 
              ? "bg-blue-50 text-blue-600 border border-blue-100" 
              : "bg-green-50 text-green-600 border border-green-100"
          }`}>
            {product.isOffline ? "Offline Store" : "Online Store"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm text-muted-foreground">{(product.rating || 0).toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-2 mt-auto flex-wrap">
          <span className="text-xl font-bold text-primary shrink-0">৳{(product.offerPrice || 0).toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through shrink-0">৳{(product.price || 0).toFixed(2)}</span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-colors inline-flex items-center justify-center" onClick={(e) => e.preventDefault()}>
            <Heart className="h-5 w-5" />
          </button>
          <button className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-colors inline-flex items-center justify-center" onClick={(e) => e.preventDefault()}>
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
