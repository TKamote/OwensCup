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
import { sendPasswordReset } from "../../services/firebase";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  LAYOUT,
} from "../../constants/theme";

interface ForgotPasswordScreenProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToSignIn,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const message = await sendPasswordReset(email);
      setEmailSent(true);
      Alert.alert("Success", message);
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert("Error", error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="email-check"
            size={80}
            color={COLORS.primary}
            style={styles.successIcon}
          />
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.instructions}>
            Please check your email and click the link to reset your password.
            The link will expire in 1 hour.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onBackToSignIn}>
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setEmailSent(false);
              setEmail("");
            }}
          >
            <Text style={styles.resendText}>
              Didn't receive the email? Try again
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="lock-reset"
          size={60}
          color={COLORS.primary}
          style={styles.icon}
        />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.text.disabled}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendResetEmail}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToSignIn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={COLORS.text.secondary}
            style={styles.backIcon}
          />
          <Text style={styles.backText}>Back to Sign In</Text>
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
    alignItems: "center",
  },
  icon: {
    marginBottom: SPACING.md,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.size["4xl"],
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.size.base,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: {
    fontSize: FONTS.size.base,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: FONTS.weight.semibold,
    marginTop: SPACING.sm,
  },
  form: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.size.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  buttonText: {
    color: COLORS.text.inverse,
    fontSize: FONTS.size.base,
    fontWeight: FONTS.weight.semibold,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.sm,
  },
  backIcon: {
    marginRight: SPACING.xs,
  },
  backText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.size.sm,
  },
  resendButton: {
    alignItems: "center",
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.size.sm,
    textDecorationLine: "underline",
  },
  instructions: {
    fontSize: FONTS.size.sm,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
});

export default ForgotPasswordScreen;
