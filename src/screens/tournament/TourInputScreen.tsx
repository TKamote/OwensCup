import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { useTournament } from "../../context/TournamentContext";

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

interface ConfirmedTeam {
  id: number;
  name: string;
  manager: string;
  captain: string;
  players: string;
  color: string;
  icon: string;
}

const TourInputScreen: React.FC = () => {
  const { setConfirmedTeams, setTournamentInfo } = useTournament();

  // Tournament info state
  const [tournamentName, setTournamentName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [raceToScore, setRaceToScore] = useState("5");
  const [showTournamentInfo, setShowTournamentInfo] = useState(false);

  // Current team being configured
  const [currentTeam, setCurrentTeam] = useState<Team>({
    id: 1,
    name: "",
    manager: "",
    captain: "",
    players: "",
    color: "#007AFF",
    icon: "trophy",
    isComplete: false,
  });

  // Confirmed teams
  const [localConfirmedTeams, setLocalConfirmedTeams] = useState<
    ConfirmedTeam[]
  >([]);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  // Modal states
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const iconOptions = [
    "trophy",
    "shield",
    "star",
    "crown",
    "medal",
    "flag",
    "target",
    "fire",
  ];
  const colorOptions = [
    "#007AFF",
    "#FF3B30",
    "#34C759",
    "#FF9500",
    "#AF52DE",
    "#FF2D92",
    "#5856D6",
    "#FF6B35",
  ];

  // Get used colors and icons (exclude the team being edited)
  const usedColors = localConfirmedTeams
    .filter((team) => !isEditing || team.id !== editingTeamId)
    .map((team) => team.color);
  const usedIcons = localConfirmedTeams
    .filter((team) => !isEditing || team.id !== editingTeamId)
    .map((team) => team.icon);

  const updateCurrentTeam = (field: keyof Team, value: string) => {
    setCurrentTeam((prev) => ({ ...prev, [field]: value }));
  };

  const updateTeamColor = (color: string) => {
    setCurrentTeam((prev) => ({ ...prev, color }));
  };

  const updateTeamIcon = (icon: string) => {
    setCurrentTeam((prev) => ({ ...prev, icon }));
  };

  const validateTeam = (team: Team): boolean => {
    if (
      !team.name.trim() ||
      !team.manager.trim() ||
      !team.captain.trim() ||
      !team.players.trim()
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return false;
    }

    const playerCount = team.players
      .split(",")
      .filter((player) => player.trim()).length;
    if (playerCount < 5) {
      Alert.alert("Invalid Player Count", "Please enter at least 5 players.");
      return false;
    }

    if (playerCount > 7) {
      Alert.alert(
        "Invalid Player Count",
        "Maximum 7 players allowed (5 main + 2 alternates)."
      );
      return false;
    }

    return true;
  };

  const addCurrentTeam = () => {
    if (!validateTeam(currentTeam)) {
      return;
    }

    // Check for conflicts only if not editing or if color/icon changed
    if (
      !isEditing ||
      (isEditing &&
        currentTeam.color !==
          localConfirmedTeams.find((t) => t.id === editingTeamId)?.color)
    ) {
      if (usedColors.includes(currentTeam.color)) {
        Alert.alert(
          "Color Already Used",
          "This color is already taken by another team."
        );
        return;
      }
    }

    if (
      !isEditing ||
      (isEditing &&
        currentTeam.icon !==
          localConfirmedTeams.find((t) => t.id === editingTeamId)?.icon)
    ) {
      if (usedIcons.includes(currentTeam.icon)) {
        Alert.alert(
          "Icon Already Used",
          "This icon is already taken by another team."
        );
        return;
      }
    }

    const newConfirmedTeam: ConfirmedTeam = {
      id: currentTeam.id,
      name: currentTeam.name,
      manager: currentTeam.manager,
      captain: currentTeam.captain,
      players: currentTeam.players,
      color: currentTeam.color,
      icon: currentTeam.icon,
    };

    if (isEditing) {
      // Update existing team
      setLocalConfirmedTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeamId ? newConfirmedTeam : team
        )
      );
      setIsEditing(false);
      setEditingTeamId(null);
      Alert.alert("Team Updated", `Team ${currentTeam.name} has been updated!`);
    } else {
      // Add new team
      setLocalConfirmedTeams((prev) => [...prev, newConfirmedTeam]);

      // Show tournament info after first team
      if (localConfirmedTeams.length === 0) {
        setShowTournamentInfo(true);
      }

      Alert.alert("Team Added", `Team ${currentTeam.name} has been added!`);
    }

    // Reset for next team
    const nextTeamId = isEditing
      ? Math.max(...localConfirmedTeams.map((t) => t.id)) + 1
      : currentTeam.id + 1;
    setCurrentTeam({
      id: nextTeamId,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: getNextAvailableColor(),
      icon: getNextAvailableIcon(),
      isComplete: false,
    });
  };

  const getNextAvailableColor = (): string => {
    const availableColors = colorOptions.filter(
      (color) => !usedColors.includes(color)
    );
    return availableColors.length > 0 ? availableColors[0] : colorOptions[0];
  };

  const getNextAvailableIcon = (): string => {
    const availableIcons = iconOptions.filter(
      (icon) => !usedIcons.includes(icon)
    );
    return availableIcons.length > 0 ? availableIcons[0] : iconOptions[0];
  };

  const editConfirmedTeam = (teamId: number) => {
    // Prevent editing if already editing another team
    if (isEditing) {
      Alert.alert(
        "Already Editing",
        "Please finish editing the current team first."
      );
      return;
    }

    const team = localConfirmedTeams.find((t) => t.id === teamId);
    if (team) {
      setCurrentTeam({
        ...team,
        isComplete: true,
      });
      setIsEditing(true);
      setEditingTeamId(teamId);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTeamId(null);

    // Reset to next available team
    const nextTeamId = Math.max(...localConfirmedTeams.map((t) => t.id)) + 1;
    setCurrentTeam({
      id: nextTeamId,
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: getNextAvailableColor(),
      icon: getNextAvailableIcon(),
      isComplete: false,
    });
  };

  const finalizeTeams = () => {
    if (localConfirmedTeams.length !== 4) {
      Alert.alert(
        "Incomplete Teams",
        "Please add all 4 teams before finalizing."
      );
      return;
    }

    if (!tournamentName.trim() || !organizer.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter tournament name and organizer."
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    // Save to context
    setConfirmedTeams(localConfirmedTeams);
    setTournamentInfo(tournamentName, organizer, raceToScore);
    Alert.alert(
      "Tournament Setup Complete",
      "Teams have been finalized! Tournament is ready to begin."
    );
  };

  const renderCurrentTeamInput = () => (
    <View style={styles.teamInputContainer}>
      <View style={styles.teamHeader}>
        <View style={[styles.teamIcon, { backgroundColor: currentTeam.color }]}>
          <MaterialCommunityIcons
            name={currentTeam.icon as any}
            size={24}
            color="white"
          />
        </View>
        <Text style={styles.teamTitle}>Team {currentTeam.id}</Text>
      </View>

      <Text style={styles.inputLabel}>Team Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter team name"
        value={currentTeam.name}
        onChangeText={(text) => updateCurrentTeam("name", text)}
      />

      <Text style={styles.inputLabel}>Manager Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter manager name"
        value={currentTeam.manager}
        onChangeText={(text) => updateCurrentTeam("manager", text)}
      />

      <Text style={styles.inputLabel}>Captain Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter captain name"
        value={currentTeam.captain}
        onChangeText={(text) => updateCurrentTeam("captain", text)}
      />

      <Text style={styles.inputLabel}>Players (minimum 5, maximum 7) *</Text>
      <TextInput
        style={[styles.input, styles.playersInput]}
        placeholder="Enter player names separated by commas"
        value={currentTeam.players}
        onChangeText={(text) => updateCurrentTeam("players", text)}
        multiline
        numberOfLines={3}
      />

      <View style={styles.colorIconSection}>
        <Text style={styles.sectionLabel}>Team Color:</Text>
        <View style={styles.colorOptions}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                currentTeam.color === color && styles.selectedColor,
                usedColors.includes(color) && styles.disabledColor,
              ]}
              onPress={() => updateTeamColor(color)}
              disabled={usedColors.includes(color)}
            />
          ))}
        </View>
      </View>

      <View style={styles.colorIconSection}>
        <Text style={styles.sectionLabel}>Team Icon:</Text>
        <View style={styles.iconOptions}>
          {iconOptions.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                currentTeam.icon === icon && styles.selectedIcon,
                usedIcons.includes(icon) && styles.disabledIcon,
              ]}
              onPress={() => updateTeamIcon(icon)}
              disabled={usedIcons.includes(icon)}
            >
              <MaterialCommunityIcons
                name={icon as any}
                size={20}
                color={
                  currentTeam.icon === icon
                    ? "white"
                    : usedIcons.includes(icon)
                    ? COLORS.gray[400]
                    : COLORS.text.primary
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addTeamButton} onPress={addCurrentTeam}>
          <Text style={styles.addTeamButtonText}>
            {isEditing ? "Update Team" : `Add Team ${currentTeam.id}`}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTournamentInfoCard = () => (
    <View style={styles.tournamentInfoCard}>
      <Text style={styles.cardTitle}>Tournament Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Tournament Name"
        value={tournamentName}
        onChangeText={setTournamentName}
      />
      <TextInput
        style={styles.input}
        placeholder="Organizer Name"
        value={organizer}
        onChangeText={setOrganizer}
      />
      <TextInput
        style={styles.input}
        placeholder="Race to Score (default: 5)"
        value={raceToScore}
        onChangeText={setRaceToScore}
        keyboardType="numeric"
      />
    </View>
  );

  const renderConfirmedTeamCard = (team: ConfirmedTeam) => (
    <View key={team.id} style={styles.confirmedTeamCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: team.color }]}>
          <MaterialCommunityIcons
            name={team.icon as any}
            size={20}
            color="white"
          />
        </View>
        <Text style={styles.cardTeamName}>{team.name}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editConfirmedTeam(team.id)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.cardDetailText}>Manager: {team.manager}</Text>
        <Text style={styles.cardDetailText}>Captain: {team.captain}</Text>
        <Text style={styles.cardDetailText}>Players: {team.players}</Text>
      </View>
    </View>
  );

  const renderAlternateTeamCard = (team: ConfirmedTeam) => (
    <View key={team.id} style={styles.alternateTeamCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: team.color }]}>
          <MaterialCommunityIcons
            name={team.icon as any}
            size={20}
            color="white"
          />
        </View>
        <Text style={styles.cardTeamName}>{team.name}</Text>
        <View style={styles.alternateBadge}>
          <Text style={styles.alternateBadgeText}>ALT</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editConfirmedTeam(team.id)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.cardDetailText}>Manager: {team.manager}</Text>
        <Text style={styles.cardDetailText}>Captain: {team.captain}</Text>
        <Text style={styles.cardDetailText}>Players: {team.players}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament Setup</Text>
        <TouchableOpacity
          style={styles.rulesButton}
          onPress={() => setShowRulesModal(true)}
        >
          <MaterialCommunityIcons
            name="book-open-variant"
            size={20}
            color="white"
          />
          <Text style={styles.rulesButtonText}>Owen's Rules</Text>
        </TouchableOpacity>
      </View>

      {/* Current Team Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isEditing
            ? `Edit Team ${editingTeamId}`
            : `Add Team ${currentTeam.id}`}
        </Text>
        {renderCurrentTeamInput()}
      </View>

      {/* Tournament Info Card - Show after first team */}
      {showTournamentInfo && (
        <View style={styles.section}>{renderTournamentInfoCard()}</View>
      )}

      {/* Confirmed Teams */}
      {localConfirmedTeams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Confirmed Teams ({localConfirmedTeams.length})
          </Text>

          {/* Main Tournament Teams (First 4) */}
          {localConfirmedTeams.slice(0, 4).map(renderConfirmedTeamCard)}

          {/* Finalize button appears after 4th team */}
          {localConfirmedTeams.length >= 4 && (
            <TouchableOpacity
              style={styles.finalizeButton}
              onPress={finalizeTeams}
            >
              <Text style={styles.finalizeButtonText}>
                Finalize Tournament Teams
              </Text>
            </TouchableOpacity>
          )}

          {/* Alternate Teams (5+) */}
          {localConfirmedTeams.length > 4 && (
            <View style={styles.alternatesSection}>
              <Text style={styles.alternatesTitle}>Alternate Teams</Text>
              {localConfirmedTeams.slice(4).map(renderAlternateTeamCard)}
            </View>
          )}
        </View>
      )}

      {/* Owen's Rules Modal */}
      <Modal
        visible={showRulesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRulesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Tournament Rules</Text>
                <Text style={styles.modalSubtitle}>
                  Mosconi Cup style, tournament inspired rules.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRulesModal(false)}
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
                <Text style={styles.rulesBold}>Objective{"\n"}</Text>
                First team to win 5 out of 9 matches wins the tournament.
                {"\n\n"}
                <Text style={styles.rulesBold}>Match Types & Format{"\n"}</Text>
                <Text style={styles.rulesBold}>
                  Match 1: 1st Team's Match{"\n"}
                </Text>
                • Format: 5 vs 5 (all players from each team){"\n"}• How it
                works: Each player plays a single game against a player from the
                other team{"\n"}• Scoring: The team that wins 5 games first
                (Race to 5) wins the match point{"\n"}• Note: Each individual
                game is just one rack, not a race{"\n\n"}
                <Text style={styles.rulesBold}>Match 2: 1st Doubles{"\n"}</Text>
                • Format: 2 vs 2 (pairs from each team){"\n"}• How it works:
                Players alternate shots{"\n"}• Scoring: Race to 5 games{"\n\n"}
                <Text style={styles.rulesBold}>Match 3: 1st Singles{"\n"}</Text>
                • Format: 1 vs 1 (best players from each team){"\n"}• How it
                works: Individual competition{"\n"}• Scoring: Race to 5 games
                {"\n\n"}
                <Text style={styles.rulesBold}>Match 4: 2nd Doubles{"\n"}</Text>
                • Format: 2 vs 2 (different pairs){"\n"}• Scoring: Race to 5
                games{"\n\n"}
                <Text style={styles.rulesBold}>Match 5: 2nd Singles{"\n"}</Text>
                • Format: 1 vs 1 (second best players){"\n"}• Scoring: Race to 5
                games{"\n\n"}
                <Text style={styles.rulesBold}>Match 6: Teams{"\n"}</Text>•
                Format: 3 vs 3 (remaining players){"\n"}• Scoring: Race to 5
                games{"\n\n"}
                <Text style={styles.rulesBold}>Match 7: 3rd Singles{"\n"}</Text>
                • Format: 1 vs 1 (third best players){"\n"}• Scoring: Race to 5
                games{"\n\n"}
                <Text style={styles.rulesBold}>Match 8: 3rd Doubles{"\n"}</Text>
                • Format: 2 vs 2 (remaining pairs){"\n"}• Scoring: Race to 5
                games{"\n\n"}
                <Text style={styles.rulesBold}>
                  Match 9: 4th Singles (Captain's Match){"\n"}
                </Text>
                • Format: 1 vs 1 (team captains){"\n"}• Scoring: Race to 5 games
                {"\n\n"}
                <Text style={styles.rulesBold}>Tournament Scoring{"\n"}</Text>•
                Each match win = 1 point for the team{"\n"}• First team to 5
                points wins the tournament
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Tournament Setup</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.confirmContent}>
              <Text style={styles.confirmText}>
                Are you sure you want to finalize the tournament setup? This
                action cannot be undone.
              </Text>

              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmFinalButton}
                  onPress={handleFinalConfirm}
                >
                  <Text style={styles.confirmFinalButtonText}>Finalize</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  rulesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
  },
  rulesButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  teamInputContainer: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  tournamentInfoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  teamTitle: {
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  inputLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    fontSize: FONTS.size.base,
    backgroundColor: COLORS.white,
  },
  playersInput: {
    height: 80,
    textAlignVertical: "top",
  },
  colorIconSection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
  },
  selectedColor: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  disabledColor: {
    opacity: 0.3,
    borderColor: COLORS.gray[400],
  },
  iconOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  selectedIcon: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledIcon: {
    opacity: 0.3,
    borderColor: COLORS.gray[400],
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  addTeamButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  addTeamButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
  },
  confirmedTeamCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  alternateTeamCard: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    ...SHADOWS.sm,
  },
  alternateBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  alternateBadgeText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  cardTeamName: {
    flex: 1,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  editButton: {
    padding: SPACING.xs,
  },
  cardDetails: {
    marginTop: SPACING.xs,
  },
  cardDetailText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  finalizeButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  finalizeButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
  },
  alternatesSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  alternatesTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
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
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  modalSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  rulesContent: {
    maxHeight: "70%",
    paddingHorizontal: SPACING.lg,
  },
  rulesText: {
    fontSize: FONTS.size.base,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
  rulesBold: {
    fontWeight: FONTS.weight.bold,
  },
  confirmContent: {
    padding: SPACING.lg,
  },
  confirmText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.medium,
  },
  confirmFinalButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  confirmFinalButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
  },
});

export default TourInputScreen;
