"use client";

import { useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/libs/firebase";
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
    const initialized = useRef(false);
    const buttonRef = useRef(null);

    const handleCredentialResponse = useCallback(
        async (response) => {
            setError("");
            setLoading(true);

            try {
                // Step 1: Convert Google JWT to Firebase credential
                const credential = GoogleAuthProvider.credential(response.credential);
                console.log("[auth] Step 1: Google credential created");

                // Step 2: Sign in to Firebase client
                const result = await signInWithCredential(auth, credential);
                console.log("[auth] Step 2: Firebase signIn success, uid:", result.user.uid);

                // Step 3: Get Firebase-issued ID token
                const firebaseIdToken = await result.user.getIdToken();
                console.log("[auth] Step 3: Got Firebase ID token, length:", firebaseIdToken.length);

                // Step 4: Send to server to create session cookie
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: firebaseIdToken }),
                });
                console.log("[auth] Step 4: Server response status:", res.status);

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
            } catch (err) {
                console.error("[auth] Error at:", err);
                setError(err.message || "Sign in failed. Please try again.");
                setLoading(false);
            }
        },
        [router, returnUrl]
    );

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
                        <div ref={buttonRef} className="min-h-[44px]" />
                    )}

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}
                </div>
            </main>
        </>
    );
}
