import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignInPage() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f8f6f3",
            }}
        >
            <SignIn
                routing="hash"
                afterSignInUrl="/events"
                afterSignUpUrl="/events"
            />
        </div>
    );
}
