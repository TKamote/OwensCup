// Firebase Configuration
// In production, these should be moved to environment variables
export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA9XM-m4tk8qohMCTwhAcayZI-8sGnRPyI",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "owenscup.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "owenscup",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "owenscup.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "719761938656",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:719761938656:web:653f3f20d58092ee0a9885",
  measurementId:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-E11GSM385Z",
};

// Security: Validate that all required config values are present
export const validateFirebaseConfig = () => {
  const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      throw new Error(`Missing required Firebase configuration: ${key}`);
    }
  }

  return true;
};
