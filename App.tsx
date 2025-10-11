import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { TournamentProvider } from "./src/context/TournamentContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <AppNavigator />
      </TournamentProvider>
    </AuthProvider>
  );
}
