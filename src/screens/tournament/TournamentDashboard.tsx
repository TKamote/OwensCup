import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTournament } from "../../context/TournamentContext";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const TournamentDashboard = () => {
  const navigation = useNavigation();
  const { tournamentState } = useTournament();

  const handleMatchSelect = (matchNumber: number) => {
    if (matchNumber === 1) {
      navigation.navigate("Match 1" as never);
    } else if (matchNumber === 2) {
      navigation.navigate("Match 2" as never);
    } else if (matchNumber === 3) {
      navigation.navigate("Match 3" as never);
    }
  };

  // Get the first 4 teams (main teams) from confirmed teams
  const mainTeams = tournamentState.confirmedTeams.slice(0, 4);

  console.log(
    "TournamentDashboard - confirmedTeams:",
    tournamentState.confirmedTeams
  );
  console.log("TournamentDashboard - mainTeams:", mainTeams);

  // Determine match status based on tournament state
  const getMatchStatus = (matchNumber: number) => {
    if (matchNumber === 1) {
      return tournamentState.semiFinal1.winner ? "Completed" : "Active";
    } else if (matchNumber === 2) {
      return tournamentState.semiFinal2.winner ? "Completed" : "Active";
    } else if (matchNumber === 3) {
      if (
        !tournamentState.semiFinal1.winner ||
        !tournamentState.semiFinal2.winner
      ) {
        return "Pending";
      }
      return tournamentState.final.winner ? "Completed" : "Active";
    }
    return "Pending";
  };

  // Get winner names for final match
  const getFinalTeams = () => {
    const sf1Winner = tournamentState.semiFinal1.winner;
    const sf2Winner = tournamentState.semiFinal2.winner;

    if (sf1Winner && sf2Winner) {
      return { team1: sf1Winner, team2: sf2Winner };
    }
    return { team1: "Winner Match 1", team2: "Winner Match 2" };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament Dashboard</Text>
        <Text style={styles.subtitle}>
          {tournamentState.tournamentName || "PBS Cup Aug 2025"}
        </Text>
        {tournamentState.organizer && (
          <Text style={styles.organizer}>
            Organized by: {tournamentState.organizer}
          </Text>
        )}
      </View>

      <View style={styles.bracketContainer}>
        <View style={styles.semiFinals}>
          <Text style={styles.roundTitle}>Semi-Finals</Text>

          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => handleMatchSelect(1)}
          >
            <Text style={styles.matchTitle}>Match 1</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>
                {mainTeams[0]?.name || "Team A"}
              </Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>
                {mainTeams[1]?.name || "Team B"}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {tournamentState.semiFinal1.teamScores[0]} -{" "}
                {tournamentState.semiFinal1.teamScores[1]}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                getMatchStatus(1) === "Completed" && styles.completedStatus,
              ]}
            >
              {getMatchStatus(1)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => handleMatchSelect(2)}
          >
            <Text style={styles.matchTitle}>Match 2</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>
                {mainTeams[2]?.name || "Team C"}
              </Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>
                {mainTeams[3]?.name || "Team D"}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {tournamentState.semiFinal2.teamScores[0]} -{" "}
                {tournamentState.semiFinal2.teamScores[1]}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                getMatchStatus(2) === "Completed" && styles.completedStatus,
              ]}
            >
              {getMatchStatus(2)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.final}>
          <Text style={styles.roundTitle}>Final</Text>
          <TouchableOpacity
            style={styles.finalCard}
            onPress={() => handleMatchSelect(3)}
          >
            <Text style={styles.matchTitle}>Match 3</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>{getFinalTeams().team1}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>{getFinalTeams().team2}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {tournamentState.final.teamScores[0]} -{" "}
                {tournamentState.final.teamScores[1]}
              </Text>
            </View>
            <Text
              style={[
                styles.status,
                getMatchStatus(3) === "Completed" && styles.completedStatus,
              ]}
            >
              {getMatchStatus(3)}
            </Text>
          </TouchableOpacity>
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
  organizer: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  bracketContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  semiFinals: {
    marginBottom: SPACING.xl,
  },
  roundTitle: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  matchTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
  },
  vs: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    fontWeight: FONTS.weight.medium,
  },
  scoreContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  score: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    textAlign: "center",
  },
  status: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  completedStatus: {
    color: COLORS.success,
  },
  final: {
    marginTop: SPACING.lg,
  },
  finalCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  championSection: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  championTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  championName: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.success,
  },
});

export default TournamentDashboard;
