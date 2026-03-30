import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { join } from "path";

if (getApps().length === 0) {
    const serviceAccountPath = join(process.cwd(), "firebase-service-account.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
    initializeApp({ credential: cert(serviceAccount) });
}

const adminAuth = getAuth();

export { adminAuth };
