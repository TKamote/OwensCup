import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";

// Import screens
import HomeScreen from "../screens/home/HomeScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import TourInputScreen from "../screens/tournament/TourInputScreen";
import MosconiScoreScreen from "../screens/tournament/MosconiScoreScreen";
import FavouriteTournamentsScreen from "../screens/tournament/FavouriteTournamentsScreen";
import PastTournamentsScreen from "../screens/tournament/PastTournamentsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Combined Auth Screen Component
const AuthScreen: React.FC = () => {
  const [isSignIn, setIsSignIn] = React.useState(true);

  return isSignIn ? (
    <SignInScreen onSwitchToSignUp={() => setIsSignIn(false)} />
  ) : (
    <SignUpScreen onSwitchToSignIn={() => setIsSignIn(true)} />
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
        headerStyle: {
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.gray[200],
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
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
            case "Tour Settings":
              iconName = "cog";
              break;
            case "Tour Dashboard":
              iconName = "trophy";
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />

      {user ? (
        // Authenticated user tabs
        <>
          <Tab.Screen name="Tour Settings" component={TourInputScreen} />
          <Tab.Screen name="Tour Dashboard" component={MosconiScoreScreen} />
          <Tab.Screen name="Logout" component={LogoutScreen} />
        </>
      ) : (
        // Non-authenticated user tabs
        <>
          <Tab.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
