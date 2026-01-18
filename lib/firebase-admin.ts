import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Firebase Admin SDK configuration
// Uses service account credentials from environment variables

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function initializeAdminApp() {
    if (getApps().length === 0) {
        // Check for service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccount) {
            try {
                const credentials = JSON.parse(serviceAccount);
                adminApp = initializeApp({
                    credential: cert(credentials),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } catch (error) {
                console.error("Error parsing service account:", error);
                // Fallback to application default credentials
                adminApp = initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            }
        } else {
            // Use application default credentials (for local development or Cloud Run)
            adminApp = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }
    } else {
        adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
}

// Initialize on module load
initializeAdminApp();

export { adminApp, adminAuth, adminDb };
