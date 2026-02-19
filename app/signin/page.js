"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import HexagonLogo from "@/components/HexagonLogo";

const COUNTRY_CODES = [
    { code: "+1", flag: "🇺🇸", label: "US" },
    { code: "+1", flag: "🇨🇦", label: "CA" },
    { code: "+44", flag: "🇬🇧", label: "UK" },
    { code: "+61", flag: "🇦🇺", label: "AU" },
    { code: "+64", flag: "🇳🇿", label: "NZ" },
    { code: "+353", flag: "🇮🇪", label: "IE" },
    { code: "+49", flag: "🇩🇪", label: "DE" },
    { code: "+33", flag: "🇫🇷", label: "FR" },
    { code: "+34", flag: "🇪🇸", label: "ES" },
    { code: "+39", flag: "🇮🇹", label: "IT" },
    { code: "+31", flag: "🇳🇱", label: "NL" },
    { code: "+46", flag: "🇸🇪", label: "SE" },
    { code: "+47", flag: "🇳🇴", label: "NO" },
    { code: "+45", flag: "🇩🇰", label: "DK" },
    { code: "+55", flag: "🇧🇷", label: "BR" },
    { code: "+52", flag: "🇲🇽", label: "MX" },
    { code: "+81", flag: "🇯🇵", label: "JP" },
    { code: "+82", flag: "🇰🇷", label: "KR" },
    { code: "+91", flag: "🇮🇳", label: "IN" },
    { code: "+27", flag: "🇿🇦", label: "ZA" },
];

function detectCountryCode() {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const map = {
            "America/": "+1", "US/": "+1", "Canada/": "+1",
            "Europe/London": "+44", "GB": "+44",
            "Australia/": "+61", "Pacific/Auckland": "+64",
            "Europe/Dublin": "+353", "Europe/Berlin": "+49",
            "Europe/Paris": "+33", "Europe/Madrid": "+34",
            "Europe/Rome": "+39", "Europe/Amsterdam": "+31",
            "Europe/Stockholm": "+46", "Europe/Oslo": "+47",
            "Europe/Copenhagen": "+45", "America/Sao_Paulo": "+55",
            "America/Mexico_City": "+52", "Asia/Tokyo": "+81",
            "Asia/Seoul": "+82", "Asia/Kolkata": "+91",
            "Asia/Calcutta": "+91", "Africa/Johannesburg": "+27",
        };
        for (const [prefix, code] of Object.entries(map)) {
            if (tz.startsWith(prefix) || tz === prefix) return code;
        }
    } catch { /* best-effort */ }
    return "+1";
}

export default function SignInPage() {
    const router = useRouter();
    const [step, setStep] = useState("phone"); // "phone" | "method" | "code"
    const [countryCode, setCountryCode] = useState(() => detectCountryCode());
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cleanPhone, setCleanPhone] = useState("");
    const [countdown, setCountdown] = useState(0);
    const codeInputRef = useRef(null);

    const phoneValid = phone.replace(/\D/g, "").length >= 7;
    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

    // Resend countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    function handlePhoneContinue(e) {
        e.preventDefault();
        if (!phoneValid) return;
        setError("");
        setStep("method");
    }

    async function handleSendViaSms() {
        setError("");
        setLoading(true);
        try {
            const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone.replace(/^0+/, "")}`;
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: fullPhone }),
            });
            let data;
            try { data = await res.json(); } catch { setError("Something went wrong."); return; }
            if (!res.ok) { setError(data.error || "Failed to send code"); return; }
            setCleanPhone(data.phone);
            setStep("code");
            setCountdown(30);
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
            try { data = await res.json(); } catch { setError("Something went wrong."); return; }
            if (!res.ok) { setError(data.error || "Invalid code"); return; }
            router.push("/events");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (countdown > 0) return;
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to resend"); }
            else { setCode(""); setCountdown(30); }
        } catch {
            setError("Failed to resend. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-5 text-white">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-4 flex justify-center">
                    <HexagonLogo className="h-12 w-12 text-white/80" />
                </div>

                {/* Title */}
                <h1 className="mb-8 text-center font-serif text-3xl italic text-white">
                    Sign in or sign up
                </h1>

                {/* ── Step 1: Phone ── */}
                {step === "phone" && (
                    <form onSubmit={handlePhoneContinue}>
                        {/* Combined phone row */}
                        <div className="flex overflow-hidden rounded-xl border border-white/25">
                            {/* Country selector */}
                            <div className="relative flex items-center border-r border-white/25 bg-white/[0.04]">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="h-full appearance-none border-0 bg-transparent py-4 pl-4 pr-10 text-lg outline-none"
                                    style={{ paddingRight: "40px" }}
                                >
                                    {COUNTRY_CODES.map((c, i) => (
                                        <option key={`${c.code}-${c.label}-${i}`} value={c.code}>
                                            {c.flag} {c.code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Phone input */}
                            <div className="relative flex flex-1 items-center bg-white/[0.04]">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone number"
                                    autoFocus
                                    autoComplete="tel"
                                    className="w-full border-0 bg-transparent px-4 py-4 text-lg text-white placeholder-white/35 outline-none"
                                />
                                {phoneValid && (
                                    <span className="absolute right-4 text-lg text-white/50">✓</span>
                                )}
                            </div>
                        </div>

                        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={!phoneValid}
                            className={`mt-4 w-full rounded-xl py-4 text-base font-semibold transition-all ${phoneValid
                                ? "bg-white text-black hover:bg-white/90"
                                : "cursor-not-allowed bg-white/15 text-white/30"
                                }`}
                        >
                            Login
                        </button>
                    </form>
                )}

                {/* ── Step 2: Delivery Method ── */}
                {step === "method" && (
                    <div>
                        {/* Phone row (locked) */}
                        <div className="flex overflow-hidden rounded-xl border border-white/25 opacity-50">
                            <div className="flex items-center border-r border-white/25 bg-white/[0.04] px-4 py-4 text-lg">
                                {selectedCountry.flag}
                            </div>
                            <div className="flex flex-1 items-center bg-white/[0.04] px-4 py-4">
                                <span className="text-lg text-white/70">{phone}</span>
                                <span className="ml-auto text-lg text-white/50">✓</span>
                            </div>
                        </div>

                        {/* Method card */}
                        <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.06] p-6">
                            <button
                                onClick={() => { setStep("phone"); setError(""); }}
                                className="mb-4 text-xl text-white/70 hover:text-white"
                            >
                                ✕
                            </button>
                            <h2 className="text-center text-xl font-bold text-white">Get your code</h2>
                            <p className="mt-2 text-center text-sm text-white/50">
                                Choose to receive Nature Club notifications via SMS or WhatsApp
                            </p>

                            {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

                            <div className="mt-6 space-y-3">
                                {/* WhatsApp — greyed out */}
                                <button
                                    disabled
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-4 text-base font-medium text-white/25 cursor-not-allowed"
                                >
                                    💬 Send with WhatsApp
                                    <span className="ml-1 text-xs text-white/20">(coming soon)</span>
                                </button>
                                {/* SMS */}
                                <button
                                    onClick={handleSendViaSms}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-white/25 bg-white/[0.06] py-4 text-base font-medium text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    {loading ? "Sending..." : "📱 Send with SMS"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Verify Code ── */}
                {step === "code" && (
                    <form onSubmit={handleVerifyOtp}>
                        {/* Phone row (locked) */}
                        <div className="flex overflow-hidden rounded-xl border border-white/25 opacity-50">
                            <div className="flex items-center border-r border-white/25 bg-white/[0.04] px-4 py-4 text-lg">
                                {selectedCountry.flag}
                            </div>
                            <div className="flex flex-1 items-center bg-white/[0.04] px-4 py-4">
                                <span className="text-lg text-white/70">{phone}</span>
                                <span className="ml-auto text-lg text-white/50">✓</span>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-white/50">
                            We sent {cleanPhone} a code via SMS
                        </p>

                        {/* Code input */}
                        <label className="mt-5 block text-sm font-medium text-white/70">
                            Verification Code
                        </label>
                        <input
                            ref={codeInputRef}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            autoComplete="one-time-code"
                            className="mt-1 w-full rounded-xl border border-white/25 bg-white/[0.04] px-4 py-4 text-lg tracking-[0.3em] text-white placeholder-white/30 outline-none focus:border-white/50"
                        />

                        {/* Resend timer */}
                        <p className="mt-2 text-sm text-white/40">
                            Didn&apos;t receive your code?{" "}
                            {countdown > 0 ? (
                                <span>Resend it in {countdown}s</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="text-white/70 hover:text-white underline"
                                >
                                    Resend
                                </button>
                            )}
                        </p>

                        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading || code.length < 6}
                            className={`mt-5 w-full rounded-xl py-4 text-base font-semibold transition-all ${code.length >= 6
                                ? "bg-white text-black hover:bg-white/90"
                                : "cursor-not-allowed bg-white/15 text-white/30"
                                }`}
                        >
                            {loading ? "Verifying..." : "I agree"}
                        </button>

                        <p className="mt-3 text-center text-xs leading-relaxed text-white/30">
                            By clicking &apos;I agree&apos;, you agree to our{" "}
                            <a href="/tos" className="text-white/50 underline">Terms</a> and{" "}
                            <a href="/privacy-policy" className="text-white/50 underline">Privacy Policy</a>
                            {" "}and consent to receive event texts from Nature Club & hosts.
                        </p>

                        <button
                            type="button"
                            onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                            className="mt-4 block w-full text-center text-sm text-white/40 hover:text-white"
                        >
                            Change number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
