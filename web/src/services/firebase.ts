import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  DocumentData,
} from "firebase/firestore";
// Removed auth imports - using direct access approach

// Firestore document data interface
interface FirestoreDocumentData extends DocumentData {
  id?: string;
  name?: string;
  status?: string;
  currentRound?: string;
  teams?: WebTeam[];
  rounds?: WebRound[];
  streamingMode?: string;
  lastWebUpdate?: FirestoreTimestamp;
  pushedAt?: FirestoreTimestamp;
  pushedBy?: string;
}

// Firestore Timestamp interface
interface FirestoreTimestamp {
  toDate(): Date;
}
import {
  firebaseConfig,
  validateFirebaseConfig,
} from "../config/firebase.config";

// Validate Firebase configuration on startup
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Types for streaming data (matching mobile app)
export interface WebPlayer {
  id: string;
  name: string;
  captain: boolean;
}

export interface WebTeam {
  id: string;
  name: string;
  players: WebPlayer[];
}

export interface WebMatch {
  id: string;
  team1Id?: string;
  team2Id?: string;
  team1?: {
    id: string;
    name: string;
    score: number;
  };
  team2?: {
    id: string;
    name: string;
    score: number;
  };
  team1Score?: number;
  team2Score?: number;
  isCompleted: boolean;
  isLive?: boolean;
}

export interface WebRound {
  id?: string;
  name?: string;
  roundName?: string;
  matches: WebMatch[];
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface WebTournamentData {
  id: string;
  name: string;
  status: "setup" | "live" | "completed";
  currentRound: string;
  teams: WebTeam[];
  rounds: WebRound[];
  streamingMode: "normal" | "streaming" | "manual";
  lastWebUpdate: Date;
  pushedAt: Date;
  pushedBy: string;
}

// Helper: convert Firestore Timestamp | Date | string to Date
const toSafeDate = (
  value: FirestoreTimestamp | Date | string | null | undefined
): Date => {
  if (!value) return new Date(0);
  // Firestore Timestamp has toDate
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value as FirestoreTimestamp).toDate();
  }
  const d = new Date(value as string | number | Date);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

// Listen to streaming data in real-time
export const listenToStreamingData = (
  callback: (data: WebTournamentData | null) => void
) => {
  const streamingRef = doc(db, "streaming", "current_tournament");

  return onSnapshot(
    streamingRef,
    (doc) => {
      if (doc.exists()) {
        const raw = doc.data() as FirestoreDocumentData;

        // Handle mobile app's data structure
        const overview = raw.overview || {};
        const roundsData = raw.rounds || {};

        const data: WebTournamentData = {
          id: raw.id || overview.tournamentId || "current",
          name: overview.tournamentName || raw.name || "Tournament",
          status:
            overview.status ||
            (raw.status as "setup" | "live" | "completed") ||
            "setup",
          currentRound: overview.currentRound || raw.currentRound || "",
          teams: Array.isArray(raw.teams) ? raw.teams : [],
          rounds: Object.entries(roundsData)
            .filter(([, round]) => round && typeof round === "object")
            .sort(([keyA], [keyB]) => {
              // Sort rounds in a consistent order: semiFinal1, semiFinal2, final
              const order = { semiFinal1: 1, semiFinal2: 2, final: 3 };
              return (
                (order[keyA as keyof typeof order] || 999) -
                (order[keyB as keyof typeof order] || 999)
              );
            })
            .map(([, round]) => round) as WebRound[],
          streamingMode:
            (raw.streamingMode as "normal" | "streaming" | "manual") ||
            "normal",
          lastWebUpdate: toSafeDate(raw.lastWebUpdate),
          pushedAt: toSafeDate(raw.pushedAt),
          pushedBy: raw.pushedBy || "",
        };
        callback(data);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to streaming data:", error);
      callback(null);
    }
  );
};

// Get current streaming data (one-time read)
export const getCurrentStreamingData =
  async (): Promise<WebTournamentData | null> => {
    try {
      const streamingRef = doc(db, "streaming", "current_tournament");
      const docSnap = await getDoc(streamingRef);

      if (docSnap.exists()) {
        const raw = docSnap.data() as FirestoreDocumentData;

        // Handle mobile app's data structure
        const overview = raw.overview || {};
        const roundsData = raw.rounds || {};

        const data: WebTournamentData = {
          id: raw.id || overview.tournamentId || "current",
          name: overview.tournamentName || raw.name || "Tournament",
          status:
            overview.status ||
            (raw.status as "setup" | "live" | "completed") ||
            "setup",
          currentRound: overview.currentRound || raw.currentRound || "",
          teams: Array.isArray(raw.teams) ? raw.teams : [],
          rounds: Object.entries(roundsData)
            .filter(([, round]) => round && typeof round === "object")
            .sort(([keyA], [keyB]) => {
              // Sort rounds in a consistent order: semiFinal1, semiFinal2, final
              const order = { semiFinal1: 1, semiFinal2: 2, final: 3 };
              return (
                (order[keyA as keyof typeof order] || 999) -
                (order[keyB as keyof typeof order] || 999)
              );
            })
            .map(([, round]) => round) as WebRound[],
          streamingMode:
            (raw.streamingMode as "normal" | "streaming" | "manual") ||
            "normal",
          lastWebUpdate: toSafeDate(raw.lastWebUpdate),
          pushedAt: toSafeDate(raw.pushedAt),
          pushedBy: raw.pushedBy || "",
        };
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error getting streaming data:", error);
      return null;
    }
  };

// Explore existing Firebase data
export const exploreFirebaseData = async () => {
  try {
    console.log("🔍 Exploring Firebase data...");
    console.log("⚠️ Note: Some collections may require authentication");

    // Try to check streaming collection first (most likely to be accessible)
    try {
      const streamingRef = doc(db, "streaming", "current_tournament");
      const streamingDoc = await getDoc(streamingRef);
      if (streamingDoc.exists()) {
        console.log("✅ 📡 Streaming data found:", streamingDoc.data());
      } else {
        console.log("📡 No streaming data found (collection exists but empty)");
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "permission-denied") {
        console.log(
          "❌ 📡 Streaming collection: Permission denied (needs authentication)"
        );
      } else {
        console.log("❌ 📡 Streaming collection error:", firebaseError.message);
      }
    }

    // Try to check users collection
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      console.log("✅ 👥 Users found:", usersSnapshot.docs.length);
      usersSnapshot.docs.forEach((doc) => {
        console.log(`  - User ${doc.id}:`, doc.data());
      });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "permission-denied") {
        console.log(
          "❌ 👥 Users collection: Permission denied (needs authentication)"
        );
      } else {
        console.log("❌ 👥 Users collection error:", firebaseError.message);
      }
    }

    // Try to check for any other common collections
    const commonCollections = ["tournaments", "matches", "teams", "players"];
    for (const collectionName of commonCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        console.log(
          `✅ 📁 ${collectionName} collection: ${snapshot.docs.length} documents`
        );
        if (snapshot.docs.length > 0) {
          snapshot.docs.slice(0, 2).forEach((doc) => {
            console.log(`  - ${collectionName} ${doc.id}:`, doc.data());
          });
        }
      } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === "permission-denied") {
          console.log(`❌ 📁 ${collectionName} collection: Permission denied`);
        } else {
          console.log(
            `❌ 📁 ${collectionName} collection error:`,
            firebaseError.message
          );
        }
      }
    }

    console.log("🔍 Exploration complete!");
    return true;
  } catch (error) {
    console.error("❌ Error exploring Firebase:", error);
    return false;
  }
};

export { db };
