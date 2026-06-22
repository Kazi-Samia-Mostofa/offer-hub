import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Save, X } from "lucide-react";
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
  const [facebookUrl, setFacebookUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [storeType, setStoreType] = useState<"online" | "offline">("online");

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed!", e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log("Selected file:", file);
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log("File read complete!", event.target?.result);
        setLogoPreview(event.target?.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
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
        .select("*")
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
        setFacebookUrl(data.facebook_url ?? "");
        setLogoUrl(data.logo_url ?? "");
        setLogoPreview(data.logo_url ?? null);
        setStoreType((data.store_type as "online" | "offline") || "online");
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

    let finalLogoUrl = logoUrl.trim() || null;

    // Upload logo file if selected
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `store-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, logoFile);

      if (uploadError) {
        console.error(uploadError);
        toast.error(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      finalLogoUrl = publicUrl;
    }

    const payload = {
      user_id: userId,
      store_name: storeName.trim(),
      description: description.trim(),
      email: contactEmail.trim(),
      phone: phone.trim(),
      location: location.trim(),
      website_url: websiteUrl.trim() || null,
      facebook_url: facebookUrl.trim() || null,
      logo_url: finalLogoUrl,
      store_type: storeType,
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
                <input
                  type="file"
                  id="logoFile"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <div
                  className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border overflow-hidden shrink-0 cursor-pointer group"
                  onClick={(e) => {
                    console.log("Logo div clicked!");
                    const input = document.getElementById("logoFile");
                    console.log("Input element:", input);
                    input?.click();
                  }}
                >
                  {logoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                      {(editMode || logoFile) ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLogoFile();
                          }}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 border border-border flex items-center justify-center shadow-sm opacity-90 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <Label htmlFor="logoUrl">Logo image URL (optional, or upload above)</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://…"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setLogoPreview(e.target.value);
                      }
                    }}
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
                  <Label>Store Type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storeType"
                        value="online"
                        checked={storeType === "online"}
                        onChange={() => setStoreType("online")}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">Online Store</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="storeType"
                        value="offline"
                        checked={storeType === "offline"}
                        onChange={() => setStoreType("offline")}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">Offline Store</span>
                    </label>
                  </div>
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
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook Page URL (optional, for online stores without website)</Label>
                  <Input
                    id="facebookUrl"
                    placeholder="https://facebook.com/yourstore"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving…" : "Save profile"}
                </Button>
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
