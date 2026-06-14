import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Feather, Radio, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Register: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'writer' | 'reader'>('writer');
  const [phone, setPhone] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!name) {
      tempErrors.name = "Full name is required";
      isValid = false;
    }

    if (!username) {
      tempErrors.username = "Username is required";
      isValid = false;
    } else if (username.length < 3) {
      tempErrors.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (/\s/.test(username)) {
      tempErrors.username = "Username cannot contain spaces";
      isValid = false;
    }

    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!phone) {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9\s-]{6,15}$/.test(phone)) {
      tempErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const success = await register(name, username, email, role, phone, password);
      if (success) {
        navigate("/feed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12 transition-colors duration-300 relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <Feather className="h-6 w-6 text-primary rotate-12" />
            <span>Inkspire</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign up to post stories, interact with comments, and customize your feed.
          </p>
        </div>

        <Card className="border border-border/50 bg-card/75 backdrop-blur-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Get Started</CardTitle>
            <CardDescription className="text-center">
              Create an Inkspire account today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
              </div>

              {/* Username */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-[10px] text-red-500">{errors.username}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+15555555555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
              </div>

              {/* Role Picker */}
              <div className="space-y-1.5 text-left">
                <Label>I want to join as a</Label>
                <div className="grid grid-cols-1 gap-4 mt-1">
                  <div
                    className="border rounded-lg p-3 text-center transition-all border-primary bg-primary/5 ring-1 ring-primary"
                  >
                    <p className="text-sm font-semibold">Writer</p>
                    <p className="text-[10px] text-muted-foreground">Draft and publish original blogs</p>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="space-y-1.5 text-left">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t p-4 text-xs">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
export default Register;
