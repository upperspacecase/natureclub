import Link from "next/link";

export const metadata = {
    title: "Sign in — Nature Club",
};

// TWILIO-AUTH: Replace with phone OTP form when Twilio is wired
export default function SignInPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-sm">
                <h1 className="font-serif text-2xl italic text-white">
                    Nature Club
                </h1>
                <p className="mt-3 text-sm text-white/60">
                    Phone authentication coming soon.
                </p>
                <Link
                    href="/events"
                    className="btn mt-6 w-full"
                >
                    Continue to Events →
                </Link>
            </div>
        </div>
    );
}
