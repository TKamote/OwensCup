import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  pastTeams as teamData,
  pastMatches as matchData,
} from "../../utils/tournamentData";
import TeamHeader from "../../components/tournament/TeamHeader";
import MatchCard from "../../components/tournament/MatchCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const PastTournamentsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Create static match scores for past tournament (completed state)
  const pastMatchScores: [number, number][] = [
    [5, 2], // Match 1: Pinoy Sargo won (1-0)
    [3, 5], // Match 2: WBB won (1-1)
    [5, 1], // Match 3: Pinoy Sargo won (2-1)
    [2, 5], // Match 4: WBB won (2-2)
    [5, 3], // Match 5: Pinoy Sargo won (3-2)
    [2, 5], // Match 6: WBB won (3-3)
    [4, 5], // Match 7: WBB won (3-4)
    [2, 5], // Match 8: WBB won (3-5) - TOURNAMENT OVER
    [0, 0], // Match 9: Not played (tournament already ended)
  ];

  // Updated team data with correct final scores
  const updatedTeamData = [
    { name: "Pinoy Sargo", score: 3 },
    { name: "WBB (Jerome)", score: 5 }, // Reached 5 wins, tournament over
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="trophy"
            size={32}
            color={COLORS.secondary}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.title}>PBS Cup Jul 2025</Text>
        </View>
        <Text style={styles.subtitle}>Completed Tournament</Text>
        <Text style={styles.viewerText}>Organized by: Owen</Text>

        <TeamHeader teams={updatedTeamData} />

        <FlatList
          data={matchData}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item, index }) => (
            <MatchCard
              match={item}
              teamScores={updatedTeamData.map((t) => t.score)}
              matchScore={pastMatchScores[index]}
              onScoreChange={() => {}} // Empty function - no editing
              isCurrent={false} // Not current since it's past
              isCompleted={true} // All matches are completed
              onReset={() => {}} // No reset functionality
              onAdjust={() => {}} // No adjust functionality
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: "center",
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  viewerText: {
    textAlign: "center",
    fontSize: FONTS.size.sm,
    color: COLORS.success,
    fontWeight: FONTS.weight.medium,
    marginBottom: SPACING.sm,
  },
});

export default PastTournamentsScreen;
