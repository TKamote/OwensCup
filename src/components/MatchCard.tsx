import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface MatchCardProps {
  match: {
    number: number;
    type: string;
    raceTo: number;
    players: string;
  };
  teamScores: [number, number];
  matchScore: [number, number];
  onScoreChange: (teamIdx: 0 | 1, delta: number) => void;
  isCurrent: boolean;
  isCompleted: boolean;
}

const teamIcons = [
  { name: "fish", color: "#FF7043" }, // Pinoy Sargo
  { name: "shark", color: "#1976D2" }, // WBB (Jerome)
];

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teamScores,
  matchScore,
  onScoreChange,
  isCurrent,
  isCompleted,
}) => {
  return (
    <View
      style={[
        styles.card,
        isCurrent && styles.current,
        isCompleted && styles.completed,
      ]}
    >
      <Text style={styles.title}>
        Match {match.number}: {match.type}
      </Text>
      <Text style={styles.subtitle}>Players: {match.players}</Text>
      <Text style={styles.subtitle}>Race to {match.raceTo}</Text>
      <View style={styles.scoreRow}>
        <TouchableOpacity
          onPress={() => onScoreChange(0, 1)}
          disabled={isCompleted}
          style={styles.scoreBtn}
        >
          <MaterialCommunityIcons
            name={teamIcons[0].name}
            size={24}
            color={teamIcons[0].color}
          />
        </TouchableOpacity>
        <Text style={styles.scoreDisplay}>
          {matchScore[0]} - {matchScore[1]}
        </Text>
        <TouchableOpacity
          onPress={() => onScoreChange(1, 1)}
          disabled={isCompleted}
          style={styles.scoreBtn}
        >
          <MaterialCommunityIcons
            name={teamIcons[1].name}
            size={24}
            color={teamIcons[1].color}
          />
        </TouchableOpacity>
      </View>
      {isCompleted && <Text style={styles.completedText}>Completed</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  current: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  completed: {
    opacity: 0.6,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scoreBtn: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
  },
  scoreDisplay: {
    fontSize: 18,
    fontWeight: "bold",
  },
  completedText: {
    color: "green",
    marginTop: 8,
    fontWeight: "bold",
  },
});

export default MatchCard;
