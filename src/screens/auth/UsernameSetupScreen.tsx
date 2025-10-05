import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/firebase";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  LAYOUT,
} from "../../constants/theme";

interface UsernameSetupScreenProps {
  onComplete: () => void;
}

const UsernameSetupScreen: React.FC<UsernameSetupScreenProps> = ({
  onComplete,
}) => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameSetup = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert(
        "Error",
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    try {
      setLoading(true);

      // Update user profile with username
      await updateUserProfile(user!.uid, { username });

      Alert.alert(
        "Success",
        "Username set successfully! You can now use this username in tournaments.",
        [{ text: "OK", onPress: onComplete }]
      );
    } catch (error: any) {
      console.error("Username setup error:", error);

      let errorMessage = "Failed to set username. Please try again.";

      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to update your profile.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateUsernameFromEmail = () => {
    if (user?.email) {
      const emailPrefix = user.email.split("@")[0];
      const cleanUsername = emailPrefix.replace(/[^a-zA-Z0-9]/g, "");
      setUsername(cleanUsername);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-plus"
            size={80}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.title}>Set Your Username</Text>
        <Text style={styles.subtitle}>
          Choose a username that will be displayed in tournaments. You can use
          the same name as your player name if you'd like.
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={COLORS.text.disabled}
          />

          <TouchableOpacity
            style={styles.suggestButton}
            onPress={generateUsernameFromEmail}
          >
            <Text style={styles.suggestButtonText}>Use email as username</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleUsernameSetup}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Setting Username..." : "Set Username"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Username Guidelines:</Text>
          <Text style={styles.infoText}>• 3-20 characters long</Text>
          <Text style={styles.infoText}>
            • Letters, numbers, and underscores only
          </Text>
          <Text style={styles.infoText}>
            • Can be the same as your player name
          </Text>
          <Text style={styles.infoText}>• Will be visible to other users</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.size["3xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.size.lg,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.size.lg,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  suggestButton: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  suggestButtonText: {
    fontSize: FONTS.size.base,
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  submitButtonText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  infoContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  infoTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
});

export default UsernameSetupScreen;
