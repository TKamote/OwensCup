# OwensCup Web App - Complete Recreation Guide

## Overview

The OwensCup web app is a Next.js application that provides real-time tournament streaming and display capabilities. It connects to Firebase to receive live tournament data from the mobile app and displays it in a TV-friendly format optimized for streaming and broadcasting.

## Technology Stack

### Core Technologies

- **Next.js**: 15.5.3 (with Turbopack)
- **React**: 19.1.0
- **TypeScript**: ^5
- **Tailwind CSS**: ^4

### Firebase Integration

- **firebase**: ^12.3.0

### UI Components & Icons

- **@fortawesome/fontawesome-svg-core**: ^7.1.0
- **@fortawesome/free-solid-svg-icons**: ^7.1.0
- **@fortawesome/react-fontawesome**: ^3.1.0

### Streaming Integration

- **obs-websocket-js**: ^5.0.6 (for OBS Studio integration)

### Development Tools

- **ESLint**: ^9
- **@types/node**: ^20
- **@types/react**: ^19
- **@types/react-dom**: ^19

## Project Structure

```
web/
├── package.json                     # Dependencies and scripts
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── postcss.config.mjs               # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
├── next-env.d.ts                    # Next.js type definitions
├── README.md                        # Project documentation
├── STREAMING_SETUP.md               # Streaming setup guide
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── vercel.svg
└── src/
    ├── app/                         # Next.js App Router
    │   ├── favicon.ico
    │   ├── globals.css              # Global styles
    │   ├── layout.tsx               # Root layout
    │   ├── page.tsx                 # Home page
    │   ├── players/
    │   │   └── page.tsx             # Players page
    │   ├── stream/
    │   │   └── page.tsx             # Stream page
    │   ├── stream-experimental/
    │   │   ├── layout.tsx           # Experimental stream layout
    │   │   └── page.tsx             # Experimental stream page
    │   ├── team/
    │   │   └── page.tsx             # Team page
    │   └── teams/
    │       └── page.tsx             # Teams page
    ├── components/                  # React components
    │   ├── Navigation.tsx           # Main navigation component
    │   ├── Navigation.module.css    # Navigation styles
    │   ├── StreamOverlay.tsx        # Stream overlay component
    │   ├── StreamOverlayExperimental.tsx
    │   ├── TeamsDisplay.tsx         # Teams display component
    │   └── TVDisplay.tsx            # Main TV display component
    ├── config/
    │   └── firebase.config.ts       # Firebase configuration
    └── services/
        └── firebase.ts              # Firebase service functions
```

## Key Features

### 1. Real-time Tournament Display

- Live tournament data from Firebase
- TV-optimized layout for streaming
- Real-time score updates
- Tournament status tracking

### 2. Multi-page Navigation

- Home page with main tournament display
- Teams page for team information
- Players page for player details
- Stream page for streaming controls
- Team-specific pages

### 3. Streaming Integration

- OBS Studio integration via WebSocket
- Stream control functionality
- Overlay management
- Real-time streaming data

### 4. Responsive Design

- Mobile-first approach
- TV-friendly layouts
- Glassmorphism effects
- Dark theme optimized for streaming

### 5. Firebase Integration

- Real-time data listeners
- User-specific data access
- Stream control management
- Data exploration tools

## Setup Instructions

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app
cd web
```

### 2. Install Dependencies

```bash
# Firebase
npm install firebase

# FontAwesome icons
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome

# OBS integration
npm install obs-websocket-js

# Development dependencies
npm install --save-dev @types/node
```

### 3. Configure Next.js

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 4. Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        secondary: "#FFD700",
        glass: {
          primary: "rgba(255, 255, 255, 0.25)",
          secondary: "rgba(255, 255, 255, 0.15)",
          border: "rgba(107, 217, 85, 0.3)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
```

### 5. Firebase Setup

Create `src/config/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id",
};

export const validateFirebaseConfig = () => {
  const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      throw new Error(`Missing required Firebase configuration: ${key}`);
    }
  }

  return true;
};
```

### 6. Core Components Implementation

#### Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Owen's Cup Tournament",
  description: "Real-time tournament streaming and management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

#### Main TV Display Component (`src/components/TVDisplay.tsx`)

- Real-time Firebase data listening
- Tournament status display
- Team and match information
- Responsive layout for streaming
- Glassmorphism styling

#### Navigation Component (`src/components/Navigation.tsx`)

- Multi-page navigation
- Active page highlighting
- Responsive design
- FontAwesome icons

#### Firebase Service (`src/services/firebase.ts`)

- Real-time data listeners
- Stream control management
- Data transformation utilities
- Error handling and fallbacks

### 7. Page Structure

#### Home Page (`src/app/page.tsx`)

```typescript
import TVDisplay from "@/components/TVDisplay";

export default function Home() {
  return (
    <main className="min-h-screen">
      <TVDisplay />
    </main>
  );
}
```

#### Teams Page (`src/app/teams/page.tsx`)

- Team information display
- Player lists
- Team statistics
- Responsive grid layout

#### Players Page (`src/app/players/page.tsx`)

- Individual player information
- Player statistics
- Team affiliations
- Search and filter functionality

#### Stream Page (`src/app/stream/page.tsx`)

- Streaming controls
- OBS integration
- Overlay management
- Real-time stream status

### 8. Styling System

#### Global Styles (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-geist-sans: "Geist", sans-serif;
  --font-geist-mono: "Geist Mono", monospace;
}

body {
  font-family: var(--font-geist-sans);
}

/* Glassmorphism utilities */
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

#### Navigation Styles (`src/components/Navigation.module.css`)

- Custom navigation styling
- Active state indicators
- Responsive breakpoints
- Animation effects

## Key Implementation Details

### Real-time Data Flow

1. Firebase Firestore listeners connect to streaming collection
2. Mobile app pushes tournament data to user-specific documents
3. Web app receives real-time updates via Firebase listeners
4. UI components re-render with new data automatically
5. Stream control updates affect display behavior

### Data Structure

- **Tournament Overview**: Basic tournament information
- **Teams**: Team details with player information
- **Rounds**: Semi-finals and final round data
- **Matches**: Individual match scores and status
- **Stream Control**: Display preferences and hidden sections

### Streaming Integration

- OBS Studio WebSocket connection
- Real-time overlay updates
- Stream control management
- Custom overlay positioning

### Responsive Design

- Mobile-first approach
- TV-optimized layouts (1920x1080, 4K support)
- Flexible grid systems
- Adaptive typography

### Performance Optimizations

- Next.js App Router for optimal performance
- Client-side rendering for real-time updates
- Efficient Firebase listeners
- Optimized re-renders
- Image optimization

## Deployment

### Development

```bash
npm run dev
# or with Turbopack
npm run dev --turbopack
```

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Set environment variables for Firebase
4. Deploy automatically on git push

### Custom Domain Setup

1. Configure domain in Vercel dashboard
2. Update DNS settings
3. Configure SSL certificate
4. Update Firebase authorized domains

## Customization Guide

### Changing App Name/Branding

1. Update `src/app/layout.tsx` metadata
2. Replace favicon and public assets
3. Update Firebase project configuration
4. Modify color scheme in Tailwind config
5. Update component text and labels

### Adding New Pages

1. Create new page in `src/app/`
2. Add navigation link in `Navigation.tsx`
3. Implement page component
4. Add routing if needed
5. Update TypeScript interfaces

### Modifying Display Layout

1. Update `TVDisplay.tsx` component
2. Modify CSS classes and Tailwind utilities
3. Adjust responsive breakpoints
4. Update glassmorphism effects
5. Test on different screen sizes

### Adding New Firebase Collections

1. Update Firebase service functions
2. Add TypeScript interfaces
3. Implement real-time listeners
4. Update data transformation logic
5. Add error handling

## Troubleshooting

### Common Issues

1. **Firebase Connection**: Check configuration and network
2. **Real-time Updates**: Verify Firestore listeners
3. **Build Errors**: Check Next.js configuration
4. **Styling Issues**: Verify Tailwind CSS setup
5. **Streaming Problems**: Check OBS WebSocket connection

### Debug Tools

- Firebase Console for data inspection
- Next.js DevTools for development
- Browser DevTools for client-side debugging
- Vercel Analytics for performance monitoring

### Performance Monitoring

- Core Web Vitals tracking
- Real-time data update frequency
- Firebase listener performance
- Bundle size optimization

## Advanced Features

### OBS Integration

- WebSocket connection to OBS Studio
- Real-time overlay updates
- Scene switching capabilities
- Stream control management

### Multi-user Support

- User-specific data isolation
- Multiple tournament streams
- Admin controls
- Permission management

### Analytics Integration

- Tournament view tracking
- User engagement metrics
- Performance monitoring
- Error tracking

This guide provides everything needed to recreate the OwensCup web app with the same functionality, real-time capabilities, and streaming integration.
