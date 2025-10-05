import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTournament } from "../../context/TournamentContext";
import StreamingControls from "./StreamingControls";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../../constants/theme";

const FloatingStreamingButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { streamingMode, setStreamingMode, pushToStreaming } = useTournament();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStreamingIcon = () => {
    switch (streamingMode) {
      case "streaming":
        return "broadcast";
      case "manual":
        return "hand-pointing-up";
      default:
        return "wifi-off";
    }
  };

  const getStreamingColor = () => {
    switch (streamingMode) {
      case "streaming":
        return "#1a5f1a"; // Darker green
      case "manual":
        return "#b8860b"; // Darker orange/gold
      default:
        return "#2c2c2c"; // Dark gray
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: getStreamingColor() },
        ]}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={getStreamingIcon()}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Expanded Modal */}
      <Modal
        visible={isExpanded}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsExpanded(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsExpanded(false)}
        >
          <View style={styles.expandedContainer}>
            <View style={styles.expandedHeader}>
              <Text style={styles.expandedTitle}>Streaming Controls</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsExpanded(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.streamingControlsWrapper}>
              <StreamingControls />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30, // Moved up 10px from 20
    left: 0,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    ...SHADOWS.lg,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.lg,
    maxWidth: "90%",
    maxHeight: "80%",
    ...SHADOWS.xl,
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  expandedTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  streamingControlsWrapper: {
    minWidth: 280,
  },
});

export default FloatingStreamingButton;
