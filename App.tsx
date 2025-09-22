import "react-native-gesture-handler";
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { TournamentProvider } from "./src/context/TournamentContext";
import SimplifiedNavigator from "./src/navigation/SimplifiedNavigator";

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <SimplifiedNavigator />
      </TournamentProvider>
    </AuthProvider>
  );
}
