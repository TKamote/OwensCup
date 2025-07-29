import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
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

interface Team {
  id: number;
  name: string;
  manager: string;
  captain: string;
  players: string;
  color: string;
  icon: string;
  isComplete: boolean;
}

const TournamentSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [teams, setTeams] = useState<Team[]>([
    {
      id: 1,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: "#007AFF",
      icon: "trophy",
      isComplete: false,
    },
    {
      id: 2,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: "#FF3B30",
      icon: "shield",
      isComplete: false,
    },
    {
      id: 3,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: "#34C759",
      icon: "star",
      isComplete: false,
    },
    {
      id: 4,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: "#FF9500",
      icon: "crown",
      isComplete: false,
    },
  ]);

  const [selectedRaceTo, setSelectedRaceTo] = useState("5");
  const [tournamentName, setTournamentName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const raceToOptions = ["3", "4", "5", "6", "7", "9"];

  const updateTeam = (teamId: number, field: keyof Team, value: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              [field]: value,
              isComplete: checkTeamComplete({ ...team, [field]: value }),
            }
          : team
      )
    );
  };

  const checkTeamComplete = (team: Team): boolean => {
    return !!(team.name && team.manager && team.captain && team.players);
  };

  const getCompletedTeamsCount = () => {
    return teams.filter((team) => team.isComplete).length;
  };

  const handlePreview = () => {
    const completedTeams = teams.filter((team) => team.isComplete);
    if (completedTeams.length < 4) {
      Alert.alert(
        "Incomplete Teams",
        `Please complete all 4 teams. Currently ${completedTeams.length}/4 teams are complete.`
      );
      return;
    }
    if (!tournamentName || !organizer) {
      Alert.alert(
        "Missing Information",
        "Please enter tournament name and organizer name."
      );
      return;
    }
    setPreviewModalVisible(true);
  };

  const handleConfirm = () => {
    setPreviewModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleSaveTournament = () => {
    // TODO: Save to Firebase in Phase 2
    Alert.alert(
      "Tournament Saved",
      "Tournament setup completed successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            setConfirmModalVisible(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderTeamSection = (team: Team) => (
    <View
      key={team.id}
      style={[styles.teamSection, { borderLeftColor: team.color }]}
    >
      <View style={styles.teamHeader}>
        <MaterialCommunityIcons
          name={team.icon as any}
          size={24}
          color={team.color}
        />
        <Text style={styles.teamTitle}>Team {team.id}</Text>
        {team.isComplete && (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={COLORS.success}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Team Name:</Text>
        <TextInput
          style={styles.textInput}
          value={team.name}
          onChangeText={(value) => updateTeam(team.id, "name", value)}
          placeholder="Enter team name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Manager:</Text>
        <TextInput
          style={styles.textInput}
          value={team.manager}
          onChangeText={(value) => updateTeam(team.id, "manager", value)}
          placeholder="Enter manager name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Captain:</Text>
        <TextInput
          style={styles.textInput}
          value={team.captain}
          onChangeText={(value) => updateTeam(team.id, "captain", value)}
          placeholder="Enter captain name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Players:</Text>
        <TextInput
          style={styles.multilineInput}
          value={team.players}
          onChangeText={(value) => updateTeam(team.id, "players", value)}
          placeholder="Enter player names, comma separated"
          multiline={true}
          numberOfLines={3}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament Setup</Text>
        <Text style={styles.subtitle}>Configure 4 Teams</Text>
      </View>

      {/* Tournament Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournament Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tournament Name:</Text>
          <TextInput
            style={styles.textInput}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Organizer:</Text>
          <TextInput
            style={styles.textInput}
            value={organizer}
            onChangeText={setOrganizer}
            placeholder="Enter organizer name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Race to:</Text>
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
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Teams Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teams Configuration</Text>
          <Text style={styles.progressText}>
            {getCompletedTeamsCount()}/4 Complete
          </Text>
        </View>

        {teams.map(renderTeamSection)}
      </View>

      {/* Preview Button */}
      <TouchableOpacity
        style={[
          styles.previewButton,
          (getCompletedTeamsCount() < 4 || !tournamentName || !organizer) &&
            styles.disabledButton,
        ]}
        onPress={handlePreview}
        disabled={getCompletedTeamsCount() < 4 || !tournamentName || !organizer}
      >
        <MaterialCommunityIcons name="eye" size={24} color={COLORS.white} />
        <Text style={styles.previewButtonText}>Preview Tournament</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.overviewButton}
        onPress={() => navigation.navigate("TeamOverview" as never)}
      >
        <MaterialCommunityIcons
          name="account-group"
          size={24}
          color={COLORS.white}
        />
        <Text style={styles.overviewButtonText}>View Team Overview</Text>
      </TouchableOpacity>

      {/* Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tournament Preview</Text>
              <TouchableOpacity
                onPress={() => setPreviewModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.previewContent}>
              <Text style={styles.previewSectionTitle}>
                Tournament: {tournamentName}
              </Text>
              <Text style={styles.previewSectionTitle}>
                Organizer: {organizer}
              </Text>
              <Text style={styles.previewSectionTitle}>
                Race to: {selectedRaceTo}
              </Text>

              <Text style={styles.previewSectionTitle}>Teams:</Text>
              {teams.map((team) => (
                <View key={team.id} style={styles.previewTeam}>
                  <View style={styles.previewTeamHeader}>
                    <MaterialCommunityIcons
                      name={team.icon as any}
                      size={20}
                      color={team.color}
                    />
                    <Text style={styles.previewTeamName}>{team.name}</Text>
                  </View>
                  <Text style={styles.previewTeamDetail}>
                    Manager: {team.manager}
                  </Text>
                  <Text style={styles.previewTeamDetail}>
                    Captain: {team.captain}
                  </Text>
                  <Text style={styles.previewTeamDetail}>
                    Players: {team.players}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPreviewModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={60}
              color={COLORS.success}
            />
            <Text style={styles.confirmModalTitle}>Save Tournament?</Text>
            <Text style={styles.confirmModalText}>
              This will create the tournament with the configured teams and
              settings.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveTournament}
              >
                <Text style={styles.saveButtonText}>Save Tournament</Text>
              </TouchableOpacity>
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
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  progressText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    fontWeight: FONTS.weight.medium,
  },
  teamSection: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  teamTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONTS.size.base,
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONTS.size.base,
    backgroundColor: COLORS.white,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceButtonText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    fontWeight: FONTS.weight.medium,
  },
  selectedButtonText: {
    color: COLORS.white,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.md,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[400],
  },
  previewButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  overviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.md,
  },
  overviewButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: "90%",
    maxHeight: "80%",
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  previewContent: {
    padding: SPACING.lg,
  },
  previewSectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  previewTeam: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  previewTeamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  previewTeamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  previewTeamDetail: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xl,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.white,
  },
  confirmModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    width: "80%",
    ...SHADOWS.lg,
  },
  confirmModalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  confirmModalText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  confirmModalButtons: {
    flexDirection: "row",
    width: "100%",
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.white,
  },
});

export default TournamentSetupScreen;
