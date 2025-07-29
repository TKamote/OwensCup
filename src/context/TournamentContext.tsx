import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  teams as teamData,
  matches as matchData,
} from "../utils/tournamentData";
import {
  saveTournamentData,
  loadTournamentData,
  updateTournamentScore,
} from "../services/firebase";

interface Team {
  id: number;
  name: string;
  manager: string;
  captain: string;
  players: string;
  color: string;
  icon: string;
}

interface TournamentState {
  teamScores: number[];
  matchScores: [number, number][];
  currentMatch: number;
  champion: string | null;
  modalVisible: boolean;
  tournamentId: string | null;
  confirmedTeams: Team[];
  tournamentName: string;
  organizer: string;
  raceToScore: string;
}

interface ActionHistory {
  type: "score_change" | "match_reset";
  matchIndex: number;
  teamIndex?: number;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

interface TournamentContextType {
  tournamentState: TournamentState;
  updateMatchScore: (matchIndex: number, teamIdx: 0 | 1, delta: number) => void;
  setModalVisible: (visible: boolean) => void;
  loading: boolean;
  saveTournament: () => Promise<void>;
  loadTournament: () => Promise<void>;
  resetMatch: (matchIndex: number) => void;
  resetAllScores: () => void;
  undoLastAction: () => void;
  setConfirmedTeams: (teams: Team[]) => void;
  setTournamentInfo: (
    name: string,
    organizer: string,
    raceToScore: string
  ) => void;
  error: string | null;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
};

interface TournamentProviderProps {
  children: React.ReactNode;
}

export const TournamentProvider: React.FC<TournamentProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState>({
    teamScores: [0, 0, 0, 0], // Initialize with 4 teams
    matchScores: matchData.map(() => [0, 0] as [number, number]),
    currentMatch: 0,
    champion: null,
    modalVisible: false,
    tournamentId: null,
    confirmedTeams: [],
    tournamentName: "",
    organizer: "",
    raceToScore: "5",
  });

  // Initialize tournament data
  useEffect(() => {
    if (user) {
      loadTournament();
    } else {
      setLoading(false);
    }
  }, [user]);

  const addToHistory = (action: Omit<ActionHistory, "timestamp">) => {
    setActionHistory((prev) => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const loadTournament = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null); // Clear error before loading
      const savedData = await loadTournamentData(user.uid);

      if (savedData && savedData.length > 0) {
        const latestTournament = savedData[savedData.length - 1];
        setTournamentState({
          teamScores: latestTournament.teamScores || [0, 0, 0, 0],
          matchScores:
            latestTournament.matchScores ||
            matchData.map(() => [0, 0] as [number, number]),
          currentMatch: latestTournament.currentMatch || 0,
          champion: latestTournament.champion || null,
          modalVisible: false,
          tournamentId: latestTournament.id || null,
          confirmedTeams: latestTournament.confirmedTeams || [],
          tournamentName: latestTournament.tournamentName || "",
          organizer: latestTournament.organizer || "",
          raceToScore: latestTournament.raceToScore || "5",
        });
      } else {
        // No saved data found, use default state (this is normal for new users)
        setTournamentState({
          teamScores: [0, 0, 0, 0], // Initialize with 4 teams
          matchScores: matchData.map(() => [0, 0] as [number, number]),
          currentMatch: 0,
          champion: null,
          modalVisible: false,
          tournamentId: null,
          confirmedTeams: [],
          tournamentName: "",
          organizer: "",
          raceToScore: "5",
        });
      }
      setError(null); // Clear error on success
    } catch (error) {
      setError("Failed to load tournament data.");
      // Error loading tournament data
    } finally {
      setLoading(false);
    }
  };

  const saveTournament = async () => {
    if (!user) return;

    try {
      setError(null); // Clear error before saving
      const tournamentData = {
        teamScores: tournamentState.teamScores,
        matchScores: tournamentState.matchScores,
        currentMatch: tournamentState.currentMatch,
        champion: tournamentState.champion,
        teams: teamData,
        matches: matchData,
        confirmedTeams: tournamentState.confirmedTeams,
        tournamentName: tournamentState.tournamentName,
        organizer: tournamentState.organizer,
        raceToScore: tournamentState.raceToScore,
      };

      await saveTournamentData(user.uid, tournamentData);
      setError(null); // Clear error on success
    } catch (error) {
      setError("Failed to save tournament data.");
      // Error saving tournament data
    }
  };

  const updateMatchScore = (
    matchIndex: number,
    teamIdx: 0 | 1,
    delta: number
  ) => {
    setTournamentState((prevState) => {
      const newMatchScores = [...prevState.matchScores] as [number, number][];
      const currentMatchScore = [...newMatchScores[matchIndex]] as [
        number,
        number
      ];
      const oldScore = currentMatchScore[teamIdx];

      // Update match score
      currentMatchScore[teamIdx] = Math.max(
        0,
        currentMatchScore[teamIdx] + delta
      );
      newMatchScores[matchIndex] = currentMatchScore;

      // Add to history
      addToHistory({
        type: "score_change",
        matchIndex,
        teamIndex: teamIdx,
        oldValue: oldScore,
        newValue: currentMatchScore[teamIdx],
      });

      // Recalculate ALL team scores based on completed matches
      const newTeamScores = [0, 0];
      newMatchScores.forEach((matchScore, index) => {
        const match = matchData[index];
        const isCompleted =
          matchScore[0] === match.raceTo || matchScore[1] === match.raceTo;

        if (isCompleted) {
          const winner = matchScore[0] === match.raceTo ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      // Score recalculation completed

      // Check for champion
      if (newTeamScores[0] === 5) {
        const champion = teamData[0].name;
        return {
          ...prevState,
          teamScores: newTeamScores,
          matchScores: newMatchScores,
          champion,
          modalVisible: true,
        };
      } else if (newTeamScores[1] === 5) {
        const champion = teamData[1].name;
        return {
          ...prevState,
          teamScores: newTeamScores,
          matchScores: newMatchScores,
          champion,
          modalVisible: true,
        };
      }

      // Move to next match if current match is completed
      const currentMatch = matchData[matchIndex];
      const isCurrentMatchCompleted =
        currentMatchScore[0] === currentMatch.raceTo ||
        currentMatchScore[1] === currentMatch.raceTo;

      if (isCurrentMatchCompleted) {
        const nextMatch = Math.min(matchIndex + 1, matchData.length - 1);
        return {
          ...prevState,
          teamScores: newTeamScores,
          matchScores: newMatchScores,
          currentMatch: nextMatch,
        };
      }

      return {
        ...prevState,
        teamScores: newTeamScores,
        matchScores: newMatchScores,
      };
    });
  };

  const resetMatch = (matchIndex: number) => {
    setTournamentState((prevState) => {
      const newMatchScores = [...prevState.matchScores] as [number, number][];
      const oldScores = [...newMatchScores[matchIndex]];

      // Reset match scores
      newMatchScores[matchIndex] = [0, 0] as [number, number];

      // Add to history
      addToHistory({
        type: "match_reset",
        matchIndex,
        oldValue: oldScores,
        newValue: [0, 0],
      });

      // Recalculate team scores based on completed matches
      const newTeamScores = [0, 0];
      newMatchScores.forEach((matchScore, index) => {
        const match = matchData[index];
        const isCompleted =
          matchScore[0] === match.raceTo || matchScore[1] === match.raceTo;

        if (isCompleted) {
          const winner = matchScore[0] === match.raceTo ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      return {
        ...prevState,
        matchScores: newMatchScores,
        teamScores: newTeamScores,
      };
    });
  };

  const resetAllScores = () => {
    setTournamentState((prevState) => {
      // Reset all match scores to [0, 0]
      const newMatchScores = matchData.map(() => [0, 0] as [number, number]);

      // Reset team scores to [0, 0] (will be recalculated by existing logic)
      const newTeamScores = [0, 0];

      // Recalculate team scores based on completed matches (should be all 0s now)
      newMatchScores.forEach((matchScore, index) => {
        const match = matchData[index];
        const isCompleted =
          matchScore[0] === match.raceTo || matchScore[1] === match.raceTo;

        if (isCompleted) {
          const winner = matchScore[0] === match.raceTo ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      return {
        ...prevState,
        matchScores: newMatchScores,
        teamScores: newTeamScores,
        currentMatch: 0, // Reset current match to 0
        // Keep champion state unchanged as requested
      };
    });

    // Clear action history
    setActionHistory([]);
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];

    setTournamentState((prevState) => {
      const newMatchScores = [...prevState.matchScores] as [number, number][];

      if (
        lastAction.type === "score_change" &&
        lastAction.teamIndex !== undefined
      ) {
        newMatchScores[lastAction.matchIndex][lastAction.teamIndex] =
          lastAction.oldValue;
      } else if (lastAction.type === "match_reset") {
        newMatchScores[lastAction.matchIndex] = lastAction.oldValue;
      }

      // Recalculate team scores based on completed matches
      const newTeamScores = [0, 0];
      newMatchScores.forEach((matchScore, index) => {
        const match = matchData[index];
        const isCompleted =
          matchScore[0] === match.raceTo || matchScore[1] === match.raceTo;

        if (isCompleted) {
          const winner = matchScore[0] === match.raceTo ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      return {
        ...prevState,
        matchScores: newMatchScores,
        teamScores: newTeamScores,
      };
    });

    // Remove the last action from history
    setActionHistory((prev) => prev.slice(0, -1));
  };

  const setModalVisible = (visible: boolean) => {
    setTournamentState((prevState) => ({
      ...prevState,
      modalVisible: visible,
    }));
  };

  const setConfirmedTeams = (teams: Team[]) => {
    setTournamentState((prevState) => ({
      ...prevState,
      confirmedTeams: teams,
    }));

    // Real-time sync to Firebase
    if (user) {
      saveTournamentData(user.uid, {
        ...tournamentState,
        confirmedTeams: teams,
      }).catch((error) => {
        console.error("Error syncing teams to Firebase:", error);
        setError("Failed to sync teams to cloud");
      });
    }
  };

  const setTournamentInfo = (
    name: string,
    organizer: string,
    raceToScore: string
  ) => {
    setTournamentState((prevState) => ({
      ...prevState,
      tournamentName: name,
      organizer: organizer,
      raceToScore: raceToScore,
    }));

    // Real-time sync to Firebase
    if (user) {
      saveTournamentData(user.uid, {
        ...tournamentState,
        tournamentName: name,
        organizer: organizer,
        raceToScore: raceToScore,
      }).catch((error) => {
        console.error("Error syncing tournament info to Firebase:", error);
        setError("Failed to sync tournament info to cloud");
      });
    }
  };

  // Auto-save tournament data when it changes
  useEffect(() => {
    if (user && !loading) {
      saveTournament();
    }
  }, [
    tournamentState.teamScores,
    tournamentState.matchScores,
    tournamentState.currentMatch,
    tournamentState.champion,
  ]);

  // Real-time listener for tournament data changes
  useEffect(() => {
    if (!user) return;

    const unsubscribe = loadTournamentData(user.uid, (data) => {
      if (data) {
        setTournamentState((prev) => ({
          ...prev,
          ...data,
        }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  const value = {
    tournamentState,
    updateMatchScore,
    setModalVisible,
    loading,
    saveTournament,
    loadTournament,
    resetMatch,
    resetAllScores,
    undoLastAction,
    setConfirmedTeams,
    setTournamentInfo,
    error,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};
