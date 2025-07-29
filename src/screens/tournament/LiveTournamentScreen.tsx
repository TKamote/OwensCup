import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useTournament } from "../../context/TournamentContext";
import { teams as teamData } from "../../utils/tournamentData";

const LiveTournamentScreen = () => {
  const { tournamentState } = useTournament();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Tournament</Text>
        <Text style={styles.subtitle}>PBS Cup Aug 2025</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* OVERALL Section */}
        <View style={styles.overallSection}>
          <Text style={styles.overallTitle}>OVERALL</Text>
          <View style={styles.overallContainer}>
            <View style={styles.matchColumn}>
              <Text style={styles.matchColumnTitle}>Match A</Text>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{teamData[0].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.teamScores[0]}
                </Text>
              </View>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{teamData[1].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.teamScores[1]}
                </Text>
              </View>
            </View>
            <View style={styles.columnDivider} />
            <View style={styles.matchColumn}>
              <Text style={styles.matchColumnTitle}>Match B</Text>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{teamData[2].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.teamScores[2]}
                </Text>
              </View>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{teamData[3].name}</Text>
                <Text style={styles.teamScore}>
                  {tournamentState.teamScores[3]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Matches Section */}
        <View style={styles.detailedSection}>
          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M1 Teams</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M1 Teams</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M2 1st Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M2 1st Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M3 1st Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M3 1st Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M4 2nd Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M4 2nd Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M5 2nd Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M5 2nd Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M6 Teams</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M6 Teams</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M7 3rd Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M7 3rd Singles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedContainer}>
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M8 3rd Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatchColumn}>
              <Text style={styles.detailedMatchTitle}>M8 3rd Doubles</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedRow}>
            <View style={styles.detailedMatch}>
              <Text style={styles.detailedMatchTitle}>M9 4th S (Capt)</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Pinoy Sargo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>WBB</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
            <View style={styles.detailedDivider} />
            <View style={styles.detailedMatch}>
              <Text style={styles.detailedMatchTitle}>M9 4th S (Capt)</Text>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Bikol</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
              <View style={styles.detailedScoreRow}>
                <Text style={styles.detailedTeamName}>Ilongo</Text>
                <Text style={styles.detailedScore}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3rd Match Section */}
        <View style={styles.thirdMatchSection}>
          <Text style={styles.thirdMatchTitle}>Championship Match</Text>
          <View style={styles.thirdMatchContainer}>
            <View style={styles.thirdMatchColumn}>
              <Text style={styles.thirdMatchColumnTitle}>Final Match</Text>
              <View style={styles.thirdMatchScoreRow}>
                <Text style={styles.thirdMatchTeamName}>Winner Match 1</Text>
                <Text style={styles.thirdMatchScore}>0</Text>
              </View>
              <View style={styles.thirdMatchScoreRow}>
                <Text style={styles.thirdMatchTeamName}>Winner Match 2</Text>
                <Text style={styles.thirdMatchScore}>0</Text>
              </View>
            </View>
          </View>

          {/* Championship Detailed Matches */}
          <View style={styles.thirdMatchDetailedContainer}>
            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>M1 Teams</Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M2 1st Doubles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M3 1st Singles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M4 2nd Doubles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M5 2nd Singles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>M6 Teams</Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M7 3rd Singles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M8 3rd Doubles
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>

            <View style={styles.thirdMatchDetailedRow}>
              <View style={styles.thirdMatchDetailedColumn}>
                <Text style={styles.thirdMatchDetailedTitle}>
                  M9 4th S (Capt)
                </Text>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 1
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
                <View style={styles.thirdMatchDetailedScoreRow}>
                  <Text style={styles.thirdMatchDetailedTeamName}>
                    Winner Match 2
                  </Text>
                  <Text style={styles.thirdMatchDetailedScore}>0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flex: 1,
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
  matchesContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
  },
  matchSection: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  scoreDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },

  // OVERALL Section Styles
  overallSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  matchColumn: {
    flex: 1,
  },
  matchColumnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  teamScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  teamScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  columnDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 15,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overallMatch: {
    flex: 1,
  },
  overallMatchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  overallScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  overallTeamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  overallScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  overallDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 15,
  },

  // Detailed Section Styles
  detailedSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailedMatchColumn: {
    flex: 1,
  },
  detailedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailedMatch: {
    flex: 1,
  },
  detailedMatchTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  detailedScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1,
  },
  detailedTeamName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  detailedScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  detailedDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },

  // 3rd Match Section Styles
  thirdMatchSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thirdMatchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  thirdMatchContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  thirdMatchColumn: {
    flex: 1,
    maxWidth: 200,
  },
  thirdMatchColumnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  thirdMatchScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  thirdMatchTeamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  thirdMatchScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },

  // 3rd Match Detailed Section Styles
  thirdMatchDetailedContainer: {
    marginTop: 15,
  },
  thirdMatchDetailedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  thirdMatchDetailedColumn: {
    flex: 1,
  },
  thirdMatchDetailedTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
    color: "#333",
  },
  thirdMatchDetailedScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1,
  },
  thirdMatchDetailedTeamName: {
    fontSize: 10,
    fontWeight: "500",
    color: "#333",
  },
  thirdMatchDetailedScore: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007AFF",
  },
  thirdMatchDetailedDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
});

export default LiveTournamentScreen;
