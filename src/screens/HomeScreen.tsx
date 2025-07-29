import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/theme";
import { useAuth } from "../context/AuthContext";

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const handlePBSCupPress = () => {
    if (user) {
      // Navigate to Tournament Bracket for tournament overview
      navigation.navigate("Tournament Bracket");
    } else {
      Alert.alert(
        "Authentication Required",
        "Please sign in to view tournaments.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
    }
  };

  const handlePastTournamentsPress = () => {
    if (user) {
      // Navigate to Past Tournaments tab
      navigation.navigate("Past Tournaments");
    } else {
      Alert.alert(
        "Authentication Required",
        "Please sign in to view past tournaments.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
    }
  };

  const handleFavouriteTournamentsPress = () => {
    if (user) {
      // Navigate to Live Tournament for spectator view
      navigation.navigate("Live Tournament");
    } else {
      Alert.alert(
        "Authentication Required",
        "Please sign in to view live tournament.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
    }
  };

  const handleTeamOverviewPress = () => {
    if (user) {
      // Navigate to Team Overview
      navigation.navigate("TeamOverview");
    } else {
      Alert.alert(
        "Authentication Required",
        "Please sign in to view team overview.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Section - Replaces Welcome Message */}

      <Image
        source={require("../../assets/icon.png")}
        style={styles.welcomeImage}
        // resizeMode="contain"
      />

      {/* Navigation Buttons - Centered */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={handlePBSCupPress}>
          <MaterialCommunityIcons
            name="trophy"
            size={24}
            color={COLORS.white}
          />
          <Text style={styles.buttonText}>PBS Cup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleFavouriteTournamentsPress}
        >
          <MaterialCommunityIcons name="heart" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>Live Tournament</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePastTournamentsPress}
        >
          <MaterialCommunityIcons
            name="history"
            size={24}
            color={COLORS.white}
          />
          <Text style={styles.buttonText}>Past Tournaments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleTeamOverviewPress}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={COLORS.white}
          />
          <Text style={styles.buttonText}>Team Overview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },

  welcomeImage: {
    width: "100%",
    height: "60%",
  },
  buttonSection: {
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    width: "80%",
    minWidth: 250,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    marginLeft: SPACING.sm,
    textAlign: "center",
  },
});

export default HomeScreen;
