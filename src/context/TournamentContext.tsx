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

interface TournamentState {
  teamScores: number[];
  matchScores: [number, number][];
  currentMatch: number;
  champion: string | null;
  modalVisible: boolean;
  tournamentId: string | null;
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
  undoLastAction: () => void;
  error: string | null; // Add error to context type
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
    teamScores: [0, 0],
    matchScores: matchData.map(() => [0, 0] as [number, number]),
    currentMatch: 0,
    champion: null,
    modalVisible: false,
    tournamentId: null,
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
          teamScores: latestTournament.teamScores || [0, 0],
          matchScores:
            latestTournament.matchScores ||
            matchData.map(() => [0, 0] as [number, number]),
          currentMatch: latestTournament.currentMatch || 0,
          champion: latestTournament.champion || null,
          modalVisible: false,
          tournamentId: latestTournament.id || null,
        });
      } else {
        // No saved data found, use default state (this is normal for new users)
        setTournamentState({
          teamScores: [0, 0],
          matchScores: matchData.map(() => [0, 0] as [number, number]),
          currentMatch: 0,
          champion: null,
          modalVisible: false,
          tournamentId: null,
        });
      }
      setError(null); // Clear error on success
    } catch (error) {
      setError("Failed to load tournament data.");
      console.error("Error loading tournament data:", error);
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
      };

      await saveTournamentData(user.uid, tournamentData);
      setError(null); // Clear error on success
    } catch (error) {
      setError("Failed to save tournament data.");
      console.error("Error saving tournament data:", error);
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

      // Check if match is completed
      const match = matchData[matchIndex];
      const isCompleted =
        currentMatchScore[0] === match.raceTo ||
        currentMatchScore[1] === match.raceTo;

      // Update team scores if match is completed
      let newTeamScores = [...prevState.teamScores];
      if (isCompleted) {
        const winner = currentMatchScore[0] === match.raceTo ? 0 : 1;
        newTeamScores[winner]++;

        // Check for champion
        if (newTeamScores[winner] === 5) {
          const champion = teamData[winner].name;
          return {
            ...prevState,
            teamScores: newTeamScores,
            matchScores: newMatchScores,
            champion,
            modalVisible: true,
          };
        }

        // Move to next match if not the last one
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

  const value = {
    tournamentState,
    updateMatchScore,
    setModalVisible,
    loading,
    saveTournament,
    loadTournament,
    resetMatch,
    undoLastAction,
    error, // Expose error
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};
