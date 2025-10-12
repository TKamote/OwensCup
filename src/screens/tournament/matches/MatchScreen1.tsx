import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTournament } from "../../../context/TournamentContext";
import {
  teams as teamData,
  matches as matchData,
} from "../../../utils/tournamentData";
import TeamHeader from "../../../components/tournament/TeamHeader";
import MatchCard from "../../../components/tournament/MatchCard";
import FloatingStreamingButton from "../../../components/streaming/FloatingStreamingButton";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  GLASS_SHADOWS,
  SHADOWS,
} from "../../../constants/theme";

const MatchScreen1: React.FC = () => {
  const navigation = useNavigation();
  const { tournamentState, updateMatchScore, setModalVisible, resetMatch } =
    useTournament();

  // Use semi-final 1 for this screen
  const currentMatchup = tournamentState.rounds?.semiFinal1;

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [scoreAdjustModalVisible, setScoreAdjustModalVisible] = useState(false);
  const [winnerModalVisible, setWinnerModalVisible] = useState(false);

  // Simple winner detection - check if any team has 5 wins
  useEffect(() => {
    if (!currentMatchup?.matches || !Array.isArray(currentMatchup.matches)) {
      return;
    }

    const teamScores = [0, 0];
    currentMatchup.matches.forEach((match) => {
      if (match && match.isCompleted) {
        if (match.team1Score > match.team2Score) {
          teamScores[0]++;
        } else {
          teamScores[1]++;
        }
      }
    });

    if (teamScores[0] >= 5 || teamScores[1] >= 5) {
      setWinnerModalVisible(true);
    }
  }, [currentMatchup?.matches]);

  // Get the teams for this matchup
  const mainTeams = (tournamentState.confirmedTeams || []).slice(0, 2);
  const team1 = mainTeams[0];
  const team2 = mainTeams[1];

  // Debug logging removed for cleaner console

  // Parse players for each team - new Player[] structure only
  const getTeamPlayers = (team: any) => {
    if (!team || !team.players) return [];

    // Only handle Player[] array format with unique IDs
    if (Array.isArray(team.players)) {
      return team.players.map((player: any, index: number) => ({
        id: player.id,
        name: player.name,
        designation: player.designation || `P${index + 1}`,
      }));
    }

    return [];
  };

  const team1Players = getTeamPlayers(team1);
  const team2Players = getTeamPlayers(team2);

  // Get player names for specific matches
  const getPlayerNamesForMatch = (matchIndex: number, teamIndex: number) => {
    const players = teamIndex === 0 ? team1Players : team2Players;

    switch (matchIndex) {
      case 0: // Match 1: All 5 players
        return players
          .slice(0, 5)
          .map((p: any) => p.name)
          .join(", ");
      case 1: // Match 2: Players 2 & 3 (1st Doubles)
        return `${players[1]?.name || "P2"}, ${players[2]?.name || "P3"}`;
      case 2: // Match 3: Player 1 (1st Singles)
        return players[0]?.name || "P1";
      case 3: // Match 4: Players 4 & 5 (2nd Doubles)
        return `${players[3]?.name || "P4"}, ${players[4]?.name || "P5"}`;
      case 4: // Match 5: Player 2 (2nd Singles)
        return players[1]?.name || "P2";
      case 5: // Match 6: All 5 players (2nd Team Match)
        return players
          .slice(0, 5)
          .map((p: any) => p.name)
          .join(", ");
      case 6: // Match 7: 3rd Doubles (P1 & P3)
        return `${players[0]?.name || "P1"}, ${players[2]?.name || "P3"}`;
      case 7: // Match 8: Player 3 (3rd Singles) - Captain's pick
        return players[2]?.name || "P3";
      case 8: // Match 9: 4th Singles - Captain's pick
        return players[3]?.name || "P4";
      default:
        return "Players TBD";
    }
  };

  const handleScoreChange = (
    matchIndex: number,
    teamIndex: 0 | 1,
    delta: number
  ) => {
    updateMatchScore("semiFinal1", matchIndex, teamIndex, delta);
  };

  const handleResetMatch = (matchIndex: number) => {
    Alert.alert("Reset Match", "Are you sure you want to reset this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetMatch("semiFinal1", matchIndex);
          setAdjustModalVisible(false);
          setSelectedMatch(null);
        },
      },
    ]);
  };

  const handleAdjustScore = (
    matchIndex: number,
    teamIndex: 0 | 1,
    newScore: number
  ) => {
    // Get current match scores from the new structure
    const currentMatch = currentMatchup.matches[matchIndex];
    const currentScores = [currentMatch.team1Score, currentMatch.team2Score];
    const oldScore = currentScores[teamIndex];
    const raceToScore = parseInt(tournamentState.raceToScore);

    if (newScore < 0) {
      Alert.alert("Invalid Score", "Score cannot be negative");
      return;
    }

    // Allow scores up to raceToScore + 1 for adjustment purposes
    if (newScore > raceToScore + 1) {
      Alert.alert("Invalid Score", `Score cannot exceed ${raceToScore + 1}`);
      return;
    }

    const delta = newScore - currentScores[teamIndex];

    if (delta !== 0) {
      handleScoreChange(matchIndex, teamIndex, delta);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Champion Modal */}
      <Modal
        visible={winnerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWinnerModalVisible(false)}
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
            <Text style={styles.championName}>
              {currentMatchup.winnerTeamId
                ? tournamentState.confirmedTeams.find(
                    (t) => t.id === currentMatchup.winnerTeamId
                  )?.name || "Winner"
                : "Winner"}
            </Text>
            <Text style={styles.championSubtitle}>Congratulations!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setWinnerModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset All Scores Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resetModal}>
            <Text style={styles.resetModalTitle}>Reset All Scores</Text>
            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAdjustModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetConfirmButton}
                onPress={() => {
                  // Reset all scores for this matchup
                  for (let i = 0; i < currentMatchup.matches.length; i++) {
                    resetMatch("semiFinal1", i);
                  }
                  setAdjustModalVisible(false);
                }}
              >
                <Text style={styles.resetConfirmButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Score Adjustment Modal */}
      <Modal
        visible={scoreAdjustModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScoreAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resetModal}>
            <Text style={styles.resetModalTitle}>Adjust Score</Text>
            <Text style={styles.resetModalSubtitle}>
              Match {selectedMatch !== null ? selectedMatch + 1 : ""}
            </Text>

            {selectedMatch !== null && (
              <View style={styles.scoreAdjustmentContainer}>
                <View style={styles.teamScoreAdjustment}>
                  <Text style={styles.teamName}>{team1?.name || "Team A"}</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          tournamentState.rounds.semiFinal1.matches[
                            selectedMatch
                          ].team1Score - 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {
                        tournamentState.rounds.semiFinal1.matches[selectedMatch]
                          .team1Score
                      }
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          tournamentState.rounds.semiFinal1.matches[
                            selectedMatch
                          ].team1Score + 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.teamScoreAdjustment}>
                  <Text style={styles.teamName}>{team2?.name || "Team B"}</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          tournamentState.rounds.semiFinal1.matches[
                            selectedMatch
                          ].team2Score - 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {
                        tournamentState.rounds.semiFinal1.matches[selectedMatch]
                          .team2Score
                      }
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          tournamentState.rounds.semiFinal1.matches[
                            selectedMatch
                          ].team2Score + 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setScoreAdjustModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Semifinal 1</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setAdjustModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="reload"
              size={24}
              color={COLORS.warning}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
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
              teams={[
                {
                  name: team1?.name || "Team A",
                  score: teamScores[0],
                },
                {
                  name: team2?.name || "Team B",
                  score: teamScores[1],
                },
              ]}
              teamObjects={[team1, team2]}
            />
          );
        })()}

        {!team1 || !team2 ? (
          <View style={styles.noTeamsMessage}>
            <MaterialCommunityIcons
              name="information"
              size={48}
              color={COLORS.primary}
            />
            <Text style={styles.noTeamsTitle}>Teams Not Set Up</Text>
            <Text style={styles.noTeamsText}>
              Go to "Tournament Setup" tab to add teams and players, then
              finalize the tournament to see individual matches.
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentMatchup?.matches || []}
            keyExtractor={(item, index) => `match-${index}`}
            renderItem={({ item: match, index }) => {
              const isCompleted = match?.isCompleted || false;

              return (
                <MatchCard
                  match={{
                    number: index + 1,
                    type: "team",
                    raceTo: parseInt(tournamentState.raceToScore) || 5,
                    players: "Team Match",
                  }}
                  matchIndex={index}
                  teamScores={[0, 0]} // TODO: Calculate from matches
                  matchScore={[match?.team1Score || 0, match?.team2Score || 0]}
                  onScoreChange={(teamIdx, delta) =>
                    handleScoreChange(index, teamIdx, delta)
                  }
                  isCurrent={false} // TODO: Implement current match logic
                  isCompleted={isCompleted}
                  onReset={() => handleResetMatch(index)}
                  onAdjust={() => {
                    setSelectedMatch(index);
                    setScoreAdjustModalVisible(true);
                  }}
                  playerDisplay={getPlayerNamesForMatch(index, 0)}
                  matchType={getMatchType(index)}
                  teamStartIndex={0} // Use teams 1 & 2 (index 0 & 1)
                />
              );
            }}
            extraData={{
              matches: currentMatchup.matches,
            }}
          />
        )}
      </View>

      {/* Floating Streaming Button */}
      <FloatingStreamingButton />
    </SafeAreaView>
  );
};

// Helper function to get match type
const getMatchType = (matchIndex: number): string => {
  switch (matchIndex) {
    case 0:
      return "Team Match";
    case 1:
      return "1st Doubles";
    case 2:
      return "1st Singles";
    case 3:
      return "2nd Doubles";
    case 4:
      return "2nd Singles";
    case 5:
      return "2nd Team Match";
    case 6:
      return "3rd Doubles";
    case 7:
      return "3rd Singles";
    case 8:
      return "4th Singles";
    default:
      return "Match";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.secondary,
  },
  backButtonText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  noTeamsMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  noTeamsTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  noTeamsText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    flex: 1,
  },
  headerButtons: {
    position: "absolute",
    right: 20,
    top: 20,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.glass.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...GLASS_SHADOWS.light,
  },
  adjustButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.glass.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...GLASS_SHADOWS.light,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  winnerSection: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    alignItems: "center",
    ...SHADOWS.md,
  },
  winnerTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  winnerName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  winnerId: {
    fontSize: FONTS.size.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  roundId: {
    fontSize: FONTS.size.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  championModal: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    ...GLASS_SHADOWS.heavy,
  },
  trophyIcon: {
    marginBottom: SPACING.sm,
  },
  championTitle: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  championName: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  championSubtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...GLASS_SHADOWS.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  modalButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  adjustModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  adjustModalTitle: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  adjustModalSubtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  scoreAdjustmentContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  teamScoreAdjustment: {
    width: "100%",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  teamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  scoreAdjustment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
  },
  scoreButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  scoreButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  scoreDisplay: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: SPACING.md,
  },
  resetButton: {
    backgroundColor: COLORS.glass.secondary,
    borderWidth: 2,
    borderColor: COLORS.glass.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...GLASS_SHADOWS.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  resetButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  resetModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.lg,
  },
  resetModalTitle: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  resetModalSubtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  resetModalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: SPACING.md,
  },
  cancelButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...GLASS_SHADOWS.medium,
  },
  cancelButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  resetConfirmButton: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...GLASS_SHADOWS.medium,
  },
  resetConfirmButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
});

export default MatchScreen1;
