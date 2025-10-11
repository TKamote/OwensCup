import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAllTournaments } from "../../services/firebase";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Define a type for the navigation stack parameters
type RootStackParamList = {
  ViewerTournamentDetail: { tournamentId: string };
  // Add other screens here as needed
};

type ViewerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ViewerTournamentDetail"
>;

interface Tournament {
  id: string;
  tournamentName: string;
  organizer: string;
  updatedAt: { toDate: () => Date }; // Firestore timestamp
  tournamentChampionTeamId: string | null;
}

const ViewerScreen: React.FC = () => {
  const [ongoing, setOngoing] = useState<Tournament[]>([]);
  const [completed, setCompleted] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ViewerScreenNavigationProp>();

  const fetchTournaments = async () => {
    try {
      const tournaments = (await getAllTournaments()) as Tournament[];

      // Sort tournaments by latest update
      tournaments.sort(
        (a, b) =>
          b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime()
      );

      // Separate into ongoing and completed
      const ongoingTournaments = tournaments.filter(
        (t) => !t.tournamentChampionTeamId
      );
      const completedTournaments = tournaments.filter(
        (t) => !!t.tournamentChampionTeamId
      );

      setOngoing(ongoingTournaments);
      setCompleted(completedTournaments);
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTournaments();
  }, []);

  const renderTournamentItem = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ViewerTournamentDetail", { tournamentId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tournamentName} numberOfLines={1}>
          {item.tournamentName}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.primary}
        />
      </View>
      <Text style={styles.organizerText}>Organized by: {item.organizer}</Text>
      <Text style={styles.updatedText}>
        Last updated: {item.updatedAt.toDate().toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Tournaments...</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={[
        { title: "Ongoing Tournaments", data: ongoing },
        { title: "Completed Tournaments", data: completed },
      ]}
      keyExtractor={(item) => item.id}
      renderItem={renderTournamentItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="trophy-outline"
            size={64}
            color={COLORS.text.secondary}
          />
          <Text style={styles.emptyText}>
            No tournaments available right now.
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  sectionHeader: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  tournamentName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.primary,
    flex: 1,
  },
  organizerText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  updatedText: {
    fontSize: FONTS.size.xs,
    color: COLORS.text.disabled,
  },
});

export default ViewerScreen;
