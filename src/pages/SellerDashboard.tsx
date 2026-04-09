import { useState } from "react";
import { Star, Upload, Package, Eye, Users, Plus, Trash2, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "upload" | "products">("profile");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold text-foreground mb-6">Seller Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Package, label: "Total Products", value: "24" },
              { icon: Eye, label: "Total Views", value: "12.5k" },
              { icon: Users, label: "Followers", value: "1.2k" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-lg border border-border p-5 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {(["profile", "upload", "products"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "upload" ? "Upload Product" : tab === "products" ? "My Products" : "Store Profile"}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm">Upload Logo</Button>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input placeholder="Your Store Name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Tell buyers about your store..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="store@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="City, Area, or Address" />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input placeholder="https://yourstore.com" />
                </div>
              </div>
              <Button><Save className="h-4 w-4 mr-2" /> Save Profile</Button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="bg-card rounded-lg border border-border p-6 space-y-5 max-w-2xl">
              <h2 className="text-xl font-bold text-foreground">Add New Product</h2>
              <div className="w-full h-40 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/50">
                <div className="text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Click to upload product images</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="Product title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your product..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input placeholder="e.g., Electronics" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input placeholder="e.g., wireless, bluetooth" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="City, Area, or Store Address" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Original Price ($)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Final Price</Label>
                    <Input disabled placeholder="Auto-calculated" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option>In Stock</option>
                    <option>Limited Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button><Save className="h-4 w-4 mr-2" /> Publish</Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">Sample Product {i}</h3>
                    <p className="text-sm text-muted-foreground">$49.99 · 25% off · In Stock</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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

export default SellerDashboard;
