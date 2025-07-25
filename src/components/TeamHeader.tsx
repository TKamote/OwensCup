import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TeamHeaderProps {
  teams: { name: string; score: number }[];
}

const iconMap: Record<string, { name: string; color: string }> = {
  "Pinoy Sargo": { name: "fish", color: "#FF7043" }, // orange for salmon
  "WBB (Jerome)": { name: "shark", color: "#1976D2" }, // blue for tuna/shark
};

const TeamHeader: React.FC<TeamHeaderProps> = ({ teams }) => {
  return (
    <View style={styles.container}>
      <View style={styles.teamBlock}>
        <MaterialCommunityIcons
          name={iconMap[teams[0].name]?.name || "account"}
          size={32}
          color={iconMap[teams[0].name]?.color || "#888"}
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
          size={32}
          color={iconMap[teams[1].name]?.color || "#888"}
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
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  teamBlock: {
    alignItems: "center",
    flex: 2,
  },
  logo: {
    marginBottom: 2,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  scoreBlock: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginHorizontal: 8,
    minWidth: 32,
    textAlign: "center",
  },
  vs: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginHorizontal: 2,
  },
});

export default TeamHeader;
