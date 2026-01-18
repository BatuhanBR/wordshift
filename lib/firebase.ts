import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let database: Database;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Oturum kalıcılığı: env ile kontrol
  const persistence = (process.env.NEXT_PUBLIC_AUTH_PERSISTENCE || "local").toLowerCase();
  const target = persistence === "session" ? browserSessionPersistence : persistence === "none" ? inMemoryPersistence : browserLocalPersistence;
  // Hata atsa bile uygulamayı bloklamasın
  setPersistence(auth, target).catch(() => {});
  db = getFirestore(app);
  database = getDatabase(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  database = getDatabase(app);
}

export { app, auth, db, database };

