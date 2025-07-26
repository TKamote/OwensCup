import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9XM-m4tk8qohMCTwhAcayZI-8sGnRPyI",
  authDomain: "owenscup.firebaseapp.com",
  projectId: "owenscup",
  storageBucket: "owenscup.firebasestorage.app",
  messagingSenderId: "719761938656",
  appId: "1:719761938656:web:653f3f20d58092ee0a9885",
  measurementId: "G-E11GSM385Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signInWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const createUserWithEmailAndPasswordFirebase = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName,
      email,
      createdAt: new Date(),
      tournaments: [],
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOutFirebase = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

// Tournament data functions
export const saveTournamentData = async (
  userId: string,
  tournamentData: any
) => {
  try {
    // For now, just log the data since we're not implementing full storage yet
    console.log('Saving tournament data:', tournamentData);
    // This will be updated when we implement the proper tournament storage
  } catch (error) {
    throw error;
  }
};

export const loadTournamentData = async (userId: string) => {
  try {
    // For now, return empty array since we're not storing tournaments in users collection
    // This will be updated when we implement the proper tournament storage
    return [];
  } catch (error) {
    throw error;
  }
};

export const updateTournamentScore = async (
  tournamentId: string,
  matchIndex: number,
  teamScores: number[],
  matchScores: [number, number][]
) => {
  try {
    const tournamentRef = doc(db, "tournaments", tournamentId);
    await updateDoc(tournamentRef, {
      teamScores,
      matchScores,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

// Export auth instance for use in context
export { auth, db };
