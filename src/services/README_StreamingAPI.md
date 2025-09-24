# Streaming API Documentation

## Overview

The Streaming API provides a clean, web-optimized data export system for your tournament app. It allows you to control when and how tournament data is pushed to Firebase for web consumption.

## Features

### 🎯 Smart Data Management

- **Normal Mode**: Auto-save every 30 seconds (default)
- **Streaming Mode**: Real-time updates to web streaming
- **Manual Mode**: Save only when you press buttons

### 📊 Web-Optimized Data Structure

- Clean, standardized JSON format
- Optimized for streaming overlays
- Real-time tournament status tracking
- Match progression and scoring data

### 🔄 Real-time Updates

- Firebase listeners for live data
- Automatic data synchronization
- Web-friendly data transformation

## Usage

### 1. Streaming Controls Component

The `StreamingControls` component provides a user interface for managing streaming modes:

```tsx
import StreamingControls from "../components/streaming/StreamingControls";

// Add to your screen
<StreamingControls />;
```

### 2. Programmatic Control

```tsx
import { useTournament } from "../context/TournamentContext";

const { streamingMode, setStreamingMode, pushToStreaming, getWebData } =
  useTournament();

// Change streaming mode
setStreamingMode("streaming");

// Force push data to streaming
await pushToStreaming(true);

// Get current web data
const webData = getWebData();
```

### 3. Web Data Structure

The API transforms your tournament data into a web-friendly format:

```typescript
interface WebTournamentData {
  overview: {
    tournamentId: string;
    tournamentName: string;
    status: "setup" | "live" | "completed";
    currentRound: "semiFinal1" | "semiFinal2" | "final" | null;
    // ... more fields
  };
  rounds: {
    semiFinal1: WebRoundData;
    semiFinal2: WebRoundData;
    final: WebRoundData;
  };
  champion: {
    teamId: string | null;
    teamName: string | null;
  };
  streamingMode: StreamingMode;
  lastWebUpdate: Date | null;
}
```

## Firebase Structure

### User Tournament Data

```
users/{userId}/tournament/current
```

- Your existing tournament data
- Always saved regardless of streaming mode

### Streaming Data

```
streaming/current_tournament
```

- Web-optimized tournament data
- Only updated when in streaming mode or forced
- Contains transformed data for web consumption

## Streaming Modes

### Normal Mode (Default)

- Auto-save every 30 seconds
- Data saved to user's tournament collection
- No streaming data pushed
- Best for regular tournament management

### Streaming Mode

- Real-time updates to streaming collection
- Data pushed immediately on changes
- Higher data usage
- Best for live streaming/broadcasting

### Manual Mode

- No automatic saves
- Save only when buttons are pressed
- Full control over data pushes
- Best for testing or low-connection scenarios

## Web Integration

### Firebase Listener (React.js)

```javascript
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Listen to streaming data
const streamingRef = doc(db, "streaming", "current_tournament");
const unsubscribe = onSnapshot(streamingRef, (doc) => {
  if (doc.exists()) {
    const tournamentData = doc.data();
    // Update your web UI with tournament data
    updateTournamentUI(tournamentData);
  }
});
```

### Data Consumption

```javascript
// Example: Update tournament status
function updateTournamentUI(data) {
  const { overview, rounds, champion } = data;

  // Update tournament header
  document.getElementById("tournament-name").textContent =
    overview.tournamentName;
  document.getElementById("tournament-status").textContent = overview.status;

  // Update current match
  if (overview.currentRound) {
    const currentRound = rounds[overview.currentRound];
    updateMatchDisplay(currentRound);
  }

  // Update champion
  if (champion.teamName) {
    document.getElementById("champion").textContent = champion.teamName;
  }
}
```

## Performance Considerations

### Data Volume Control

- **Normal Mode**: Minimal Firebase writes (30-second intervals)
- **Streaming Mode**: Real-time writes (higher usage)
- **Manual Mode**: Zero automatic writes

### Cost Optimization

- Use Normal Mode for regular tournament management
- Switch to Streaming Mode only when broadcasting
- Use Manual Mode for testing or low-connection scenarios

### Web App Performance

- Web app controls its own update frequency
- Firebase listeners are efficient and real-time
- Data structure is optimized for quick parsing

## Error Handling

The API includes comprehensive error handling:

```typescript
try {
  await pushToStreaming(true);
} catch (error) {
  console.error("Failed to push to streaming:", error);
  // Handle error appropriately
}
```

## Testing

### Preview Web Data

Use the "View Web Data" button in the Streaming Controls to preview the exact data that will be sent to your web app.

### Manual Testing

1. Set up a tournament with teams
2. Switch to Streaming Mode
3. Make score changes
4. Check Firebase console for streaming data updates
5. Verify web app receives real-time updates

## Next Steps

1. **Test the streaming functionality** with your existing tournament data
2. **Integrate with your React.js web app** using Firebase listeners
3. **Customize the web data structure** if needed for your specific use case
4. **Add authentication** to the streaming collection for security
5. **Implement web overlays** using the tournament data

## Support

For questions or issues with the Streaming API, check:

- Firebase console for data updates
- Browser console for web app errors
- Mobile app console for streaming errors
- This documentation for usage examples
