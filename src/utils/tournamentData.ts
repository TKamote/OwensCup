// Current tournament data (PBS Cup 2025_Aug - Live)
export const teams = [
  { name: "Pinoy Sargo", score: 0 },
  { name: "WBB (Jerome)", score: 0 },
];

export const matches = [
  {
    number: 1,
    type: "1st Team Match",
    players: "All",
    raceTo: 5,
  },
  {
    number: 2,
    type: "1st Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 3,
    type: "1st Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 4,
    type: "2nd Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 5,
    type: "2nd Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 6,
    type: "2nd Team Match",
    players: "All",
    raceTo: 5,
  },
  {
    number: 7,
    type: "3rd Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 8,
    type: "3rd Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 9,
    type: "4th Singles [Captain's Pick]",
    players: "1v1",
    raceTo: 5,
  },
];

// Past tournament data (PBS Cup 2025_Jul - Completed)
export const pastTeams = [
  { name: "Pinoy Sargo", score: 3 },
  { name: "WBB (Jerome)", score: 5 },
];

export const pastMatches = [
  {
    number: 1,
    type: "1st Team Match",
    players: "All",
    raceTo: 5,
  },
  {
    number: 2,
    type: "1st Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 3,
    type: "1st Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 4,
    type: "2nd Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 5,
    type: "2nd Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 6,
    type: "2nd Team Match",
    players: "All",
    raceTo: 5,
  },
  {
    number: 7,
    type: "3rd Doubles",
    players: "Pair",
    raceTo: 5,
  },
  {
    number: 8,
    type: "3rd Singles",
    players: "1v1",
    raceTo: 5,
  },
  {
    number: 9,
    type: "4th Singles [Captain's Pick]",
    players: "1v1",
    raceTo: 5,
  },
];

// Function to get tournament data based on type
export const getTournamentData = (type: "live" | "past") => {
  if (type === "past") {
    return {
      teams: pastTeams,
      matches: pastMatches,
    };
  }
  return {
    teams,
    matches,
  };
};
