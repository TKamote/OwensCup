import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTournament } from "../../context/TournamentContext";
import { StreamingMode } from "../../services/streamingAPI";
import { COLORS } from "../../constants/theme";

interface StreamingControlsProps {
  style?: any;
}

const StreamingControls: React.FC<StreamingControlsProps> = ({ style }) => {
  const { streamingMode, setStreamingMode, pushToStreaming } = useTournament();

  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const handleModeChange = (mode: StreamingMode) => {
    setStreamingMode(mode);
    setShowModeSelector(false);

    // Show confirmation for streaming mode
    if (mode === "streaming") {
      Alert.alert(
        "Streaming Mode Enabled",
        "Your tournament data will now be pushed to the web in real-time. This will increase data usage.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePushToStreaming = async () => {
    setIsPushing(true);
    try {
      await pushToStreaming(true);
      Alert.alert(
        "Success",
        "Tournament data pushed to streaming successfully!"
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to push data to streaming. Please try again."
      );
    } finally {
      setIsPushing(false);
    }
  };

  const getModeIcon = (mode: StreamingMode) => {
    switch (mode) {
      case "normal":
        return "clock-outline";
      case "streaming":
        return "broadcast";
      case "manual":
        return "hand-pointing-up";
      default:
        return "help-circle";
    }
  };

  const getModeColor = (mode: StreamingMode) => {
    switch (mode) {
      case "normal":
        return COLORS.gray[500];
      case "streaming":
        return COLORS.primary;
      case "manual":
        return COLORS.warning;
      default:
        return COLORS.gray[400];
    }
  };

  const getModeDescription = (mode: StreamingMode) => {
    switch (mode) {
      case "normal":
        return "Auto-save every 30 seconds (default)";
      case "streaming":
        return "Real-time updates to web streaming";
      case "manual":
        return "Save only when you press buttons";
      default:
        return "Unknown mode";
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Current Mode Display */}
      <TouchableOpacity
        style={[
          styles.modeButton,
          { borderColor: getModeColor(streamingMode) },
        ]}
        onPress={() => setShowModeSelector(true)}
      >
        <MaterialCommunityIcons
          name={getModeIcon(streamingMode)}
          size={20}
          color={getModeColor(streamingMode)}
        />
        <Text style={[styles.modeText, { color: getModeColor(streamingMode) }]}>
          {streamingMode.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Single Action Button */}
      <TouchableOpacity
        style={styles.singleActionButton}
        onPress={handlePushToStreaming}
        disabled={isPushing}
      >
        <MaterialCommunityIcons name="broadcast" size={16} color="white" />
        <Text style={styles.singleActionButtonText}>
          {isPushing ? "Pushing..." : "Push to Web"}
        </Text>
      </TouchableOpacity>

      {/* Mode Description */}
      <Text style={styles.description}>
        {getModeDescription(streamingMode)}
      </Text>

      {/* Mode Selector Modal */}
      <Modal
        visible={showModeSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Streaming Mode</Text>

            {(["normal", "streaming", "manual"] as StreamingMode[]).map(
              (mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeOption,
                    streamingMode === mode && styles.selectedModeOption,
                  ]}
                  onPress={() => handleModeChange(mode)}
                >
                  <MaterialCommunityIcons
                    name={getModeIcon(mode)}
                    size={24}
                    color={
                      streamingMode === mode ? COLORS.primary : COLORS.gray[500]
                    }
                  />
                  <View style={styles.modeOptionText}>
                    <Text
                      style={[
                        styles.modeOptionTitle,
                        streamingMode === mode && styles.selectedModeText,
                      ]}
                    >
                      {mode.toUpperCase()}
                    </Text>
                    <Text style={styles.modeOptionDescription}>
                      {getModeDescription(mode)}
                    </Text>
                  </View>
                  {streamingMode === mode && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModeSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  singleActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  singleActionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  description: {
    fontSize: 10,
    color: COLORS.gray[500],
    textAlign: "center",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.text.primary,
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedModeOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  modeOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  selectedModeText: {
    color: COLORS.primary,
  },
  modeOptionDescription: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: COLORS.gray[200],
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
});

export default StreamingControls;
