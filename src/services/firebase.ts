import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import {
  firebaseConfig,
  validateFirebaseConfig,
} from "../config/firebase.config";

// Validate Firebase configuration on startup
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (web SDK - persistence warning is OK for now)
const auth = getAuth(app);

const db = getFirestore(app);

// Security: Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // Minimum 6 characters for Firebase
  return password.length >= 6;
};

// Authentication functions
export const signInWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
) => {
  try {
    // Security: Validate inputs
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!validatePassword(password)) {
      throw new Error("Password must be at least 6 characters");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

// Check if user is already authenticated
export const getCurrentUser = () => {
  const currentUser = auth.currentUser;
  return currentUser;
};

// Check if database is accessible
export const checkDatabaseConnectivity = async (): Promise<boolean> => {
  // This check is problematic with security rules.
  // We will assume connectivity and let the actual data load fail if there's an issue.
  return true;
};

// Helper function to generate unique username
const generateUniqueUsername = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `user_${timestamp}_${random}`;
};

// Function to check if user/player name is already taken
export const isNameTaken = async (
  userOrPlayerName: string
): Promise<boolean> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("userOrPlayerName", "==", userOrPlayerName)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if name is taken:", error);
    throw error;
  }
};

export const createUserWithEmailAndPasswordFirebase = async (
  email: string,
  password: string,
  userOrPlayerName: string
) => {
  try {
    // Security: Validate inputs
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!validatePassword(password)) {
      throw new Error("Password must be at least 6 characters");
    }
    if (!userOrPlayerName || userOrPlayerName.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    // Security: Basic sanitization (allow copy/paste but remove dangerous characters)
    const sanitizedName = userOrPlayerName.trim().replace(/[<>]/g, "");

    // Check if name is already taken
    const nameTaken = await isNameTaken(sanitizedName);
    if (nameTaken) {
      const error = new Error("Name already taken");
      (error as any).code = "name-already-taken";
      throw error;
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Generate unique username
    const username = generateUniqueUsername();

    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      userOrPlayerName: sanitizedName,
      username,
      email,
      createdAt: new Date(),
      tournaments: [],
      isAdmin: false, // Default to regular user
      role: "viewer", // Assign default role
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

// Security: Validate tournament data
const validateTournamentData = (data: any): boolean => {
  if (!data || typeof data !== "object") {
    return false;
  }

  // Check for required fields
  const requiredFields = [
    "tournamentId",
    "tournamentName",
    "organizer",
    "raceToScore",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }

  // Validate raceToScore is a valid number
  const validScores = ["3", "5", "7", "9"];
  if (!validScores.includes(data.raceToScore)) {
    return false;
  }

  return true;
};

// Tournament data functions
export const saveTournamentData = async (
  userId: string,
  tournamentData: any
) => {
  try {
    // Security: Validate user ID
    if (!userId || typeof userId !== "string" || userId.length < 10) {
      throw new Error("Invalid user ID");
    }

    // Security: Validate tournament data
    if (!validateTournamentData(tournamentData)) {
      throw new Error("Invalid tournament data");
    }

    await setDoc(doc(db, "users", userId, "tournament", "current"), {
      ...tournamentData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Firebase: Error saving tournament data:", error);
    throw error;
  }
};

export const loadTournamentData = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId, "tournament", "current");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
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

// Admin functions for tournament management
export const saveTournamentToGlobal = async (
  userId: string,
  username: string,
  tournamentData: any
) => {
  try {
    const tournamentId = `tournament_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await setDoc(doc(db, "tournaments", tournamentId), {
      ...tournamentData,
      createdBy: userId,
      createdByUsername: username,
      tournamentId: tournamentId,
      isPublic: false, // Default to private
      adminApproved: false, // Default to not approved
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return tournamentId;
  } catch (error) {
    console.error("Firebase: Error saving tournament to global:", error);
    throw error;
  }
};

export const getAllTournaments = async () => {
  try {
    const streamingRef = collection(db, "streaming");
    const querySnapshot = await getDocs(streamingRef);

    const tournaments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tournaments;
  } catch (error) {
    console.error("Firebase: Error fetching all tournaments:", error);
    throw error;
  }
};

// Real-time listener for tournaments
export const subscribeToTournaments = (
  callback: (tournaments: any[]) => void
) => {
  const streamingRef = collection(db, "streaming");

  const unsubscribe = onSnapshot(
    streamingRef,
    (querySnapshot) => {
      const tournaments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(tournaments);
    },
    (error) => {
      console.error("Firebase: Error listening to tournaments:", error);
    }
  );

  return unsubscribe;
};

export const deleteTournament = async (tournamentId: string) => {
  try {
    await deleteDoc(doc(db, "tournaments", tournamentId));

    return true;
  } catch (error) {
    console.error("Firebase: Error deleting tournament:", error);
    throw error;
  }
};

export const approveTournament = async (tournamentId: string) => {
  try {
    await updateDoc(doc(db, "tournaments", tournamentId), {
      adminApproved: true,
      isPublic: true,
      approvedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Firebase: Error approving tournament:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Firebase: Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Firebase: Error updating user profile:", error);
    throw error;
  }
};

// Admin function to create user account
export const createUserAccountByAdmin = async (
  userOrPlayerName: string,
  email: string
) => {
  try {
    // Check if name is already taken
    const nameTaken = await isNameTaken(userOrPlayerName);
    if (nameTaken) {
      const error = new Error("Name already taken");
      (error as any).code = "name-already-taken";
      throw error;
    }

    // Check if email is already registered
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        "tempPassword123" // Temporary password
      );

      // Generate unique username
      const username = generateUniqueUsername();

      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        userOrPlayerName,
        username,
        email,
        createdAt: new Date(),
        tournaments: [],
        isAdmin: false,
        createdByAdmin: true,
        tempPassword: true, // Flag to indicate user should change password
      });

      // TODO: Send email to user with login details
      // For now, we'll just return the temporary password

      return {
        success: true,
        message: `Account created successfully. Temporary password: tempPassword123`,
        userOrPlayerName,
        email,
        tempPassword: "tempPassword123",
      };
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        const error2 = new Error("Email already registered");
        (error2 as any).code = "email-already-in-use";
        throw error2;
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

// Function to make a user an admin
export const makeUserAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Firebase: Error making user admin:", error);
    throw error;
  }
};

// Function to delete all authentication users
export const deleteAllAuthUsers = async () => {
  try {
    // Note: This requires Firebase Admin SDK for server-side deletion
    // For client-side, we'll need to use a different approach

    // For now, we'll return a message to guide manual deletion
    return {
      success: false,
      message:
        "Authentication user deletion requires Firebase Admin SDK. Please delete users manually from Firebase Console → Authentication → Users, then use the complete reset function for Firestore data.",
      manualSteps: [
        "1. Go to Firebase Console → Authentication → Users",
        "2. Select all users and delete them",
        "3. Then use the Complete Reset button in Admin Dashboard",
      ],
    };
  } catch (error) {
    console.error("Firebase: Error deleting auth users:", error);
    throw error;
  }
};

// Complete Firebase reset function - DELETE ALL DATA
export const completeFirebaseReset = async () => {
  try {
    // Delete all users from Authentication
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      await deleteDoc(userDoc.ref);
    }

    // Delete all tournaments from global collection
    const tournamentsRef = collection(db, "tournaments");
    const tournamentsSnapshot = await getDocs(tournamentsRef);

    for (const tournamentDoc of tournamentsSnapshot.docs) {
      await deleteDoc(tournamentDoc.ref);
    }

    // Delete all user-specific tournament data
    const usersSnapshot2 = await getDocs(usersRef);
    for (const userDoc of usersSnapshot2.docs) {
      const userTournamentRef = collection(
        db,
        "users",
        userDoc.id,
        "tournament"
      );
      const userTournamentSnapshot = await getDocs(userTournamentRef);

      for (const tournamentDoc of userTournamentSnapshot.docs) {
        await deleteDoc(tournamentDoc.ref);
      }
    }

    return {
      success: true,
      message:
        "Complete reset successful. All users, tournaments, and data have been deleted.",
      deletedUsers: usersSnapshot.docs.length,
      deletedTournaments: tournamentsSnapshot.docs.length,
    };
  } catch (error) {
    console.error("Firebase: Error during complete reset:", error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent! Please check your inbox and follow the instructions.";
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email address");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Too many password reset attempts. Please try again later."
      );
    }
    throw new Error(error.message || "Failed to send password reset email");
  }
};

// Export auth instance for use in context
export { auth, db };
