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
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  LAYOUT,
} from "../../constants/theme";

interface SignUpScreenProps {
  onSwitchToSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSwitchToSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userOrPlayerName, setUserOrPlayerName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !userOrPlayerName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await signUp(email, password, userOrPlayerName);
    } catch (error: any) {
      console.error("Sign up error:", error);

      let errorMessage = "Failed to sign up. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please sign in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === "name-already-taken") {
        errorMessage =
          "This name is already taken. Please choose a different name.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Join PBS Cup Tournament</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="User or Player Name"
          value={userOrPlayerName}
          onChangeText={setUserOrPlayerName}
          autoCapitalize="words"
          placeholderTextColor={COLORS.text.disabled}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.disabled}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={COLORS.text.disabled}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={onSwitchToSignIn}
        >
          <Text style={styles.switchText}>
            Already have an account?{" "}
            <Text style={styles.switchTextBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  form: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
    height: 44,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.primary,
    marginBottom: SPACING.sm,
    height: 44,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
  },
  eyeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginTop: SPACING.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.bold,
  },
  switchButton: {
    marginTop: SPACING.sm,
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  switchText: {
    color: COLORS.text.primary,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
  },
  switchTextBold: {
    color: COLORS.primary,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
});

export default SignUpScreen;
