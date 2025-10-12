import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { useTournament } from "../context/TournamentContext";

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { tournamentState } = useTournament();

  return (
    <View style={styles.container}>
      {/* App Logo/Icon */}
      <Image
        source={require("../../assets/icon.png")}
        style={styles.appIcon}
        resizeMode="contain"
      />

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Owen's Cup</Text>

        {user && (
          <Text style={styles.userGreeting}>
            Welcome back, {user.displayName || user.email}!
          </Text>
        )}
      </View>

      {/* Content based on user role */}
      {user && (
        <>
          {/* Tournament Status Card for Managers */}
          {user.role === "tournamentManager" &&
            tournamentState.tournamentName && (
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <MaterialCommunityIcons
                    name="trophy"
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.statusTitle}>Current Tournament</Text>
                </View>

                <Text style={styles.tournamentName}>
                  {tournamentState.tournamentName}
                </Text>

                <Text style={styles.tournamentDetails}>
                  Organizer: {tournamentState.organizer}
                </Text>

                <Text style={styles.tournamentDetails}>
                  Teams: {tournamentState.confirmedTeams.length}
                </Text>
              </View>
            )}

          {/* Community Message for Viewers */}
          {user.role === "viewer" && (
            <View style={styles.communityCard}>
              <View style={styles.communityHeader}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.communityTitle}>Join Our Community</Text>
              </View>

              <Text style={styles.communityMessage}>
                The app for the coolest Filipino's in Singapore, finding
                camarderie and fun playing billiards! 🎱🫶🤝💪 🎱
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  appIcon: {
    width: 288,
    height: 288,
    alignSelf: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userGreeting: {
    fontSize: FONTS.size.base,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  statusCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  tournamentName: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tournamentDetails: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  communityCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  communityTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  communityMessage: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    lineHeight: FONTS.lineHeight.relaxed * FONTS.size.base,
    textAlign: "center",
  },
});

export default HomeScreen;
