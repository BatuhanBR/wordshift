import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

// Helper type for document mapping
type DocSnapshot = QueryDocumentSnapshot<DocumentData>;

// ============================================
// GET /api/user/data - Export all user data (KVKK)
// ============================================
export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Collect all user data
        const userData: Record<string, unknown> = {
            exportDate: new Date().toISOString(),
            userId,
        };

        // 1. User profile
        const userDoc = await adminDb.collection("users").doc(userId).get();
        if (userDoc.exists) {
            userData.profile = userDoc.data();
        }

        // 2. Game history
        const gamesSnapshot = await adminDb
            .collection("games")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        userData.games = gamesSnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 3. Statistics
        const statsSnapshot = await adminDb
            .collection("stats")
            .where("userId", "==", userId)
            .get();

        userData.statistics = statsSnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 4. Match history (subcollection)
        const matchHistorySnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("matchHistory")
            .orderBy("timestamp", "desc")
            .get();

        userData.matchHistory = matchHistorySnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 5. Friends (subcollection)
        const friendsSnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("friends")
            .get();

        userData.friends = friendsSnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 6. Analytics data (if exists)
        const analyticsSnapshot = await adminDb
            .collection("analytics_events")
            .where("userId", "==", userId)
            .orderBy("timestamp", "desc")
            .limit(1000)
            .get();

        userData.analyticsEvents = analyticsSnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        // 7. Sessions
        const sessionsSnapshot = await adminDb
            .collection("sessions")
            .where("userId", "==", userId)
            .orderBy("startTime", "desc")
            .limit(100)
            .get();

        userData.sessions = sessionsSnapshot.docs.map((doc: DocSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(userData);
    } catch (error) {
        console.error("Error exporting user data:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}

// ============================================
// DELETE /api/user/data - Delete all user data (KVKK)
// ============================================
export async function DELETE(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const batch = adminDb.batch();

        // 1. Delete games
        const gamesSnapshot = await adminDb
            .collection("games")
            .where("userId", "==", userId)
            .get();

        gamesSnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 2. Delete statistics
        const statsSnapshot = await adminDb
            .collection("stats")
            .where("userId", "==", userId)
            .get();

        statsSnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 3. Delete analytics events
        const analyticsSnapshot = await adminDb
            .collection("analytics_events")
            .where("userId", "==", userId)
            .get();

        analyticsSnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 4. Delete sessions
        const sessionsSnapshot = await adminDb
            .collection("sessions")
            .where("userId", "==", userId)
            .get();

        sessionsSnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 5. Delete match history (subcollection)
        const matchHistorySnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("matchHistory")
            .get();

        matchHistorySnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 6. Delete friends (subcollection)
        const friendsSnapshot = await adminDb
            .collection("users")
            .doc(userId)
            .collection("friends")
            .get();

        friendsSnapshot.docs.forEach((doc: DocSnapshot) => {
            batch.delete(doc.ref);
        });

        // 7. Delete user document
        batch.delete(adminDb.collection("users").doc(userId));

        // Commit batch delete
        await batch.commit();

        // 8. Delete Firebase Auth user
        await adminAuth.deleteUser(userId);

        return NextResponse.json({
            success: true,
            message: "All user data has been deleted",
            deletedCollections: [
                "users",
                "games",
                "stats",
                "analytics_events",
                "sessions",
                "matchHistory",
                "friends"
            ]
        });
    } catch (error) {
        console.error("Error deleting user data:", error);
        return NextResponse.json(
            { error: "Failed to delete data" },
            { status: 500 }
        );
    }
}
