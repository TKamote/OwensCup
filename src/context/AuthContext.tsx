import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPasswordFirebase,
  createUserWithEmailAndPasswordFirebase,
  signOutFirebase,
  auth,
} from "../services/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "viewer" | "tournamentManager" | "admin" | null; // Add role
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userOrPlayerName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch user profile from Firestore to get the role
          let userProfile: User | null = null;
          try {
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User data from Firestore:", userData);
              userProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName:
                  userData.userOrPlayerName || firebaseUser.displayName,
                role: userData.role || "viewer", // Default to 'viewer' if role is not set
              };
              console.log("User profile set:", userProfile);
            } else {
              // This case is for users that existed before the 'users' collection was standard.
              // We can create a default profile for them.
              console.log("User document not found, creating default profile.");
              const defaultProfile = {
                userOrPlayerName:
                  firebaseUser.displayName ||
                  firebaseUser.email?.split("@")[0] ||
                  "User",
                email: firebaseUser.email,
                createdAt: new Date(),
                tournaments: [],
                isAdmin: false,
                role: "viewer",
              };
              const { setDoc } = await import("firebase/firestore");
              await setDoc(doc(db, "users", firebaseUser.uid), defaultProfile);
              userProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: defaultProfile.userOrPlayerName,
                role: "viewer",
              };
            }
          } catch (error) {
            console.error("Error loading user profile:", error);
            // If fetching fails, create a fallback user object
            userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: "viewer", // Fallback to viewer
            };
          }
          setUser(userProfile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPasswordFirebase(email, password);
      // Don't set loading to false here - let onAuthStateChanged handle it
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userOrPlayerName: string
  ) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPasswordFirebase(
        email,
        password,
        userOrPlayerName
      );
      // Don't set loading to false here - let onAuthStateChanged handle it
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutFirebase();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
