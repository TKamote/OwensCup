import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Define the type for the route params
type RootStackParamList = {
  ViewerTournamentDetail: { tournamentId: string };
};

type ViewerTournamentDetailRouteProp = RouteProp<
  RootStackParamList,
  "ViewerTournamentDetail"
>;

// NEW: Helper function to get team name by ID from the tournament data
const getTeamNameById = (teams: any[], teamId: string) => {
  const team = teams.find((t) => t.id === teamId);
  return team?.name || "TBD";
};

// NEW: Read-only component for the tournament summary
const TournamentSummary: React.FC<{ tournament: any }> = ({ tournament }) => {
  const teams = tournament.confirmedTeams || [];

  const calculateRoundScore = (round: any) => {
    if (!round || !round.matches) return [0, 0];
    const wins = [0, 0];
    round.matches.forEach((match: any) => {
      if (match.winnerId) {
        if (match.winnerId === round.matches[0].team1Id) wins[0]++;
        if (match.winnerId === round.matches[0].team2Id) wins[1]++;
      }
    });
    return wins;
  };

  const sf1Scores = calculateRoundScore(tournament.rounds?.semiFinal1);
  const sf2Scores = calculateRoundScore(tournament.rounds?.semiFinal2);
  const finalScores = calculateRoundScore(tournament.rounds?.final);

  const sf1Winner = tournament.rounds?.semiFinal1?.winnerTeamId;
  const sf2Winner = tournament.rounds?.semiFinal2?.winnerTeamId;

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.sectionTitle}>Tournament Summary</Text>

      {/* Semi-Finals */}
      <View style={styles.matchupCard}>
        <Text style={styles.matchupTitle}>Semi-Final 1</Text>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>
            {getTeamNameById(
              teams,
              tournament.rounds?.semiFinal1?.matches[0]?.team1Id
            )}
          </Text>
          <Text style={styles.scoreText}>
            {sf1Scores[0]} - {sf1Scores[1]}
          </Text>
          <Text style={styles.teamName}>
            {getTeamNameById(
              teams,
              tournament.rounds?.semiFinal1?.matches[0]?.team2Id
            )}
          </Text>
        </View>
      </View>

      <View style={styles.matchupCard}>
        <Text style={styles.matchupTitle}>Semi-Final 2</Text>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>
            {getTeamNameById(
              teams,
              tournament.rounds?.semiFinal2?.matches[0]?.team1Id
            )}
          </Text>
          <Text style={styles.scoreText}>
            {sf2Scores[0]} - {sf2Scores[1]}
          </Text>
          <Text style={styles.teamName}>
            {getTeamNameById(
              teams,
              tournament.rounds?.semiFinal2?.matches[0]?.team2Id
            )}
          </Text>
        </View>
      </View>

      {/* Final */}
      <View style={styles.matchupCard}>
        <Text style={styles.matchupTitle}>Championship Final</Text>
        <View style={styles.teamRow}>
          <Text style={styles.teamName}>
            {sf1Winner ? getTeamNameById(teams, sf1Winner) : "Winner SF1"}
          </Text>
          <Text style={styles.scoreText}>
            {finalScores[0]} - {finalScores[1]}
          </Text>
          <Text style={styles.teamName}>
            {sf2Winner ? getTeamNameById(teams, sf2Winner) : "Winner SF2"}
          </Text>
        </View>
      </View>

      {tournament.tournamentChampionTeamId && (
        <View style={styles.championContainer}>
          <Text style={styles.championTitle}>🏆 Tournament Champion 🏆</Text>
          <Text style={styles.championName}>
            {getTeamNameById(teams, tournament.tournamentChampionTeamId)}
          </Text>
        </View>
      )}
    </View>
  );
};

// NEW: Read-only component for a list of matches in a round
const RoundMatches: React.FC<{ round: any; teams: any[] }> = ({
  round,
  teams,
}) => {
  if (!round || !round.matches) return null;

  return (
    <View style={styles.roundContainer}>
      <Text style={styles.sectionTitle}>
        {round.name === "final" ? "Final Matches" : `Matches for ${round.name}`}
      </Text>
      {round.matches.map((match: any, index: number) => (
        <View key={match.id || index} style={styles.matchCard}>
          <Text style={styles.matchTitle}>Match {index + 1}</Text>
          <View style={styles.teamRow}>
            <Text style={styles.teamName}>
              {getTeamNameById(teams, match.team1Id)}
            </Text>
            <Text style={styles.scoreText}>
              {match.team1Score} - {match.team2Score}
            </Text>
            <Text style={styles.teamName}>
              {getTeamNameById(teams, match.team2Id)}
            </Text>
          </View>
          {match.winnerId && (
            <Text style={styles.winnerAnnounce}>
              Winner: {getTeamNameById(teams, match.winnerId)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const ViewerTournamentDetailScreen: React.FC = () => {
  const route = useRoute<ViewerTournamentDetailRouteProp>();
  const { tournamentId } = route.params;

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTournamentDetails = async () => {
    try {
      const docRef = doc(db, "tournaments", tournamentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTournament(docSnap.data());
      } else {
        console.log("No such tournament!");
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails();
  }, [tournamentId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournamentDetails();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.messageText}>Loading Tournament Details...</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={COLORS.error}
        />
        <Text style={styles.messageText}>
          Tournament data could not be found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{tournament.tournamentName}</Text>
        <Text style={styles.subtitle}>Organized by {tournament.organizer}</Text>
      </View>

      {/* RENDER THE NEW COMPONENTS */}
      <TournamentSummary tournament={tournament} />
      <RoundMatches
        round={tournament.rounds?.semiFinal1}
        teams={tournament.confirmedTeams}
      />
      <RoundMatches
        round={tournament.rounds?.semiFinal2}
        teams={tournament.confirmedTeams}
      />
      <RoundMatches
        round={tournament.rounds?.final}
        teams={tournament.confirmedTeams}
      />
    </ScrollView>
  );
};

// Add new styles and update existing ones
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  messageText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    alignItems: "center",
  },
  title: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  placeholder: {
    padding: SPACING.xl,
    margin: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  matchupCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  matchupTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamName: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: "center",
  },
  scoreText: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginHorizontal: SPACING.md,
  },
  championContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  championTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  championName: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  roundContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  matchTitle: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  winnerAnnounce: {
    marginTop: SPACING.sm,
    textAlign: "center",
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.success,
  },
});

export default ViewerTournamentDetailScreen;
