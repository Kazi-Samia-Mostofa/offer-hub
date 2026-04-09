import { useState } from "react";
import { Bell, Heart, UserCheck, ChevronDown, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { trendingProducts, topStores } from "@/data/mockData";

const BuyerProfile = () => {
  const [activeTab, setActiveTab] = useState<"droplist" | "following" | "notifications">("droplist");
  const [droplistProducts] = useState(trendingProducts.slice(0, 3));
  const [followedStores] = useState(topStores.slice(0, 2));
  const [notifications] = useState([
    { id: 1, message: 'Price dropped on "Wireless Headphones" — now $149.99!', time: "2 hours ago", read: false },
    { id: 2, message: '"Organic Skincare Set" has been deleted by the seller.', time: "1 day ago", read: true },
    { id: 3, message: 'New offer from TechVibe — 30% off all accessories!', time: "3 days ago", read: true },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {([
              { key: "droplist", label: "Droplist", icon: Heart },
              { key: "following", label: "Following", icon: UserCheck },
              { key: "notifications", label: "Notifications", icon: Bell },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {key === "notifications" && notifications.filter((n) => !n.read).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Droplist */}
          {activeTab === "droplist" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Products you're watching. You'll be notified when prices drop!
              </p>
              {droplistProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {droplistProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Your droplist is empty.</p>
              )}
            </div>
          )}

          {/* Following */}
          {activeTab === "following" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                You are following {followedStores.length} store(s).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedStores.map((store) => (
                  <Link
                    key={store.id}
                    to={`/store/${store.id}`}
                    className="bg-card rounded-lg border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <img src={store.image} alt={store.name} className="w-14 h-14 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-foreground">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-card rounded-lg border p-4 flex items-start gap-3 ${
                    n.read ? "border-border" : "border-primary/40 bg-primary/5"
                  }`}
                >
                  <Bell className={`h-5 w-5 shrink-0 mt-0.5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerProfile;
