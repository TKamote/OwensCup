import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../../constants/theme";

interface TeamHeaderProps {
  teams: { name: string; score: number }[];
}

const iconMap: Record<
  string,
  { name: "billiards" | "triangle-outline" | "account"; color: string }
> = {
  "Pinoy Sargo": { name: "billiards", color: COLORS.team1 },
  "WBB (Jerome)": { name: "triangle-outline", color: "#8B4513" }, // Wood/brown color
};

const TeamHeader: React.FC<TeamHeaderProps> = ({ teams }) => {
  return (
    <View style={styles.container}>
      <View style={styles.teamBlock}>
        <MaterialCommunityIcons
          name={iconMap[teams[0].name]?.name || "account"}
          size={32}
          color={iconMap[teams[0].name]?.color || COLORS.gray[500]}
          style={styles.logo}
        />
        <Text style={styles.name}>{teams[0].name}</Text>
      </View>
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{teams[0].score}</Text>
        <Text style={styles.vs}>-</Text>
        <Text style={styles.score}>{teams[1].score}</Text>
      </View>
      <View style={styles.teamBlock}>
        <MaterialCommunityIcons
          name={iconMap[teams[1].name]?.name || "account"}
          size={40}
          color={iconMap[teams[1].name]?.color || COLORS.gray[500]}
          style={styles.logo}
        />
        <Text style={styles.name}>{teams[1].name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  teamBlock: {
    alignItems: "center",
    flex: 2,
  },
  logo: {
    marginBottom: SPACING.xs,
  },
  name: {
    fontWeight: FONTS.weight.bold,
    fontSize: FONTS.size.base,
    textAlign: "center",
  },
  scoreBlock: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginHorizontal: SPACING.md,
    minWidth: 32,
    textAlign: "center",
  },
  vs: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginHorizontal: SPACING.xs,
  },
});

export default TeamHeader;
