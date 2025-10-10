# OwensCup Mobile App - Complete Recreation Guide

## Overview

The OwensCup mobile app is a React Native/Expo tournament management application that allows users to create, manage, and stream tournament data in real-time. It features Firebase authentication, real-time data synchronization, and streaming capabilities.

## Technology Stack

### Core Technologies

- **React Native**: 0.81.4
- **Expo**: 54.0.12 (SDK 54.0.0)
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### Navigation

- **@react-navigation/native**: ^7.1.14
- **@react-navigation/bottom-tabs**: ^7.4.2
- **@react-navigation/stack**: ^7.4.3

### Firebase Integration

- **@react-native-firebase/app**: ^22.4.0
- **@react-native-firebase/auth**: ^22.4.0
- **@react-native-firebase/firestore**: ^22.4.0
- **firebase**: ^12.0.0

### UI Components

- **@expo/vector-icons**: ^15.0.2 (MaterialCommunityIcons)

### Development Tools

- **@babel/core**: ^7.25.2
- **babel-preset-expo**: ^54.0.2

## Project Structure

```
OwensCup/
├── App.tsx                          # Main app entry point
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── babel.config.js                  # Babel configuration
├── google-services.json             # Firebase Android config
├── assets/                          # App icons and images
│   ├── icon.png
│   ├── splash-icon.png
│   ├── playstore-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── components/                  # Reusable UI components
    │   └── streaming/
    │       ├── FloatingStreamingButton.tsx
    │       └── StreamingControls.tsx
    ├── config/
    │   └── firebase.config.ts       # Firebase configuration
    ├── constants/
    │   └── theme.ts                 # App theme and styling constants
    ├── context/                     # React Context providers
    │   ├── AuthContext.tsx          # Authentication state management
    │   └── TournamentContext.tsx    # Tournament data management
    ├── hooks/
    │   └── useUsernameCheck.ts      # Custom hooks
    ├── navigation/
    │   ├── AppNavigator.tsx         # Main navigation structure
    │   └── SimplifiedNavigator.tsx  # Simplified navigation
    ├── screens/                     # App screens
    │   ├── HomeScreen.tsx
    │   ├── auth/
    │   │   ├── SignInScreen.tsx
    │   │   ├── SignUpScreen.tsx
    │   │   └── UsernameSetupScreen.tsx
    │   ├── tournament/
    │   │   ├── FavouriteTournamentsScreen.tsx
    │   │   ├── LiveTournamentScreen.tsx
    │   │   ├── PastTournamentsScreen.tsx
    │   │   ├── TeamOverviewScreen.tsx
    │   │   ├── TourInputScreen.tsx
    │   │   ├── TournamentDashboard.tsx
    │   │   └── matches/
    │   │       ├── MatchScreen1.tsx
    │   │       ├── MatchScreen2.tsx
    │   │       └── MatchScreen3.tsx
    │   └── admin/
    │       └── AdminDashboard.tsx
    ├── services/
    │   ├── firebase.ts              # Firebase service functions
    │   ├── streamingAPI.ts          # Streaming data management
    │   └── README_StreamingAPI.md
    └── utils/
        └── tournamentData.ts        # Tournament data utilities
```

## Key Features

### 1. Authentication System

- Email/password authentication via Firebase Auth
- User profile management with display names
- Username uniqueness validation
- Admin user creation capabilities

### 2. Tournament Management

- 4-team tournament structure (2 semi-finals, 1 final)
- 9 matches per round (best of 9 = 5 wins needed)
- Real-time score tracking
- Match completion detection
- Tournament finalization and locking

### 3. Team & Player Management

- Team creation with 5 players each
- Player designation system (Captain, Player, Manager)
- Team color and icon assignment
- Player participation tracking

### 4. Real-time Data Streaming

- Firebase Firestore real-time listeners
- Streaming mode for live tournament broadcasting
- User-specific data isolation
- Web app data synchronization

### 5. Navigation Structure

- Bottom tab navigation for main features
- Stack navigation for detailed screens
- Conditional navigation based on authentication
- Simplified navigation for tournament management

## Setup Instructions

### 1. Initialize Expo Project

```bash
npx create-expo-app OwensCup --template blank-typescript
cd OwensCup
```

### 2. Install Dependencies

```bash
# Core navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack

# Firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore firebase

# UI components
npm install @expo/vector-icons

# Development dependencies
npm install --save-dev @types/react @types/react-native
```

### 3. Configure Expo

Update `app.json`:

```json
{
  "expo": {
    "name": "OwensCup",
    "slug": "OwensCup",
    "version": "1.0.0",
    "sdkVersion": "54.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.davidonquit.owenscup",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/playstore-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 4. Configure EAS Build

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 16.12.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "demo-apk": {
      "android": {
        "buildType": "apk"
      },
      "developmentClient": false,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "developmentClient": false,
      "distribution": "internal",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 5. Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Download `google-services.json` for Android
5. Configure Firebase config in `src/config/firebase.config.ts`

### 6. Core Architecture Implementation

#### App Entry Point (`App.tsx`)

```typescript
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { TournamentProvider } from "./src/context/TournamentContext";
import SimplifiedNavigator from "./src/navigation/SimplifiedNavigator";

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <SimplifiedNavigator />
      </TournamentProvider>
    </AuthProvider>
  );
}
```

#### Authentication Context (`src/context/AuthContext.tsx`)

- Manages user authentication state
- Handles sign in/up/sign out
- Creates user profiles in Firestore
- Validates usernames for uniqueness

#### Tournament Context (`src/context/TournamentContext.tsx`)

- Manages tournament data state
- Handles real-time score updates
- Implements tournament logic (best of 9 matches)
- Manages streaming data synchronization
- Auto-saves tournament data

#### Firebase Service (`src/services/firebase.ts`)

- Authentication functions
- Tournament data CRUD operations
- User profile management
- Admin functions
- Database connectivity checks

#### Streaming API (`src/services/streamingAPI.ts`)

- Transforms tournament data for web consumption
- Manages streaming modes (normal, streaming, manual)
- Handles real-time data synchronization
- User-specific data isolation

### 7. Theme System (`src/constants/theme.ts`)

Comprehensive theme system with:

- Color palette (primary, secondary, team colors, status colors)
- Typography (font sizes, weights, line heights)
- Spacing system
- Border radius values
- Shadow definitions
- Glassmorphism effects
- Layout constants
- Animation settings
- Z-index management

### 8. Navigation Structure

- **SimplifiedNavigator**: Main app navigator
- **MainTabNavigator**: Bottom tab navigation
- **Stack Navigation**: For detailed screens
- Conditional rendering based on authentication state

## Key Implementation Details

### Tournament Logic

- **Structure**: 4 teams, 2 semi-finals, 1 final
- **Matches**: 9 matches per round
- **Winning**: Best of 9 (5 wins needed)
- **Scoring**: Race-to-score system (3, 5, 7, or 9 points)
- **Completion**: Automatic match/round/tournament completion detection

### Data Flow

1. User creates tournament with teams and players
2. Tournament data stored in Firestore under user's document
3. Real-time listeners update UI when data changes
4. Streaming mode pushes data to web-optimized format
5. Web app receives real-time updates via Firebase listeners

### Security Features

- Input validation for all user inputs
- Email format validation
- Password strength requirements
- Username uniqueness checks
- Firebase security rules for data access
- User-specific data isolation

### Performance Optimizations

- Debounced auto-save (30 seconds)
- Efficient Firebase listeners
- Optimized re-renders with React Context
- Lazy loading of screens
- Connection status monitoring

## Deployment

### Development

```bash
npm start
# or
expo start
```

### EAS Build (Production)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android --profile production
```

### Key Build Profiles

- **development**: Development client for testing
- **preview**: Internal distribution APK
- **production**: Production APK for Play Store

## Customization Guide

### Changing App Name/Branding

1. Update `app.json` name and slug
2. Replace assets in `/assets/` folder
3. Update Firebase project configuration
4. Modify theme colors in `src/constants/theme.ts`
5. Update package.json name

### Adding New Features

1. Create new screens in `src/screens/`
2. Add navigation routes in `SimplifiedNavigator.tsx`
3. Update context providers if needed
4. Add Firebase service functions
5. Update TypeScript interfaces

### Modifying Tournament Structure

1. Update tournament data interfaces
2. Modify tournament logic in `TournamentContext.tsx`
3. Update streaming API transformations
4. Adjust UI components for new structure
5. Update Firebase data validation

## Troubleshooting

### Common Issues

1. **Firebase Connection**: Check configuration and network
2. **Authentication**: Verify Firebase Auth setup
3. **Build Errors**: Check EAS configuration and dependencies
4. **Navigation**: Ensure proper screen registration
5. **Data Sync**: Verify Firestore rules and listeners

### Debug Tools

- Firebase Console for data inspection
- Expo DevTools for development
- React Native Debugger for state inspection
- Console logs for streaming data debugging

This guide provides everything needed to recreate the OwensCup mobile app with the same functionality, architecture, and features.
