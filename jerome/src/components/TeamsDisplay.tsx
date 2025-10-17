"use client";

import React, { useState, useEffect } from "react";
import { listenToStreamingData, WebTournamentData } from "../services/firebase";

interface TeamsDisplayProps {
  className?: string;
  defaultTab?: "teams" | "players";
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  className = "",
  defaultTab = "teams",
}) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab] = useState<"teams" | "players">(defaultTab);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
      console.log("Tournament data received:", data);
      console.log("Raw teams data:", data?.teams);
      console.log("Teams length:", data?.teams?.length);
      if (data?.teams) {
        data.teams.forEach((team, index) => {
          console.log(`Team ${index}:`, team);
          console.log(`Team ${index} players:`, team.players);
        });
      }
      setTournamentData(data);
    });

    return () => unsubscribe();
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gray-100 text-gray-800 p-8 h-screen flex items-center justify-center">
        <div className="text-4xl">Loading...</div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div className="bg-gray-100 text-gray-800 p-8 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-gray-800">
            Waiting for Tournament Data...
          </div>
          <div className="text-sm text-gray-600">
            Make sure your mobile app is connected and tournament is active
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-transparent text-gray-800 p-8 h-[1200px] overflow-hidden ${className}`}
    >
      {/* Tab Content */}
      <div className="h-full">
        {activeTab === "teams" ? (
          <div className="max-w-6xl mx-auto h-[1000px] bg-transparent">
            {/* Teams Content */}
            <div className="bg-gradient-to-br from-yellow-200/60 via-amber-200/50 to-yellow-200/55 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/70 shadow-2xl h-full mt-15">
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold mb-2 text-white">Teams</h2>
                <div className="w-20 h-1 mx-auto bg-cyan-600"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(tournamentData.teams?.length > 0
                  ? tournamentData.teams
                  : [
                      { id: "1", name: "Pinoy Sargo", players: [] },
                      { id: "2", name: "WBB (Jerome)", players: [] },
                      { id: "3", name: "Bikol", players: [] },
                      { id: "4", name: "Ilongo", players: [] },
                    ]
                )
                  .slice(0, 4)
                  .map((team) => (
                    <div
                      key={team.id}
                      className="bg-gradient-to-br from-yellow-100/60 to-amber-100/50 backdrop-blur-lg rounded-xl p-4 border border-yellow-400/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="text-center mb-3">
                        <h3 className="text-3xl font-bold mb-2 text-yellow-800">
                          {team.name}
                        </h3>
                        <div className="w-16 h-1 mx-auto mb-3 bg-cyan-600"></div>
                        <div className="text-gray-700 text-xl mb-3">
                          {team.players?.length || 0} Players
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="space-y-2">
                        {team.players && team.players.length > 0 ? (
                          team.players.map((player) => (
                            <div
                              key={player.id}
                              className="text-2xl p-2 m-2 rounded-lg bg-white/80 border border-yellow-400/30 text-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {player.name}
                                </span>
                                {player.captain && (
                                  <span className="text-base bg-yellow-500 text-white px-2 py-1 rounded font-bold">
                                    C
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-600 text-xl italic">
                            No players available
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto h-full bg-transparent bg-opacity-50 mt-15">
            {/* Players Content */}
            <div className="bg-gradient-to-br from-yellow-200/60 via-amber-200/50 to-yellow-200/55 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/70 shadow-2xl h-[1000px]">
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold mb-2 text-white">Players</h2>
                <div className="w-20 h-1 mx-auto bg-cyan-600"></div>
                <p className="text-xl text-white mt-2">
                  All Players (for Ranking)
                </p>
              </div>

              <div className="h-full overflow-y-auto">
                <div className="space-y-2">
                  {(() => {
                    // Get all unique players from all teams
                    const allPlayers =
                      tournamentData.teams?.flatMap(
                        (team) =>
                          team.players?.map((player) => ({
                            ...player,
                            teamName: team.name,
                            // Add placeholder points for ranking
                            points: Math.floor(Math.random() * 100) + 1,
                          })) || []
                      ) || [];

                    // If no players, show sample data
                    const samplePlayers = [
                      {
                        id: "1",
                        name: "John Doe",
                        captain: false,
                        teamName: "Pinoy Sargo",
                        points: 85,
                      },
                      {
                        id: "2",
                        name: "Jane Smith",
                        captain: false,
                        teamName: "WBB (Jerome)",
                        points: 72,
                      },
                      {
                        id: "3",
                        name: "Mike Johnson",
                        captain: false,
                        teamName: "Bikol",
                        points: 68,
                      },
                      {
                        id: "4",
                        name: "Sarah Wilson",
                        captain: false,
                        teamName: "Ilongo",
                        points: 91,
                      },
                      {
                        id: "5",
                        name: "David Brown",
                        captain: false,
                        teamName: "Pinoy Sargo",
                        points: 55,
                      },
                      {
                        id: "6",
                        name: "Lisa Davis",
                        captain: false,
                        teamName: "WBB (Jerome)",
                        points: 78,
                      },
                    ];

                    const playersToShow =
                      allPlayers.length > 0 ? allPlayers : samplePlayers;

                    // Debug: Log player counts
                    console.log(
                      "🔍 Total players before deduplication:",
                      playersToShow.length
                    );
                    playersToShow.forEach((player, index) => {
                      console.log(
                        `  Player ${index + 1}: ${player.name} (${
                          player.teamName
                        })`
                      );
                    });

                    // Remove duplicates by player name (in case same player is in multiple teams)
                    const uniquePlayers = playersToShow.filter(
                      (player, index, self) =>
                        index === self.findIndex((p) => p.name === player.name)
                    );

                    console.log(
                      "🔍 Total players after deduplication:",
                      uniquePlayers.length
                    );

                    // Sort players by points in descending order for ranking
                    uniquePlayers.sort((a, b) => b.points - a.points);

                    // Split players into two columns
                    const leftColumnPlayers = uniquePlayers.filter(
                      (_, index) => index % 2 === 0
                    );
                    const rightColumnPlayers = uniquePlayers.filter(
                      (_, index) => index % 2 === 1
                    );

                    return (
                      <>
                        {/* Column Headers */}
                        <div className="grid grid-cols-2 gap-2 text-3xl font-bold text-white mb-2 pb-2 border-b border-gray-400">
                          <div className="grid grid-cols-4 gap-1">
                            <div className="text-center">Rank</div>
                            <div>Name</div>
                            <div>Team</div>
                            <div className="text-right">Points</div>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            <div className="text-center">Rank</div>
                            <div>Name</div>
                            <div>Team</div>
                            <div className="text-right">Points</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Left Column */}
                          <div className="space-y-1">
                            {leftColumnPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="grid grid-cols-4 gap-1 items-center p-2 rounded-lg bg-gradient-to-r from-yellow-100/60 to-amber-100/40 backdrop-blur-sm border border-yellow-400/40 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <div className="text-center text-3xl font-bold text-yellow-700">
                                  {uniquePlayers.indexOf(player) + 1}
                                </div>
                                <div className="text-3xl font-medium text-gray-800 truncate">
                                  {player.name}
                                </div>
                                <div className="text-3xl text-gray-600 truncate">
                                  {player.teamName}
                                </div>
                                <div className="text-right text-3xl font-bold text-yellow-700">
                                  {player.points}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Right Column */}
                          <div className="space-y-1">
                            {rightColumnPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="grid grid-cols-4 gap-1 items-center p-2 rounded-lg bg-gradient-to-r from-yellow-100/60 to-amber-100/40 backdrop-blur-sm border border-yellow-400/40 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                <div className="text-center text-3xl font-bold text-yellow-700">
                                  {uniquePlayers.indexOf(player) + 1}
                                </div>
                                <div className="text-3xl font-medium text-gray-800 truncate">
                                  {player.name}
                                </div>
                                <div className="text-3xl text-gray-600 truncate">
                                  {player.teamName}
                                </div>
                                <div className="text-right text-3xl font-bold text-yellow-700">
                                  {player.points}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsDisplay;
