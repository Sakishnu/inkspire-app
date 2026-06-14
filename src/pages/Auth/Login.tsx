import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Feather, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Login: React.FC = () => {
  const { login, loginWithPhone } = useApp();
  const navigate = useNavigate();

  // Password login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  // Phone OTP login states
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeError, setOtpCodeError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const validatePasswordLogin = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email address or phone number is required");
      isValid = false;
    } else {
      const isEmail = /\S+@\S+\.\S+/.test(email);
      const isPhone = /^\+?[0-9\s-]{6,15}$/.test(email);
      if (!isEmail && !isPhone) {
        setEmailError("Please enter a valid email or phone number");
        isValid = false;
      } else {
        setEmailError("");
      }
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validatePasswordLogin()) return;

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/feed");
      } else {
        setError("Incorrect email/phone number or password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = () => {
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    const isPhone = /^\+?[0-9\s-]{6,15}$/.test(phone);
    if (!isPhone) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validatePhone()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const code = "123456";
      setGeneratedOtp(code);
      toast.success(`Your verification code is ${code}`);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setOtpCodeError("Verification code is required");
      return;
    }
    if (otpCode.trim() !== generatedOtp) {
      setOtpCodeError("Incorrect verification code. Please try again.");
      return;
    }

    setOtpCodeError("");
    setLoading(true);
    try {
      const success = await loginWithPhone(phone);
      if (success) {
        navigate("/feed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign in with phone.");
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
            Explore and publish ideas from developers, designers, and creators.
          </p>
        </div>

        <Card className="border border-border/50 bg-card/75 backdrop-blur-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              {isOtpLogin ? "Enter your phone number to receive a login code." : "Enter your credentials to access your feed."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4">
            {isOtpLogin ? (
              /* Phone OTP Login Flow */
              <div className="space-y-4">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+15555555555"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={phoneError ? "border-red-500" : ""}
                      />
                      {phoneError && <p className="text-[11px] text-red-500">{phoneError}</p>}
                      <p className="text-[10px] text-muted-foreground">
                        Enter your phone number to receive a 6-digit verification code.
                      </p>
                    </div>
                    <Button onClick={handleSendOtp} className="w-full font-semibold" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send Verification Code"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="phone-display">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone-display"
                          type="text"
                          value={phone}
                          disabled
                          className="bg-muted"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode("");
                            setOtpCodeError("");
                          }}
                          className="px-3"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="otp-code">Verification Code</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className={`text-center tracking-widest font-bold text-lg ${otpCodeError ? "border-red-500" : ""}`}
                      />
                      {otpCodeError && <p className="text-[11px] text-red-500 text-center">{otpCodeError}</p>}
                    </div>
                    <Button type="submit" className="w-full font-semibold" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setIsOtpLogin(false);
                      setOtpSent(false);
                      setPhone("");
                      setPhoneError("");
                      setOtpCode("");
                      setOtpCodeError("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline p-0 h-auto"
                  >
                    Sign in with Email & Password
                  </Button>
                </div>
              </div>
            ) : (
              /* Password Login Flow */
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg text-center font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email address or Phone number</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="writer1@inkspire.com or +15555555555"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={emailError ? "border-red-500" : ""}
                    />
                    {emailError && <p className="text-[11px] text-red-500">{emailError}</p>}
                    <p className="text-[10px] text-muted-foreground">
                      Try: <code className="bg-muted px-1 py-0.5 rounded">reader@inkspire.com</code> / <code className="bg-muted px-1 py-0.5 rounded">reader123</code> or <code className="bg-muted px-1 py-0.5 rounded">+17777777777</code>
                    </p>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-[11px] text-red-500">{passwordError}</p>}
                  </div>

                  <Button type="submit" className="w-full mt-6 font-semibold" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setIsOtpLogin(true);
                      setEmail("");
                      setEmailError("");
                      setPassword("");
                      setPasswordError("");
                      setError("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline p-0 h-auto"
                  >
                    Sign in with Phone (OTP)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t p-4 text-xs">
            <span className="text-muted-foreground">Don't have an account?</span>
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
