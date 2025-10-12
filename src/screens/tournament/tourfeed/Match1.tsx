import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TeamHeader from "../../../components/tournament/TeamHeader";
import MatchCard from "../../../components/tournament/MatchCard";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
} from "../../../constants/theme";

interface Player {
  id: string;
  name: string;
  designation: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  icon?: string;
  color?: string;
}

interface Match {
  isCompleted: boolean;
  team1Score: number;
  team2Score: number;
}

const TourFeedMatch1: React.FC<{ tournament: any }> = ({ tournament }) => {
  // Use semi-final 1 for this screen
  const currentMatchup = tournament.rounds?.semiFinal1;

  if (
    !tournament ||
    !currentMatchup ||
    !currentMatchup.matches ||
    currentMatchup.matches.length === 0
  ) {
    return (
      <View style={styles.container}>
        <Text>Loading Semifinal 1...</Text>
      </View>
    );
  }

  // Get the teams from the first match (they're the same for all matches in a round)
  const firstMatch = currentMatchup.matches[0];
  const team1 = firstMatch.team1;
  const team2 = firstMatch.team2;

  // Parse players for each team from playerNames string
  const getTeamPlayers = (team: any) => {
    if (!team || !team.playerNames) return [];
    // Split the comma-separated player names
    const playerNames = team.playerNames
      .split(", ")
      .filter((name: string) => name.trim() !== "");
    return playerNames.map((name: string, index: number) => ({
      id: `${team.id}_player_${index}`,
      name: name.trim(),
      designation: `P${index + 1}`,
    }));
  };

  const team1Players = getTeamPlayers(team1);
  const team2Players = getTeamPlayers(team2);

  // Get player names for specific matches
  const getPlayerNamesForMatch = (matchIndex: number, teamIndex: number) => {
    const players = teamIndex === 0 ? team1Players : team2Players;

    switch (matchIndex) {
      case 0:
        return players
          .slice(0, 5)
          .map((p: Player) => p.name)
          .join(", ");
      case 1:
        return `${players[1]?.name || "P2"}, ${players[2]?.name || "P3"}`;
      case 2:
        return players[0]?.name || "P1";
      case 3:
        return `${players[3]?.name || "P4"}, ${players[4]?.name || "P5"}`;
      case 4:
        return players[1]?.name || "P2";
      case 5:
        return players
          .slice(0, 5)
          .map((p: Player) => p.name)
          .join(", ");
      case 6:
        return `${players[0]?.name || "P1"}, ${players[2]?.name || "P3"}`;
      case 7:
        return players[2]?.name || "P3";
      case 8:
        return players[3]?.name || "P4";
      default:
        return "Players TBD";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Semifinal 1</Text>
      </View>

      <View style={styles.content}>
        {(() => {
          // Use the actual team scores from the round data
          const teamScores = [
            currentMatchup.team1Wins || 0,
            currentMatchup.team2Wins || 0,
          ];

          return (
            <TeamHeader
              teams={[
                {
                  name: team1?.name || "Team A",
                  score: teamScores[0],
                },
                {
                  name: team2?.name || "Team B",
                  score: teamScores[1],
                },
              ]}
              teamObjects={[
                team1
                  ? {
                      ...team1,
                      icon: team1.icon || "account",
                      color: team1.color || COLORS.primary,
                    }
                  : null,
                team2
                  ? {
                      ...team2,
                      icon: team2.icon || "account",
                      color: team2.color || COLORS.primary,
                    }
                  : null,
              ]}
            />
          );
        })()}

        {!team1 || !team2 ? (
          <View style={styles.noTeamsMessage}>
            <MaterialCommunityIcons
              name="information"
              size={48}
              color={COLORS.primary}
            />
            <Text style={styles.noTeamsTitle}>Teams Not Set Up</Text>
            <Text style={styles.noTeamsText}>
              The tournament manager has not finalized the teams for this match.
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentMatchup?.matches || []}
            keyExtractor={(item, index) => `match-${index}`}
            renderItem={({ item: match, index }) => {
              const isCompleted = match?.isCompleted || false;

              return (
                <MatchCard
                  match={{
                    number: index + 1,
                    type: "team",
                    raceTo: parseInt(tournament.raceToScore) || 5,
                    players: "Team Match",
                  }}
                  matchIndex={index}
                  teamScores={[
                    match?.team1?.score || 0,
                    match?.team2?.score || 0,
                  ]}
                  matchScore={[
                    match?.team1?.score || 0,
                    match?.team2?.score || 0,
                  ]}
                  onScoreChange={() => {}} // No-op
                  isCurrent={false}
                  isCompleted={isCompleted}
                  onReset={() => {}} // No-op
                  onAdjust={() => {}} // No-op
                  playerDisplay={getPlayerNamesForMatch(index, 0)}
                  matchType={getMatchType(index)}
                  teamStartIndex={0}
                  isReadOnly={true} // Pass read-only flag
                />
              );
            }}
            extraData={{
              matches: currentMatchup.matches,
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// Helper function to get match type
const getMatchType = (matchIndex: number): string => {
  switch (matchIndex) {
    case 0:
      return "Team Match";
    case 1:
      return "1st Doubles";
    case 2:
      return "1st Singles";
    case 3:
      return "2nd Doubles";
    case 4:
      return "2nd Singles";
    case 5:
      return "2nd Team Match";
    case 6:
      return "3rd Doubles";
    case 7:
      return "3rd Singles";
    case 8:
      return "4th Singles";
    default:
      return "Match";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.md - 2,
    paddingTop: SPACING.md - 2,
    paddingBottom: SPACING.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md - 2,
    paddingTop: SPACING.sm - 2,
  },
  noTeamsMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl - 2,
  },
  noTeamsTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md - 2,
    marginBottom: SPACING.sm - 2,
  },
  noTeamsText: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

export default TourFeedMatch1;
