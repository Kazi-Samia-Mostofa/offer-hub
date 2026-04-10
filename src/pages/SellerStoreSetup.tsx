import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/supabaseClient";
import { isSellerStoreReady } from "@/lib/sellerStore";

const SellerStoreSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const role = user.user_metadata?.role as string | undefined;
      if (role !== "seller") {
        navigate("/", { replace: true });
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("seller_profiles")
        .select("store_name, description, email, phone, location, website_url, logo_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error(error);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setStoreName(data.store_name ?? "");
        setDescription(data.description ?? "");
        setContactEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setLocation(data.location ?? "");
        setWebsiteUrl(data.website_url ?? "");
        setLogoUrl(data.logo_url ?? "");
      }

      if (!editMode && isSellerStoreReady(data)) {
        navigate("/seller/dashboard", { replace: true });
        return;
      }

      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate, editMode]);

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please log in to save your profile.");
      return;
    }
    if (!storeName.trim() || !description.trim() || !contactEmail.trim() || !phone.trim() || !location.trim()) {
      toast.error("Please fill in store name, description, email, phone, and location.");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: userId,
      store_name: storeName.trim(),
      description: description.trim(),
      email: contactEmail.trim(),
      phone: phone.trim(),
      location: location.trim(),
      website_url: websiteUrl.trim() || null,
      logo_url: logoUrl.trim() || null,
    };
    const { error } = await supabase.from("seller_profiles").upsert(payload, {
      onConflict: "user_id",
    });
    setSaving(false);
    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }
    toast.success(editMode ? "Store profile updated." : "Store profile saved.");
    navigate("/seller/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {editMode ? "Update your store" : "Set up your store"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {editMode
              ? "Change your store details below, then save."
              : "Add your store information. After you save, you can manage products from your seller dashboard."}
          </p>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border overflow-hidden shrink-0">
                  {logoUrl.trim() ? (
                    <img src={logoUrl.trim()} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <Label htmlFor="logoUrl">Logo image URL (optional)</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://…"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    placeholder="Your Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell buyers about your store..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="store@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 234 567 890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Area, or Address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL (optional)</Label>
                  <Input
                    id="websiteUrl"
                    placeholder="https://yourstore.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving…" : "Save profile"}
                </Button>
                {editMode && (
                  <Button type="button" variant="outline" asChild>
                    <Link to="/seller/dashboard">Back to dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerStoreSetup;
