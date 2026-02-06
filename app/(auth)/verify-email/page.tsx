"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully!");
                    // Redirect to app after 2 seconds
                    setTimeout(() => {
                        router.push("/login");
                    }, 2000);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed");
                }
            } catch {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
            >
                {status === "loading" && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-50">Verifying your email...</h1>
                        <p className="mt-3 text-sm text-slate-300/80">
                            Please wait while we verify your email address.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                            <Check className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-50">Email Verified!</h1>
                        <p className="mt-3 text-sm text-slate-300/80">{message}</p>
                        <p className="mt-2 text-xs text-slate-400">Redirecting you to login...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                            <X className="h-8 w-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-50">Verification Failed</h1>
                        <p className="mt-3 text-sm text-slate-300/80">{message}</p>
                        <div className="mt-6 flex flex-col gap-3">
                            <Link href="/signup">
                                <Button className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-5 text-sm font-semibold text-slate-950">
                                    Try signing up again
                                </Button>
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm text-sky-400 hover:text-sky-300"
                            >
                                Back to login
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
