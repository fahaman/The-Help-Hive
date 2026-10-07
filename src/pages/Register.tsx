import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Hexagon, CheckCircle, XCircle } from "lucide-react";
import { sampleUsers, providers as defaultProviders } from "@/lib/mock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, createUser, createProvider } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  
  const createUserMut = useMutation({ mutationFn: createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Country codes with digit limits
  const countryCodes = [
    { code: "+1", country: "US/Canada", digits: 10 },
    { code: "+44", country: "UK", digits: 10 },
    { code: "+91", country: "India", digits: 10 },
    { code: "+971", country: "UAE", digits: 9 },
    { code: "+86", country: "China", digits: 11 },
    { code: "+81", country: "Japan", digits: 10 },
    { code: "+49", country: "Germany", digits: 10 },
    { code: "+33", country: "France", digits: 9 },
    { code: "+39", country: "Italy", digits: 10 },
    { code: "+34", country: "Spain", digits: 9 },
    { code: "+7", country: "Russia", digits: 10 },
  ];

  const selectedCountry = countryCodes.find(c => c.code === countryCode);
  const maxDigits = selectedCountry?.digits || 10;

  // Validation functions
  const validateName = (name: string) => {
    return /^[a-zA-Z\s]+$/.test(name) && name.length >= 2;
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=[\]{};"':|,.<>?]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    return hasMinLength && hasDigit && hasSymbol && hasUppercase;
  };

  const validatePhoneNumber = (number: string) => {
    return number.length === maxDigits && /^\d+$/.test(number);
  };

  const handleSendOtp = () => {
    if (!validateName(name)) {
      toast({ title: "Invalid Name", description: "Name must contain only letters and spaces, minimum 2 characters.", variant: "destructive" });
      return;
    }

    if (!email) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (!validatePassword(password)) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters with 1 digit, 1 symbol, and 1 uppercase letter.", variant: "destructive" });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({ title: "Invalid Phone Number", description: `Phone number must be exactly ${maxDigits} digits for ${selectedCountry?.country}.`, variant: "destructive" });
      return;
    }

    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    
    // Send to Vite dev server to log in terminal
    fetch('/api/log-otp', {
      method: 'POST',
      body: JSON.stringify({ message: `Verification code for ${countryCode} ${phoneNumber} is: ${otpCode}` })
    }).catch(() => {});

    setOtpSent(true);
    setShowOtpDialog(true);
    toast({ title: "OTP Sent", description: `[DEV] Your verification code is: ${otpCode}` });
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter a 6-digit OTP.", variant: "destructive" });
      return;
    }

    setIsVerifying(true);

    // Verify against generated OTP
    setTimeout(async () => {
      if (otp === generatedOtp) {
        // Save user data
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
        localStorage.setItem("userPhone", `${countryCode} ${phoneNumber}`);
        localStorage.setItem("joinedAt", new Date().toISOString().split('T')[0]);

        try {
          // Both users and providers need an AppUser account to login
          await createUserMut.mutateAsync({
            id: `u${Date.now()}`,
            name: name,
            email: email,
            role: role,
            joinedAt: new Date().toISOString().split('T')[0],
            status: "active"
          });

          toast({ title: "Success", description: "Account created and verified successfully!" });
          
          setTimeout(() => {
            if (role === "provider") {
              navigate("/become-provider");
            } else {
              navigate("/");
            }
          }, 500);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to create account in backend.";
          // Handle specific Prisma errors for unique constraint (email already exists)
          if (errorMessage.includes("Unique constraint failed")) {
             toast({ title: "Error", description: "An account with this email already exists.", variant: "destructive" });
          } else {
             toast({ title: "Error", description: errorMessage, variant: "destructive" });
          }
        }
      } else {
        toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect.", variant: "destructive" });
      }
      setIsVerifying(false);
      if (otp === generatedOtp) {
        setShowOtpDialog(false);
      }
    }, 1000);
  };

  const passwordStrength = {
    length: password.length >= 8,
    digit: /\d/.test(password),
    symbol: /[!@#$%^&*()_+\-=[\]{};"':|,.<>?]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="card-elevated rounded-xl bg-card p-8">
            <div className="mb-6 text-center">
              <Hexagon className="mx-auto mb-3 h-10 w-10 text-accent" strokeWidth={2.5} />
              <h1 className="font-heading text-2xl font-bold text-foreground">Create Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join The Help Hive today</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={name && !validateName(name) ? "border-red-500" : ""}
                />
                {name && !validateName(name) && (
                  <p className="text-sm text-red-500 mt-1">Name must contain only letters and spaces</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} ({country.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder={`${maxDigits} digits`}
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= maxDigits) {
                        setPhoneNumber(value);
                      }
                    }}
                    className={phoneNumber && !validatePhoneNumber(phoneNumber) ? "border-red-500" : ""}
                  />
                </div>
                {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                  <p className="text-sm text-red-500 mt-1">Phone number must be exactly {maxDigits} digits</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.length ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                      <span className={passwordStrength.length ? "text-green-600" : "text-red-600"}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.digit ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                      <span className={passwordStrength.digit ? "text-green-600" : "text-red-600"}>At least 1 number</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.symbol ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                      <span className={passwordStrength.symbol ? "text-green-600" : "text-red-600"}>At least 1 symbol</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordStrength.uppercase ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                      <span className={passwordStrength.uppercase ? "text-green-600" : "text-red-600"}>At least 1 uppercase letter</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Register as</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Customer</SelectItem>
                    <SelectItem value="provider">Service Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {role === "provider" && (
                <div>
                  <Label>Service Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!validateName(name) || !email || !validatePassword(password) || !validatePhoneNumber(phoneNumber)}>
                Send Verification Code
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-accent hover:underline">Log in</Link>
            </p>
          </div>
        </div>

        {/* OTP Verification Dialog */}
        <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify Your Phone Number</DialogTitle>
              <DialogDescription>
                We've sent a 6-digit verification code to {countryCode} {phoneNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Verify & Create Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default Register;
