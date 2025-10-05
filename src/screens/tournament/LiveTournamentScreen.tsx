import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTournament } from "../../context/TournamentContext";
import { teams as teamData } from "../../utils/tournamentData";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

type RootStackParamList = {
  "Match 1": undefined;
  "Match 2": undefined;
  "Match 3": undefined;
};

const LiveTournamentScreen: React.FC = () => {
  const { tournamentState } = useTournament();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Get the first 4 teams (main teams) from confirmed teams
  const mainTeams = (tournamentState.confirmedTeams || []).slice(0, 4);

  // Helper function to calculate team scores from matches
  const calculateTeamScores = (matches: any[]) => {
    const scores = [0, 0];
    if (!matches || !Array.isArray(matches)) {
      return scores;
    }
    matches.forEach((match) => {
      if (match && match.isCompleted) {
        if (match.team1Score > match.team2Score) {
          scores[0]++;
        } else {
          scores[1]++;
        }
      }
    });
    return scores;
  };

  // Helper function to get team name by ID
  const getTeamNameById = (teamId: string) => {
    const team = tournamentState.confirmedTeams.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  // Calculate scores for each round
  const semiFinal1Scores = calculateTeamScores(
    tournamentState.rounds?.semiFinal1?.matches || []
  );
  const semiFinal2Scores = calculateTeamScores(
    tournamentState.rounds?.semiFinal2?.matches || []
  );
  const finalScores = calculateTeamScores(
    tournamentState.rounds?.final?.matches || []
  );

  // Get winner team names
  const semiFinal1Winner = tournamentState.rounds?.semiFinal1?.winnerTeamId
    ? getTeamNameById(tournamentState.rounds.semiFinal1.winnerTeamId)
    : "Winner SF1";
  const semiFinal2Winner = tournamentState.rounds?.semiFinal2?.winnerTeamId
    ? getTeamNameById(tournamentState.rounds.semiFinal2.winnerTeamId)
    : "Winner SF2";
  const tournamentChampion = tournamentState.tournamentChampionTeamId
    ? getTeamNameById(tournamentState.tournamentChampionTeamId)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tournament</Text>
        <Text style={styles.subtitle}>
          {tournamentState.tournamentName || "Tournament"}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.semiFinalsSection}>
          <Text style={styles.sectionTitle}>Semi-Finals</Text>

          <TouchableOpacity
            style={styles.matchupContainer}
            onPress={() => {
              try {
                navigation.navigate("Match 1");
              } catch (error) {
                console.error("Navigation error to Match 1:", error);
              }
            }}
          >
            <Text style={styles.matchupTitle}>Semi-Final 1</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>
                  {mainTeams[0]?.name || "Team A"}
                </Text>
                <Text style={styles.teamScore}>{semiFinal1Scores[0]}</Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>
                  {mainTeams[1]?.name || "Team B"}
                </Text>
                <Text style={styles.teamScore}>{semiFinal1Scores[1]}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.matchupContainer}
            onPress={() => navigation.navigate("Match 2")}
          >
            <Text style={styles.matchupTitle}>Semi-Final 2</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>
                  {mainTeams[2]?.name || "Team C"}
                </Text>
                <Text style={styles.teamScore}>{semiFinal2Scores[0]}</Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>
                  {mainTeams[3]?.name || "Team D"}
                </Text>
                <Text style={styles.teamScore}>{semiFinal2Scores[1]}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.finalSection}>
          <Text style={styles.sectionTitle}>Championship</Text>
          <TouchableOpacity
            style={styles.matchupContainer}
            onPress={() => navigation.navigate("Match 3")}
          >
            <Text style={styles.matchupTitle}>Final</Text>
            <View style={styles.teamRow}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{semiFinal1Winner}</Text>
                <Text style={styles.teamScore}>{finalScores[0]}</Text>
              </View>
              <Text style={styles.vs}>vs</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{semiFinal2Winner}</Text>
                <Text style={styles.teamScore}>{finalScores[1]}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {tournamentChampion && (
          <View style={styles.championSection}>
            <Text style={styles.championTitle}>🏆 Tournament Champion</Text>
            <Text style={styles.championName}>{tournamentChampion}</Text>
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
