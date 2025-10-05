import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { useTournament } from "../../context/TournamentContext";

interface Player {
  id: string;
  name: string;
  designation: string;
}

interface Team {
  id: string;
  name: string;
  manager: string;
  captain: string;
  players: Player[];
  color: string;
  icon: string;
}

const TeamOverviewScreen: React.FC = () => {
  const { tournamentState } = useTournament();
  const { confirmedTeams, tournamentName, organizer, raceToScore } =
    tournamentState;

  // Use confirmed teams from context, fallback to mock data if empty
  const teams: Team[] = confirmedTeams.length > 0 ? confirmedTeams : [];

  // Separate main teams (first 4) from alternates
  const mainTeams = teams.slice(0, 4);
  const alternateTeams = teams.slice(4);

  const renderTeamCard = (team: Team) => (
    <View style={styles.teamCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.teamIcon, { backgroundColor: team.color }]}>
          <MaterialCommunityIcons
            name={team.icon as any}
            size={24}
            color="white"
          />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSubtitle}>Team {team.id}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Manager:</Text>
          <Text style={styles.detailValue}>{team.manager}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Captain:</Text>
          <Text style={styles.detailValue}>{team.captain}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Players:</Text>
          <Text style={styles.detailValue}>
            {team.players.map(player => player.name).join(", ")}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAlternateTeamCard = (team: Team) => (
    <View style={styles.alternateTeamCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.teamIcon, { backgroundColor: team.color }]}>
          <MaterialCommunityIcons
            name={team.icon as any}
            size={24}
            color="white"
          />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSubtitle}>Team {team.id}</Text>
        </View>
        <View style={styles.alternateBadge}>
          <Text style={styles.alternateBadgeText}>ALT</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Manager:</Text>
          <Text style={styles.detailValue}>{team.manager}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Captain:</Text>
          <Text style={styles.detailValue}>{team.captain}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Players:</Text>
          <Text style={styles.detailValue}>
            {team.players.map(player => player.name).join(", ")}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Overview</Text>
        <Text style={styles.subtitle}>
          {tournamentName || "Tournament Teams Summary"}
        </Text>
        {organizer && (
          <Text style={styles.organizer}>Organizer: {organizer}</Text>
        )}
      </View>

      <View style={styles.content}>
        {mainTeams.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Main Tournament Teams</Text>
            {mainTeams.map((team, index) => {
              const key = `main-${team.name}-${index}`;
              return <View key={key}>{renderTeamCard(team)}</View>;
            })}
          </>
        ) : (
          <Text style={styles.noTeamsText}>No teams configured yet</Text>
        )}

        {alternateTeams.length > 0 && (
          <View style={styles.alternatesSection}>
            <Text style={styles.alternatesTitle}>Alternate Teams</Text>
            {alternateTeams.map((team, index) => {
              const key = `alternate-${team.name}-${index}`;
              return <View key={key}>{renderAlternateTeamCard(team)}</View>;
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  organizer: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  teamSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  cardDetails: {
    marginTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.text.secondary,
    width: 80,
  },
  detailValue: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  noTeamsText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.xl,
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
    marginLeft: SPACING.sm,
  },
  alternateBadgeText: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
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
});

export default TeamOverviewScreen;
