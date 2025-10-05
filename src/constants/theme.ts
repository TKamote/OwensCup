// Theme constants for consistent styling across the app

// Colors
export const COLORS = {
  // Primary colors
  primary: "#007AFF",
  primaryDark: "#0056CC",
  primaryLight: "#4DA3FF",

  // Secondary colors
  secondary: "#FFD700",
  secondaryDark: "#FFB300",
  secondaryLight: "#FFE44D",

  // Team colors
  team1: "#FF7043", // Pinoy Sargo (orange)
  team2: "#1976D2", // WBB Jerome (blue)

  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#FF3B30",
  info: "#2196F3",

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  // Text colors
  text: {
    primary: "#222222",
    secondary: "#555555",
    tertiary: "#666666",
    disabled: "#9E9E9E",
    inverse: "#FFFFFF",
  },

  // Background colors
  background: {
    primary: "#F5F5F5",
    secondary: "#FFFFFF",
    modal: "rgba(0,0,0,0.5)",
  },

  // Border colors
  border: {
    light: "#DDDDDD",
    medium: "#CCCCCC",
    dark: "#999999",
  },

  // Shadow colors
  shadow: {
    light: "rgba(0,0,0,0.1)",
    medium: "rgba(0,0,0,0.2)",
    dark: "rgba(0,0,0,0.3)",
  },

  // Glassmorphism colors
  glass: {
    primary: "rgba(255, 255, 255, 0.25)",
    secondary: "rgba(255, 255, 255, 0.15)",
    border: "rgba(107, 217, 85, 0.3)",
    backdrop: "rgba(0, 0, 0, 0.1)",
  },
} as const;

// Typography
export const FONTS = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 22,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
    "6xl": 36,
  },

  // Font weights
  weight: {
    normal: "normal" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "bold" as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Glassmorphism shadows
export const GLASS_SHADOWS = {
  light: {
    shadowColor: COLORS.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  heavy: {
    shadowColor: COLORS.shadow.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Layout
export const LAYOUT = {
  // Screen padding
  screenPadding: SPACING.md,

  // Header height
  headerHeight: 60,

  // Tab bar height
  tabBarHeight: 60,

  // Button heights
  buttonHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },

  // Input heights
  inputHeight: 48,
} as const;

// Animation
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const;

// Z-index
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
