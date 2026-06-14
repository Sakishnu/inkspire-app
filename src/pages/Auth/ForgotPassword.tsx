import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Feather, ArrowLeft, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const ForgotPassword: React.FC = () => {
  const { users, hashPassword, resetPassword } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const validateIdentifier = () => {
    if (!identifier.trim()) {
      setIdentifierError("Email address or phone number is required");
      return false;
    }
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    const isPhone = /^\+?[0-9\s-]{6,15}$/.test(identifier);
    if (!isEmail && !isPhone) {
      setIdentifierError("Please enter a valid email or phone number");
      return false;
    }

    // Check if user exists
    const userExists = users.some(
      (u) =>
        u.email.toLowerCase() === identifier.trim().toLowerCase() ||
        (u.phone && u.phone.trim() === identifier.trim())
    );

    if (!userExists) {
      setIdentifierError("No account found with this email or phone number");
      return false;
    }

    setIdentifierError("");
    return true;
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIdentifier()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isEmail = identifier.includes("@");
      if (isEmail) {
        toast.success(`Password reset link sent to your email. Click to reset.`);
        setStep(3);
      } else {
        toast.success("Your verification code is 123456");
        setStep(2);
      }
    }, 1000);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setCodeError("Verification code is required");
      return;
    }
    if (code.trim() !== "123456") {
      setCodeError("Incorrect verification code. Please try again.");
      return;
    }

    setCodeError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 800);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      const success = await resetPassword(identifier.trim(), hashed);
      if (success) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        setPasswordError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
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
            Recover your account details securely.
          </p>
        </div>

        <Card className="border border-border/50 bg-card/75 backdrop-blur-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Enter your email or phone number to recover your password."}
              {step === 2 && `Enter the 6-digit verification code sent to your phone.`}
              {step === 3 && "Create a new secure password for your account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <span className="h-px w-6 bg-muted-foreground/20" />
              <span className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <span className="h-px w-6 bg-muted-foreground/20" />
              <span className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>

            {step === 1 && (
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="identifier">Email Address or Phone Number</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@example.com or +15555555555"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={identifierError ? "border-red-500" : ""}
                  />
                  {identifierError && <p className="text-[10px] text-red-500">{identifierError}</p>}
                </div>

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? "Sending..." : "Continue"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`text-center tracking-widest font-bold text-lg ${codeError ? "border-red-500" : ""}`}
                  />
                  {codeError && <p className="text-[10px] text-red-500 text-center">{codeError}</p>}
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Enter the code we sent via SMS.
                  </p>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Your verification code is 123456");
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg text-center font-medium">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-center border-t p-4">
            <Link to="/login" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Sign In</span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
