import { db } from "./firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from "firebase/firestore";

// Streaming mode types
export type StreamingMode = "normal" | "streaming" | "manual";

// Type definitions (copied from TournamentContext since they're not exported)
interface Player {
  id: string;
  name: string;
  designation: string;
}

interface Team {
  id: string;
  name: string;
  manager: string;
  captain: string;
  players: Player[];
  color: string;
  icon: string;
}

interface Match {
  id: string;
  roundId: string;
  matchNumber: number;
  matchType: "team" | "doubles" | "singles";
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  winnerId: string | null;
  isCompleted: boolean;
  playersPlayed: any[];
  createdAt: Date;
}

interface Round {
  id: string;
  name: string;
  matches: Match[];
  winnerTeamId: string | null;
  isCompleted: boolean;
}

interface TournamentState {
  tournamentId: string;
  tournamentName: string;
  organizer: string;
  raceToScore: string;
  confirmedTeams: Team[];
  rounds: {
    semiFinal1: Round;
    semiFinal2: Round;
    final: Round;
  };
  tournamentChampionTeamId: string | null;
  tournamentFinalized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Web-optimized data structures
export interface WebTournamentOverview {
  tournamentId: string;
  tournamentName: string;
  organizer: string;
  raceToScore: string;
  status: "setup" | "live" | "completed";
  currentRound: "semiFinal1" | "semiFinal2" | "final" | null;
  totalTeams: number;
  confirmedTeams: number;
  lastUpdated: Date;
}

export interface WebMatchData {
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

export interface WebRoundData {
  roundName: string;
  isCompleted: boolean;
  winnerTeamId: string | null;
  matches: WebMatchData[];
  team1Wins: number;
  team2Wins: number;
  winsNeeded: number;
}

export interface WebTournamentData {
  overview: WebTournamentOverview;
  rounds: {
    semiFinal1: WebRoundData;
    semiFinal2: WebRoundData;
    final: WebRoundData;
  };
  champion: {
    teamId: string | null;
    teamName: string | null;
  };
  streamingMode: StreamingMode;
  lastWebUpdate: Date | null;
}

// Helper function to get team by ID
const getTeamById = (teams: Team[], teamId: string): Team | null => {
  return teams.find((team) => team.id === teamId) || null;
};

// Helper function to get player names for specific matches (copied from MatchCard)
const getPlayerNamesForMatch = (
  matchIndex: number,
  teamIndex: number,
  team: Team
): string => {
  const players = team.players || [];

  switch (matchIndex) {
    case 0: // Match 1: All 5 players - show all player names
      return players.map((p) => p.name).join(", ");
    case 1: // Match 2: Players 2 & 3 (1st Doubles)
      return `${players[1]?.name || "P2"}, ${players[2]?.name || "P3"}`;
    case 2: // Match 3: Player 1 (1st Singles)
      return players[0]?.name || "P1";
    case 3: // Match 4: Players 4 & 5 (2nd Doubles)
      return `${players[3]?.name || "P4"}, ${players[4]?.name || "P5"}`;
    case 4: // Match 5: Player 2 (2nd Singles)
      return players[1]?.name || "P2";
    case 5: // Match 6: All 5 players (2nd Team Match) - show all player names
      return players.map((p) => p.name).join(", ");
    case 6: // Match 7: 3rd Doubles (P1 & P3)
      return `${players[0]?.name || "P1"}, ${players[2]?.name || "P3"}`;
    case 7: // Match 8: Player 3 (3rd Singles) - Captain's pick
      return players[2]?.name || "P3";
    case 8: // Match 9: 4th Singles - Captain's pick
      return players[3]?.name || "P4";
    default:
      return "Players TBD";
  }
};

// Transform tournament state to web-optimized format
export const transformToWebFormat = (
  tournamentState: TournamentState,
  streamingMode: StreamingMode = "normal"
): WebTournamentData => {
  const { confirmedTeams, rounds, raceToScore } = tournamentState;

  // Determine tournament status
  let status: "setup" | "live" | "completed" = "setup";
  let currentRound: "semiFinal1" | "semiFinal2" | "final" | null = null;

  if (confirmedTeams.length >= 4) {
    if (rounds.final.isCompleted) {
      status = "completed";
    } else if (rounds.semiFinal1.isCompleted && rounds.semiFinal2.isCompleted) {
      status = "live";
      currentRound = "final";
    } else if (rounds.semiFinal1.isCompleted || rounds.semiFinal2.isCompleted) {
      status = "live";
      currentRound = rounds.semiFinal1.isCompleted
        ? "semiFinal2"
        : "semiFinal1";
    } else {
      status = "live";
      currentRound = "semiFinal1";
    }
  }

  // Transform rounds data
  const transformRound = (round: Round, roundName: string): WebRoundData => {
    const team1 = getTeamById(confirmedTeams, round.matches[0]?.team1Id || "");
    const team2 = getTeamById(confirmedTeams, round.matches[0]?.team2Id || "");

    const completedMatches = round.matches.filter(
      (match: Match) => match.isCompleted
    );
    const team1Wins = completedMatches.filter(
      (match: Match) => match.winnerId === round.matches[0]?.team1Id
    ).length;
    const team2Wins = completedMatches.filter(
      (match: Match) => match.winnerId === round.matches[0]?.team2Id
    ).length;
    const winsNeeded = Math.ceil(9 / 2); // 5 wins needed

    return {
      roundName,
      isCompleted: round.isCompleted,
      winnerTeamId: round.winnerTeamId,
      matches: round.matches.map((match: Match, matchIndex: number) => {
        const matchTeam1 = getTeamById(confirmedTeams, match.team1Id);
        const matchTeam2 = getTeamById(confirmedTeams, match.team2Id);

        // Get player names for this specific match
        const team1PlayerNames = matchTeam1
          ? getPlayerNamesForMatch(matchIndex, 0, matchTeam1)
          : "Players TBD";
        const team2PlayerNames = matchTeam2
          ? getPlayerNamesForMatch(matchIndex, 1, matchTeam2)
          : "Players TBD";

        return {
          matchId: match.id,
          roundName,
          matchNumber: match.matchNumber,
          team1: {
            id: match.team1Id,
            name: matchTeam1?.name || "Unknown Team",
            score: match.team1Score,
            color: matchTeam1?.color || "#000000",
            icon: matchTeam1?.icon || "🏆",
            playerNames: team1PlayerNames,
          },
          team2: {
            id: match.team2Id,
            name: matchTeam2?.name || "Unknown Team",
            score: match.team2Score,
            color: matchTeam2?.color || "#000000",
            icon: matchTeam2?.icon || "🏆",
            playerNames: team2PlayerNames,
          },
          isCompleted: match.isCompleted,
          winnerId: match.winnerId,
          raceToScore: parseInt(raceToScore),
          lastUpdated: new Date(),
        };
      }),
      team1Wins,
      team2Wins,
      winsNeeded,
    };
  };

  // Get champion team
  const championTeam = getTeamById(
    confirmedTeams,
    tournamentState.tournamentChampionTeamId || ""
  );

  return {
    overview: {
      tournamentId: tournamentState.tournamentId,
      tournamentName: tournamentState.tournamentName,
      organizer: tournamentState.organizer,
      raceToScore,
      status,
      currentRound,
      totalTeams: 4, // Tournament is designed for 4 teams
      confirmedTeams: confirmedTeams.length,
      lastUpdated: new Date(),
    },
    rounds: {
      semiFinal1: transformRound(rounds.semiFinal1, "semiFinal1"),
      semiFinal2: transformRound(rounds.semiFinal2, "semiFinal2"),
      final: transformRound(rounds.final, "final"),
    },
    champion: {
      teamId: tournamentState.tournamentChampionTeamId,
      teamName: championTeam?.name || null,
    },
    streamingMode,
    lastWebUpdate: null, // Will be set when actually pushed to web
  };
};

// Helper function to convert email to safe Firebase document ID
const emailToSafeId = (email: string): string => {
  return email.replace(/[@.]/g, "").toLowerCase();
};

// Helper function to map UID to email for specific users
const getUserEmailFromUid = (uid: string): string => {
  if (uid.includes("support") || uid.includes("tournatracker")) {
    return "support@tournatracker.com";
  } else if (uid.includes("davidonquit") || uid.includes("yahoo")) {
    return "davidonquit@yahoo.com";
  }
  return uid;
};

// Save tournament data to Firebase with streaming optimization
export const saveTournamentToStreaming = async (
  userId: string,
  tournamentState: TournamentState,
  streamingMode: StreamingMode,
  forceUpdate: boolean = false
): Promise<void> => {
  try {
    // Always save to user's tournament data (current behavior)
    const userTournamentRef = doc(db, "users", userId, "tournament", "current");
    await setDoc(userTournamentRef, {
      ...tournamentState,
      updatedAt: new Date(),
    });

    // Only push to streaming collection if in streaming mode or forced
    if (streamingMode === "streaming" || forceUpdate) {
      try {
        const webData = transformToWebFormat(tournamentState, streamingMode);
        webData.lastWebUpdate = new Date();

        const userEmail = getUserEmailFromUid(userId);
        const safeId = emailToSafeId(userEmail);
        console.log(
          "🔍 Mobile app pushing to collection:",
          `streaming/${safeId}`
        );
        console.log(
          "🔍 User ID:",
          userId,
          "→ Email:",
          userEmail,
          "→ Safe ID:",
          safeId
        );
        const streamingRef = doc(db, "streaming", safeId);
        await setDoc(streamingRef, {
          ...webData,
          pushedAt: new Date(),
          pushedBy: userId,
        });
      } catch (error: any) {
        // If streaming collection fails due to permissions, just log it
        console.warn(
          "Streaming collection not accessible (permissions issue):",
          error.message
        );
        // Don't throw the error - let the user data save succeed
      }
    }
  } catch (error) {
    console.error("Error saving tournament to streaming:", error);
    throw error;
  }
};

// Set up real-time listener for streaming data
export const setupStreamingListener = (
  callback: (data: WebTournamentData | null) => void
): Unsubscribe => {
  const streamingRef = doc(db, "streaming", "current_tournament");

  return onSnapshot(
    streamingRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data() as WebTournamentData;
        callback(data);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error in streaming listener:", error);
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
        return docSnap.data() as WebTournamentData;
      }
      return null;
    } catch (error) {
      console.error("Error getting current streaming data:", error);
      return null;
    }
  };

// Clear streaming data (useful for testing or reset)
export const clearStreamingData = async (): Promise<void> => {
  try {
    const streamingRef = doc(db, "streaming", "current_tournament");
    await setDoc(streamingRef, {
      cleared: true,
      clearedAt: new Date(),
    });
  } catch (error) {
    console.error("Error clearing streaming data:", error);
    throw error;
  }
};

// Types are already exported above with the interface declarations
