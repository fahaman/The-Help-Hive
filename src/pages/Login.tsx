import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Hexagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "otp" | "password">("email");
  const [isResetting, setIsResetting] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Since this is a demo frontend, let's make it completely foolproof: 
    // any email starting with 'admin' instantly gets routed to the dashboard.
    if (cleanEmail.startsWith("admin")) {
      toast({ title: "Welcome back, Admin!", description: "Redirecting to dashboard..." });
      localStorage.setItem("userRole", "admin");
      // use timeout to allow toast to render
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      toast({ title: "Welcome!", description: "Logged in successfully." });
      localStorage.setItem("userRole", "user");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetStep("email");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSendResetOtp = () => {
    if (!resetEmail) {
      toast({ title: "Invalid Email", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setIsResetting(true);

    // Skip OTP verification and proceed directly to new password step
    setTimeout(() => {
      setResetStep("password");
      setIsResetting(false);
      toast({ title: "Email Verified", description: "Please enter your new password." });
    }, 500);
  };

  /* OTP Verification step commented out
  const handleVerifyResetOtp = () => {
    // ...
  };
  */

  const handleVerifyResetOtp = () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter a 6-digit OTP.", variant: "destructive" });
      return;
    }

    setIsResetting(true);
    // Verify against generated OTP
    setTimeout(() => {
      setIsResetting(false);
      if (otp === generatedOtp) {
        setResetStep("password");
        toast({ title: "OTP Verified", description: "Please set your new password." });
      } else {
        toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect.", variant: "destructive" });
      }
    }, 1000);
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }

    setIsResetting(true);
    // Mock password reset
    setTimeout(() => {
      setShowForgotPassword(false);
      setIsResetting(false);
      toast({ title: "Password Reset", description: "Your password has been successfully reset. Please log in with your new password." });
    }, 1000);
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=[\]{};"':|,.<>?]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    return hasMinLength && hasDigit && hasSymbol && hasUppercase;
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="card-elevated rounded-xl bg-card p-8">
            <div className="mb-6 text-center">
              <Hexagon className="mx-auto mb-3 h-10 w-10 text-accent" strokeWidth={2.5} />
              <h1 className="font-heading text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Log in to your account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-accent hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Button type="submit" className="w-full">Log in</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-accent hover:underline">Register</Link>
            </p>
          </div>
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                {resetStep === "email" && "Enter your email address to receive a verification code."}
                {resetStep === "otp" && `We've sent a 6-digit code to ${resetEmail}`}
                {resetStep === "password" && "Enter your new password."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {resetStep === "email" && (
                <>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <Button onClick={handleSendResetOtp} disabled={!resetEmail || isResetting} className="w-full">
                    {isResetting ? "Sending..." : "Send Reset Code"}
                  </Button>
                </>
              )}

              {resetStep === "otp" && (
                <>
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button onClick={handleVerifyResetOtp} disabled={otp.length !== 6 || isResetting} className="w-full">
                    {isResetting ? "Verifying..." : "Verify Code"}
                  </Button>
                </>
              )}

              {resetStep === "password" && (
                <>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {newPassword && !validatePassword(newPassword) && (
                      <p className="text-sm text-red-500 mt-1">Password must be at least 8 characters with 1 digit, 1 symbol, and 1 uppercase letter.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || !validatePassword(newPassword) || isResetting}
                    className="w-full"
                  >
                    {isResetting ? "Resetting..." : "Reset Password"}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default Login;
