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

interface MatchupState {
  teamScores: [number, number];
  matchScores: [number, number][];
  currentMatch: number;
  winner: string | null;
  modalVisible: boolean;
}

interface TournamentData {
  semiFinal1?: MatchupState;
  semiFinal2?: MatchupState;
  final?: MatchupState;
  tournamentChampion?: string | null;
  id?: string | null;
  confirmedTeams?: Team[];
  tournamentName?: string;
  organizer?: string;
  raceToScore?: string;
}

interface TournamentState {
  semiFinal1: MatchupState;
  semiFinal2: MatchupState;
  final: MatchupState;
  tournamentChampion: string | null;
  tournamentId: string | null;
  confirmedTeams: Team[];
  tournamentName: string;
  organizer: string;
  raceToScore: string;
}

interface ActionHistory {
  type: "score_change" | "match_reset";
  matchup: "semiFinal1" | "semiFinal2" | "final";
  matchIndex: number;
  teamIndex?: number;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

interface TournamentContextType {
  tournamentState: TournamentState;
  updateMatchScore: (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    teamIdx: 0 | 1,
    delta: number
  ) => void;
  setModalVisible: (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    visible: boolean
  ) => void;
  loading: boolean;
  saveTournament: () => Promise<void>;
  loadTournament: () => Promise<void>;
  resetMatch: (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number
  ) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
  const [tournamentState, setTournamentState] = useState<TournamentState>({
    semiFinal1: {
      teamScores: [0, 0],
      matchScores: matchData.map(() => [0, 0] as [number, number]),
      currentMatch: 0,
      winner: null,
      modalVisible: false,
    },
    semiFinal2: {
      teamScores: [0, 0],
      matchScores: matchData.map(() => [0, 0] as [number, number]),
      currentMatch: 0,
      winner: null,
      modalVisible: false,
    },
    final: {
      teamScores: [0, 0],
      matchScores: matchData.map(() => [0, 0] as [number, number]),
      currentMatch: 0,
      winner: null,
      modalVisible: false,
    },
    tournamentChampion: null,
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
      setError(null);
      const savedData = await loadTournamentData(user.uid);

      if (savedData && Array.isArray(savedData)) {
        // Handle old format (array)
        const latestTournament = savedData[savedData.length - 1];
        setTournamentState({
          semiFinal1: latestTournament.semiFinal1 || {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          semiFinal2: latestTournament.semiFinal2 || {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          final: latestTournament.final || {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          tournamentChampion: latestTournament.tournamentChampion || null,
          tournamentId: latestTournament.id || null,
          confirmedTeams: latestTournament.confirmedTeams || [],
          tournamentName: latestTournament.tournamentName || "",
          organizer: latestTournament.organizer || "",
          raceToScore: latestTournament.raceToScore || "5",
        });
      } else if (savedData) {
        // Handle new flattened format
        const reconstructMatchScores = (flattenedScores: any[]) => {
          const scores: [number, number][] = [];
          flattenedScores.forEach((score) => {
            scores[score.matchIndex] = [score.team0Score, score.team1Score];
          });
          return scores;
        };

        setTournamentState({
          semiFinal1: {
            teamScores: savedData.semiFinal1?.teamScores || [0, 0],
            matchScores: reconstructMatchScores(
              savedData.semiFinal1?.matchScores || []
            ),
            currentMatch: savedData.semiFinal1?.currentMatch || 0,
            winner: savedData.semiFinal1?.winner || null,
            modalVisible: savedData.semiFinal1?.modalVisible || false,
          },
          semiFinal2: {
            teamScores: savedData.semiFinal2?.teamScores || [0, 0],
            matchScores: reconstructMatchScores(
              savedData.semiFinal2?.matchScores || []
            ),
            currentMatch: savedData.semiFinal2?.currentMatch || 0,
            winner: savedData.semiFinal2?.winner || null,
            modalVisible: savedData.semiFinal2?.modalVisible || false,
          },
          final: {
            teamScores: savedData.final?.teamScores || [0, 0],
            matchScores: reconstructMatchScores(
              savedData.final?.matchScores || []
            ),
            currentMatch: savedData.final?.currentMatch || 0,
            winner: savedData.final?.winner || null,
            modalVisible: savedData.final?.modalVisible || false,
          },
          tournamentChampion: savedData.tournamentChampion || null,
          tournamentId: savedData.id || null,
          confirmedTeams: savedData.confirmedTeams || [],
          tournamentName: savedData.tournamentName || "",
          organizer: savedData.organizer || "",
          raceToScore: savedData.raceToScore || "5",
        });
      } else {
        // No saved data, use defaults
        setTournamentState({
          semiFinal1: {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          semiFinal2: {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          final: {
            teamScores: [0, 0],
            matchScores: matchData.map(() => [0, 0] as [number, number]),
            currentMatch: 0,
            winner: null,
            modalVisible: false,
          },
          tournamentChampion: null,
          tournamentId: null,
          confirmedTeams: [],
          tournamentName: "",
          organizer: "",
          raceToScore: "5",
        });
      }
      setError(null);
    } catch (error) {
      setError("Failed to load tournament data.");
    } finally {
      setLoading(false);
    }
  };

  const saveTournament = async () => {
    if (!user) {
      console.log("No user authenticated, skipping save");
      return;
    }

    try {
      setError(null);
      console.log("Saving tournament data for user:", user.uid);

      // Flatten the data structure to avoid nested arrays
      const tournamentData = {
        semiFinal1: {
          teamScores: tournamentState.semiFinal1.teamScores,
          matchScores: tournamentState.semiFinal1.matchScores.map(
            (score, index) => ({
              matchIndex: index,
              team0Score: score[0],
              team1Score: score[1],
            })
          ),
          currentMatch: tournamentState.semiFinal1.currentMatch,
          winner: tournamentState.semiFinal1.winner,
          modalVisible: tournamentState.semiFinal1.modalVisible,
        },
        semiFinal2: {
          teamScores: tournamentState.semiFinal2.teamScores,
          matchScores: tournamentState.semiFinal2.matchScores.map(
            (score, index) => ({
              matchIndex: index,
              team0Score: score[0],
              team1Score: score[1],
            })
          ),
          currentMatch: tournamentState.semiFinal2.currentMatch,
          winner: tournamentState.semiFinal2.winner,
          modalVisible: tournamentState.semiFinal2.modalVisible,
        },
        final: {
          teamScores: tournamentState.final.teamScores,
          matchScores: tournamentState.final.matchScores.map(
            (score, index) => ({
              matchIndex: index,
              team0Score: score[0],
              team1Score: score[1],
            })
          ),
          currentMatch: tournamentState.final.currentMatch,
          winner: tournamentState.final.winner,
          modalVisible: tournamentState.final.modalVisible,
        },
        tournamentChampion: tournamentState.tournamentChampion,
        confirmedTeams: tournamentState.confirmedTeams,
        tournamentName: tournamentState.tournamentName,
        organizer: tournamentState.organizer,
        raceToScore: tournamentState.raceToScore,
      };

      console.log(
        "Flattened tournament data:",
        JSON.stringify(tournamentData, null, 2)
      );
      await saveTournamentData(user.uid, tournamentData);
      console.log("Tournament saved successfully");
      setError(null);
    } catch (error) {
      console.error("Failed to save tournament:", error);
      setError(
        `Failed to save tournament data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const updateMatchScore = (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    teamIdx: 0 | 1,
    delta: number
  ) => {
    setTournamentState((prevState) => {
      const matchupState = prevState[matchup];
      const newMatchScores = [...matchupState.matchScores] as [
        number,
        number
      ][];
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
        matchup,
        matchIndex,
        teamIndex: teamIdx,
        oldValue: oldScore,
        newValue: currentMatchScore[teamIdx],
      });

      // Recalculate team scores based on completed matches
      const newTeamScores: [number, number] = [0, 0];
      newMatchScores.forEach((matchScore, index) => {
        const match = matchData[index];
        const isCompleted =
          matchScore[0] === match.raceTo || matchScore[1] === match.raceTo;

        if (isCompleted) {
          const winner = matchScore[0] === match.raceTo ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      // Check for matchup winner
      if (newTeamScores[0] === 5) {
        const winnerTeam =
          matchup === "semiFinal1"
            ? prevState.confirmedTeams[0]?.name || "Team A"
            : matchup === "semiFinal2"
            ? prevState.confirmedTeams[2]?.name || "Team C"
            : "Winner SF1";
        return {
          ...prevState,
          [matchup]: {
            ...matchupState,
            teamScores: newTeamScores,
            matchScores: newMatchScores,
            winner: winnerTeam,
            modalVisible: true,
          },
        };
      } else if (newTeamScores[1] === 5) {
        const winnerTeam =
          matchup === "semiFinal1"
            ? prevState.confirmedTeams[1]?.name || "Team B"
            : matchup === "semiFinal2"
            ? prevState.confirmedTeams[3]?.name || "Team D"
            : "Winner SF2";
        return {
          ...prevState,
          [matchup]: {
            ...matchupState,
            teamScores: newTeamScores,
            matchScores: newMatchScores,
            winner: winnerTeam,
            modalVisible: true,
          },
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
          [matchup]: {
            ...matchupState,
            teamScores: newTeamScores,
            matchScores: newMatchScores,
            currentMatch: nextMatch,
          },
        };
      }

      return {
        ...prevState,
        [matchup]: {
          ...matchupState,
          teamScores: newTeamScores,
          matchScores: newMatchScores,
        },
      };
    });
  };

  const resetMatch = (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number
  ) => {
    setTournamentState((prevState) => {
      const matchupState = prevState[matchup];
      const newMatchScores = [...matchupState.matchScores] as [
        number,
        number
      ][];
      const oldScores = [...newMatchScores[matchIndex]];

      // Reset match scores
      newMatchScores[matchIndex] = [0, 0] as [number, number];

      // Add to history
      addToHistory({
        type: "match_reset",
        matchup,
        matchIndex,
        oldValue: oldScores,
        newValue: [0, 0],
      });

      // Recalculate team scores based on completed matches
      const newTeamScores: [number, number] = [0, 0];
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
        [matchup]: {
          ...matchupState,
          matchScores: newMatchScores,
          teamScores: newTeamScores,
        },
      };
    });
  };

  const resetAllScores = () => {
    setTournamentState((prevState) => {
      const newSemiFinal1MatchScores = matchData.map(
        () => [0, 0] as [number, number]
      );
      const newSemiFinal2MatchScores = matchData.map(
        () => [0, 0] as [number, number]
      );
      const newFinalMatchScores = matchData.map(
        () => [0, 0] as [number, number]
      );

      return {
        ...prevState,
        semiFinal1: {
          ...prevState.semiFinal1,
          matchScores: newSemiFinal1MatchScores,
          teamScores: [0, 0] as [number, number],
          currentMatch: 0,
          winner: null, // Clear winner
          modalVisible: false, // Clear modal
        },
        semiFinal2: {
          ...prevState.semiFinal2,
          matchScores: newSemiFinal2MatchScores,
          teamScores: [0, 0] as [number, number],
          currentMatch: 0,
          winner: null, // Clear winner
          modalVisible: false, // Clear modal
        },
        final: {
          ...prevState.final,
          matchScores: newFinalMatchScores,
          teamScores: [0, 0] as [number, number],
          currentMatch: 0,
          winner: null, // Clear winner
          modalVisible: false, // Clear modal
        },
        tournamentChampion: null,
      };
    });

    setActionHistory([]);
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];

    setTournamentState((prevState) => {
      const matchupState = prevState[lastAction.matchup];
      const newMatchScores = [...matchupState.matchScores] as [
        number,
        number
      ][];

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
      const newTeamScores: [number, number] = [0, 0];
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
        [lastAction.matchup]: {
          ...matchupState,
          matchScores: newMatchScores,
          teamScores: newTeamScores,
        },
      };
    });

    setActionHistory((prev) => prev.slice(0, -1));
  };

  const setModalVisible = (
    matchup: "semiFinal1" | "semiFinal2" | "final",
    visible: boolean
  ) => {
    setTournamentState((prevState) => ({
      ...prevState,
      [matchup]: {
        ...prevState[matchup],
        modalVisible: visible,
      },
    }));
  };

  const setConfirmedTeams = (teams: Team[]) => {
    console.log("setConfirmedTeams called with:", teams);
    console.log("Current user:", user?.uid);

    setTournamentState((prevState) => {
      const newState = {
        ...prevState,
        confirmedTeams: teams,
      };

      console.log("New state with teams:", newState.confirmedTeams);

      // Save to Firebase with updated state (flattened)
      if (user) {
        const flattenedData = {
          semiFinal1: {
            teamScores: newState.semiFinal1.teamScores,
            matchScores: newState.semiFinal1.matchScores.map(
              (score, index) => ({
                matchIndex: index,
                team0Score: score[0],
                team1Score: score[1],
              })
            ),
            currentMatch: newState.semiFinal1.currentMatch,
            winner: newState.semiFinal1.winner,
            modalVisible: newState.semiFinal1.modalVisible,
          },
          semiFinal2: {
            teamScores: newState.semiFinal2.teamScores,
            matchScores: newState.semiFinal2.matchScores.map(
              (score, index) => ({
                matchIndex: index,
                team0Score: score[0],
                team1Score: score[1],
              })
            ),
            currentMatch: newState.semiFinal2.currentMatch,
            winner: newState.semiFinal2.winner,
            modalVisible: newState.semiFinal2.modalVisible,
          },
          final: {
            teamScores: newState.final.teamScores,
            matchScores: newState.final.matchScores.map((score, index) => ({
              matchIndex: index,
              team0Score: score[0],
              team1Score: score[1],
            })),
            currentMatch: newState.final.currentMatch,
            winner: newState.final.winner,
            modalVisible: newState.final.modalVisible,
          },
          tournamentChampion: newState.tournamentChampion,
          confirmedTeams: newState.confirmedTeams,
          tournamentName: newState.tournamentName,
          organizer: newState.organizer,
          raceToScore: newState.raceToScore,
        };

        console.log("Saving to Firebase:", flattenedData);

        saveTournamentData(user.uid, flattenedData)
          .then(() => {
            console.log("Successfully saved to Firebase");
          })
          .catch((error) => {
            console.error("Error syncing teams to Firebase:", error);
            setError("Failed to sync teams to cloud");
          });
      } else {
        console.log("No user found, cannot save to Firebase");
      }

      return newState;
    });
  };

  const setTournamentInfo = (
    name: string,
    organizer: string,
    raceToScore: string
  ) => {
    setTournamentState((prevState) => {
      const newState = {
        ...prevState,
        tournamentName: name,
        organizer: organizer,
        raceToScore: raceToScore,
      };

      // Save to Firebase with updated state (flattened)
      if (user) {
        const flattenedData = {
          semiFinal1: {
            teamScores: newState.semiFinal1.teamScores,
            matchScores: newState.semiFinal1.matchScores.map(
              (score, index) => ({
                matchIndex: index,
                team0Score: score[0],
                team1Score: score[1],
              })
            ),
            currentMatch: newState.semiFinal1.currentMatch,
            winner: newState.semiFinal1.winner,
            modalVisible: newState.semiFinal1.modalVisible,
          },
          semiFinal2: {
            teamScores: newState.semiFinal2.teamScores,
            matchScores: newState.semiFinal2.matchScores.map(
              (score, index) => ({
                matchIndex: index,
                team0Score: score[0],
                team1Score: score[1],
              })
            ),
            currentMatch: newState.semiFinal2.currentMatch,
            winner: newState.semiFinal2.winner,
            modalVisible: newState.semiFinal2.modalVisible,
          },
          final: {
            teamScores: newState.final.teamScores,
            matchScores: newState.final.matchScores.map((score, index) => ({
              matchIndex: index,
              team0Score: score[0],
              team1Score: score[1],
            })),
            currentMatch: newState.final.currentMatch,
            winner: newState.final.winner,
            modalVisible: newState.final.modalVisible,
          },
          tournamentChampion: newState.tournamentChampion,
          confirmedTeams: newState.confirmedTeams,
          tournamentName: newState.tournamentName,
          organizer: newState.organizer,
          raceToScore: newState.raceToScore,
        };

        saveTournamentData(user.uid, flattenedData).catch((error) => {
          console.error("Error syncing tournament info to Firebase:", error);
          setError("Failed to sync tournament info to cloud");
        });
      }

      return newState;
    });
  };

  // Auto-save tournament data when it changes
  useEffect(() => {
    if (user && !loading) {
      saveTournament();
    }
  }, [
    tournamentState.semiFinal1.teamScores,
    tournamentState.semiFinal1.matchScores,
    tournamentState.semiFinal1.currentMatch,
    tournamentState.semiFinal1.winner,
    tournamentState.semiFinal2.teamScores,
    tournamentState.semiFinal2.matchScores,
    tournamentState.semiFinal2.currentMatch,
    tournamentState.semiFinal2.winner,
    tournamentState.final.teamScores,
    tournamentState.final.matchScores,
    tournamentState.final.currentMatch,
    tournamentState.final.winner,
    tournamentState.tournamentChampion,
    tournamentState.confirmedTeams,
    tournamentState.tournamentName,
    tournamentState.organizer,
    tournamentState.raceToScore,
  ]);

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
