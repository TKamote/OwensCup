import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import TourInputScreen from "../screens/tournament/TourInputScreen";

import TeamOverviewScreen from "../screens/tournament/TeamOverviewScreen";
import FavouriteTournamentsScreen from "../screens/tournament/FavouriteTournamentsScreen";
import PastTournamentsScreen from "../screens/tournament/PastTournamentsScreen";
import LiveTournamentScreen from "../screens/tournament/LiveTournamentScreen";
import TournamentDashboard from "../screens/tournament/TournamentDashboard";
import MatchScreen1 from "../screens/tournament/matches/MatchScreen1";
import MatchScreen2 from "../screens/tournament/matches/MatchScreen2";
import MatchScreen3 from "../screens/tournament/matches/MatchScreen3";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Wrapper Component
const AuthWrapper: React.FC = () => {
  const [isSignIn, setIsSignIn] = React.useState(true);

  return isSignIn ? (
    <SignInScreen onSwitchToSignUp={() => setIsSignIn(false)} />
  ) : (
    <SignUpScreen onSwitchToSignIn={() => setIsSignIn(true)} />
  );
};

// Auth Stack Navigator with consistent headers
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray[200],
          height: 60, // Compact but visible header height
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 16, // Smaller font size
        },
        headerBackTitle: "Back",
        headerTitleContainerStyle: {
          paddingHorizontal: 20, // Reduced horizontal padding
        },
      }}
    >
      <Stack.Screen
        name="AuthMain"
        component={AuthWrapper}
        options={{
          headerShown: false,
          title: "Authentication",
        }}
      />
    </Stack.Navigator>
  );
};

// Logout Screen Component
const LogoutScreen: React.FC = () => {
  const { signOut } = useAuth();

  React.useEffect(() => {
    signOut();
  }, []);

  return null;
};

// Home Stack Navigator with consistent headers
const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray[200],
          height: 60, // Compact but visible header height
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 16, // Smaller font size
        },
        headerBackTitle: "Back",
        headerTitleContainerStyle: {
          paddingHorizontal: 20, // Reduced horizontal padding
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "Home",
        }}
      />
      <Stack.Screen
        name="Live Tournament"
        component={FavouriteTournamentsScreen}
        options={{
          title: "Live Tournament",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="Past Tournaments"
        component={PastTournamentsScreen}
        options={{
          title: "Past Tournaments",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

// Tour Input Stack Navigator
const TourInputStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray[200],
          height: 105, // Compact but visible header height
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 16, // Smaller font size
        },
        headerBackTitle: "Back",
        headerTitleContainerStyle: {
          paddingHorizontal: 20, // Reduced horizontal padding
        },
      }}
    >
      <Stack.Screen
        name="TourSettingsMain"
        component={TourInputScreen}
        options={{
          headerShown: true,
          title: "Tournament Setup",
        }}
      />

      <Stack.Screen
        name="TeamOverview"
        component={TeamOverviewScreen}
        options={{
          headerShown: true,
          title: "Team Overview",
        }}
      />
    </Stack.Navigator>
  );
};

// Past Tournaments Stack Navigator
const PastTournamentsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.gray[200],
          height: 105,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 16,
        },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="PastTournamentsMain"
        component={PastTournamentsScreen}
        options={{
          title: "Past Tournaments",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: "home" | "login" | "cog" | "trophy" | "logout" | "help";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Auth":
              iconName = "login";
              break;
            case "Tour Input":
              iconName = "cog";
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
        // Consistent headers across all screens
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.gray[300],
          height: 105, // Increased height for better visibility
        },
        headerTintColor: COLORS.primary, // Consistent color
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 16, // Consistent font size
        },
      })}
    >
      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen
            name="Tour Input"
            component={TourInputScreen}
            options={({ navigation }) => ({
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              ),
            })}
          />

          <Tab.Screen name="Logout" component={LogoutScreen} />
        </>
      ) : (
        // Non-authenticated user tabs
        <>
          <Tab.Screen name="Auth" component={AuthWrapper} />
        </>
      )}
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        {user && (
          <>
            <Stack.Screen
              name="Past Tournaments"
              component={PastTournamentsStack}
            />
            <Stack.Screen
              name="Live Tournament"
              component={LiveTournamentScreen}
              options={{
                title: "Live Tournament",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 105,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
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
                  height: 105,
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
                title: "Match 1",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 105,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="Match 2"
              component={MatchScreen2}
              options={{
                title: "Match 2",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 105,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="Match 3"
              component={MatchScreen3}
              options={{
                title: "Final Match",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 105,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
            <Stack.Screen
              name="TeamOverview"
              component={TeamOverviewScreen}
              options={{
                title: "Team Overview",
                headerShown: true,
                headerStyle: {
                  backgroundColor: COLORS.background.primary,
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.gray[300],
                  height: 105,
                },
                headerTintColor: COLORS.primary,
                headerTitleStyle: {
                  fontWeight: "600",
                  fontSize: 16,
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
