import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.jpeg";

const SignUp = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as "buyer" | "seller",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    setError("");
    alert("Sign up functionality will be available once backend is connected.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 bg-secondary/30">
        <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 shadow-sm mx-4">
          <div className="text-center mb-6">
            <img src={logo} alt="LookUp" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join LookUp as a buyer or seller</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["buyer", "seller"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => update("role", role)}
                    className={`py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.role === role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {role === "buyer" ? "🛒 Buy Products" : "🏪 Sell Products"}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => update("agreeTerms", e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span className="text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" className="w-full">Create Account</Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
