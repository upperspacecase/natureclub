import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

if (getApps().length === 0) {
    let credential;

    // Try local file first (dev), fall back to env vars (prod/Vercel)
    const localPath = join(process.cwd(), "firebase-service-account.json");
    if (existsSync(localPath)) {
        const serviceAccount = JSON.parse(readFileSync(localPath, "utf-8"));
        credential = cert(serviceAccount);
    } else {
        credential = cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY
                ?.replace(/\\n/g, "\n")
                ?.replace(/\\\\n/g, "\n"),
        });
    }

    initializeApp({ credential });
}

const adminAuth = getAuth();

export { adminAuth };
