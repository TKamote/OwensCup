// Firebase Configuration for Web App
export const firebaseConfig = {
  apiKey: "AIzaSyA9XM-m4tk8qohMCTwhAcayZI-8sGnRPyI",
  authDomain: "owenscup.firebaseapp.com",
  projectId: "owenscup",
  storageBucket: "owenscup.firebasestorage.app",
  messagingSenderId: "719761938656",
  appId: "1:719761938656:web:653f3f20d58092ee0a9885",
  measurementId: "G-E11GSM385Z",
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
