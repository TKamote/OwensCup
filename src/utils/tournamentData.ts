// Tournament data and utility functions for the Modified Mosconi Cup-style 9-ball tournament

export const teams = [
  {
    name: "Pinoy Sargo",
    logo: require("../../assets/favicon.png"), // Salmon fish
    players: ["Sargo 1", "Sargo 2", "Sargo 3", "Sargo 4", "Sargo 5"],
  },
  {
    name: "WBB (Jerome)",
    logo: require("../../assets/icon.png"), // Tuna fish
    players: ["Jerome 1", "Jerome 2", "Jerome 3", "Jerome 4", "Jerome 5"],
  },
];

export const matches = [
  {
    number: 1,
    type: "Team Match",
    raceTo: 5,
    players: "All",
  },
  {
    number: 2,
    type: "Doubles",
    raceTo: 4,
    players: "Pair",
  },
  {
    number: 3,
    type: "Singles",
    raceTo: 4,
    players: "1v1",
  },
  {
    number: 4,
    type: "Reverse Doubles",
    raceTo: 4,
    players: "Pair",
  },
  {
    number: 5,
    type: "Singles",
    raceTo: 4,
    players: "1v1",
  },
  {
    number: 6,
    type: "Team Match",
    raceTo: 5,
    players: "All",
  },
  {
    number: 7,
    type: "Doubles",
    raceTo: 4,
    players: "Pair",
  },
  {
    number: 8,
    type: "Singles",
    raceTo: 4,
    players: "1v1",
  },
  {
    number: 9,
    type: "Captain’s Pick",
    raceTo: 4,
    players: "1v1",
  },
];
