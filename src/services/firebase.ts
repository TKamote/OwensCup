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
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
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

// Firebase Auth automatically handles persistence by default
// No need to manually configure persistence
console.log("Firebase initialized successfully");

// Authentication functions
export const signInWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
) => {
  try {
    console.log("Attempting to sign in user:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in successfully:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

// Check if user is already authenticated
export const getCurrentUser = () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log("Current user found:", currentUser.email);
  } else {
    console.log("No current user found");
  }
  return currentUser;
};

// Check if database is accessible
export const checkDatabaseConnectivity = async (): Promise<boolean> => {
  try {
    console.log("Testing database connectivity...");

    // Try to read from a test document
    const testDocRef = doc(db, "_test_connection", "test");
    await getDoc(testDocRef);

    console.log("Database connectivity test successful");
    return true;
  } catch (error) {
    console.error("Database connectivity test failed:", error);
    return false;
  }
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
    // Check if name is already taken
    const nameTaken = await isNameTaken(userOrPlayerName);
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
      userOrPlayerName,
      username,
      email,
      createdAt: new Date(),
      tournaments: [],
      isAdmin: false, // Default to regular user
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
    console.log("Firebase: Saving tournament data for user:", userId);
    console.log("Firebase: Tournament data:", tournamentData);

    await setDoc(doc(db, "users", userId, "tournament", "current"), {
      ...tournamentData,
      updatedAt: new Date(),
    });

    console.log("Firebase: Successfully saved tournament data");
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
    console.log("Firebase: Saving tournament to global collection");

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

    console.log("Firebase: Successfully saved tournament to global collection");
    return tournamentId;
  } catch (error) {
    console.error("Firebase: Error saving tournament to global:", error);
    throw error;
  }
};

export const getAllTournaments = async () => {
  try {
    console.log("Firebase: Fetching all tournaments");

    const tournamentsRef = collection(db, "tournaments");
    const querySnapshot = await getDocs(tournamentsRef);

    const tournaments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Firebase: Found ${tournaments.length} tournaments`);
    return tournaments;
  } catch (error) {
    console.error("Firebase: Error fetching all tournaments:", error);
    throw error;
  }
};

export const deleteTournament = async (tournamentId: string) => {
  try {
    console.log(`Firebase: Deleting tournament: ${tournamentId}`);

    await deleteDoc(doc(db, "tournaments", tournamentId));

    console.log("Firebase: Successfully deleted tournament");
    return true;
  } catch (error) {
    console.error("Firebase: Error deleting tournament:", error);
    throw error;
  }
};

export const approveTournament = async (tournamentId: string) => {
  try {
    console.log(`Firebase: Approving tournament: ${tournamentId}`);

    await updateDoc(doc(db, "tournaments", tournamentId), {
      adminApproved: true,
      isPublic: true,
      approvedAt: new Date(),
    });

    console.log("Firebase: Successfully approved tournament");
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
    console.log("Firebase: Updating user profile for:", userId);
    console.log("Firebase: Updates:", updates);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    console.log("Firebase: Successfully updated user profile");
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
      console.log(
        `Account created for ${userOrPlayerName} (${email}) with temp password: tempPassword123`
      );

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
    console.log("Firebase: Making user admin:", userId);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date(),
    });

    console.log("Firebase: Successfully made user admin");
    return true;
  } catch (error) {
    console.error("Firebase: Error making user admin:", error);
    throw error;
  }
};

// Function to delete all authentication users
export const deleteAllAuthUsers = async () => {
  try {
    console.log("Firebase: Starting deletion of all authentication users");

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
    console.log("Firebase: Starting complete reset - DELETING ALL DATA");

    // Delete all users from Authentication
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      console.log(`Firebase: Deleting user: ${userDoc.id}`);
      await deleteDoc(userDoc.ref);
    }

    // Delete all tournaments from global collection
    const tournamentsRef = collection(db, "tournaments");
    const tournamentsSnapshot = await getDocs(tournamentsRef);

    for (const tournamentDoc of tournamentsSnapshot.docs) {
      console.log(`Firebase: Deleting tournament: ${tournamentDoc.id}`);
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
        console.log(
          `Firebase: Deleting user tournament: ${userDoc.id}/${tournamentDoc.id}`
        );
        await deleteDoc(tournamentDoc.ref);
      }
    }

    console.log("Firebase: Complete reset successful - ALL DATA DELETED");
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

// Export auth instance for use in context
export { auth, db };
