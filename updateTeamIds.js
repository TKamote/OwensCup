// Simple script to update team IDs in Firestore
// You can run this in your browser console or create a Firebase function

// Current data structure (what you have):
const currentTeams = [
  {
    id: 1,
    name: "Balagbag",
    captain: "Lito",
    manager: "Dave",
    players: "Bong, Freddie, larry, Ariel, Neri, Nilo",
    color: "#007AFF",
    icon: "trophy",
  },
  {
    id: 1, // This is the problem!
    name: "Flordeliz",
    captain: "Caracas",
    manager: "Bong",
    players: "Liming, Nadine, King, Arum, MOmin, Subra",
    color: "#FF9500",
    icon: "flag",
  },
];

// Updated data structure (what you want):
const updatedTeams = [
  {
    id: "team_001", // Unique string ID
    name: "Balagbag",
    captain: "Lito",
    manager: "Dave",
    players: "Bong, Freddie, larry, Ariel, Neri, Nilo",
    color: "#007AFF",
    icon: "trophy",
  },
  {
    id: "team_002", // Unique string ID
    name: "Flordeliz",
    captain: "Caracas",
    manager: "Bong",
    players: "Liming, Nadine, King, Arum, MOmin, Subra",
    color: "#FF9500",
    icon: "flag",
  },
];

// To update in Firestore:
// 1. Go to your Firestore console
// 2. Navigate to: users > [your-user-id] > tournament > current
// 3. Update the confirmedTeams array with the updatedTeams data above
// 4. Save the changes

console.log("Updated teams with unique IDs:", updatedTeams);
