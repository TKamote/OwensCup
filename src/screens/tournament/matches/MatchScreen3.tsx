import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTournament } from "../../../context/TournamentContext";
import { COLORS } from "../../../constants/theme";
import MatchCard from "../../../components/tournament/MatchCard";
import TeamHeader from "../../../components/tournament/TeamHeader";
import { matches as matchData } from "../../../utils/tournamentData";

const MatchScreen3 = () => {
  const { tournamentState, updateMatchScore, resetMatch, resetAllScores } =
    useTournament();
  const [modalVisible, setModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [scoreAdjustModalVisible, setScoreAdjustModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const handleDirectScoreChange = (
    matchIndex: number,
    teamIdx: 0 | 1,
    newScore: number
  ) => {
    const currentScore = tournamentState.matchScores[matchIndex][teamIdx];
    const delta = newScore - currentScore;
    updateMatchScore(matchIndex, teamIdx, delta);
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

  const handleResetAll = () => {
    Alert.alert(
      "Reset all scoring to 0?",
      "This will reset all match scores and overall scores to zero.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: resetAllScores },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Final Match</Text>
        <Text style={styles.subtitle}>Winner Match 1 vs Winner Match 2</Text>
      </View>

      {/* Overall Score Section */}
      <View style={styles.overallSection}>
        <View style={styles.overallHeader}>
          <Text style={styles.overallTitle}>OVERALL SCORE</Text>
          <TouchableOpacity onPress={handleResetAll} style={styles.resetButton}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.overallScores}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>Winner Match 1</Text>
            <Text style={styles.score}>{tournamentState.teamScores[0]}</Text>
          </View>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>Winner Match 2</Text>
            <Text style={styles.score}>{tournamentState.teamScores[1]}</Text>
          </View>
        </View>
      </View>

      <TeamHeader
        teams={[
          { name: "Winner Match 1", score: tournamentState.teamScores[0] },
          { name: "Winner Match 2", score: tournamentState.teamScores[1] },
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
            matchIndex={2}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 5,
  },
  overallSection: {
    backgroundColor: COLORS.background.secondary,
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background.primary,
    borderRadius: 6,
  },
  resetButtonText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontWeight: "500",
  },
  overallScores: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  teamScore: {
    alignItems: "center",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
    marginBottom: 5,
  },
  score: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  matchesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 15,
  },
});

export default MatchScreen3;
