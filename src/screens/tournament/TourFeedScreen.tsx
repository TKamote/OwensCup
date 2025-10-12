import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  subscribeToTournaments,
  getAllTournaments,
} from "../../services/firebase";
import TourFeedMatch1 from "./tourfeed/Match1";
import TourFeedMatch2 from "./tourfeed/Match2";
import TourFeedMatch3 from "./tourfeed/Match3";
import { COLORS, FONTS, SPACING } from "../../constants/theme";

// --- Type Definitions ---
interface Player {
  id: string;
  name: string;
  designation: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  icon?: string;
  color?: string;
}

interface Match {
  isCompleted: boolean;
  team1Score: number;
  team2Score: number;
}

interface Round {
  matches: Match[];
  isCompleted: boolean;
  winnerTeamId: string | null;
}

interface Rounds {
  semiFinal1: Round;
  semiFinal2: Round;
  final: Round;
}

interface Tournament {
  id: string;
  tournamentName?: string;
  name?: string;
  rounds: Rounds;
  overview: {
    confirmedTeams: number;
    currentRound: string;
    organizer: string;
    raceToScore: string;
    status: string;
    totalTeams: number;
    tournamentId: string;
    tournamentName?: string;
  };
}

const TourFeedScreen: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("tournamentFavorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  // Save favorites to AsyncStorage
  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(
        "tournamentFavorites",
        JSON.stringify(newFavorites)
      );
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (tournamentId: string) => {
    const newFavorites = favorites.includes(tournamentId)
      ? favorites.filter((id) => id !== tournamentId)
      : [...favorites, tournamentId];
    saveFavorites(newFavorites);
  };

  const processTournaments = (allTournaments: Tournament[]) => {
    // Filter for tournaments that are active/have data
    const activeTournaments = allTournaments.filter(
      (t) => t.rounds?.semiFinal1 && t.overview?.confirmedTeams >= 4
    );

    // Remove duplicates by tournament name, keeping the first occurrence
    const uniqueTournaments = activeTournaments.filter(
      (tournament, index, array) => {
        const tournamentName =
          tournament.overview?.tournamentName ||
          tournament.tournamentName ||
          tournament.name;
        return (
          array.findIndex(
            (t) =>
              (t.overview?.tournamentName || t.tournamentName || t.name) ===
              tournamentName
          ) === index
        );
      }
    );

    // Sort tournaments: favorites first, then others
    const sortedTournaments = uniqueTournaments.sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

    setTournaments(sortedTournaments);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    // Load favorites on mount
    loadFavorites();

    // Set up real-time listener
    const unsubscribe = subscribeToTournaments((allTournaments) => {
      processTournaments(allTournaments as Tournament[]);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Re-sort tournaments when favorites change
  useEffect(() => {
    if (tournaments.length > 0) {
      const sortedTournaments = [...tournaments].sort((a, b) => {
        const aIsFavorite = favorites.includes(a.id);
        const bIsFavorite = favorites.includes(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
      });
      setTournaments(sortedTournaments);
    }
  }, [favorites]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const allTournaments = (await getAllTournaments()) as Tournament[];
      processTournaments(allTournaments);
    } catch (error) {
      console.error("Failed to refresh tournaments:", error);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Tournaments...</Text>
      </View>
    );
  }

  const renderTournament = ({
    item: tournament,
    index,
  }: {
    item: Tournament;
    index: number;
  }) => {
    // Different light background colors for each tournament
    const backgroundColors = [
      "#fff9c4", // Light yellow
      "#e3f2fd", // Light blue
      "#f3e5f5", // Light purple
      "#e8f5e8", // Light green
      "#fff3e0", // Light orange
      "#fce4ec", // Light pink
      "#e0f2f1", // Light teal
      "#f1f8e9", // Light lime
    ];
    const backgroundColor = backgroundColors[index % backgroundColors.length];

    return (
      <View style={[styles.tournamentContainer, { backgroundColor }]}>
        {index > 0 && (
          <View style={styles.tournamentDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerContent}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.dividerText}>Next Tournament</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.dividerLine} />
          </View>
        )}
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentName}>
            {tournament.overview?.tournamentName ||
              tournament.tournamentName ||
              tournament.name}
          </Text>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(tournament.id)}
          >
            <MaterialCommunityIcons
              name={
                favorites.includes(tournament.id) ? "heart" : "heart-outline"
              }
              size={24}
              color={
                favorites.includes(tournament.id)
                  ? COLORS.error
                  : COLORS.text.secondary
              }
            />
          </TouchableOpacity>
        </View>
        {/* Semifinal 1 */}
        <TourFeedMatch1 tournament={tournament} />
        {/* Semifinal 2 */}
        <TourFeedMatch2 tournament={tournament} />
        {/* Final */}
        <TourFeedMatch3 tournament={tournament} />

        {/* Bottom Heart Icon */}
        <View style={styles.bottomHeartContainer}>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(tournament.id)}
          >
            <MaterialCommunityIcons
              name={
                favorites.includes(tournament.id) ? "heart" : "heart-outline"
              }
              size={24}
              color={
                favorites.includes(tournament.id)
                  ? COLORS.error
                  : COLORS.text.secondary
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.center}>
      <Text style={styles.noTournamentsText}>No Active Tournaments</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollView}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scrollView: {
    paddingBottom: SPACING.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
  },
  noTournamentsText: {
    fontSize: FONTS.size.xl,
    color: COLORS.text.secondary,
  },
  tournamentContainer: {
    borderRadius: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.xs - 2,
  },
  tournamentDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 2,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  dividerText: {
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
    marginHorizontal: SPACING.xs,
  },
  tournamentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tournamentName: {
    fontSize: 22,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    textAlign: "center",
    flex: 1,
  },
  heartButton: {
    padding: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  bottomHeartContainer: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});

export default TourFeedScreen;
