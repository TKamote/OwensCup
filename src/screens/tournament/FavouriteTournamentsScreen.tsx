import React from "react";
import { View, FlatList, StyleSheet, Text, Modal } from "react-native";
import {
  teams as teamData,
  matches as matchData,
} from "../../utils/tournamentData";
import TeamHeader from "../../components/tournament/TeamHeader";
import MatchCard from "../../components/tournament/MatchCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTournament } from "../../context/TournamentContext";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const FavouriteTournamentsScreen: React.FC = () => {
  const { tournamentState, setModalVisible, loading } = useTournament();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tournament data...</Text>
      </View>
    );
  }

  // Use semi-final 1 for this screen
  const currentMatchup = tournamentState.rounds.semiFinal1;

  return (
    <View style={styles.container}>
      {/* Champion Modal */}
      <Modal
        visible={false} // TODO: Implement modal visibility logic for new structure
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible("semiFinal1", false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.championModal}>
            <MaterialCommunityIcons name="star" size={64} color="#FFD700" />
            <MaterialCommunityIcons
              name="trophy"
              size={48}
              color="#FFD700"
              style={styles.trophyIcon}
            />
            <Text style={styles.championTitle}>Winner!</Text>
            <Text style={styles.championText}>
              {currentMatchup.winnerTeamId
                ? tournamentState.confirmedTeams.find(
                    (t) => t.id === currentMatchup.winnerTeamId
                  )?.name || "Winner"
                : "Winner"}
            </Text>
            <Text style={styles.championSubtitle}>Congratulations!</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="trophy"
            size={32}
            color={COLORS.secondary}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.title}>
            {tournamentState.tournamentName || "Tournament"}
          </Text>
        </View>
        <Text style={styles.subtitle}>
          {tournamentState.organizer
            ? `Organized by ${tournamentState.organizer}`
            : "Tournament"}
        </Text>
        <Text style={styles.viewerText}>Live Tournament - Semi-Final 1</Text>

        {/* Calculate team scores from matches */}
        {(() => {
          const teamScores = [0, 0];
          currentMatchup.matches.forEach((match) => {
            if (match.isCompleted) {
              if (match.team1Score > match.team2Score) {
                teamScores[0]++;
              } else {
                teamScores[1]++;
              }
            }
          });

          return (
            <TeamHeader
              teams={teamData.slice(0, 2).map((t, i) => ({
                ...t,
                score: teamScores[i],
              }))}
            />
          );
        })()}

        <FlatList
          data={matchData}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item, index }) => {
            const match = currentMatchup.matches[index];
            const isCompleted = match.isCompleted;

            return (
              <MatchCard
                match={item}
                matchIndex={index}
                teamScores={[0, 0]} // TODO: Calculate from matches
                matchScore={[match.team1Score, match.team2Score]}
                onScoreChange={() => {}} // Empty function - no editing
                isCurrent={false} // TODO: Implement current match logic
                isCompleted={isCompleted}
                onReset={() => {}} // No reset functionality
                onAdjust={() => {}} // No adjust functionality
              />
            );
          }}
          extraData={{
            matches: currentMatchup.matches,
          }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
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
    fontSize: FONTS.size["3xl"],
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
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
    marginBottom: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  championModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    marginHorizontal: SPACING.lg,
    ...SHADOWS.lg,
  },
  trophyIcon: {
    marginTop: SPACING.sm,
  },
  championTitle: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  championText: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  championSubtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
});

export default FavouriteTournamentsScreen;
