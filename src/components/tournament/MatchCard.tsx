import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  GLASS_SHADOWS,
} from "../../constants/theme";
import { useTournament } from "../../context/TournamentContext";

interface MatchCardProps {
  match: {
    number: number;
    type: string;
    raceTo: number;
    players: string;
  };
  teamScores: number[];
  matchScore: [number, number];
  onScoreChange: (teamIdx: 0 | 1, delta: number) => void;
  isCurrent: boolean;
  isCompleted: boolean;
  onReset?: () => void;
  onAdjust?: () => void;
  readOnly?: boolean;
  matchIndex: number;
  playerDisplay?: string;
  matchType?: string;
  teamStartIndex?: number;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teamScores,
  matchScore,
  onScoreChange,
  isCurrent,
  isCompleted,
  onReset,
  onAdjust,
  readOnly = false,
  matchIndex,
  playerDisplay,
  matchType,
  teamStartIndex = 0,
}) => {
  const { tournamentState } = useTournament();

  // Use the teamStartIndex to determine which teams to show
  let team1, team2;

  if (teamStartIndex === -1) {
    // Special case for Final round - use the actual Final round teams
    const sf1Winner = tournamentState.rounds.semiFinal1.winnerTeamId;
    const sf2Winner = tournamentState.rounds.semiFinal2.winnerTeamId;

    team1 = tournamentState.confirmedTeams.find(
      (team) => team.id === sf1Winner
    );
    team2 = tournamentState.confirmedTeams.find(
      (team) => team.id === sf2Winner
    );
  } else {
    // Normal case - use teamStartIndex
    const mainTeams = tournamentState.confirmedTeams.slice(
      teamStartIndex,
      teamStartIndex + 2
    );
    team1 = mainTeams[0];
    team2 = mainTeams[1];
  }

  // Parse players for each team
  const getTeamPlayers = (team: any) => {
    if (!team || !team.players || !Array.isArray(team.players)) return [];

    return team.players.map((player: any, index: number) => ({
      id: player.id || `player_${index + 1}`,
      name: player.name || "Unknown Player",
      designation: player.designation || `P${index + 1}`,
    }));
  };

  const team1Players = getTeamPlayers(team1);
  const team2Players = getTeamPlayers(team2);

  // Get player names for specific matches
  const getPlayerNamesForMatch = (matchIndex: number, teamIndex: number) => {
    const players = teamIndex === 0 ? team1Players : team2Players;

    switch (matchIndex) {
      case 0: // Match 1: All 5 players - show all player names
        const team1AllPlayers = team1Players
          .map((p: { id: string; name: string; designation: string }) => p.name)
          .join(", ");
        const team2AllPlayers = team2Players
          .map((p: { id: string; name: string; designation: string }) => p.name)
          .join(", ");
        return teamIndex === 0 ? team1AllPlayers : team2AllPlayers;
      case 1: // Match 2: Players 2 & 3 (1st Doubles)
        return `${players[1]?.name || "P2"}, ${players[2]?.name || "P3"}`;
      case 2: // Match 3: Player 1 (1st Singles)
        return players[0]?.name || "P1";
      case 3: // Match 4: Players 4 & 5 (2nd Doubles)
        return `${players[3]?.name || "P4"}, ${players[4]?.name || "P5"}`;
      case 4: // Match 5: Player 2 (2nd Singles)
        return players[1]?.name || "P2";
      case 5: // Match 6: All 5 players (2nd Team Match) - show all player names
        const team1AllPlayers2 = team1Players
          .map((p: { id: string; name: string; designation: string }) => p.name)
          .join(", ");
        const team2AllPlayers2 = team2Players
          .map((p: { id: string; name: string; designation: string }) => p.name)
          .join(", ");
        return teamIndex === 0 ? team1AllPlayers2 : team2AllPlayers2;
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

  const leftPlayerName = getPlayerNamesForMatch(matchIndex, 0);
  const rightPlayerName = getPlayerNamesForMatch(matchIndex, 1);

  // Always use team icons for consistency
  const getIconForMatch = (teamIndex: number) => {
    const team = teamIndex === 0 ? team1 : team2;
    return (team?.icon as any) || "account";
  };

  return (
    <View
      style={[
        styles.card,
        isCurrent && styles.current,
        isCompleted && styles.completed,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>
          Match {match.number}: {matchType || match.type}
        </Text>
        {!readOnly && (
          <View style={styles.actionButtons}>
            {onAdjust && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  onAdjust();
                }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
            {onReset && (
              <TouchableOpacity style={styles.actionButton} onPress={onReset}>
                <MaterialCommunityIcons
                  name="reload"
                  size={16}
                  color={COLORS.warning}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.matchInfoRow}>
        <Text style={styles.subtitle}>Race to {match.raceTo}</Text>
        {isCompleted && <Text style={styles.completedText}>Completed</Text>}
      </View>

      <View style={styles.scoreRow}>
        {!readOnly ? (
          <>
            {/* Left Team/Player */}
            <TouchableOpacity
              onPress={() => {
                onScoreChange(0, 1);
              }}
              style={[styles.scoreBtn, styles.scoreBtnActive]}
              disabled={isCompleted}
              activeOpacity={0.7}
            >
              <View style={styles.teamInfo}>
                <MaterialCommunityIcons
                  name={getIconForMatch(0)}
                  size={24}
                  color={team1?.color || COLORS.primary}
                />
                <Text style={styles.playerName}>{leftPlayerName}</Text>
              </View>
              <Text style={styles.score}>{matchScore[0]}</Text>
            </TouchableOpacity>

            {/* Right Team/Player */}
            <TouchableOpacity
              onPress={() => {
                onScoreChange(1, 1);
              }}
              style={[styles.scoreBtn, styles.scoreBtnActive]}
              disabled={isCompleted}
              activeOpacity={0.7}
            >
              <View style={styles.teamInfo}>
                <MaterialCommunityIcons
                  name={getIconForMatch(1)}
                  size={24}
                  color={team2?.color || COLORS.primary}
                />
                <Text style={styles.playerName}>{rightPlayerName}</Text>
              </View>
              <Text style={styles.score}>{matchScore[1]}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Read-only view */}
            <View style={styles.scoreBtn}>
              <View style={styles.teamInfo}>
                <MaterialCommunityIcons
                  name={getIconForMatch(0)}
                  size={24}
                  color={team1?.color || COLORS.primary}
                />
                <Text style={styles.playerName}>{leftPlayerName}</Text>
              </View>
              <Text style={styles.score}>{matchScore[0]}</Text>
            </View>
            <View style={styles.scoreBtn}>
              <View style={styles.teamInfo}>
                <MaterialCommunityIcons
                  name={getIconForMatch(1)}
                  size={24}
                  color={team2?.color || COLORS.primary}
                />
                <Text style={styles.playerName}>{rightPlayerName}</Text>
              </View>
              <Text style={styles.score}>{matchScore[1]}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    margin: SPACING.sm,
    ...GLASS_SHADOWS.heavy,
    borderWidth: 1.5,
    borderColor: COLORS.gray[400],
  },
  current: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  completed: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  subtitle: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  matchInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  actionButtons: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glass.secondary,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...GLASS_SHADOWS.light,
  },
  scoreRow: {
    flexDirection: "row",
    marginTop: SPACING.sm,
  },
  scoreBtn: {
    flex: 1,
    backgroundColor: COLORS.glass.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    ...GLASS_SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  scoreBtnActive: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  teamInfo: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  playerName: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    textAlign: "center",
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    maxWidth: "100%",
  },
  score: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  completedText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.success,
    textAlign: "center",
    marginTop: SPACING.sm,
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default MatchCard;
