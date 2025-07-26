import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  const handlePBSCupPress = () => {
    if (user) {
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

  const handlePastTournamentsPress = () => {
    if (user) {
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

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.homeTitle}>Home</Text>
      </View>

      {/* Welcome Message - Top Left */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          <Text>Welcome{"\n"}</Text>
          <Text>Tournament Managers</Text>
        </Text>
      </View>

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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    paddingTop: SPACING["2xl"],
  },
  titleSection: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  homeTitle: {
    fontSize: FONTS.size["xl"],
    fontWeight: FONTS.weight.normal,
    color: COLORS.text.primary,
  },
  welcomeSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: FONTS.size["2xl"] + 4, // Increased by another 4px
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  buttonSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    width: 300,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    marginLeft: SPACING.sm,
  },
});

export default HomeScreen;
