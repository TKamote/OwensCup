import React from "react";
import { SafeAreaView } from "react-native";
import TournamentScreen from "./src/screens/TournamentScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TournamentScreen />
    </SafeAreaView>
  );
}
