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
  checkDatabaseConnectivity,
} from "../services/firebase";

// Unique ID generation functions
const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}_${random}`;
};

const generateTeamId = () => `team_${generateUniqueId()}`;
const generatePlayerId = () => `player_${generateUniqueId()}`;
const generateMatchId = (round: string, matchNumber: number) =>
  `match_${round}_${matchNumber}_${generateUniqueId()}`;
const generateTournamentId = () => `tournament_${generateUniqueId()}`;
const generateScoreId = (matchId: string) =>
  `score_${matchId}_${generateUniqueId()}`;
const generateRoundId = (roundName: string) =>
  `round_${roundName}_${generateUniqueId()}`;

// Helper function to create a properly typed match
const createMatch = (
  round: string,
  matchNumber: number,
  matchType: "team" | "doubles" | "singles" = "team"
): Match => ({
  id: generateMatchId(round, matchNumber),
  roundId: generateRoundId(round),
  matchNumber,
  matchType,
  team1Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
  team2Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
  team1Score: 0,
  team2Score: 0,
  winnerId: null,
  isCompleted: false,
  playersPlayed: [],
  createdAt: new Date(),
});

// Player interface with unique ID
interface Player {
  id: string;
  name: string;
  designation: string; // "Captain", "Player", "Manager", etc.
}

// Team interface with unique ID and Player array
interface Team {
  id: string; // Changed from number to string
  name: string;
  manager: string;
  captain: string;
  players: Player[]; // Always Player array now
  color: string;
  icon: string;
}

// Match interface with unique ID and enhanced player tracking
interface Match {
  id: string;
  roundId: string;
  matchNumber: number;
  matchType: "team" | "doubles" | "singles"; // Type of match
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  winnerId: string | null;
  isCompleted: boolean;
  playersPlayed: PlayerParticipation[]; // Enhanced player participation
  createdAt: Date;
}

// Enhanced player participation tracking
interface PlayerParticipation {
  playerId: string;
  playerName: string;
  teamId: string;
  matchId: string;
  matchType: "team" | "doubles" | "singles"; // Type of match this player participated in
  played: boolean;
  points: number;
  position?: string; // "captain", "best_player", "captains_pick", etc.
}

// Round interface
interface Round {
  id: string;
  name: string; // "semiFinal1", "semiFinal2", "final"
  matches: Match[];
  winnerTeamId: string | null;
  isCompleted: boolean;
}

// Score interface
interface Score {
  id: string;
  matchId: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  timestamp: Date;
}

interface MatchupState {
  roundId: string;
  matches: Match[];
  currentMatchIndex: number;
  winnerTeamId: string | null; // Store team ID, not team name
  modalVisible: boolean;
}

interface TournamentData {
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
  createdAt: Date;
  updatedAt: Date;
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
  tournamentFinalized: boolean; // New field to track if tournament is locked
  createdAt: Date;
  updatedAt: Date;
}

interface ActionHistory {
  type: "score_change" | "match_reset" | "player_participation";
  roundName: "semiFinal1" | "semiFinal2" | "final";
  matchId: string;
  teamIndex?: number;
  playerId?: string;
  played?: boolean;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

interface TournamentContextType {
  tournamentState: TournamentState;
  updateMatchScore: (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    teamIdx: 0 | 1,
    delta: number
  ) => void;
  setModalVisible: (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    visible: boolean
  ) => void;
  loading: boolean;
  saveTournament: () => Promise<void>;
  loadTournament: () => Promise<void>;
  resetMatch: (
    roundName: "semiFinal1" | "semiFinal2" | "final",
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
  finalizeTournament: () => void;
  resetTournamentDataContext: () => void;
  updatePlayerParticipation: (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    playerId: string,
    played: boolean
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
    tournamentId: generateTournamentId(),
    tournamentName: "",
    organizer: "",
    raceToScore: "5",
    confirmedTeams: [],
    rounds: {
      semiFinal1: {
        id: generateRoundId("semiFinal1"),
        name: "semiFinal1",
        matches: matchData.map((match, index) =>
          createMatch("semiFinal1", index)
        ),
        winnerTeamId: null,
        isCompleted: false,
      },
      semiFinal2: {
        id: generateRoundId("semiFinal2"),
        name: "semiFinal2",
        matches: matchData.map((match, index) => ({
          id: generateMatchId("semiFinal2", index),
          roundId: generateRoundId("semiFinal2"),
          matchNumber: index,
          matchType: "team", // Default to team match
          team1Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
          team2Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
          team1Score: 0,
          team2Score: 0,
          winnerId: null,
          isCompleted: false,
          playersPlayed: [],
          createdAt: new Date(),
        })),
        winnerTeamId: null,
        isCompleted: false,
      },
      final: {
        id: generateRoundId("final"),
        name: "final",
        matches: matchData.map((match, index) => ({
          id: generateMatchId("final", index),
          roundId: generateRoundId("final"),
          matchNumber: index,
          matchType: "team", // Default to team match
          team1Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
          team2Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
          team1Score: 0,
          team2Score: 0,
          winnerId: null,
          isCompleted: false,
          playersPlayed: [],
          createdAt: new Date(),
        })),
        winnerTeamId: null,
        isCompleted: false,
      },
    },
    tournamentChampionTeamId: null,
    tournamentFinalized: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Initialize tournament data
  useEffect(() => {
    if (user) {
      loadTournament();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Assign team IDs to matches when teams are loaded
  useEffect(() => {
    if (tournamentState.confirmedTeams.length >= 4) {
      setTournamentState((prev) => {
        const updatedRounds = { ...prev.rounds };

        // Assign team IDs to semiFinal1 (teams 0 & 1)
        updatedRounds.semiFinal1.matches = updatedRounds.semiFinal1.matches.map(
          (match: any) => ({
            ...match,
            team1Id: prev.confirmedTeams[0].id,
            team2Id: prev.confirmedTeams[1].id,
          })
        );

        // Assign team IDs to semiFinal2 (teams 2 & 3)
        updatedRounds.semiFinal2.matches = updatedRounds.semiFinal2.matches.map(
          (match: any) => ({
            ...match,
            team1Id: prev.confirmedTeams[2].id,
            team2Id: prev.confirmedTeams[3].id,
          })
        );

        return {
          ...prev,
          rounds: updatedRounds,
        };
      });
    }
  }, [tournamentState.confirmedTeams.length]);

  // Update Final round with winning teams when semi-finals are completed
  useEffect(() => {
    const sf1Winner = tournamentState.rounds.semiFinal1.winnerTeamId;
    const sf2Winner = tournamentState.rounds.semiFinal2.winnerTeamId;

    if (sf1Winner && sf2Winner) {
      setTournamentState((prev) => {
        const updatedRounds = { ...prev.rounds };

        // Update Final round matches with the winning team IDs
        updatedRounds.final.matches = updatedRounds.final.matches.map(
          (match: any) => ({
            ...match,
            team1Id: sf1Winner,
            team2Id: sf2Winner,
          })
        );

        return {
          ...prev,
          rounds: updatedRounds,
        };
      });
    }
  }, [
    tournamentState.rounds.semiFinal1.winnerTeamId,
    tournamentState.rounds.semiFinal2.winnerTeamId,
  ]);

  const addToHistory = (action: Omit<ActionHistory, "timestamp">) => {
    setActionHistory((prev) => [...prev, { ...action, timestamp: Date.now() }]);
  };

  const loadTournament = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First, check if database is accessible
      console.log("Checking database connectivity...");
      const isDatabaseAccessible = await checkDatabaseConnectivity();

      if (!isDatabaseAccessible) {
        console.log("Database not accessible - clearing local data");
        // Reset to default state if database is not accessible
        setTournamentState({
          tournamentId: generateTournamentId(),
          tournamentName: "",
          organizer: "",
          raceToScore: "5",
          confirmedTeams: [],
          rounds: {
            semiFinal1: {
              id: generateRoundId("semiFinal1"),
              name: "semiFinal1",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal1", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            semiFinal2: {
              id: generateRoundId("semiFinal2"),
              name: "semiFinal2",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal2", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            final: {
              id: generateRoundId("final"),
              name: "final",
              matches: matchData.map((match, index) =>
                createMatch("final", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
          },
          tournamentChampionTeamId: null,
          tournamentFinalized: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setActionHistory([]);
        setError("Database connection lost. Local data has been cleared.");
        setLoading(false);
        return;
      }

      const savedData = await loadTournamentData(user.uid);

      if (savedData && Array.isArray(savedData)) {
        // Old array format - skip it and use defaults

        setTournamentState({
          tournamentId: generateTournamentId(),
          tournamentName: "",
          organizer: "",
          raceToScore: "5",
          confirmedTeams: [],
          rounds: {
            semiFinal1: {
              id: generateRoundId("semiFinal1"),
              name: "semiFinal1",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal1", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            semiFinal2: {
              id: generateRoundId("semiFinal2"),
              name: "semiFinal2",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal2", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            final: {
              id: generateRoundId("final"),
              name: "final",
              matches: matchData.map((match, index) =>
                createMatch("final", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
          },
          tournamentChampionTeamId: null,
          tournamentFinalized: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (
        savedData &&
        savedData.confirmedTeams &&
        Array.isArray(savedData.confirmedTeams)
      ) {
        // Handle new flattened format with proper structure validation

        // Validate and ensure all teams have proper structure
        const validatedTeams = savedData.confirmedTeams
          .map((team: any) => {
            if (!team.id || !Array.isArray(team.players)) {
              console.warn(
                "Invalid team structure found, skipping team:",
                team
              );
              return null;
            }

            // Ensure all players have proper structure
            const validatedPlayers = team.players
              .map((player: any) => {
                if (!player.id || !player.name) {
                  console.warn(
                    "Invalid player structure found, skipping player:",
                    player
                  );
                  return null;
                }
                return {
                  id: player.id,
                  name: player.name,
                  designation: player.designation || "Player",
                };
              })
              .filter(Boolean);

            return {
              ...team,
              players: validatedPlayers,
            };
          })
          .filter(Boolean);

        setTournamentState({
          tournamentId: savedData.tournamentId || generateTournamentId(),
          tournamentName: savedData.tournamentName || "",
          organizer: savedData.organizer || "",
          raceToScore: savedData.raceToScore || "5",
          confirmedTeams: validatedTeams,
          rounds: savedData.rounds || {
            semiFinal1: {
              id: generateRoundId("semiFinal1"),
              name: "semiFinal1",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal1", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            semiFinal2: {
              id: generateRoundId("semiFinal2"),
              name: "semiFinal2",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal2", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            final: {
              id: generateRoundId("final"),
              name: "final",
              matches: matchData.map((match, index) =>
                createMatch("final", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
          },
          tournamentChampionTeamId: savedData.tournamentChampionTeamId || null,
          tournamentFinalized: savedData.tournamentFinalized || false,
          createdAt: savedData.createdAt || new Date(),
          updatedAt: savedData.updatedAt || new Date(),
        });
      } else {
        // No saved data, use defaults

        setTournamentState({
          tournamentId: generateTournamentId(),
          tournamentName: "",
          organizer: "",
          raceToScore: "5",
          confirmedTeams: [],
          rounds: {
            semiFinal1: {
              id: generateRoundId("semiFinal1"),
              name: "semiFinal1",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal1", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            semiFinal2: {
              id: generateRoundId("semiFinal2"),
              name: "semiFinal2",
              matches: matchData.map((match, index) =>
                createMatch("semiFinal2", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
            final: {
              id: generateRoundId("final"),
              name: "final",
              matches: matchData.map((match, index) =>
                createMatch("final", index)
              ),
              winnerTeamId: null,
              isCompleted: false,
            },
          },
          tournamentChampionTeamId: null,
          tournamentFinalized: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      setError(null);
    } catch (error) {
      console.error("Failed to load tournament:", error);
      setError(
        `Failed to load tournament data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

      // Check database connectivity before saving
      const isDatabaseAccessible = await checkDatabaseConnectivity();
      if (!isDatabaseAccessible) {
        console.log("Database not accessible - skipping save");
        setError("Cannot save data - database connection lost");
        return;
      }

      // Flatten the data structure to avoid nested arrays
      const tournamentData = {
        tournamentId: tournamentState.tournamentId,
        tournamentName: tournamentState.tournamentName,
        organizer: tournamentState.organizer,
        raceToScore: tournamentState.raceToScore,
        confirmedTeams: tournamentState.confirmedTeams,
        rounds: {
          semiFinal1: {
            id: tournamentState.rounds.semiFinal1.id,
            name: tournamentState.rounds.semiFinal1.name,
            matches: tournamentState.rounds.semiFinal1.matches.map(
              (match, index) => ({
                id: match.id,
                roundId: match.roundId,
                matchNumber: index,
                matchType: match.matchType,
                team1Id: match.team1Id,
                team2Id: match.team2Id,
                team1Score: match.team1Score,
                team2Score: match.team2Score,
                winnerId: match.winnerId,
                isCompleted: match.isCompleted,
                playersPlayed: match.playersPlayed,
                createdAt: match.createdAt,
              })
            ),
            winnerTeamId: tournamentState.rounds.semiFinal1.winnerTeamId,
            isCompleted: tournamentState.rounds.semiFinal1.isCompleted,
          },
          semiFinal2: {
            id: tournamentState.rounds.semiFinal2.id,
            name: tournamentState.rounds.semiFinal2.name,
            matches: tournamentState.rounds.semiFinal2.matches.map(
              (match, index) => ({
                id: match.id,
                roundId: match.roundId,
                matchNumber: index,
                matchType: match.matchType,
                team1Id: match.team1Id,
                team2Id: match.team2Id,
                team1Score: match.team1Score,
                team2Score: match.team2Score,
                winnerId: match.winnerId,
                isCompleted: match.isCompleted,
                playersPlayed: match.playersPlayed,
                createdAt: match.createdAt,
              })
            ),
            winnerTeamId: tournamentState.rounds.semiFinal2.winnerTeamId,
            isCompleted: tournamentState.rounds.semiFinal2.isCompleted,
          },
          final: {
            id: tournamentState.rounds.final.id,
            name: tournamentState.rounds.final.name,
            matches: tournamentState.rounds.final.matches.map(
              (match, index) => ({
                id: match.id,
                roundId: match.roundId,
                matchNumber: index,
                matchType: match.matchType,
                team1Id: match.team1Id,
                team2Id: match.team2Id,
                team1Score: match.team1Score,
                team2Score: match.team2Score,
                winnerId: match.winnerId,
                isCompleted: match.isCompleted,
                playersPlayed: match.playersPlayed,
                createdAt: match.createdAt,
              })
            ),
            winnerTeamId: tournamentState.rounds.final.winnerTeamId,
            isCompleted: tournamentState.rounds.final.isCompleted,
          },
        },
        tournamentChampionTeamId: tournamentState.tournamentChampionTeamId,
        createdAt: tournamentState.createdAt,
        updatedAt: tournamentState.updatedAt,
      };

      console.log(
        "Flattened tournament data:",
        JSON.stringify(tournamentData, null, 2)
      );
      await saveTournamentData(user.uid, tournamentData);

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
    roundName: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    teamIdx: 0 | 1,
    delta: number
  ) => {
    setTournamentState((prevState) => {
      const round = prevState.rounds[roundName];
      const match = round.matches[matchIndex];
      const raceToScore = parseInt(prevState.raceToScore);

      // Don't allow scoring if match is already completed
      if (match.isCompleted) {
        console.log("Match already completed, cannot update score");
        return prevState;
      }

      // Calculate new score
      const newScore = Math.max(
        0,
        match[teamIdx === 0 ? "team1Score" : "team2Score"] + delta
      );

      // Create updated match
      const updatedMatch: Match = {
        ...match,
        [teamIdx === 0 ? "team1Score" : "team2Score"]: newScore,
      };

      // Check if this match is now completed
      const isMatchCompleted =
        updatedMatch.team1Score >= raceToScore ||
        updatedMatch.team2Score >= raceToScore;

      console.log(
        `Match ${matchIndex + 1} - Scores: [${updatedMatch.team1Score}, ${
          updatedMatch.team2Score
        }], Race to: ${raceToScore}, Completed: ${isMatchCompleted}`
      );

      if (isMatchCompleted) {
        // Determine match winner
        const matchWinner = updatedMatch.team1Score >= raceToScore ? 0 : 1;
        updatedMatch.winnerId =
          matchWinner === 0 ? match.team1Id : match.team2Id;
        updatedMatch.isCompleted = true;

        console.log(
          `🎯 Match ${matchIndex + 1} completed! Winner: Team ${
            matchWinner + 1
          } (${updatedMatch.winnerId})`
        );
      } else {
        // If match is no longer completed (e.g., race-to-score was increased), reset completion
        updatedMatch.winnerId = null;
        updatedMatch.isCompleted = false;
      }

      // Update matches array
      const updatedMatches = [...round.matches];
      updatedMatches[matchIndex] = updatedMatch;

      // Calculate round progress
      const completedMatches = updatedMatches.filter((m) => m.isCompleted);
      const team1Wins = completedMatches.filter(
        (m) => m.winnerId === match.team1Id
      ).length;
      const team2Wins = completedMatches.filter(
        (m) => m.winnerId === match.team2Id
      ).length;

      // Check if round is completed (best of 9 matches = 5 wins needed)
      const winsNeeded = Math.ceil(9 / 2); // 5 wins needed
      let roundWinnerId = null;
      let isRoundCompleted = false;

      if (team1Wins >= winsNeeded) {
        roundWinnerId = match.team1Id;
        isRoundCompleted = true;
        console.log(
          `🏆 Round ${roundName} completed! Winner: Team 1 (${roundWinnerId})`
        );
      } else if (team2Wins >= winsNeeded) {
        roundWinnerId = match.team2Id;
        isRoundCompleted = true;
        console.log(
          `🏆 Round ${roundName} completed! Winner: Team 2 (${roundWinnerId})`
        );
      } else {
        // If no team has enough wins, round is not completed
        roundWinnerId = null;
        isRoundCompleted = false;
        console.log(
          `Round ${roundName} - No winner yet. Need ${winsNeeded} wins.`
        );
      }

      // Add to history
      addToHistory({
        type: "score_change",
        roundName,
        matchId: match.id,
        teamIndex: teamIdx,
        oldValue: match[teamIdx === 0 ? "team1Score" : "team2Score"],
        newValue: newScore,
      });

      // Update round state
      const updatedRound: Round = {
        ...round,
        matches: updatedMatches,
        winnerTeamId: roundWinnerId,
        isCompleted: isRoundCompleted,
      };

      // Check if tournament is completed (final round winner)
      let tournamentChampionTeamId = prevState.tournamentChampionTeamId;
      if (roundName === "final" && isRoundCompleted) {
        tournamentChampionTeamId = roundWinnerId;
        console.log(`🏆 TOURNAMENT CHAMPION: ${roundWinnerId}`);
      }

      return {
        ...prevState,
        rounds: {
          ...prevState.rounds,
          [roundName]: updatedRound,
        },
        tournamentChampionTeamId,
      };
    });
  };

  const resetMatch = (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number
  ) => {
    setTournamentState((prevState) => {
      const round = prevState.rounds[roundName];
      const match = round.matches[matchIndex];
      const newMatchScores = [...round.matches] as Match[];
      const oldScores = [match.team1Score, match.team2Score];

      // Reset match scores and completion status
      newMatchScores[matchIndex] = {
        ...match,
        team1Score: 0,
        team2Score: 0,
        winnerId: null,
        isCompleted: false,
      };

      // Add to history
      addToHistory({
        type: "match_reset",
        roundName,
        matchId: match.id,
        oldValue: oldScores,
        newValue: [0, 0],
      });

      // Recalculate team scores based on completed matches
      const newTeamScores: [number, number] = [0, 0];
      newMatchScores.forEach((match) => {
        const isCompleted =
          match.team1Score === parseInt(prevState.raceToScore) ||
          match.team2Score === parseInt(prevState.raceToScore);

        if (isCompleted) {
          const winner =
            match.team1Score === parseInt(prevState.raceToScore) ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      return {
        ...prevState,
        rounds: {
          ...prevState.rounds,
          [roundName]: {
            ...round,
            matches: newMatchScores,
            winnerTeamId: null,
            isCompleted: false,
          },
        },
      };
    });
  };

  const resetAllScores = () => {
    setTournamentState((prevState) => {
      const newSemiFinal1Matches = matchData.map((match, index) =>
        createMatch("semiFinal1", index, "team")
      );
      const newSemiFinal2Matches = matchData.map((match, index) =>
        createMatch("semiFinal2", index, "team")
      );
      const newFinalMatches = matchData.map((match, index) =>
        createMatch("final", index, "team")
      );

      return {
        ...prevState,
        rounds: {
          semiFinal1: {
            ...prevState.rounds.semiFinal1,
            matches: newSemiFinal1Matches,
            winnerTeamId: null,
            isCompleted: false,
          },
          semiFinal2: {
            ...prevState.rounds.semiFinal2,
            matches: newSemiFinal2Matches,
            winnerTeamId: null,
            isCompleted: false,
          },
          final: {
            ...prevState.rounds.final,
            matches: newFinalMatches,
            winnerTeamId: null,
            isCompleted: false,
          },
        },
        tournamentChampionTeamId: null,
      };
    });

    setActionHistory([]);
  };

  const undoLastAction = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];

    setTournamentState((prevState) => {
      const updatedRound = { ...prevState.rounds[lastAction.roundName] };
      const matchIndex = parseInt(lastAction.matchId.split("_")[2] || "0");
      const updatedMatch = { ...updatedRound.matches[matchIndex] };

      if (
        lastAction.type === "score_change" &&
        lastAction.teamIndex !== undefined
      ) {
        updatedMatch[lastAction.teamIndex === 0 ? "team1Score" : "team2Score"] =
          lastAction.oldValue;
      } else if (lastAction.type === "match_reset") {
        updatedMatch.team1Score = lastAction.oldValue[0];
        updatedMatch.team2Score = lastAction.oldValue[1];
      }

      // Update the match in the round
      const newMatches = [...updatedRound.matches];
      newMatches[matchIndex] = updatedMatch;

      // Recalculate team scores based on completed matches
      const newTeamScores: [number, number] = [0, 0];
      newMatches.forEach((match) => {
        const isCompleted =
          match.team1Score === parseInt(prevState.raceToScore) ||
          match.team2Score === parseInt(prevState.raceToScore);

        if (isCompleted) {
          const winner =
            match.team1Score === parseInt(prevState.raceToScore) ? 0 : 1;
          newTeamScores[winner]++;
        }
      });

      return {
        ...prevState,
        rounds: {
          ...prevState.rounds,
          [lastAction.roundName]: {
            ...updatedRound,
            matches: newMatches,
            winnerTeamId: null,
            isCompleted: false,
          },
        },
      };
    });

    setActionHistory((prev) => prev.slice(0, -1));
  };

  const setModalVisible = (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    visible: boolean
  ) => {
    setTournamentState((prevState) => ({
      ...prevState,
      rounds: {
        ...prevState.rounds,
        [roundName]: {
          ...prevState.rounds[roundName],
          modalVisible: visible,
        },
      },
    }));
  };

  const setConfirmedTeams = (teams: Team[]) => {
    // Convert teams to new structure with unique IDs and Player arrays
    const teamsWithUniqueIds = teams.map((team) => {
      // Generate unique team ID if not already present
      const teamId = team.id || generateTeamId();

      // Ensure each player has unique ID
      const playersArray: Player[] = team.players.map((player: Player) => ({
        ...player,
        id: player.id || generatePlayerId(),
      }));

      return {
        ...team,
        id: teamId,
        players: playersArray,
      };
    });

    setTournamentState((prev) => {
      // Update matches with real team IDs
      const updatedRounds = { ...prev.rounds };

      // Assign team IDs to semiFinal1 (teams 0 & 1)
      if (teamsWithUniqueIds.length >= 2) {
        updatedRounds.semiFinal1.matches = updatedRounds.semiFinal1.matches.map(
          (match) => ({
            ...match,
            team1Id: teamsWithUniqueIds[0].id,
            team2Id: teamsWithUniqueIds[1].id,
          })
        );
      }

      // Assign team IDs to semiFinal2 (teams 2 & 3)
      if (teamsWithUniqueIds.length >= 4) {
        updatedRounds.semiFinal2.matches = updatedRounds.semiFinal2.matches.map(
          (match) => ({
            ...match,
            team1Id: teamsWithUniqueIds[2].id,
            team2Id: teamsWithUniqueIds[3].id,
          })
        );
      }

      return {
        ...prev,
        confirmedTeams: teamsWithUniqueIds,
        rounds: updatedRounds,
      };
    });
  };

  const setTournamentInfo = (
    name: string,
    organizer: string,
    raceToScore: string
  ) => {
    setTournamentState((prev) => {
      const newRaceToScore = parseInt(raceToScore);
      const oldRaceToScore = parseInt(prev.raceToScore);

      // If race-to-score changed, we need to re-evaluate all matches
      let updatedRounds = prev.rounds;
      if (newRaceToScore !== oldRaceToScore) {
        console.log(
          `Race-to-score changed from ${oldRaceToScore} to ${newRaceToScore}`
        );

        // Re-evaluate all rounds
        const roundNames: ("semiFinal1" | "semiFinal2" | "final")[] = [
          "semiFinal1",
          "semiFinal2",
          "final",
        ];
        updatedRounds = { ...prev.rounds };

        roundNames.forEach((roundName) => {
          const round = updatedRounds[roundName];
          const updatedMatches = round.matches.map((match) => {
            const isCompleted =
              match.team1Score >= newRaceToScore ||
              match.team2Score >= newRaceToScore;

            if (isCompleted) {
              const matchWinner = match.team1Score >= newRaceToScore ? 0 : 1;
              return {
                ...match,
                winnerId: matchWinner === 0 ? match.team1Id : match.team2Id,
                isCompleted: true,
              };
            } else {
              return {
                ...match,
                winnerId: null,
                isCompleted: false,
              };
            }
          });

          // Recalculate round completion
          const completedMatches = updatedMatches.filter((m) => m.isCompleted);
          const team1Wins = completedMatches.filter(
            (m) => m.winnerId === round.matches[0].team1Id
          ).length;
          const team2Wins = completedMatches.filter(
            (m) => m.winnerId === round.matches[0].team2Id
          ).length;
          const winsNeeded = Math.ceil(9 / 2);

          let roundWinnerId = null;
          let isRoundCompleted = false;

          if (team1Wins >= winsNeeded) {
            roundWinnerId = round.matches[0].team1Id;
            isRoundCompleted = true;
          } else if (team2Wins >= winsNeeded) {
            roundWinnerId = round.matches[0].team2Id;
            isRoundCompleted = true;
          }

          updatedRounds[roundName] = {
            ...round,
            matches: updatedMatches,
            winnerTeamId: roundWinnerId,
            isCompleted: isRoundCompleted,
          };
        });
      }

      return {
        ...prev,
        tournamentName: name,
        organizer: organizer,
        raceToScore: raceToScore,
        rounds: updatedRounds,
        // Generate unique tournament ID if not already present
        tournamentId: prev.tournamentId || generateTournamentId(),
      };
    });
  };

  const finalizeTournament = () => {
    setTournamentState((prev) => ({
      ...prev,
      tournamentFinalized: true,
      updatedAt: new Date(),
    }));
  };

  const resetTournamentDataContext = () => {
    setTournamentState({
      tournamentId: generateTournamentId(),
      tournamentName: "",
      organizer: "",
      raceToScore: "5",
      confirmedTeams: [],
      rounds: {
        semiFinal1: {
          id: generateRoundId("semiFinal1"),
          name: "semiFinal1",
          matches: matchData.map((match, index) => ({
            id: generateMatchId("semiFinal1", index),
            roundId: generateRoundId("semiFinal1"),
            matchNumber: index,
            matchType: "team", // Default to team match
            team1Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
            team2Id: `team_${generateUniqueId()}`, // Placeholder, will be updated
            team1Score: 0,
            team2Score: 0,
            winnerId: null,
            isCompleted: false,
            playersPlayed: [],
            createdAt: new Date(),
          })),
          winnerTeamId: null,
          isCompleted: false,
        },
        semiFinal2: {
          id: generateRoundId("semiFinal2"),
          name: "semiFinal2",
          matches: matchData.map((match, index) =>
            createMatch("semiFinal2", index)
          ),
          winnerTeamId: null,
          isCompleted: false,
        },
        final: {
          id: generateRoundId("final"),
          name: "final",
          matches: matchData.map((match, index) => createMatch("final", index)),
          winnerTeamId: null,
          isCompleted: false,
        },
      },
      tournamentChampionTeamId: null,
      tournamentFinalized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setActionHistory([]);
  };

  // Clear all data when database is deleted
  const clearAllData = () => {
    resetTournamentDataContext();
    setError("All local data has been cleared due to database deletion.");
  };

  const updatePlayerParticipation = (
    roundName: "semiFinal1" | "semiFinal2" | "final",
    matchIndex: number,
    playerId: string,
    played: boolean
  ) => {
    setTournamentState((prevState) => {
      const round = prevState.rounds[roundName];
      const match = round.matches[matchIndex];
      const newMatches = [...round.matches] as Match[];
      const playerParticipation = match.playersPlayed.find(
        (p) => p.playerId === playerId
      );

      if (playerParticipation) {
        // Update existing participation
        newMatches[matchIndex] = {
          ...match,
          playersPlayed: match.playersPlayed.map((p) =>
            p.playerId === playerId ? { ...p, played: played } : p
          ),
        };
      } else {
        // Add new participation
        newMatches[matchIndex] = {
          ...match,
          playersPlayed: [
            ...match.playersPlayed,
            {
              playerId: playerId,
              playerName:
                prevState.confirmedTeams
                  .find((t) => t.players.some((p) => p.id === playerId))
                  ?.players.find((p) => p.id === playerId)?.name ||
                "Unknown Player",
              teamId: match.team1Id, // Assuming player played for team1 for simplicity
              matchId: match.id,
              matchType: match.matchType, // Use the match's type
              played: played,
              points: 0, // Points will be calculated later
            },
          ],
        };
      }

      // Add to history
      addToHistory({
        type: "player_participation",
        roundName,
        matchId: match.id,
        playerId: playerId,
        played: played,
        oldValue: playerParticipation?.played || false,
        newValue: played,
      });

      return {
        ...prevState,
        rounds: {
          ...prevState.rounds,
          [roundName]: {
            ...round,
            matches: newMatches,
          },
        },
      };
    });
  };

  // Auto-save tournament data when it changes
  useEffect(() => {
    if (user && !loading) {
      saveTournament();
    }
  }, [
    tournamentState.tournamentId,
    tournamentState.tournamentName,
    tournamentState.organizer,
    tournamentState.raceToScore,
    tournamentState.confirmedTeams,
    tournamentState.tournamentFinalized,
    tournamentState.rounds.semiFinal1.matches,
    tournamentState.rounds.semiFinal1.winnerTeamId,
    tournamentState.rounds.semiFinal1.isCompleted,
    tournamentState.rounds.semiFinal2.matches,
    tournamentState.rounds.semiFinal2.winnerTeamId,
    tournamentState.rounds.semiFinal2.isCompleted,
    tournamentState.rounds.final.matches,
    tournamentState.rounds.final.winnerTeamId,
    tournamentState.rounds.final.isCompleted,
    tournamentState.tournamentChampionTeamId,
    tournamentState.createdAt,
    tournamentState.updatedAt,
  ]);

  // Periodic database connectivity check
  useEffect(() => {
    if (!user) return;

    const checkConnectivity = async () => {
      const isAccessible = await checkDatabaseConnectivity();
      if (!isAccessible && !error?.includes("Database connection lost")) {
        console.log("Database connectivity check failed - clearing data");
        clearAllData();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    return () => clearInterval(interval);
  }, [user, error]);

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
    finalizeTournament,
    resetTournamentDataContext,
    updatePlayerParticipation,
    error,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export default TournamentProvider;
