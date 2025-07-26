import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const TournamentRulesScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tournament Rules</Text>
      <Text style={styles.subtitle}>
        Modified Mosconi Cup-Style 9-Ball Tournament
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        <Text style={styles.text}>• Pinoy Sargo vs WBB (Jerome)</Text>
        <Text style={styles.text}>• Each team has at least 5 players</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objective</Text>
        <Text style={styles.text}>
          • First team to win 5 out of 9 matches wins the tournament
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Types & Format</Text>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>1. 1st Team Match (Match 1 & 6)</Text>
          <Text style={styles.text}>
            • Format: 5 vs 5 (all players from each team)
          </Text>
          <Text style={styles.text}>
            • How it works: Each player from Pinoy Sargo plays a single game
            against a player from WBB (Jerome)
          </Text>
          <Text style={styles.text}>
            • Scoring: The team that wins 5 games first (Race to 5) wins the
            match point
          </Text>
          <Text style={styles.text}>
            • Note: Each individual game is just one rack, not a race
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>2. 1st Doubles (Match 2)</Text>
          <Text style={styles.text}>
            • Format: 2 vs 2 (pairs from each team)
          </Text>
          <Text style={styles.text}>
            • How it works: Players alternate shots, treated as singles match
            for scoring
          </Text>
          <Text style={styles.text}>
            • Race: First team to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>3. 1st Singles (Match 3)</Text>
          <Text style={styles.text}>• Format: 1 vs 1</Text>
          <Text style={styles.text}>
            • Race: First player to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>4. 2nd Doubles (Match 4)</Text>
          <Text style={styles.text}>
            • Format: 2 new players per team (different from Match 2)
          </Text>
          <Text style={styles.text}>
            • Race: First team to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>5. 2nd Singles (Match 5)</Text>
          <Text style={styles.text}>• Format: 1 vs 1</Text>
          <Text style={styles.text}>
            • Race: First player to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>6. 2nd Team Match (Match 6)</Text>
          <Text style={styles.text}>
            • Format: 5 vs 5 (all players from each team)
          </Text>
          <Text style={styles.text}>• Same format as Match 1</Text>
          <Text style={styles.text}>
            • Race: First team to win 5 games (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>7. 3rd Doubles (Match 7)</Text>
          <Text style={styles.text}>
            • Format: 2 vs 2 (pairs from each team)
          </Text>
          <Text style={styles.text}>
            • Race: First team to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>8. 3rd Singles (Match 8)</Text>
          <Text style={styles.text}>• Format: 1 vs 1</Text>
          <Text style={styles.text}>
            • Race: First player to win 5 racks (Race to 5)
          </Text>
        </View>

        <View style={styles.matchType}>
          <Text style={styles.matchTitle}>
            9. 4th Singles - Captain's Pick (Match 9)
          </Text>
          <Text style={styles.text}>
            • Format: Each captain selects a player for a 1v1 match
          </Text>
          <Text style={styles.text}>
            • Race: First player to win 5 racks (Race to 5)
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Progression</Text>
        <Text style={styles.text}>• Match 1: 1st Team Match (Race to 5)</Text>
        <Text style={styles.text}>• Match 2: 1st Doubles (Race to 5)</Text>
        <Text style={styles.text}>• Match 3: 1st Singles (Race to 5)</Text>
        <Text style={styles.text}>• Match 4: 2nd Doubles (Race to 5)</Text>
        <Text style={styles.text}>• Match 5: 2nd Singles (Race to 5)</Text>
        <Text style={styles.text}>• Match 6: 2nd Team Match (Race to 5)</Text>
        <Text style={styles.text}>• Match 7: 3rd Doubles (Race to 5)</Text>
        <Text style={styles.text}>• Match 8: 3rd Singles (Race to 5)</Text>
        <Text style={styles.text}>
          • Match 9: 4th Singles - Captain's Pick (Race to 5)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scoring & Progression</Text>
        <Text style={styles.text}>• Each match win = 1 point for the team</Text>
        <Text style={styles.text}>
          • First team to 5 points wins the tournament
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organizer</Text>
        <Text style={styles.text}>• Hosted by Owen</Text>
        <Text style={styles.text}>• Date: 25 Jul 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },
  matchType: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default TournamentRulesScreen;
