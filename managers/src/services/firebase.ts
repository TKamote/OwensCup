import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  DocumentData,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  firebaseConfig,
  validateFirebaseConfig,
} from "../config/firebase.config";

// Type for Firebase errors
interface FirebaseError extends Error {
  code?: string;
}

// Validate Firebase configuration on startup
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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

// Types for streaming data (matching mobile app)
export interface WebPlayer {
  id: string;
  name: string;
  captain: boolean;
}

export interface WebTeam {
  id: string;
  name: string;
  manager: string;
  captain: string;
  players: WebPlayer[];
  color: string;
  icon: string;
}

export interface WebMatch {
  matchId: string;
  roundName: string;
  matchNumber: number;
  team1: {
    id: string;
    name: string;
    score: number;
    color: string;
    icon: string;
  };
  team2: {
    id: string;
    name: string;
    score: number;
    color: string;
    icon: string;
  };
  isCompleted: boolean;
  winnerId: string | null;
  raceToScore: number;
  lastUpdated: Date;
}

export interface WebRound {
  roundName: string;
  isCompleted: boolean;
  winnerTeamId: string | null;
  matches: WebMatch[];
  team1Wins: number;
  team2Wins: number;
  winsNeeded: number;
}

export interface WebTournamentData {
  id: string;
  name: string;
  status: "setup" | "live" | "completed";
  currentRound: string;
  teams: WebTeam[];
  rounds: WebRound[];
  streamingMode: "normal" | "streaming" | "manual";
  lastWebUpdate: Date | null;
  pushedAt: Date | null;
  pushedBy: string;
}

// Types for the new Stream Control document
export interface StreamControlData {
  streamMatches: string[];
  hiddenSections: string[];
}

// Helper function to safely convert Firestore values to Date
const toSafeDate = (value: unknown): Date => {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as FirestoreTimestamp).toDate();
  }
  const d = new Date(value as string | number | Date);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

// Type for the nested rounds object
type RoundsData =
  | {
      [key: string]: Partial<WebRound>;
    }
  | WebRound[];

// Listen to streaming data in real-time
export const listenToStreamingData = (
  callback: (data: WebTournamentData | null) => void
) => {
  console.log(
    "🔍 For Managers listening to: streaming/vlquyxzadsmig74bl9j0fuyz2id3"
  );
  const streamingRef = doc(db, "streaming", "vlquyxzadsmig74bl9j0fuyz2id3");

  return onSnapshot(
    streamingRef,
    (doc) => {
      console.log(
        "🔍 Firebase snapshot received:",
        doc.exists() ? "Document exists" : "Document does not exist"
      );
      if (doc.exists()) {
        const raw = doc.data() as FirestoreDocumentData;

        // Handle mobile app's data structure
        const overview = (raw.overview || {}) as DocumentData;
        const roundsData: RoundsData = (raw.rounds || {}) as RoundsData;

        // Debug: Log the raw data structure
        console.log("🔍 Raw Firebase data:", raw);
        console.log("🔍 Overview data:", overview);
        console.log("🔍 Raw teams:", raw.teams);
        console.log("🔍 Overview teams:", overview.teams);
        console.log("🔍 Rounds data:", roundsData);
        console.log("🔍 Champion data:", raw.champion);

        // Check for other possible team data locations
        console.log("🔍 All raw data keys:", Object.keys(raw));
        console.log("🔍 All overview keys:", Object.keys(overview));

        // Look for teams in other possible locations
        if (raw.teamsData) console.log("🔍 teamsData:", raw.teamsData);
        if (raw.teamList) console.log("🔍 teamList:", raw.teamList);
        if (raw.participants) console.log("🔍 participants:", raw.participants);
        if (overview.teamsData)
          console.log("🔍 overview.teamsData:", overview.teamsData);
        if (overview.teamList)
          console.log("🔍 overview.teamList:", overview.teamList);
        if (overview.participants)
          console.log("🔍 overview.participants:", overview.participants);

        // Debug: Log detailed rounds structure
        Object.entries(roundsData).forEach(([roundKey, roundData]) => {
          console.log(`🔍 Round ${roundKey}:`, roundData);
          if (
            roundData &&
            typeof roundData === "object" &&
            roundData !== null &&
            "matches" in roundData &&
            Array.isArray(roundData.matches)
          ) {
            const round = roundData as { matches: WebMatch[] };
            round.matches.forEach((match: WebMatch, matchIndex: number) => {
              console.log(`🔍 Match ${matchIndex} in ${roundKey}:`, match);
              if (match && typeof match === "object" && match !== null) {
                const matchObj = match as {
                  team1?: unknown;
                  team2?: unknown;
                };
                if (matchObj.team1)
                  console.log(`🔍 Team1 details:`, matchObj.team1);
                if (matchObj.team2)
                  console.log(`🔍 Team2 details:`, matchObj.team2);
              }
            });
          }
        });

        // Extract teams from rounds data if teams array is empty
        let teams: WebTeam[] = [];

        console.log("🔍 Raw teams array:", raw.teams);
        console.log("🔍 Overview teams array:", overview.teams);

        if (Array.isArray(raw.teams) && raw.teams.length > 0) {
          console.log("🔍 Using raw.teams:", raw.teams.length, "teams");
          teams = raw.teams;
        } else if (Array.isArray(overview.teams) && overview.teams.length > 0) {
          console.log(
            "🔍 Using overview.teams:",
            overview.teams.length,
            "teams"
          );
          teams = overview.teams;
        } else {
          console.log("🔍 Extracting teams from rounds data...");
          // Extract teams from rounds data
          const teamMap = new Map<string, WebTeam>();

          Object.values(roundsData).forEach(
            (round: Partial<WebRound>, roundIndex: number) => {
              console.log(`🔍 Processing round ${roundIndex}:`, round);
              if (round && round.matches && Array.isArray(round.matches)) {
                // Check for team1 and team2 in matches
                const roundData = round as { matches: WebMatch[] };
                if (roundData.matches && Array.isArray(roundData.matches)) {
                  roundData.matches.forEach((match: WebMatch) => {
                    if (
                      match &&
                      typeof match === "object" &&
                      match !== null &&
                      "team1" in match &&
                      "team2" in match
                    ) {
                      const matchData = match as {
                        team1?: {
                          id?: string;
                          name?: string;
                          playerNames?: string;
                        };
                        team2?: {
                          id?: string;
                          name?: string;
                          playerNames?: string;
                        };
                      };
                      if (
                        matchData.team1 &&
                        matchData.team1.id &&
                        matchData.team1?.name &&
                        matchData.team1.name !== "Unknown Team" &&
                        matchData.team1.name.trim().length > 0
                      ) {
                        console.log(
                          `🔍 Found team1: ${
                            matchData.team1?.name || "Unknown"
                          } (${matchData.team1.id})`
                        );
                        if (!teamMap.has(matchData.team1.id)) {
                          // Parse playerNames string into individual players
                          const players: WebPlayer[] = [];
                          if (
                            matchData.team1.playerNames &&
                            typeof matchData.team1.playerNames === "string"
                          ) {
                            console.log(
                              `🔍 Team1 ${
                                matchData.team1?.name || "Unknown"
                              } playerNames string:`,
                              matchData.team1.playerNames
                            );
                            const rawPlayerNames =
                              matchData.team1.playerNames.split(",");
                            console.log(
                              `🔍 Team1 ${
                                matchData.team1?.name || "Unknown"
                              } raw split:`,
                              rawPlayerNames
                            );
                            const trimmedPlayerNames = rawPlayerNames.map(
                              (name: string) => name.trim()
                            );
                            console.log(
                              `🔍 Team1 ${
                                matchData.team1?.name || "Unknown"
                              } after trim:`,
                              trimmedPlayerNames
                            );
                            const playerNames = trimmedPlayerNames.filter(
                              (name: string) => {
                                const isValid =
                                  name && name.length > 0 && name !== "Player";
                                console.log(
                                  `🔍 Team1 ${
                                    matchData.team1?.name || "Unknown"
                                  } filtering "${name}": ${isValid}`
                                );
                                return isValid;
                              }
                            );
                            console.log(
                              `🔍 Team1 ${
                                matchData.team1?.name || "Unknown"
                              } parsed player names:`,
                              playerNames
                            );
                            playerNames.forEach(
                              (playerName: string, index: number) => {
                                players.push({
                                  id: `${matchData.team1!.id}_player_${index}`,
                                  name: playerName,
                                  captain: false, // All players are regular players for ranking
                                });
                              }
                            );
                          }

                          console.log(
                            `🔍 Creating team1: ${
                              matchData.team1?.name || "Unknown"
                            } with ${players.length} players`
                          );
                          teamMap.set(matchData.team1.id, {
                            id: matchData.team1.id,
                            name: matchData.team1?.name || "Unknown",
                            manager: "",
                            captain: "",
                            players: players,
                            color: "",
                            icon: "",
                          });
                        }
                      }
                      if (
                        matchData.team2 &&
                        matchData.team2.id &&
                        matchData.team2?.name &&
                        matchData.team2.name !== "Unknown Team" &&
                        matchData.team2.name.trim().length > 0
                      ) {
                        console.log(
                          `🔍 Found team2: ${
                            matchData.team2?.name || "Unknown"
                          } (${matchData.team2.id})`
                        );
                        if (!teamMap.has(matchData.team2.id)) {
                          // Parse playerNames string into individual players
                          const players: WebPlayer[] = [];
                          if (
                            matchData.team2.playerNames &&
                            typeof matchData.team2.playerNames === "string"
                          ) {
                            console.log(
                              `🔍 Team2 ${
                                matchData.team2?.name || "Unknown"
                              } playerNames string:`,
                              matchData.team2.playerNames
                            );
                            const rawPlayerNames =
                              matchData.team2.playerNames.split(",");
                            console.log(
                              `🔍 Team2 ${
                                matchData.team2?.name || "Unknown"
                              } raw split:`,
                              rawPlayerNames
                            );
                            const trimmedPlayerNames = rawPlayerNames.map(
                              (name: string) => name.trim()
                            );
                            console.log(
                              `🔍 Team2 ${
                                matchData.team2?.name || "Unknown"
                              } after trim:`,
                              trimmedPlayerNames
                            );
                            const playerNames = trimmedPlayerNames.filter(
                              (name: string) => {
                                const isValid =
                                  name && name.length > 0 && name !== "Player";
                                console.log(
                                  `🔍 Team2 ${
                                    matchData.team2?.name || "Unknown"
                                  } filtering "${name}": ${isValid}`
                                );
                                return isValid;
                              }
                            );
                            console.log(
                              `🔍 Team2 ${
                                matchData.team2?.name || "Unknown"
                              } parsed player names:`,
                              playerNames
                            );
                            playerNames.forEach(
                              (playerName: string, index: number) => {
                                players.push({
                                  id: `${matchData.team2!.id}_player_${index}`,
                                  name: playerName,
                                  captain: false, // All players are regular players for ranking
                                });
                              }
                            );
                          }

                          console.log(
                            `🔍 Creating team2: ${
                              matchData.team2?.name || "Unknown"
                            } with ${players.length} players`
                          );
                          teamMap.set(matchData.team2.id, {
                            id: matchData.team2.id,
                            name: matchData.team2?.name || "Unknown",
                            manager: "",
                            captain: "",
                            players: players,
                            color: "",
                            icon: "",
                          });
                        }
                      }
                    }
                  });
                }
              }
            }
          );

          teams = Array.from(teamMap.values());
        }

        // Debug: Log team and player counts
        console.log("🔍 Total teams extracted:", teams.length);
        teams.forEach((team, index) => {
          console.log(
            `🔍 Team ${index + 1} (${team.name}): ${
              team.players?.length || 0
            } players`
          );
          if (team.players) {
            team.players.forEach((player, playerIndex) => {
              console.log(`  Player ${playerIndex + 1}: ${player.name}`);
            });
          }
        });

        const data: WebTournamentData = {
          id: raw.id || overview.tournamentId || "current",
          name: overview.tournamentName || raw.name || "Tournament",
          status:
            overview.status ||
            (raw.status as "setup" | "live" | "completed") ||
            "setup",
          currentRound: overview.currentRound || raw.currentRound || "",
          teams: teams,
          rounds: (Array.isArray(roundsData)
            ? roundsData
            : Object.entries(roundsData)
                .filter(([, round]) => round && typeof round === "object")
                .sort(([keyA], [keyB]) => {
                  // Sort rounds in a consistent order: semiFinal1, semiFinal2, final
                  const order: { [key: string]: number } = {
                    semiFinal1: 1,
                    semiFinal2: 2,
                    final: 3,
                  };
                  return (order[keyA] || 999) - (order[keyB] || 999);
                })
                .map(([, round]) => round)
          ).map((round) => ({
            ...(round as WebRound),
            team1Wins: (round as WebRound).team1Wins || 0,
            team2Wins: (round as WebRound).team2Wins || 0,
            winsNeeded: (round as WebRound).winsNeeded || 5,
          })) as WebRound[],
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
      const streamingRef = doc(db, "streaming", "vlquyxzadsmig74bl9j0fuyz2id3");
      const docSnap = await getDoc(streamingRef);

      if (docSnap.exists()) {
        const raw = docSnap.data() as FirestoreDocumentData;

        // Handle mobile app's data structure
        const overview = (raw.overview || {}) as DocumentData;
        const roundsData: RoundsData = (raw.rounds || {}) as RoundsData;

        const data: WebTournamentData = {
          id: raw.id || overview.tournamentId || "current",
          name: overview.tournamentName || raw.name || "Tournament",
          status:
            overview.status ||
            (raw.status as "setup" | "live" | "completed") ||
            "setup",
          currentRound: overview.currentRound || raw.currentRound || "",
          teams: Array.isArray(raw.teams) ? raw.teams : [],
          rounds: (Array.isArray(roundsData)
            ? roundsData
            : Object.entries(roundsData)
                .filter(([, round]) => round && typeof round === "object")
                .sort(([keyA], [keyB]) => {
                  // Sort rounds in a consistent order: semiFinal1, semiFinal2, final
                  const order: { [key: string]: number } = {
                    semiFinal1: 1,
                    semiFinal2: 2,
                    final: 3,
                  };
                  return (order[keyA] || 999) - (order[keyB] || 999);
                })
                .map(([, round]) => round)
          ).map((round) => ({
            ...(round as WebRound),
            team1Wins: (round as WebRound).team1Wins || 0,
            team2Wins: (round as WebRound).team2Wins || 0,
            winsNeeded: (round as WebRound).winsNeeded || 5,
          })) as WebRound[],
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
      console.error("Error getting current streaming data:", error);
      return null;
    }
  };

// Listen to the stream control document in real-time
export const listenToStreamControl = (
  callback: (data: StreamControlData) => void
) => {
  const streamControlRef = doc(db, "streaming", "current_stream_control");
  console.log("FIREBASE: Listening to stream control document...");

  return onSnapshot(
    streamControlRef,
    (doc) => {
      if (doc.exists()) {
        console.log("FIREBASE: Stream control data received:", doc.data());
        callback(doc.data() as StreamControlData);
      } else {
        console.log(
          "FIREBASE: Stream control document does not exist, providing default."
        );
        // If the document doesn't exist, provide a default state
        callback({ streamMatches: [], hiddenSections: [] });
      }
    },
    (error) => {
      console.error("FIREBASE: Error listening to stream control:", error);
      // Provide a default state on error as well
      callback({ streamMatches: [], hiddenSections: [] });
    }
  );
};

// Update the stream control document
export const updateStreamControl = async (data: Partial<StreamControlData>) => {
  try {
    const streamControlRef = doc(db, "streaming", "current_stream_control");
    console.log("FIREBASE: Updating stream control with data:", data);
    // Use setDoc with merge: true to create the doc if it doesn't exist or update it if it does
    await setDoc(streamControlRef, data, { merge: true });
    console.log("FIREBASE: Stream control update successful.");
  } catch (error) {
    console.error("FIREBASE: Error updating stream control:", error);
  }
};

// Explore existing Firebase data
export const exploreFirebaseData = async () => {
  try {
    console.log("🔍 Exploring Firebase data...");
    console.log("⚠️ Note: Some collections may require authentication");

    // Try to check streaming collection first (most likely to be accessible)
    try {
      const streamingRef = doc(db, "streaming", "vlquyxzadsmig74bl9j0fuyz2id3");
      const streamingDoc = await getDoc(streamingRef);
      if (streamingDoc.exists()) {
        console.log("✅ 📡 Streaming data found:", streamingDoc.data());
      } else {
        console.log("📡 No streaming data found (collection exists but empty)");
      }
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
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
      const firebaseError = error as FirebaseError;
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
        const firebaseError = error as FirebaseError;
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

// ===== AUTHENTICATION FUNCTIONS =====

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const validatePassword = (password: string): boolean => {
  // Strong password: min 8 chars, uppercase, lowercase, number, special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Create user with email verification
export const createUserWithEmailVerification = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    // Validate inputs
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!validatePassword(password)) {
      throw new Error(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
    }
    if (!displayName || displayName.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Send email verification
    await sendEmailVerification(userCredential.user);

    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName: displayName.trim(),
      email,
      emailVerified: false,
      createdAt: new Date(),
      isAdmin: false,
    });

    return {
      user: userCredential.user,
      needsVerification: true,
      message:
        "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    throw new Error(message);
  }
};

// Sign in user
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error(
        "Please verify your email before signing in. Check your inbox for the verification link."
      );
    }

    return userCredential.user;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign in";
    throw new Error(message);
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign out";
    throw new Error(message);
  }
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in");
    }

    await sendEmailVerification(user);
    return "Verification email sent! Please check your inbox.";
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send verification email";
    throw new Error(message);
  }
};

// Delete user account
export const deleteUserAccount = async (password: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user logged in");
    }

    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete user data from Firestore
    await deleteDoc(doc(db, "users", user.uid));

    // Delete user account
    await deleteUser(user);

    return "Account deleted successfully";
  } catch (error) {
    const firebaseError = error as FirebaseError;
    const message = firebaseError.message || "Failed to delete account";
    throw new Error(message);
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  return !!auth.currentUser;
};

// Check if user email is verified
export const isEmailVerified = () => {
  return auth.currentUser?.emailVerified || false;
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent! Please check your inbox and follow the instructions.";
  } catch (error) {
    const firebaseError = error as FirebaseError;
    // Handle specific Firebase errors
    if (firebaseError.code === "auth/user-not-found") {
      throw new Error("No account found with this email address");
    } else if (firebaseError.code === "auth/invalid-email") {
      throw new Error("Invalid email address");
    } else if (firebaseError.code === "auth/too-many-requests") {
      throw new Error(
        "Too many password reset attempts. Please try again later."
      );
    }
    throw new Error(
      firebaseError.message || "Failed to send password reset email"
    );
  }
};

// Update password (for logged-in users)
export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user logged in");
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new Error(
        "New password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return "Password updated successfully";
  } catch (error) {
    const firebaseError = error as FirebaseError;
    if (firebaseError.code === "auth/wrong-password") {
      throw new Error("Current password is incorrect");
    } else if (firebaseError.code === "auth/weak-password") {
      throw new Error("New password is too weak");
    }
    throw new Error(firebaseError.message || "Failed to update password");
  }
};

export { db, auth };
