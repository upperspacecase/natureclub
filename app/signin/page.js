import { SignIn } from "@clerk/nextjs";

export const metadata = {
    title: "Sign in — Nature Club",
};

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-base-100">
            <SignIn
                routing="hash"
                afterSignInUrl="/events"
                afterSignUpUrl="/events"
                appearance={{
                    variables: {
                        colorBackground: "rgba(255,255,255,0.06)",
                        colorPrimary: "#ffffff",
                        colorText: "#ffffff",
                        colorTextSecondary: "rgba(255,255,255,0.6)",
                        colorInputBackground: "rgba(255,255,255,0.04)",
                        colorInputText: "#ffffff",
                        borderRadius: "0.625rem",
                    },
                    elements: {
                        card: "border border-white/15 backdrop-blur-sm shadow-xl",
                        headerTitle: "font-serif italic",
                        formButtonPrimary:
                            "bg-white text-[#1a1a1a] hover:bg-[#f7f4ee] font-medium",
                    },
                }}
            />
        </div>
    );
}
