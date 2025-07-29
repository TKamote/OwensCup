import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  teams as teamData,
  matches as matchData,
} from "../../../utils/tournamentData";
import TeamHeader from "../../../components/tournament/TeamHeader";
import MatchCard from "../../../components/tournament/MatchCard";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTournament } from "../../../context/TournamentContext";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../constants/theme";

const windowWidth = Dimensions.get("window").width;

const MatchScreen2: React.FC = () => {
  const navigation = useNavigation();
  const {
    tournamentState,
    updateMatchScore,
    setModalVisible,
    loading,
    resetMatch,
    resetAllScores,
    undoLastAction,
  } = useTournament();
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [scoreAdjustModalVisible, setScoreAdjustModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tournament...</Text>
      </View>
    );
  }

  const handleUndo = () => {
    Alert.alert(
      "Undo Last Action",
      "Are you sure you want to undo the last score change?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Undo", onPress: undoLastAction },
      ]
    );
  };

  const handleResetMatch = (matchIndex: number) => {
    Alert.alert(
      "Reset Match",
      `Are you sure you want to reset Match ${
        matchIndex + 1
      }? This will clear all scores for this match.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => resetMatch(matchIndex),
        },
      ]
    );
  };

  const handleScoreAdjustment = (matchIndex: number) => {
    setSelectedMatch(matchIndex);
    setScoreAdjustModalVisible(true);
  };

  const handleDirectScoreChange = (
    matchIndex: number,
    teamIndex: 0 | 1,
    newScore: number
  ) => {
    const match = matchData[matchIndex];
    const currentScores = [...tournamentState.matchScores[matchIndex]];

    // Validate score
    if (newScore < 0 || newScore > match.raceTo) {
      Alert.alert(
        "Invalid Score",
        `Score must be between 0 and ${match.raceTo}`
      );
      return;
    }

    // Calculate the delta
    const delta = newScore - tournamentState.matchScores[matchIndex][teamIndex];

    // Update the score using the delta
    updateMatchScore(matchIndex, teamIndex, delta);
    setScoreAdjustModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Champion Modal */}
      <Modal
        visible={tournamentState.modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.starsRow}>
              <MaterialIcons
                name="star"
                size={36}
                color={COLORS.secondary}
                style={styles.star}
              />
              <MaterialIcons
                name="star"
                size={44}
                color={COLORS.secondary}
                style={styles.star}
              />
              <MaterialIcons
                name="star"
                size={36}
                color={COLORS.secondary}
                style={styles.star}
              />
            </View>
            <MaterialCommunityIcons
              name="trophy"
              size={72}
              color={COLORS.secondary}
              style={{ marginVertical: SPACING.sm }}
            />
            <Text style={styles.championText}>Champion!</Text>
            <Text style={styles.championName}>{tournamentState.champion}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset Options Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Options</Text>
              <TouchableOpacity onPress={() => setResetModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.resetConfirmationContainer}>
              <Text style={styles.resetConfirmationText}>
                Reset all scoring to 0?
              </Text>
              <View style={styles.resetButtonRow}>
                <TouchableOpacity
                  style={[styles.resetButton, styles.noButton]}
                  onPress={() => setResetModalVisible(false)}
                >
                  <Text style={styles.noButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetButton, styles.yesButton]}
                  onPress={() => {
                    resetAllScores();
                    setResetModalVisible(false);
                  }}
                >
                  <Text style={styles.yesButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Scores</Text>
              <TouchableOpacity
                onPress={() => setScoreAdjustModalVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            {selectedMatch !== null && (
              <View style={styles.scoreAdjustmentContent}>
                <Text style={styles.matchTitle}>
                  Match {selectedMatch + 1}: {matchData[selectedMatch].type}
                </Text>

                <View style={styles.scoreAdjustmentRow}>
                  <Text style={styles.teamName}>{teamData[2].name}</Text>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() =>
                      handleDirectScoreChange(
                        selectedMatch,
                        0,
                        Math.max(
                          0,
                          tournamentState.matchScores[selectedMatch][0] - 1
                        )
                      )
                    }
                  >
                    <Text style={styles.scoreButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.currentScore}>
                    {tournamentState.matchScores[selectedMatch][0]}
                  </Text>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() =>
                      handleDirectScoreChange(
                        selectedMatch,
                        0,
                        Math.min(
                          matchData[selectedMatch].raceTo,
                          tournamentState.matchScores[selectedMatch][0] + 1
                        )
                      )
                    }
                  >
                    <Text style={styles.scoreButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scoreAdjustmentRow}>
                  <Text style={styles.teamName}>{teamData[3].name}</Text>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() =>
                      handleDirectScoreChange(
                        selectedMatch,
                        1,
                        Math.max(
                          0,
                          tournamentState.matchScores[selectedMatch][1] - 1
                        )
                      )
                    }
                  >
                    <Text style={styles.scoreButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.currentScore}>
                    {tournamentState.matchScores[selectedMatch][1]}
                  </Text>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() =>
                      handleDirectScoreChange(
                        selectedMatch,
                        1,
                        Math.min(
                          matchData[selectedMatch].raceTo,
                          tournamentState.matchScores[selectedMatch][1] + 1
                        )
                      )
                    }
                  >
                    <Text style={styles.scoreButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Tournament Header */}
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentTitleRow}>
          <MaterialCommunityIcons
            name="trophy"
            size={32}
            color={COLORS.secondary}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.tournamentTitle}>PBS Cup Aug 2025</Text>
        </View>
        <Text style={styles.tournamentSubtitle}>
          Match 2: {teamData[2].name} vs {teamData[3].name}
        </Text>
        <Text style={styles.tournamentOrganizer}>Organized by: Owen</Text>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.headerResetButton}
        onPress={() => setResetModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="backup-restore"
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>

      <TeamHeader
        teams={[
          { name: teamData[2].name, score: tournamentState.teamScores[2] },
          { name: teamData[3].name, score: tournamentState.teamScores[3] },
        ]}
      />
      <FlatList
        data={matchData}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item, index }) => (
          <MatchCard
            match={item}
            teamScores={tournamentState.teamScores}
            matchScore={tournamentState.matchScores[index]}
            onScoreChange={(teamIdx) => updateMatchScore(index, teamIdx, 1)}
            isCurrent={index === tournamentState.currentMatch}
            isCompleted={
              tournamentState.matchScores[index][0] === item.raceTo ||
              tournamentState.matchScores[index][1] === item.raceTo
            }
            onReset={() => handleResetMatch(index)}
            onAdjust={() => handleScoreAdjustment(index)}
            matchIndex={index}
          />
        )}
        extraData={{
          matchScores: tournamentState.matchScores,
          currentMatch: tournamentState.currentMatch,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // 1. Main Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // 2. Loading State
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

  // 3. Champion Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background.modal,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: windowWidth * 0.8,
    ...SHADOWS.lg,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  star: {
    marginHorizontal: SPACING.xs,
  },
  championText: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  championName: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.team2,
    marginVertical: SPACING.sm,
    textAlign: "center",
  },
  closeBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING["2xl"],
  },
  closeBtnText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },

  // 4. Reset Options Modal Styles
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  resetConfirmationContainer: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  resetConfirmationText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  resetButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  resetButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 80,
    alignItems: "center",
  },
  noButton: {
    backgroundColor: COLORS.gray[400],
  },
  yesButton: {
    backgroundColor: COLORS.warning,
  },
  noButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  yesButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },

  // 5. Score Adjustment Modal Styles
  scoreAdjustmentContent: {
    width: "100%",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  matchTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  scoreAdjustmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  scoreButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  scoreButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  currentScore: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },

  // 6. Tournament Header Styles
  tournamentHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background.primary,
  },
  tournamentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  tournamentTitle: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  tournamentSubtitle: {
    textAlign: "center",
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  tournamentOrganizer: {
    textAlign: "center",
    fontSize: FONTS.size.sm,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  // 7. Reset Button Styles
  headerResetButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    ...SHADOWS.sm,
    zIndex: 1000,
  },
});

export default MatchScreen2;
