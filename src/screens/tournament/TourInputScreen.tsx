import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const TourInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [playersPerTeam, setPlayersPerTeam] = useState("5");
  const [selectedRaceTo, setSelectedRaceTo] = useState("5");
  const [players, setPlayers] = useState("");
  const [manager, setManager] = useState("");
  const [captain, setCaptain] = useState("");

  const raceToOptions = ["3", "4", "5", "6", "7", "9"];

  return (
    <ScrollView style={styles.container}>
      

      <View style={styles.contentTitle}>
        <Text style={styles.title}>Tour Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Information</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Team Name:</Text>
          <TextInput
            style={styles.textInput}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Players per team:</Text>
          <TextInput
            style={styles.textInput}
            value={playersPerTeam}
            onChangeText={setPlayersPerTeam}
            placeholder="Number of players"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Manager:</Text>
          <TextInput
            style={styles.textInput}
            value={manager}
            onChangeText={setManager}
            placeholder="Enter manager name"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Captain:</Text>
          <TextInput
            style={styles.textInput}
            value={captain}
            onChangeText={setCaptain}
            placeholder="Enter captain name"
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Players:</Text>
          <TextInput
            style={styles.multilineInput}
            value={players}
            onChangeText={setPlayers}
            placeholder="Enter player names, comma separated (up to 8 players)"
            multiline={true}
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournament Format</Text>
        <View style={styles.buttonGroup}>
          <Text style={styles.buttonLabel}>Race to:</Text>
          <View style={styles.buttonContainer}>
            {raceToOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.choiceButton,
                  selectedRaceTo === option && styles.selectedButton,
                ]}
                onPress={() => setSelectedRaceTo(option)}
              >
                <Text
                  style={[
                    styles.choiceButtonText,
                    selectedRaceTo === option && styles.selectedButtonText,
                  ]}
                >
                  Race to {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Types</Text>
        <Text style={styles.sectionText}>
          • Team Match (5 on 5){"\n"}• Doubles Match (2 on 2){"\n"}• Singles
          Match (1 on 1){"\n"}• Captain's Pick (1 on 1)
        </Text>
      </View>

      <TouchableOpacity
        style={styles.rulesButton}
        onPress={() => setRulesModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="book-open-variant"
          size={24}
          color={COLORS.white}
        />
        <Text style={styles.rulesButtonText}>Owen's Rules</Text>
      </TouchableOpacity>

      {/* Tournament Rules Modal */}
      <Modal
        visible={rulesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRulesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tournament Rules</Text>
              <TouchableOpacity
                onPress={() => setRulesModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rulesContent}>
              <Text style={styles.rulesText}>
                <Text style={styles.rulesSectionTitle}>{"\n"}</Text>•
                <Text style={styles.rulesSectionTitle}>Objective{"\n"}</Text>•
                First team to win 5 out of 9 matches wins the tournament{"\n\n"}
                <Text style={styles.rulesSectionTitle}>
                  Match Types & Format{"\n\n"}
                </Text>
                <Text style={styles.rulesSubTitle}>
                  Match 1: 1st Team's Match{"\n"}
                </Text>
                • Format: 5 vs 5 (all players from each team){"\n"}• How it
                works: Each player plays a single game against a player from the
                other team{"\n"}• Scoring: The team that wins 5 games first
                (Race to 5) wins the match point{"\n"}• Note: Each individual
                game is just one rack, not a race{"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 2: 1st Doubles{"\n"}
                </Text>
                • Format: 2 vs 2 (pairs from each team){"\n"}• How it works:
                Players alternate shots{"\n"}• Race: First team to win 5 racks
                (Race to 5){"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 3: 1st Singles{"\n"}
                </Text>
                • Format: 1 on 1{"\n"}• Race: First player to win 5 racks (Race
                to 5){"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 4: 2nd Doubles{"\n"}
                </Text>
                • Format: 2 new players per team{"\n"}• Race: First team to win
                4 racks (Race to 4){"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 5: 2nd Singles{"\n"}
                </Text>
                • Refer to Match 3 for rules{"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 6: 2nd Team's Match (if necessary){"\n"}
                </Text>
                • Refer to Match 1 for rules{"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 7: 3rd Doubles (if necessary){"\n"}
                </Text>
                • Refer to Match 2 for rules{"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 8: 3rd Singles (if necessary){"\n"}
                </Text>
                • Refer to Match 3 for rules{"\n\n"}
                <Text style={styles.rulesSubTitle}>
                  Match 9: 4th Singles [Captain's Pick Singles](if necessary)
                  {"\n"}
                </Text>
                • Format: Each captain selects a player for a 1 on 1 match{"\n"}
                • Race: First player to win 5 racks (Race to 5) or according to
                rules set by the Captain's{"\n\n"}
                <Text style={styles.rulesSectionTitle}>
                  Scoring & Progression{"\n"}
                </Text>
                • Each match win = 1 point for the team{"\n"}• First team to 5
                points wins the tournament
              </Text>
            </ScrollView>

            {/* Fixed Footer Section */}
            <View style={styles.modalFooter}>
              <View style={styles.footerDivider} />
              <Text style={styles.footerTitle}>
                Mosconi Cup style, tournament inspired rules.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    paddingTop: SPACING.xl, // Add padding to prevent overflow
  },

  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.sm,
  },
  homeButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  title: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  contentTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm, // Add top margin to move title down
    paddingHorizontal: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  multilineInput: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    height: 100, // Set to approximately 100px height
    textAlignVertical: "top", // Align text to top for better UX
  },
  buttonGroup: {
    marginBottom: SPACING.sm,
  },
  buttonLabel: {
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: SPACING.xs,
  },
  choiceButton: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm, // Increased padding
    paddingHorizontal: SPACING.md, // Increased padding
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    marginHorizontal: SPACING.xs, // Add some horizontal margin
    marginBottom: SPACING.xs, // Add some vertical margin
  },
  choiceButtonText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedButtonText: {
    color: COLORS.white,
  },
  rulesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    alignSelf: "center", // Center the button
    width: "60%", // Set width to 60%
  },
  rulesButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 15,
    padding: SPACING.lg,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  rulesContent: {
    maxHeight: "70%",
  },
  rulesText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  rulesSectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  rulesSubTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  modalFooter: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginBottom: SPACING.sm,
  },
  footerTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default TourInputScreen;
