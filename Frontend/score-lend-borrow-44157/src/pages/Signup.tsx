import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { User, Building, Shield } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// ✅ Validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

const phoneRegex = /^[0-9]{10}$/;

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState<"borrower" | "lender" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendURL = "http://localhost:8000/api/v1";

  const roles = [
    {
      id: "borrower" as const,
      icon: User,
      title: "Borrower",
      description: "Get your BharatScore and access loans easily.",
    },
    {
      id: "lender" as const,
      icon: Building,
      title: "Lender",
      description: "Evaluate borrowers and approve loan applications.",
    },
    {
      id: "admin" as const,
      icon: Shield,
      title: "Admin",
      description: "Manage BharatScore users and analytics.",
    },
  ];

  const validate = () => {
    if (!selectedRole) {
      toast.error("Please select a role.");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Full name is required.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must be at least 8 chars with upper, lower, digit, and symbol."
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
  const res = await axios.post(`${backendURL}/auth/register`, {
    full_name: formData.name,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
    role: selectedRole,
  });

  toast.success("Account created successfully! Please login.");

  // Navigate to login page after toast
  setTimeout(() => navigate("/login"), 1000);
} catch (err: any) {
  toast.error(err?.response?.data?.detail || "Error creating account");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">
              Join BharatScore and start your financial journey
            </p>
          </div>

          {!selectedRole ? (
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className="p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <role.icon className="text-primary-foreground" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    {role.description}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Sign Up as {selectedRole}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                  Change
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                </p>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
