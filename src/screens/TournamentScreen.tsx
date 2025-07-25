import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  teams as teamData,
  matches as matchData,
} from "../utils/tournamentData";
import TeamHeader from "../components/TeamHeader";
import MatchCard from "../components/MatchCard";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;

const TournamentScreen: React.FC = () => {
  const [teamScores, setTeamScores] = useState<[number, number]>([0, 0]);
  const [matchScores, setMatchScores] = useState<[number, number][]>(
    matchData.map(() => [0, 0] as [number, number])
  );
  const [currentMatch, setCurrentMatch] = useState(0);
  const [champion, setChampion] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (teamScores[0] === 5) {
      setChampion(teamData[0].name);
      setModalVisible(true);
    } else if (teamScores[1] === 5) {
      setChampion(teamData[1].name);
      setModalVisible(true);
    }
  }, [teamScores]);

  const handleScoreChange = (
    matchIdx: number,
    teamIdx: 0 | 1,
    delta: number
  ) => {
    if (
      matchScores[matchIdx][0] >= matchData[matchIdx].raceTo ||
      matchScores[matchIdx][1] >= matchData[matchIdx].raceTo
    )
      return;
    const newScores = matchScores.map((score, idx) =>
      idx === matchIdx
        ? ([
            teamIdx === 0 ? score[0] + delta : score[0],
            teamIdx === 1 ? score[1] + delta : score[1],
          ] as [number, number])
        : score
    );
    setMatchScores(newScores);
    // Check for match completion
    const updated = newScores[matchIdx];
    if (
      updated[0] === matchData[matchIdx].raceTo ||
      updated[1] === matchData[matchIdx].raceTo
    ) {
      // Award point to team
      const winnerIdx = updated[0] === matchData[matchIdx].raceTo ? 0 : 1;
      const newTeamScores = [...teamScores] as [number, number];
      newTeamScores[winnerIdx] += 1;
      setTeamScores(newTeamScores);
      setCurrentMatch(currentMatch + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Champion Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.starsRow}>
              <MaterialIcons
                name="star"
                size={36}
                color="#FFD700"
                style={styles.star}
              />
              <MaterialIcons
                name="star"
                size={44}
                color="#FFD700"
                style={styles.star}
              />
              <MaterialIcons
                name="star"
                size={36}
                color="#FFD700"
                style={styles.star}
              />
            </View>
            <MaterialCommunityIcons
              name="trophy"
              size={72}
              color="#FFD700"
              style={{ marginVertical: 8 }}
            />
            <Text style={styles.championText}>Champion!</Text>
            <Text style={styles.championName}>{champion}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons
          name="trophy"
          size={32}
          color="#FFD700"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.title}>PBS Cup</Text>
      </View>
      <Text style={styles.subtitle}>25 Jul 2025: Hosted by Owen</Text>
      <TeamHeader
        teams={teamData.map((t, i) => ({ ...t, score: teamScores[i] }))}
      />
      <FlatList
        data={matchData}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item, index }) => (
          <MatchCard
            match={item}
            teamScores={teamScores}
            matchScore={matchScores[index]}
            onScoreChange={(teamIdx) => handleScoreChange(index, teamIdx, 1)}
            isCurrent={index === currentMatch}
            isCompleted={
              matchScores[index][0] === item.raceTo ||
              matchScores[index][1] === item.raceTo
            }
          />
        )}
        extraData={{ matchScores, currentMatch }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 32,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: windowWidth * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  star: {
    marginHorizontal: 2,
  },
  championText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginTop: 8,
  },
  championName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1976D2",
    marginVertical: 8,
    textAlign: "center",
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
});

export default TournamentScreen;
