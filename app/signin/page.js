"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [step, setStep] = useState("phone"); // "phone" | "code"
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cleanPhone, setCleanPhone] = useState("");
    const codeInputRef = useRef(null);

    async function handleSendOtp(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                setError("Something went wrong. Please try again.");
                return;
            }

            if (!res.ok) {
                setError(data.error || "Failed to send code");
                return;
            }

            setCleanPhone(data.phone);
            setStep("code");
            setTimeout(() => codeInputRef.current?.focus(), 100);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone, code }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                setError("Something went wrong. Please try again.");
                return;
            }

            if (!res.ok) {
                setError(data.error || "Invalid code");
                return;
            }

            // Signed in — redirect to events dashboard
            router.push("/events");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to resend code");
            } else {
                setError(""); // clear any previous error
                setCode("");
            }
        } catch {
            setError("Failed to resend. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-sm">
                <h1 className="font-serif text-2xl italic text-white">
                    Nature Club
                </h1>

                {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="mt-6">
                        <p className="mb-4 text-sm text-white/60">
                            Enter your phone number to sign in
                        </p>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-center text-sm text-white placeholder-white/40 outline-none focus:border-white/70"
                            autoFocus
                            autoComplete="tel"
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !phone.trim()}
                            className="btn mt-4 w-full disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Code →"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="mt-6">
                        <p className="mb-1 text-sm text-white/60">
                            Enter the 6-digit code sent to
                        </p>
                        <p className="mb-4 text-sm font-medium text-white/90">
                            {cleanPhone}
                        </p>
                        <input
                            ref={codeInputRef}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) =>
                                setCode(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="000000"
                            className="w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-center text-lg tracking-[0.3em] text-white placeholder-white/40 outline-none focus:border-white/70"
                            autoComplete="one-time-code"
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading || code.length < 6}
                            className="btn mt-4 w-full disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify →"}
                        </button>
                        <div className="mt-3 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="text-sm text-white/50 hover:text-white"
                            >
                                Resend code
                            </button>
                            <span className="text-white/20">·</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep("phone");
                                    setCode("");
                                    setError("");
                                }}
                                className="text-sm text-white/50 hover:text-white"
                            >
                                Change number
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
