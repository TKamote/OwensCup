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
import { useTournament } from "../../../context/TournamentContext";
import {
  teams as teamData,
  matches as matchData,
} from "../../../utils/tournamentData";
import TeamHeader from "../../../components/tournament/TeamHeader";
import MatchCard from "../../../components/tournament/MatchCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  GLASS_SHADOWS,
} from "../../../constants/theme";

const MatchScreen3: React.FC = () => {
  const navigation = useNavigation();
  const { tournamentState, updateMatchScore, setModalVisible, resetMatch } =
    useTournament();

  // Use final matchup for this screen
  const currentMatchup = tournamentState.rounds.final;

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [scoreAdjustModalVisible, setScoreAdjustModalVisible] = useState(false);
  const [winnerModalVisible, setWinnerModalVisible] = useState(false);

  // Get the winner team objects
  const getWinnerTeamObject = (winnerTeamId: string | null) => {
    if (!winnerTeamId) return null;
    return tournamentState.confirmedTeams.find(
      (team) => team.id === winnerTeamId
    );
  };

  const winner1 = getWinnerTeamObject(
    tournamentState.rounds.semiFinal1.winnerTeamId
  );
  const winner2 = getWinnerTeamObject(
    tournamentState.rounds.semiFinal2.winnerTeamId
  );

  // Watch for round completion and show winner modal
  useEffect(() => {
    if (currentMatchup.isCompleted && currentMatchup.winnerTeamId) {
      console.log("Round completed! Showing winner modal");
      setWinnerModalVisible(true);
    }
  }, [currentMatchup.isCompleted, currentMatchup.winnerTeamId]);

  const handleScoreChange = (
    matchIndex: number,
    teamIndex: 0 | 1,
    delta: number
  ) => {
    updateMatchScore("final", matchIndex, teamIndex, delta);
  };

  const handleResetMatch = (matchIndex: number) => {
    Alert.alert("Reset Match", "Are you sure you want to reset this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetMatch("final", matchIndex);
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
    console.log(
      `Adjusting score: Match ${matchIndex}, Team ${teamIndex}, New Score: ${newScore}`
    );

    // Get current match scores from the new structure
    const currentMatch = currentMatchup.matches[matchIndex];
    const currentScores = [currentMatch.team1Score, currentMatch.team2Score];
    const oldScore = currentScores[teamIndex];
    const raceToScore = parseInt(tournamentState.raceToScore);

    console.log(`Current scores: [${currentScores}], Race to: ${raceToScore}`);

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
    console.log(`Delta: ${delta}`);

    if (delta !== 0) {
      console.log(`Calling handleScoreChange with delta: ${delta}`);
      handleScoreChange(matchIndex, teamIndex, delta);
    } else {
      console.log("No change in score");
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
            <Text style={styles.championTitle}>Champion!</Text>
            <Text style={styles.championName}>
              {currentMatchup.winnerTeamId
                ? getWinnerTeamObject(currentMatchup.winnerTeamId)?.name ||
                  "Champion"
                : "Champion"}
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
                    resetMatch("final", i);
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
                  <Text style={styles.teamName}>Winner Match 1</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Minus button pressed for Team 1");
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          tournamentState.rounds.final.matches[selectedMatch]
                            .team1Score - 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {
                        tournamentState.rounds.final.matches[selectedMatch]
                          .team1Score
                      }
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Plus button pressed for Team 1");
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          tournamentState.rounds.final.matches[selectedMatch]
                            .team1Score + 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.teamScoreAdjustment}>
                  <Text style={styles.teamName}>Winner Match 2</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Minus button pressed for Team 2");
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          tournamentState.rounds.final.matches[selectedMatch]
                            .team2Score - 1
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {
                        tournamentState.rounds.final.matches[selectedMatch]
                          .team2Score
                      }
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Plus button pressed for Team 2");
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          tournamentState.rounds.final.matches[selectedMatch]
                            .team2Score + 1
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
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Final Match</Text>
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
                  name: tournamentState.rounds.semiFinal1.winnerTeamId
                    ? getWinnerTeamObject(
                        tournamentState.rounds.semiFinal1.winnerTeamId
                      )?.name || "Winner Match 1"
                    : "Winner Match 1",
                  score: teamScores[0],
                },
                {
                  name: tournamentState.rounds.semiFinal2.winnerTeamId
                    ? getWinnerTeamObject(
                        tournamentState.rounds.semiFinal2.winnerTeamId
                      )?.name || "Winner Match 2"
                    : "Winner Match 2",
                  score: teamScores[1],
                },
              ]}
              teamObjects={[winner1 || null, winner2 || null]}
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
              />
            );
          }}
          extraData={{
            matches: currentMatchup.matches,
          }}
        />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background.primary,
  },
  headerSpacer: {
    width: SPACING.md, // Adjust as needed for spacing
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
  },
  adjustButton: {
    padding: SPACING.xs,
  },
  headerButtons: {
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
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
    ...SHADOWS.lg,
  },
  trophyIcon: {
    marginVertical: SPACING.sm,
  },
  championTitle: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  championName: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  championSubtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  modalButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

export default MatchScreen3;
