import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  getAllTournaments,
  deleteTournament,
  approveTournament,
  getUserProfile,
  createUserAccountByAdmin,
  completeFirebaseReset,
} from "../../services/firebase";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

interface Tournament {
  id: string;
  tournamentName?: string;
  createdBy?: string;
  createdByUsername?: string;
  isPublic?: boolean;
  adminApproved?: boolean;
  createdAt?: any;
  confirmedTeams?: any[];
  [key: string]: any; // Allow additional properties from Firebase
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Account creation modal state
  const [createAccountModalVisible, setCreateAccountModalVisible] =
    useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadTournaments();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);

      // Check if user is admin
      if (!profile?.isAdmin) {
        Alert.alert(
          "Access Denied",
          "You don't have admin privileges to access this screen."
        );
        // Navigate back or to home screen
        return;
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const allTournaments = await getAllTournaments();

      // Ensure the data matches our Tournament interface
      const formattedTournaments: Tournament[] = allTournaments.map(
        (tournament: any) => ({
          id: tournament.id,
          tournamentName: tournament.tournamentName || "Unnamed Tournament",
          createdBy: tournament.createdBy || "Unknown",
          createdByUsername: tournament.createdByUsername || "Unknown User",
          isPublic: tournament.isPublic || false,
          adminApproved: tournament.adminApproved || false,
          createdAt: tournament.createdAt,
          confirmedTeams: tournament.confirmedTeams || [],
          ...tournament, // Include any other properties
        })
      );

      setTournaments(formattedTournaments);
    } catch (error) {
      console.error("Error loading tournaments:", error);
      Alert.alert("Error", "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const handleDeleteTournament = (tournament: Tournament) => {
    Alert.alert(
      "Delete Tournament",
      `Are you sure you want to delete "${tournament.tournamentName}" created by ${tournament.createdByUsername}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTournament(tournament.id);
              Alert.alert("Success", "Tournament deleted successfully");
              loadTournaments(); // Refresh list
            } catch (error) {
              console.error("Error deleting tournament:", error);
              Alert.alert("Error", "Failed to delete tournament");
            }
          },
        },
      ]
    );
  };

  const handleApproveTournament = async (tournament: Tournament) => {
    try {
      await approveTournament(tournament.id);
      Alert.alert("Success", "Tournament approved and made public");
      loadTournaments(); // Refresh list
    } catch (error) {
      console.error("Error approving tournament:", error);
      Alert.alert("Error", "Failed to approve tournament");
    }
  };

  const handleCreateAccount = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setCreatingAccount(true);
      const result = await createUserAccountByAdmin(
        newUserName.trim(),
        newUserEmail.trim()
      );

      Alert.alert(
        "Account Created Successfully",
        `Account created for ${result.userOrPlayerName} (${result.email})\n\nTemporary Password: ${result.tempPassword}\n\nPlease share this password with the user. They should change it upon first login.`,
        [
          {
            text: "OK",
            onPress: () => {
              setCreateAccountModalVisible(false);
              setNewUserName("");
              setNewUserEmail("");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating account:", error);

      let errorMessage = "Failed to create account. Please try again.";

      if (error.code === "name-already-taken") {
        errorMessage =
          "This name is already taken. Please choose a different name.";
      } else if (error.code === "email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleCompleteReset = () => {
    Alert.alert(
      "⚠️ COMPLETE RESET WARNING ⚠️",
      "This will DELETE ALL existing users and tournament data permanently. This action cannot be undone.\n\nAre you absolutely sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "DELETE EVERYTHING",
          style: "destructive",
          onPress: async () => {
            try {
              Alert.alert(
                "Final Confirmation",
                "This is your last chance to cancel. All data will be permanently deleted.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "YES, DELETE EVERYTHING",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const result = await completeFirebaseReset();
                        Alert.alert(
                          "Reset Complete",
                          `All data has been deleted successfully!\n\nDeleted Users: ${result.deletedUsers}\nDeleted Tournaments: ${result.deletedTournaments}\n\nYou can now start fresh with the new system.`,
                          [{ text: "OK" }]
                        );
                        // Refresh the tournaments list (should be empty now)
                        loadTournaments();
                      } catch (error) {
                        console.error("Reset error:", error);
                        Alert.alert(
                          "Error",
                          "Failed to complete reset. Please try again."
                        );
                      }
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Reset error:", error);
              Alert.alert(
                "Error",
                "Failed to complete reset. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderTournamentItem = ({ item }: { item: Tournament }) => (
    <View style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentName}>{item.tournamentName}</Text>
        <View style={styles.statusContainer}>
          {item.adminApproved ? (
            <View style={[styles.statusBadge, styles.approvedBadge]}>
              <Text style={styles.statusText}>Approved</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.tournamentDetails}>
        <Text style={styles.detailText}>
          Created by:{" "}
          <Text style={styles.username}>{item.createdByUsername}</Text>
        </Text>
        <Text style={styles.detailText}>
          Teams: {item.confirmedTeams?.length || 0}
        </Text>
        <Text style={styles.detailText}>
          Created:{" "}
          {item.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        {!item.adminApproved && (
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveTournament(item)}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTournament(item)}
        >
          <MaterialCommunityIcons name="delete" size={16} color="white" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!userProfile?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="shield-off"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            You don't have admin privileges to access this screen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage All Tournaments</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => setCreateAccountModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={20}
              color="white"
            />
            <Text style={styles.createAccountButtonText}>
              Create User Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleCompleteReset}
          >
            <MaterialCommunityIcons
              name="delete-sweep"
              size={20}
              color="white"
            />
            <Text style={styles.resetButtonText}>Complete Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={64}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyText}>No tournaments found</Text>
            <Text style={styles.emptySubtext}>
              Tournaments will appear here once created by users.
            </Text>
          </View>
        }
      />

      {/* Create Account Modal */}
      <Modal
        visible={createAccountModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create User Account</Text>
              <TouchableOpacity
                onPress={() => setCreateAccountModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>User or Player Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter name (must be unique)"
                value={newUserName}
                onChangeText={setNewUserName}
                autoCapitalize="words"
                placeholderTextColor={COLORS.text.disabled}
              />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter email address"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.text.disabled}
              />

              <Text style={styles.modalInfo}>
                A temporary password will be generated and displayed after
                account creation.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCreateAccountModalVisible(false);
                  setNewUserName("");
                  setNewUserEmail("");
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalCreateButton,
                  creatingAccount && styles.modalCreateButtonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={creatingAccount}
              >
                <Text style={styles.modalCreateButtonText}>
                  {creatingAccount ? "Creating..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
    alignItems: "center",
  },
  title: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  tournamentCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  tournamentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  tournamentName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  statusContainer: {
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  approvedBadge: {
    backgroundColor: COLORS.success,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.white,
  },
  tournamentDetails: {
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  username: {
    fontWeight: FONTS.weight.medium,
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  accessDeniedText: {
    fontSize: FONTS.size["2xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  accessDeniedSubtext: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  createAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  createAccountButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  resetButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  headerButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    width: "90%",
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  modalLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  modalInfo: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    fontStyle: "italic",
    marginTop: SPACING.sm,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.sm,
  },
  modalCancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  modalCancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  modalCreateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  modalCreateButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  modalCreateButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
});

export default AdminDashboard;
