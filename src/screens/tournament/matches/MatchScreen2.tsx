import React, { useState } from "react";
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
} from "../../../constants/theme";

const MatchScreen2: React.FC = () => {
  const navigation = useNavigation();
  const { tournamentState, updateMatchScore, setModalVisible, resetMatch } =
    useTournament();

  // Use semi-final 2 for this screen
  const currentMatchup = tournamentState.semiFinal2;

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);

  // Get the teams for this matchup (teams 3 & 4)
  const mainTeams = tournamentState.confirmedTeams.slice(2, 4);
  const team1 = mainTeams[0];
  const team2 = mainTeams[1];

  // Parse players for each team
  const getTeamPlayers = (team: any) => {
    if (!team || !team.players) return [];
    return team.players.split(",").map((player: string, index: number) => ({
      id: index + 1,
      name: player.trim(),
      designation: `P${index + 1}`,
    }));
  };

  const team1Players = getTeamPlayers(team1);
  const team2Players = getTeamPlayers(team2);

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
    const currentScores = [...currentMatchup.matchScores[matchIndex]];
    const oldScore = currentScores[teamIndex];

    if (newScore < 0 || newScore > 9) {
      Alert.alert("Invalid Score", "Score must be between 0 and 9");
      return;
    }

    const delta = newScore - currentMatchup.matchScores[matchIndex][teamIndex];
    if (delta !== 0) {
      handleScoreChange(matchIndex, teamIndex, delta);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Champion Modal */}
      <Modal
        visible={currentMatchup.modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible("semiFinal2", false)}
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
            <Text style={styles.championName}>{currentMatchup.winner}</Text>
            <Text style={styles.championSubtitle}>Congratulations!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible("semiFinal2", false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Score Adjustment Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.adjustModal}>
            <Text style={styles.adjustModalTitle}>Adjust Score</Text>
            <Text style={styles.adjustModalSubtitle}>
              Match {selectedMatch !== null ? selectedMatch + 1 : ""}
            </Text>

            {selectedMatch !== null && (
              <View style={styles.scoreAdjustmentContainer}>
                <View style={styles.teamScoreAdjustment}>
                  <Text style={styles.teamName}>{team1?.name || "Team C"}</Text>
                  <View style={styles.scoreAdjustment}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() =>
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          currentMatchup.matchScores[selectedMatch][0] - 1
                        )
                      }
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {currentMatchup.matchScores[selectedMatch][0]}
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() =>
                        handleAdjustScore(
                          selectedMatch,
                          0,
                          currentMatchup.matchScores[selectedMatch][0] + 1
                        )
                      }
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
                      onPress={() =>
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          currentMatchup.matchScores[selectedMatch][1] - 1
                        )
                      }
                    >
                      <Text style={styles.scoreButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.scoreDisplay}>
                      {currentMatchup.matchScores[selectedMatch][1]}
                    </Text>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() =>
                        handleAdjustScore(
                          selectedMatch,
                          1,
                          currentMatchup.matchScores[selectedMatch][1] + 1
                        )
                      }
                    >
                      <Text style={styles.scoreButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={() => {
                  if (selectedMatch !== null) {
                    handleResetMatch(selectedMatch);
                  }
                }}
              >
                <Text style={styles.resetButtonText}>Reset Match</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setAdjustModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match 2</Text>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => setAdjustModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="tune"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TeamHeader
          teams={[
            {
              name: team1?.name || "Team C",
              score: currentMatchup.teamScores[0],
            },
            {
              name: team2?.name || "Team D",
              score: currentMatchup.teamScores[1],
            },
          ]}
        />

        <FlatList
          data={matchData}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item, index }) => (
            <MatchCard
              match={item}
              matchIndex={index}
              teamScores={currentMatchup.teamScores}
              matchScore={currentMatchup.matchScores[index]}
              onScoreChange={(teamIdx, delta) =>
                handleScoreChange(index, teamIdx, delta)
              }
              isCurrent={index === currentMatchup.currentMatch}
              isCompleted={
                currentMatchup.matchScores[index][0] === item.raceTo ||
                currentMatchup.matchScores[index][1] === item.raceTo
              }
              onReset={() => handleResetMatch(index)}
              onAdjust={() => {
                setSelectedMatch(index);
                setAdjustModalVisible(true);
              }}
              playerDisplay={getPlayerNamesForMatch(index, 0)}
              matchType={getMatchType(index)}
              teamStartIndex={2} // Use teams 3 & 4 (index 2 & 3)
            />
          )}
          extraData={{
            matchScores: currentMatchup.matchScores,
            currentMatch: currentMatchup.currentMatch,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.background.modal,
    justifyContent: "center",
    alignItems: "center",
  },
  championModal: {
    backgroundColor: COLORS.glass.primary,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.glass.border,
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
  },
  modalButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  adjustModal: {
    backgroundColor: COLORS.glass.primary,
    borderRadius: BORDER_RADIUS["2xl"],
    padding: SPACING["2xl"],
    alignItems: "center",
    width: "80%",
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...GLASS_SHADOWS.heavy,
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.warning,
  },
  resetButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
});

export default MatchScreen2;
