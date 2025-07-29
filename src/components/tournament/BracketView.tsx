import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

interface BracketViewProps {
  onMatchSelect: (matchNumber: number) => void;
}

const BracketView: React.FC<BracketViewProps> = ({ onMatchSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.semiFinals}>
        <Text style={styles.roundTitle}>Semi-Finals</Text>

        <TouchableOpacity
          style={styles.matchCard}
          onPress={() => onMatchSelect(1)}
        >
          <Text style={styles.matchTitle}>Match 1</Text>
          <View style={styles.teamsContainer}>
            <Text style={styles.teamName}>Team A</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.teamName}>Team B</Text>
          </View>
          <Text style={styles.status}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.matchCard}
          onPress={() => onMatchSelect(2)}
        >
          <Text style={styles.matchTitle}>Match 2</Text>
          <View style={styles.teamsContainer}>
            <Text style={styles.teamName}>Team C</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.teamName}>Team D</Text>
          </View>
          <Text style={styles.status}>Active</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.final}>
        <Text style={styles.roundTitle}>Final</Text>
        <View style={styles.finalCard}>
          <Text style={styles.matchTitle}>Championship</Text>
          <Text style={styles.placeholder}>
            Winner Match 1 vs Winner Match 2
          </Text>
          <Text style={styles.status}>Pending</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  semiFinals: {
    marginBottom: SPACING.xl,
  },
  roundTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  matchCard: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  matchTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
  },
  vs: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    fontWeight: FONTS.weight.medium,
  },
  status: {
    fontSize: FONTS.size.sm,
    color: COLORS.secondary,
    fontWeight: FONTS.weight.medium,
  },
  final: {
    marginTop: SPACING.md,
  },
  finalCard: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  placeholder: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    fontStyle: "italic",
    marginBottom: SPACING.sm,
  },
});

export default BracketView;
