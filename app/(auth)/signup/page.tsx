"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction, checkCollabspaceIdAvailability, verifyOTPAction, resendOTPAction } from "./actions";
import { signIn } from "next-auth/react";
import { slugifyCollabspaceId } from "@/lib/utils";

type Step = "form" | "verify";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [verifyEmail, setVerifyEmail] = useState("");

  // Controlled form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [collabspaceId, setCollabspaceId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [checkingId, setCheckingId] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCollabspaceIdChange = async (value: string) => {
    const cleaned = slugifyCollabspaceId(value);
    setCollabspaceId(cleaned);
    setIdAvailable(null);

    if (cleaned.length >= 3) {
      setCheckingId(true);
      const available = await checkCollabspaceIdAvailability(cleaned);
      setIdAvailable(available);
      setCheckingId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (collabspaceId.length < 3) {
      setError("CollabSpace ID must be at least 3 characters");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("collabspaceId", collabspaceId);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    startTransition(async () => {
      const result = await signupAction(formData);
      if (result.success) {
        setVerifyEmail(result.email || email);
        setStep("verify");
        setResendCooldown(60);
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/onboarding" });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await verifyOTPAction(verifyEmail, otpString);
      if (result.success) {
        router.push("/login?verified=true");
      } else {
        setError(result.error || "Verification failed");
      }
    });
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await resendOTPAction(verifyEmail);
      if (result.success) {
        setResendCooldown(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError(result.error || "Failed to resend");
      }
    });
  };

  // OTP Verification Screen
  if (step === "verify") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 border border-sky-500/30">
            <Mail className="h-10 w-10 text-sky-400" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-50">Check your email</h1>

          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-sm text-slate-400">We sent a 6-digit code to:</p>
            <p className="mt-1 text-base font-medium text-slate-100">{verifyEmail}</p>
          </div>

          <p className="mt-4 text-sm text-slate-300/80">
            Enter the code below to verify your account
          </p>

          {/* OTP Input */}
          <div className="mt-6 flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className="h-12 w-12 rounded-xl border border-white/20 bg-white/5 text-center text-xl font-semibold text-slate-100 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                disabled={isPending}
              />
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <Button
            onClick={handleVerifyOtp}
            disabled={isPending || otp.join("").length !== 6}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-6 text-sm font-semibold text-slate-950"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={handleResendOtp}
              disabled={isPending || resendCooldown > 0}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>

            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Use different email
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Join CollabSpace and find your perfect teammates
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-6 text-slate-100 hover:bg-white/10"
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-400">or continue with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">First name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required disabled={isPending} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Last name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required disabled={isPending} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required disabled={isPending} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">CollabSpace ID</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
                <Input
                  value={collabspaceId}
                  onChange={(e) => handleCollabspaceIdChange(e.target.value)}
                  placeholder="yourname"
                  className="pl-8 pr-10"
                  required
                  disabled={isPending}
                />
                {collabspaceId.length >= 3 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    {checkingId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : idAvailable ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {collabspaceId.length > 0 && collabspaceId.length < 3
                  ? "Minimum 3 characters required"
                  : idAvailable === false
                    ? "This ID is already taken"
                    : "This will be your unique username"}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  required
                  disabled={isPending}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Confirm password</label>
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Confirm your password"
                required
                disabled={isPending}
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-[11px] text-red-400">Passwords don&apos;t match</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || (collabspaceId.length >= 3 && !idAvailable) || (confirmPassword.length > 0 && password !== confirmPassword)}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-400 hover:text-sky-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}