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
  GLASS_SHADOWS,
  SHADOWS,
} from "../../../constants/theme";

const MatchScreen2: React.FC = () => {
  const navigation = useNavigation();
  const { tournamentState, updateMatchScore, setModalVisible, resetMatch } =
    useTournament();

  // Use semi-final 2 for this screen
  const currentMatchup = tournamentState.rounds.semiFinal2;

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [scoreAdjustModalVisible, setScoreAdjustModalVisible] = useState(false);
  const [winnerModalVisible, setWinnerModalVisible] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);

  // Get the teams for this matchup (teams 3 & 4)
  const mainTeams = tournamentState.confirmedTeams.slice(2, 4);
  const team1 = mainTeams[0];
  const team2 = mainTeams[1];

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

  // Use the context's round winner instead of calculating locally
  useEffect(() => {
    if (currentMatchup.isCompleted && currentMatchup.winnerTeamId) {
      setRoundWinner(currentMatchup.winnerTeamId);
      setWinnerModalVisible(true);
    } else {
      setRoundWinner(null);
      setWinnerModalVisible(false);
    }
  }, [currentMatchup.isCompleted, currentMatchup.winnerTeamId]);

  // Get player names for specific matches
  const getPlayerNamesForMatch = (matchIndex: number, teamIndex: number) => {
    const players = teamIndex === 0 ? team1Players : team2Players;

    switch (matchIndex) {
      case 0: // Match 1: All 5 players - show team name
        return teamIndex === 0
          ? team1?.name || "Team C"
          : team2?.name || "Team D";
      case 1: // Match 2: Players 2 & 3 (1st Doubles)
        return `${players[1]?.name || "P2"}, ${players[2]?.name || "P3"}`;
      case 2: // Match 3: Player 1 (1st Singles)
        return players[0]?.name || "P1";
      case 3: // Match 4: Players 4 & 5 (2nd Doubles)
        return `${players[3]?.name || "P4"}, ${players[4]?.name || "P5"}`;
      case 4: // Match 5: Player 2 (2nd Singles)
        return players[1]?.name || "P2";
      case 5: // Match 6: All 5 players (2nd Team Match) - show team name
        return teamIndex === 0
          ? team1?.name || "Team C"
          : team2?.name || "Team D";
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
    updateMatchScore("semiFinal2", matchIndex, teamIndex, delta);
  };

  const handleResetMatch = (matchIndex: number) => {
    Alert.alert("Reset Match", "Are you sure you want to reset this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          resetMatch("semiFinal2", matchIndex);
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
            <Text style={styles.championTitle}>Winner!</Text>
            <Text style={styles.championName}>
              {roundWinner
                ? tournamentState.confirmedTeams.find(
                    (t) => t.id === roundWinner
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
                    resetMatch("semiFinal2", i);
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
                  <Text style={styles.teamName}>{team1?.name || "Team C"}</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Minus button pressed for Team 1");
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          tournamentState.rounds.semiFinal2.matches[
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
                        tournamentState.rounds.semiFinal2.matches[selectedMatch]
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
                          tournamentState.rounds.semiFinal2.matches[
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
                  <Text style={styles.teamName}>{team2?.name || "Team D"}</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => {
                        console.log("Minus button pressed for Team 2");
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          tournamentState.rounds.semiFinal2.matches[
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
                        tournamentState.rounds.semiFinal2.matches[selectedMatch]
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
                          tournamentState.rounds.semiFinal2.matches[
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
        <Text style={styles.headerTitle}>Semifinal 2</Text>
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
                  name: team1?.name || "Team C",
                  score: teamScores[0],
                },
                {
                  name: team2?.name || "Team D",
                  score: teamScores[1],
                },
              ]}
              teamObjects={[team1, team2]}
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
                playerDisplay={getPlayerNamesForMatch(index, 0)}
                matchType={getMatchType(index)}
                teamStartIndex={2} // Use teams 3 & 4 (index 2 & 3)
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.size["4xl"],
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
    paddingTop: SPACING.sm,
  },
  winnerSection: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.lg,
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
    ...SHADOWS.md,
  },
  modalButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
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

export default MatchScreen2;
