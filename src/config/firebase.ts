import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let database: Database;
let auth: Auth;

export function initializeFirebase() {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    // Validate config
    const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
    
    if (!hasRequiredConfig) {
      console.warn('Firebase configuration is incomplete. Some features may not work.');
      console.warn('Please set NEXT_PUBLIC_FIREBASE_* environment variables.');
      return { app: null, database: null, auth: null, isConfigured: false };
    }

    try {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      auth = getAuth(app);
      console.log('Firebase initialized successfully');
      return { app, database, auth, isConfigured: true };
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return { app: null, database: null, auth: null, isConfigured: false };
    }
  } else {
    // Firebase already initialized
    app = getApps()[0];
    database = getDatabase(app);
    auth = getAuth(app);
    return { app, database, auth, isConfigured: true };
  }
}

// Export getters for Firebase instances
export function getFirebaseApp(): FirebaseApp | null {
  if (!app) {
    const result = initializeFirebase();
    return result.app;
  }
  return app;
}

export function getFirebaseDatabase(): Database | null {
  if (!database) {
    const result = initializeFirebase();
    return result.database;
  }
  return database;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    const result = initializeFirebase();
    return result.auth;
  }
  return auth;
}

// Check if Firebase is properly configured
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// Initialize on module load
initializeFirebase();
