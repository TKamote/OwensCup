import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import TourInputScreen from "../screens/tournament/TourInputScreen";
import LiveTournamentScreen from "../screens/tournament/LiveTournamentScreen";
import TournamentDashboard from "../screens/tournament/TournamentDashboard";
import TeamOverviewScreen from "../screens/tournament/TeamOverviewScreen";
import MatchScreen1 from "../screens/tournament/matches/MatchScreen1";
import MatchScreen2 from "../screens/tournament/matches/MatchScreen2";
import MatchScreen3 from "../screens/tournament/matches/MatchScreen3";
import TourFeedScreen from "../screens/tournament/TourFeedScreen"; // Import the new feed screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Wrapper Component
const AuthWrapper: React.FC = () => {
  const [authMode, setAuthMode] = React.useState<
    "signin" | "signup" | "forgot"
  >("signin");

  const renderAuthScreen = () => {
    switch (authMode) {
      case "signin":
        return (
          <SignInScreen
            onSwitchToSignUp={() => setAuthMode("signup")}
            onForgotPassword={() => setAuthMode("forgot")}
          />
        );
      case "signup":
        return <SignUpScreen onSwitchToSignIn={() => setAuthMode("signin")} />;
      case "forgot":
        return (
          <ForgotPasswordScreen onBackToSignIn={() => setAuthMode("signin")} />
        );
      default:
        return (
          <SignInScreen
            onSwitchToSignUp={() => setAuthMode("signup")}
            onForgotPassword={() => setAuthMode("forgot")}
          />
        );
    }
  };

  return renderAuthScreen();
};

// Logout Screen Component
const LogoutScreen: React.FC = () => {
  const { signOut } = useAuth();

  React.useEffect(() => {
    signOut();
  }, []);

  return null;
};

// Main Tab Navigator - Simplified for tournament management
const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();

  // Render viewer-specific tabs
  if (user?.role === "viewer") {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: "home" | "view-list" | "logout";
            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Tour Feed") {
              iconName = "view-list";
            } else {
              iconName = "logout";
            }
            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray[500],
          headerShown: true,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Tour Feed" component={TourFeedScreen} />
        <Tab.Screen name="Logout" component={LogoutScreen} />
      </Tab.Navigator>
    );
  }

  // Render manager-specific tabs (default)
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Live Match":
              iconName = "play-circle";
              break;
            case "Tour Setup":
              iconName = "cog";
              break;
            case "Tour Feed":
              iconName = "view-list";
              break;
            case "Logout":
              iconName = "logout";
              break;
            default:
              iconName = "help";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[500],
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.gray[300],
          height: 100,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 16,
        },
      })}
    >
      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Home" }}
          />
          <Tab.Screen
            name="Live Match"
            component={LiveTournamentScreen}
            options={{ title: "Live Match" }}
          />
          <Tab.Screen
            name="Tour Setup"
            component={TourInputScreen}
            options={{ title: "Tour Setup" }}
          />
          <Tab.Screen
            name="Tour Feed"
            component={TourFeedScreen}
            options={{ title: "Tour Feed" }}
          />
          <Tab.Screen
            name="Logout"
            component={LogoutScreen}
            options={{ title: "Logout" }}
          />
        </>
      ) : (
        // Non-authenticated user tabs
        <Tab.Screen
          name="Auth"
          component={AuthWrapper}
          options={{ title: "Sign In" }}
        />
      )}
    </Tab.Navigator>
  );
};

// Main App Navigator - Simplified structure
const SimplifiedNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Additional screens that need stack navigation */}
        {user && (
          <>
            {/* Manager-specific stack screens */}
            <Stack.Screen
              name="Tournament Dashboard"
              component={TournamentDashboard}
              options={{
                title: "Tournament Dashboard",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 60,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="Team Overview"
              component={TeamOverviewScreen}
              options={{
                title: "Team Overview",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 60,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="Match 1"
              component={MatchScreen1}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Match 2"
              component={MatchScreen2}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Match 3"
              component={MatchScreen3}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default SimplifiedNavigator;
