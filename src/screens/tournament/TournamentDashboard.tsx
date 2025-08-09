import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

  // Determine match status based on tournament state
  const getMatchStatus = (matchNumber: number) => {
    if (matchNumber === 1) {
      return tournamentState.rounds.semiFinal1.winnerTeamId
        ? "Completed"
        : "Active";
    } else if (matchNumber === 2) {
      return tournamentState.rounds.semiFinal2.winnerTeamId
        ? "Completed"
        : "Active";
    } else if (matchNumber === 3) {
      if (
        !tournamentState.rounds.semiFinal1.winnerTeamId ||
        !tournamentState.rounds.semiFinal2.winnerTeamId
      ) {
        return "Pending";
      }
      return tournamentState.rounds.final.winnerTeamId ? "Completed" : "Active";
    }
    return "Pending";
  };

  // Get winner names for final match
  const getFinalTeams = () => {
    const sf1WinnerId = tournamentState.rounds.semiFinal1.winnerTeamId;
    const sf2WinnerId = tournamentState.rounds.semiFinal2.winnerTeamId;

    if (sf1WinnerId && sf2WinnerId) {
      const sf1Winner = tournamentState.confirmedTeams.find(
        (t) => t.id === sf1WinnerId
      );
      const sf2Winner = tournamentState.confirmedTeams.find(
        (t) => t.id === sf2WinnerId
      );
      return {
        team1: sf1Winner?.name || "Winner Match 1",
        team2: sf2Winner?.name || "Winner Match 2",
        team1Obj: sf1Winner,
        team2Obj: sf2Winner,
      };
    }
    return {
      team1: "Winner Match 1",
      team2: "Winner Match 2",
      team1Obj: null,
      team2Obj: null,
    };
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

      <ScrollView
        style={styles.bracketContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.semiFinals}>
          <Text style={styles.roundTitle}>Semi-Finals</Text>

          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => handleMatchSelect(1)}
          >
            <Text style={styles.matchTitle}>Semifinal 1</Text>
            <View style={styles.teamsContainer}>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(mainTeams[0]?.icon as any) || "account"}
                  size={32}
                  color={mainTeams[0]?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>
                  {mainTeams[0]?.name || "Team A"}
                </Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(mainTeams[1]?.icon as any) || "account"}
                  size={32}
                  color={mainTeams[1]?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>
                  {mainTeams[1]?.name || "Team B"}
                </Text>
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {(() => {
                  const teamScores = [0, 0];
                  tournamentState.rounds.semiFinal1.matches.forEach((match) => {
                    if (match.isCompleted) {
                      if (match.team1Score > match.team2Score) {
                        teamScores[0]++;
                      } else {
                        teamScores[1]++;
                      }
                    }
                  });
                  return `${teamScores[0]} - ${teamScores[1]}`;
                })()}
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
            <Text style={styles.matchTitle}>Semifinal 2</Text>
            <View style={styles.teamsContainer}>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(mainTeams[2]?.icon as any) || "account"}
                  size={32}
                  color={mainTeams[2]?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>
                  {mainTeams[2]?.name || "Team C"}
                </Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(mainTeams[3]?.icon as any) || "account"}
                  size={32}
                  color={mainTeams[3]?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>
                  {mainTeams[3]?.name || "Team D"}
                </Text>
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {(() => {
                  const teamScores = [0, 0];
                  tournamentState.rounds.semiFinal2.matches.forEach((match) => {
                    if (match.isCompleted) {
                      if (match.team1Score > match.team2Score) {
                        teamScores[0]++;
                      } else {
                        teamScores[1]++;
                      }
                    }
                  });
                  return `${teamScores[0]} - ${teamScores[1]}`;
                })()}
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
          <Text style={styles.roundTitle}>Championship</Text>
          <TouchableOpacity
            style={styles.finalCard}
            onPress={() => handleMatchSelect(3)}
          >
            <Text style={styles.matchTitle}>Final</Text>
            <View style={styles.teamsContainer}>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(getFinalTeams().team1Obj?.icon as any) || "account"}
                  size={32}
                  color={getFinalTeams().team1Obj?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>{getFinalTeams().team1}</Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamWithIcon}>
                <MaterialCommunityIcons
                  name={(getFinalTeams().team2Obj?.icon as any) || "account"}
                  size={32}
                  color={getFinalTeams().team2Obj?.color || COLORS.primary}
                />
                <Text style={styles.teamName}>{getFinalTeams().team2}</Text>
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {(() => {
                  const teamScores = [0, 0];
                  tournamentState.rounds.final.matches.forEach((match) => {
                    if (match.isCompleted) {
                      if (match.team1Score > match.team2Score) {
                        teamScores[0]++;
                      } else {
                        teamScores[1]++;
                      }
                    }
                  });
                  return `${teamScores[0]} - ${teamScores[1]}`;
                })()}
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

        {tournamentState.tournamentChampionTeamId && (
          <View style={styles.championSection}>
            <Text style={styles.championTitle}>🏆 Tournament Champion</Text>
            <Text style={styles.championName}>
              {tournamentState.confirmedTeams.find(
                (t) => t.id === tournamentState.tournamentChampionTeamId
              )?.name || "Champion"}
            </Text>
          </View>
        )}
      </ScrollView>
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
  teamWithIcon: {
    flexDirection: "column",
    alignItems: "center",
    gap: SPACING.xs,
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
