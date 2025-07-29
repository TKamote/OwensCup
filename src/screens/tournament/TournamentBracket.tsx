import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTournament } from "../../context/TournamentContext";
import { teams as teamData } from "../../utils/tournamentData";

const TournamentBracket = () => {
  const navigation = useNavigation();
  const { tournamentState } = useTournament();

  const handleMatchSelect = (matchNumber: number) => {
    if (matchNumber === 1) {
      navigation.navigate("Match 1" as never);
    } else if (matchNumber === 2) {
      navigation.navigate("Match 2" as never);
    } else if (matchNumber === 3) {
      navigation.navigate("Match 3" as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament Dashboard</Text>
        <Text style={styles.subtitle}>PBS Cup Aug 2025</Text>
      </View>

      <View style={styles.bracketContainer}>
        <View style={styles.semiFinals}>
          <Text style={styles.roundTitle}>Semi-Finals</Text>

          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => handleMatchSelect(1)}
          >
            <Text style={styles.matchTitle}>Match 1</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>{teamData[0].name}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>{teamData[1].name}</Text>
            </View>
            <Text style={styles.status}>Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => handleMatchSelect(2)}
          >
            <Text style={styles.matchTitle}>Match 2</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>{teamData[2].name}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName}>{teamData[3].name}</Text>
            </View>
            <Text style={styles.status}>Active</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.final}>
          <Text style={styles.roundTitle}>Final</Text>
          <TouchableOpacity
            style={styles.finalCard}
            onPress={() => handleMatchSelect(3)}
          >
            <Text style={styles.matchTitle}>Championship</Text>
            <Text style={styles.placeholder}>
              Winner Match 1 vs Winner Match 2
            </Text>
            <Text style={styles.status}>Pending</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  bracketContainer: {
    flex: 1,
    padding: 20,
  },
  semiFinals: {
    marginBottom: 30,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  matchCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  vs: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  status: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  final: {
    marginTop: 20,
  },
  finalCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholder: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
});

export default TournamentBracket;
