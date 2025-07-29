import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { useTournament } from "../../context/TournamentContext";
import { teams as teamData } from "../../utils/tournamentData";

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
  matchIndex: number; // Add match index to determine which teams to show
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
}) => {
  const { tournamentState } = useTournament();

  // Determine which teams to show based on match index
  let teamNames: [string, string];
  if (matchIndex === 0) {
    // Match 1: Pinoy Sargo vs WBB
    teamNames = [teamData[0].name, teamData[1].name];
  } else if (matchIndex === 1) {
    // Match 2: Bikol vs Ilongo
    teamNames = [teamData[2].name, teamData[3].name];
  } else {
    // Final Match: Winner Match 1 vs Winner Match 2
    teamNames = ["Winner Match 1", "Winner Match 2"];
  }
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
          Match {match.number}: {match.type}
        </Text>
        {!readOnly && (
          <View style={styles.actionButtons}>
            {onAdjust && (
              <TouchableOpacity style={styles.actionButton} onPress={onAdjust}>
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
                  name="refresh"
                  size={16}
                  color={COLORS.warning}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>Players: {match.players}</Text>
      <Text style={styles.subtitle}>Race to {match.raceTo}</Text>
      <View style={styles.scoreRow}>
        {!readOnly ? (
          <>
            <TouchableOpacity
              onPress={() => onScoreChange(0, 1)}
              disabled={isCompleted}
              style={styles.scoreBtn}
            >
              <Text style={styles.teamName}>{teamNames[0]}</Text>
            </TouchableOpacity>
            <Text style={styles.scoreDisplay}>
              {matchScore[0]} - {matchScore[1]}
            </Text>
            <TouchableOpacity
              onPress={() => onScoreChange(1, 1)}
              disabled={isCompleted}
              style={styles.scoreBtn}
            >
              <Text style={styles.teamName}>{teamNames[1]}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.readOnlyTeam}>
              <Text style={styles.teamName}>{teamNames[0]}</Text>
            </View>
            <Text style={styles.scoreDisplay}>
              {matchScore[0]} - {matchScore[1]}
            </Text>
            <View style={styles.readOnlyTeam}>
              <Text style={styles.teamName}>{teamNames[1]}</Text>
            </View>
          </>
        )}
      </View>
      {isCompleted && <Text style={styles.completedText}>Completed</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  current: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  completed: {
    opacity: 0.6,
  },
  cardHeader: {
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
    padding: SPACING.xs,
  },
  title: {
    fontWeight: FONTS.weight.bold,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.sm,
    marginBottom: SPACING.xs,
    color: COLORS.text.secondary,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  scoreBtn: {
    backgroundColor: COLORS.gray[200],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    alignItems: "center",
  },
  teamName: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  scoreDisplay: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  completedText: {
    color: COLORS.success,
    marginTop: SPACING.sm,
    fontWeight: FONTS.weight.bold,
  },
  readOnlyTeam: {
    backgroundColor: COLORS.gray[100],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 80,
    alignItems: "center",
  },
});

export default MatchCard;
