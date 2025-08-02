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
  const {
    tournamentState,
    setConfirmedTeams,
    setTournamentInfo,
    resetAllScores,
  } = useTournament();
  const { confirmedTeams, tournamentName, organizer, raceToScore } =
    tournamentState;
  const [showTournamentInfo, setShowTournamentInfo] = useState(false);

  // Current team being configured - ID should be based on confirmed teams count
  const [currentTeam, setCurrentTeam] = useState<Team>({
    id: Date.now(), // Use timestamp for unique ID
    name: "",
    manager: "",
    captain: "",
    players: "",
    color: "#007AFF",
    icon: "trophy",
    isComplete: false,
  });

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  // Modal states
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Update currentTeam when confirmedTeams changes (for new teams only)
  React.useEffect(() => {
    if (!isEditing) {
      setCurrentTeam((prev) => ({
        ...prev,
        id: Date.now(), // Use timestamp for unique ID
        color: getNextAvailableColor(), // Get next available color
        icon: getNextAvailableIcon(), // Get next available icon
      }));
    }
  }, [confirmedTeams.length, isEditing]);

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
  const usedColors = confirmedTeams
    .filter((team) => !isEditing || team.id !== editingTeamId)
    .map((team) => team.color);
  const usedIcons = confirmedTeams
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
    // Prevent adding teams if tournament has started
    if (isTournamentStarted()) {
      Alert.alert(
        "Tournament Locked",
        "Cannot add teams once the tournament has started. Team data is locked for data integrity."
      );
      return;
    }

    if (!validateTeam(currentTeam)) {
      return;
    }

    // Check for conflicts only if not editing or if color/icon changed
    if (
      !isEditing ||
      (isEditing &&
        currentTeam.color !==
          confirmedTeams.find((t) => t.id === editingTeamId)?.color)
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
          confirmedTeams.find((t) => t.id === editingTeamId)?.icon)
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
      id: isEditing ? editingTeamId! : Date.now(), // Use timestamp for new teams
      name: currentTeam.name,
      manager: currentTeam.manager,
      captain: currentTeam.captain,
      players: currentTeam.players,
      color: currentTeam.color,
      icon: currentTeam.icon,
    };

    if (isEditing) {
      // Update existing team
      console.log("Updating team with ID:", editingTeamId);
      console.log("Teams before update:", confirmedTeams);

      const updatedTeams = confirmedTeams.map((team) =>
        team.id === editingTeamId ? newConfirmedTeam : team
      );

      console.log("Teams after update:", updatedTeams);
      setConfirmedTeams(updatedTeams);
      setIsEditing(false);
      setEditingTeamId(null);
      Alert.alert("Team Updated", `Team ${currentTeam.name} has been updated!`);
    } else {
      // Add new team
      const newTeams = [...confirmedTeams, newConfirmedTeam];
      setConfirmedTeams(newTeams);

      // Show tournament info after first team
      if (confirmedTeams.length === 0) {
        setShowTournamentInfo(true);
      }

      Alert.alert("Team Added", `Team ${currentTeam.name} has been added!`);
    }

    // Reset for next team
    resetCurrentTeam();
  };

  const getNextAvailableColor = (): string => {
    const availableColors = colorOptions.filter(
      (color) => !usedColors.includes(color)
    );
    console.log("Used colors:", usedColors);
    console.log("Available colors:", availableColors);
    return availableColors.length > 0 ? availableColors[0] : colorOptions[0];
  };

  const getNextAvailableIcon = (): string => {
    const availableIcons = iconOptions.filter(
      (icon) => !usedIcons.includes(icon)
    );
    console.log("Used icons:", usedIcons);
    console.log("Available icons:", availableIcons);
    return availableIcons.length > 0 ? availableIcons[0] : iconOptions[0];
  };

  // Check if any matches are completed (tournament has started)
  const isTournamentStarted = () => {
    const hasWinners =
      tournamentState.semiFinal1.winner ||
      tournamentState.semiFinal2.winner ||
      tournamentState.final.winner;
    const hasScores =
      tournamentState.semiFinal1.teamScores[0] > 0 ||
      tournamentState.semiFinal1.teamScores[1] > 0 ||
      tournamentState.semiFinal2.teamScores[0] > 0 ||
      tournamentState.semiFinal2.teamScores[1] > 0 ||
      tournamentState.final.teamScores[0] > 0 ||
      tournamentState.final.teamScores[1] > 0;

    console.log("Tournament lock check:");
    console.log("- Winners:", {
      sf1: tournamentState.semiFinal1.winner,
      sf2: tournamentState.semiFinal2.winner,
      final: tournamentState.final.winner,
    });
    console.log("- Scores:", {
      sf1: tournamentState.semiFinal1.teamScores,
      sf2: tournamentState.semiFinal2.teamScores,
      final: tournamentState.final.teamScores,
    });
    console.log("- Has winners:", hasWinners);
    console.log("- Has scores:", hasScores);
    console.log("- Tournament locked:", hasWinners || hasScores);

    return hasWinners || hasScores;
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

    // Prevent editing if tournament has started
    if (isTournamentStarted()) {
      Alert.alert(
        "Tournament Locked",
        "Cannot edit teams once the tournament has started. Team data is locked for data integrity."
      );
      return;
    }

    console.log("Editing team with ID:", teamId);
    console.log("All confirmed teams:", confirmedTeams);

    const team = confirmedTeams.find((t) => t.id === teamId);
    console.log("Found team:", team);

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

    // Reset the form
    resetCurrentTeam();
  };

  const resetCurrentTeam = () => {
    setCurrentTeam({
      id: Date.now(), // Always use timestamp for unique ID
      name: "",
      manager: "",
      captain: "",
      players: "",
      color: getNextAvailableColor(),
      icon: getNextAvailableIcon(),
      isComplete: false,
    });
  };

  const deleteConfirmedTeam = (teamId: number) => {
    // Prevent deleting if tournament has started
    if (isTournamentStarted()) {
      Alert.alert(
        "Tournament Locked",
        "Cannot delete teams once the tournament has started. Team data is locked for data integrity."
      );
      return;
    }

    Alert.alert(
      "Delete Team",
      "Are you sure you want to delete this team? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedTeams = confirmedTeams.filter(
              (team) => team.id !== teamId
            );
            setConfirmedTeams(updatedTeams);
            // Reset the form after deletion
            resetCurrentTeam();
            Alert.alert("Team Deleted", "Team has been removed successfully.");
          },
        },
      ]
    );
  };

  const resetTournament = () => {
    Alert.alert(
      "Reset Tournament",
      "This will clear all tournament data and start fresh. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            console.log("Reset button pressed");
            console.log("Before reset - Tournament state:", tournamentState);

            // Clear all tournament data
            setConfirmedTeams([]);
            setTournamentInfo("", "", "5");
            resetCurrentTeam();

            // Reset tournament state to clear lock
            resetAllScores();

            console.log("After reset - Tournament state should be cleared");

            Alert.alert(
              "Tournament Reset",
              "All data has been cleared. You can now start fresh."
            );
          },
        },
      ]
    );
  };

  const finalizeTeams = () => {
    if (confirmedTeams.length < 4) {
      Alert.alert(
        "Incomplete Teams",
        "Please add at least 4 teams before finalizing."
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
    setConfirmedTeams(confirmedTeams);
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
        <Text style={styles.teamTitle}>
          {isEditing
            ? `Edit Team ${editingTeamId}`
            : `Add Team ${confirmedTeams.length + 1}`}
        </Text>
      </View>

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Team Name:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter team name"
          value={currentTeam.name}
          onChangeText={(text) => updateCurrentTeam("name", text)}
        />
      </View>

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Manager:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter manager name"
          value={currentTeam.manager}
          onChangeText={(text) => updateCurrentTeam("manager", text)}
        />
      </View>

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Captain:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter captain name"
          value={currentTeam.captain}
          onChangeText={(text) => updateCurrentTeam("captain", text)}
        />
      </View>

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Players:</Text>
        <TextInput
          style={[styles.inlineInput, styles.playersInput]}
          placeholder="Enter player names separated by commas"
          value={currentTeam.players}
          onChangeText={(text) => updateCurrentTeam("players", text)}
          multiline
          numberOfLines={3}
        />
      </View>

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
            {isEditing
              ? "Update Team"
              : `Add Team ${confirmedTeams.length + 1}`}
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

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Tournament Name:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter tournament name"
          value={tournamentName}
          onChangeText={(text) =>
            setTournamentInfo(text, organizer, raceToScore)
          }
        />
      </View>

      <View style={styles.inlineInputRow}>
        <Text style={styles.inlineLabel}>Organizer:</Text>
        <TextInput
          style={styles.inlineInput}
          placeholder="Enter organizer name"
          value={organizer}
          onChangeText={(text) =>
            setTournamentInfo(tournamentName, text, raceToScore)
          }
        />
      </View>

      <View style={styles.raceToSection}>
        <Text style={styles.sectionLabel}>Race to:</Text>
        <View style={styles.raceToOptions}>
          {["3", "5", "7", "9"].map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.raceToOption,
                raceToScore === score && styles.selectedRaceTo,
              ]}
              onPress={() =>
                setTournamentInfo(tournamentName, organizer, score)
              }
            >
              <Text
                style={[
                  styles.raceToOptionText,
                  raceToScore === score && styles.selectedRaceToText,
                ]}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderConfirmedTeamCard = (team: ConfirmedTeam) => (
    <View style={styles.confirmedTeamCard}>
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
          onPress={() => {
            Alert.alert("Team Options", "What would you like to do?", [
              {
                text: "Edit Team",
                onPress: () => editConfirmedTeam(team.id),
              },
              {
                text: "Delete Team",
                style: "destructive",
                onPress: () => deleteConfirmedTeam(team.id),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]);
          }}
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
    <View style={styles.alternateTeamCard}>
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
          onPress={() => {
            Alert.alert("Team Options", "What would you like to do?", [
              {
                text: "Edit Team",
                onPress: () => editConfirmedTeam(team.id),
              },
              {
                text: "Delete Team",
                style: "destructive",
                onPress: () => deleteConfirmedTeam(team.id),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]);
          }}
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
        <Text style={styles.title}>Tour Input</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetTournament}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="white" />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
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
      </View>

      {/* Tournament Info Card - Always at top */}
      {renderTournamentInfoCard()}

      {/* Tournament Lock Status */}
      {isTournamentStarted() && (
        <View style={styles.lockStatus}>
          <MaterialCommunityIcons
            name="lock"
            size={20}
            color={COLORS.warning}
          />
          <Text style={styles.lockText}>
            Tournament Locked - Team data cannot be modified
          </Text>
        </View>
      )}

      {/* Current Team Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isEditing
            ? `Edit Team ${editingTeamId}`
            : `Add Team ${confirmedTeams.length + 1}`}
        </Text>
        {renderCurrentTeamInput()}
      </View>

      {/* Confirmed Teams */}
      {confirmedTeams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Confirmed Teams ({confirmedTeams.length})
          </Text>

          {/* Main Tournament Teams (First 4) */}
          {confirmedTeams.slice(0, 4).map((team, index) => {
            const key = `confirmed-${team.id}-${index}`;
            return <View key={key}>{renderConfirmedTeamCard(team)}</View>;
          })}

          {/* Finalize button appears after 4th team */}
          {confirmedTeams.length >= 4 && (
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
          {confirmedTeams.length > 4 && (
            <View style={styles.alternatesSection}>
              <Text style={styles.alternatesTitle}>Alternate Teams</Text>
              {confirmedTeams.slice(4).map((team, index) => {
                const key = `alternate-${team.id}-${index + 4}`;
                return <View key={key}>{renderAlternateTeamCard(team)}</View>;
              })}
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
    height: 60,
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
  inlineInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  inlineLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    width: 100,
    marginRight: SPACING.sm,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    fontSize: FONTS.size.base,
    backgroundColor: COLORS.white,
  },
  raceToSection: {
    marginTop: SPACING.md,
  },
  raceToOptions: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  raceToOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  selectedRaceTo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  raceToOptionText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  selectedRaceToText: {
    color: COLORS.white,
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
  lockStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  lockText: {
    marginLeft: SPACING.sm,
    color: COLORS.warning,
    fontWeight: FONTS.weight.medium,
    fontSize: FONTS.size.sm,
  },
  headerButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.sm,
  },
  resetButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weight.medium,
    marginLeft: SPACING.xs,
  },
});

export default TourInputScreen;
