import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  GLASS_SHADOWS,
} from "../../constants/theme";
import { useTournament } from "../../context/TournamentContext";

interface TeamHeaderProps {
  teams: { name: string; score: number }[];
  teamObjects?: ({ icon: string; color: string } | null)[];
}

const TeamHeader: React.FC<TeamHeaderProps> = ({ teams, teamObjects }) => {
  const { tournamentState } = useTournament();

  // Use passed team objects if available, otherwise fall back to confirmed teams
  const team1 = teamObjects?.[0] || tournamentState.confirmedTeams[0];
  const team2 = teamObjects?.[1] || tournamentState.confirmedTeams[1];

  // Get actual team names or use placeholders
  const getTeamName = (index: number) => {
    if (index === 0) {
      return teams[0].name || team1?.name || "Team A";
    } else {
      return teams[1].name || team2?.name || "Team B";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.teamBlock}>
        <MaterialCommunityIcons
          name={(team1?.icon as any) || "account"}
          size={32}
          color={team1?.color || COLORS.gray[500]}
          style={styles.logo}
        />
        <Text style={styles.name}>{getTeamName(0)}</Text>
      </View>
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{teams[0].score}</Text>
        <Text style={styles.vs}>-</Text>
        <Text style={styles.score}>{teams[1].score}</Text>
      </View>
      <View style={styles.teamBlock}>
        <MaterialCommunityIcons
          name={(team2?.icon as any) || "account"}
          size={40}
          color={team2?.color || COLORS.gray[500]}
          style={styles.logo}
        />
        <Text style={styles.name}>{getTeamName(1)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.glass.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...GLASS_SHADOWS.medium,
  },
  teamBlock: {
    alignItems: "center",
    flex: 2,
  },
  logo: {
    marginBottom: SPACING.sm,
  },
  name: {
    fontWeight: FONTS.weight.semibold,
    fontSize: FONTS.size.base,
    textAlign: "center",
    color: COLORS.text.primary,
  },
  scoreBlock: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginHorizontal: SPACING.md,
    minWidth: 40,
    textAlign: "center",
  },
  vs: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.sm,
  },
});

export default TeamHeader;
