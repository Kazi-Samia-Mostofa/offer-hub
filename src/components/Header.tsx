import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/Lookup_logo.png";
import { supabase } from "@/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [sellerStoreId, setSellerStoreId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      
      if (s?.user?.user_metadata?.role === "seller") {
        const { data } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", s.user.id)
          .single();
        setSellerStoreId(data?.id || null);
      }
    };
    
    fetchSession();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user?.user_metadata?.role === "seller") {
        const { data } = await supabase
          .from("seller_profiles")
          .select("id")
          .eq("id", s.user.id)
          .single();
        setSellerStoreId(data?.id || null);
      } else {
        setSellerStoreId(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    setSellerStoreId(null);
    navigate("/");
  };

  const isSeller = session?.user?.user_metadata?.role === "seller";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDroplistClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      toast.error("Please log in to access your Droplist");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="LookUp" className="h-16 w-auto" />
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="md:flex flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products or stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-none focus-visible:ring-primary"
            />
          </div>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3 shrink-0">
          {!isSeller && (
            <Link to="/droplist" onClick={handleDroplistClick}>
              <Button variant="ghost" size="sm">Droplist</Button>
            </Link>
          )}
          {isSeller && (
            <>
              <Link to="/seller/dashboard">
                <Button variant="ghost" size="sm">My Shop</Button>
              </Link>
              {sellerStoreId && (
                <Link to={`/store/${sellerStoreId}`}>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Store className="h-4 w-4" /> View Store
                  </Button>
                </Link>
              )}
            </>
          )}
          {session ? (
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products or stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-none"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            {!isSeller && (
              <Link to="/droplist" onClick={(e) => {
                setMobileMenuOpen(false);
                handleDroplistClick(e);
              }}>
                <Button variant="ghost" className="w-full justify-start">Droplist</Button>
              </Link>
            )}
            {isSeller && (
              <>
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">My Shop</Button>
                </Link>
                {sellerStoreId && (
                  <Link to={`/store/${sellerStoreId}`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start flex items-center gap-1">
                      <Store className="h-4 w-4" /> View Store
                    </Button>
                  </Link>
                )}
              </>
            )}
            {session ? (
              <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
