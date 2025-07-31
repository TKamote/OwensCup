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
  apiKey: "AIzaSyAA_wfbF0ytUY3Qnd0YC9qHhkXO8QPC_iE",
  authDomain: "owenscup.firebaseapp.com",
  projectId: "owenscup",
  storageBucket: "owenscup.firebasestorage.app",
  messagingSenderId: "719761938656",
  appId: "1:719761938656:android:af1796bfe8a9848d0a9885",
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
    console.log("Attempting to save tournament data for user:", userId);
    console.log("Tournament data:", tournamentData);
    
    // Save tournament data to Firestore
    await setDoc(doc(db, "users", userId, "tournament", "current"), {
      ...tournamentData,
      updatedAt: new Date(),
    });
    console.log("Tournament data saved successfully");
  } catch (error) {
    console.error("Error saving tournament data:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      userId: userId,
      dataSize: JSON.stringify(tournamentData).length
    });
    throw error;
  }
};

export const loadTournamentData = async (userId: string) => {
  try {
    console.log("Attempting to load tournament data for user:", userId);
    
    // Load tournament data from Firestore
    const docRef = doc(db, "users", userId, "tournament", "current");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Tournament data loaded successfully");
      return docSnap.data();
    } else {
      console.log("No tournament data found, returning empty state");
      return null;
    }
  } catch (error) {
    console.error("Error loading tournament data:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      userId: userId
    });
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
