"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/libs/firebase";
import Script from "next/script";
import Image from "next/image";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function SignInPage() {
    return (
        <Suspense>
            <SignInContent />
        </Suspense>
    );
}

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl") || "/home";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFallback, setShowFallback] = useState(false);
    const initialized = useRef(false);
    const gsiRendered = useRef(false);
    const buttonRef = useRef(null);

    // Exchange a signed-in Firebase user for the nc_session cookie, then redirect
    const finishSignIn = useCallback(
        async (firebaseUser) => {
            const firebaseIdToken = await firebaseUser.getIdToken();
            console.log("[auth] Got Firebase ID token, length:", firebaseIdToken.length);

            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: firebaseIdToken }),
            });
            console.log("[auth] Server response status:", res.status);

            if (!res.ok) {
                const text = await res.text();
                console.error("[auth] Server error response:", text.slice(0, 200));
                try {
                    const data = JSON.parse(text);
                    throw new Error(data.error || "Sign in failed");
                } catch (parseErr) {
                    throw new Error("Server returned invalid response");
                }
            }

            router.push(returnUrl);
        },
        [router, returnUrl]
    );

    const handleCredentialResponse = useCallback(
        async (response) => {
            setError("");
            setLoading(true);

            try {
                // Convert Google JWT to Firebase credential, sign in to Firebase client
                const credential = GoogleAuthProvider.credential(response.credential);
                console.log("[auth] Google credential created");

                const result = await signInWithCredential(auth, credential);
                console.log("[auth] Firebase signIn success, uid:", result.user.uid);

                await finishSignIn(result.user);
            } catch (err) {
                console.error("[auth] Error at:", err);
                setError(err.message || "Sign in failed. Please try again.");
                setLoading(false);
            }
        },
        [finishSignIn]
    );

    // Fallback path: Firebase popup sign-in, used when the GSI script is
    // blocked or fails to render its button
    const handlePopupSignIn = useCallback(async () => {
        setError("");
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("[auth] Popup signIn success, uid:", result.user.uid);
            await finishSignIn(result.user);
        } catch (err) {
            console.error("[auth] Popup error:", err);
            if (err.code === "auth/popup-closed-by-user") {
                setLoading(false);
                return;
            }
            setError(err.message || "Sign in failed. Please try again.");
            setLoading(false);
        }
    }, [finishSignIn]);

    // If the GSI button hasn't rendered shortly after mount (script blocked,
    // offline, extension interference), show our own sign-in button instead
    useEffect(() => {
        const t = setTimeout(() => {
            if (!gsiRendered.current) setShowFallback(true);
        }, 2500);
        return () => clearTimeout(t);
    }, []);

    const initializeGSI = useCallback(() => {
        if (initialized.current || !window.google?.accounts?.id) return;
        initialized.current = true;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
            context: "signin",
        });

        // Show One Tap prompt
        window.google.accounts.id.prompt();

        // Also render the button as a fallback
        if (buttonRef.current) {
            window.google.accounts.id.renderButton(buttonRef.current, {
                type: "standard",
                shape: "rectangular",
                theme: "outline",
                size: "large",
                text: "continue_with",
                width: 320,
            });
            gsiRendered.current = buttonRef.current.childElementCount > 0;
        }
    }, [handleCredentialResponse]);

    return (
        <>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initializeGSI}
            />
            <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-sm flex flex-col items-center gap-8">
                    <Image
                        src="/logo-light.svg"
                        alt="Nature Club"
                        width={48}
                        height={48}
                        className="opacity-90"
                    />

                    <h1 className="font-serif italic text-white text-3xl text-center text-balance">
                        Spend more time in Nature
                    </h1>

                    {loading ? (
                        <div className="flex items-center gap-3 text-white/60">
                            <span className="loading loading-spinner loading-sm" />
                            Signing in...
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div ref={buttonRef} className="min-h-[44px]" />
                            {showFallback && (
                                <button
                                    type="button"
                                    onClick={handlePopupSignIn}
                                    className="w-80 max-w-full h-11 rounded bg-white text-gray-800 text-sm font-medium hover:bg-gray-100"
                                >
                                    Continue with Google
                                </button>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}
                </div>
            </main>
        </>
    );
}
