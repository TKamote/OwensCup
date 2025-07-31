import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useTournament } from "../../context/TournamentContext";
import { teams as teamData } from "../../utils/tournamentData";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const LiveTournamentScreen: React.FC = () => {
  const { tournamentState } = useTournament();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tournament</Text>
        <Text style={styles.subtitle}>PBS Cup August 2025</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.semiFinalsSection}>
          <Text style={styles.sectionTitle}>Semi-Finals</Text>

          <View style={styles.matchupContainer}>
            <Text style={styles.matchupTitle}>Semi-Final 1</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{teamData[0].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.semiFinal1.teamScores[0]}
                </Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{teamData[1].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.semiFinal1.teamScores[1]}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.matchupContainer}>
            <Text style={styles.matchupTitle}>Semi-Final 2</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{teamData[2].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.semiFinal2.teamScores[0]}
                </Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{teamData[3].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.semiFinal2.teamScores[1]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.finalSection}>
          <Text style={styles.sectionTitle}>Final</Text>
          <View style={styles.matchupContainer}>
            <Text style={styles.matchupTitle}>Championship</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>Winner SF1</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.final.teamScores[0]}
                </Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>Winner SF2</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.final.teamScores[1]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {tournamentState.tournamentChampion && (
          <View style={styles.championSection}>
            <Text style={styles.championTitle}>🏆 Tournament Champion</Text>
            <Text style={styles.championName}>
              {tournamentState.tournamentChampion}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
  },
  title: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  semiFinalsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  matchupContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  matchupTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  teamName: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  teamScore: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
  vs: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.md,
  },
  finalSection: {
    marginBottom: SPACING.xl,
  },
  championSection: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  championTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  championName: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
  },
});

export default LiveTournamentScreen;
