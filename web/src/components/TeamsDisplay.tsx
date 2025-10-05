"use client";

import React, { useState, useEffect } from "react";
import { listenToStreamingData, WebTournamentData } from "../services/firebase";

interface TeamsDisplayProps {
  className?: string;
  defaultTab?: "teams" | "players";
  showTabs?: boolean;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  className = "",
  defaultTab = "teams",
  showTabs = true,
}) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"teams" | "players">(defaultTab);

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
      <div className="bg-gray-900 text-white p-8 h-screen flex items-center justify-center">
        <div className="text-4xl">Loading...</div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div className="bg-gray-900 text-white p-8 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Waiting for Tournament Data...</div>
          <div className="text-sm text-gray-400">
            Make sure your mobile app is connected and tournament is active
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-transparent text-white p-8 h-[1200px] overflow-hidden ${className}`}
    >
      {/* Home Navigation Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg border border-gray-600 transition-all duration-200 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Home
        </button>
      </div>

      {/* Tab Navigation - Only show if showTabs is true */}
      {showTabs && (
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => setActiveTab("teams")}
              className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                activeTab === "teams"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                activeTab === "players"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Players
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="h-full">
        {activeTab === "teams" ? (
          <div className="max-w-6xl mx-auto h-[1000px] bg-transparent">
            {/* Teams Content */}
            <div className="bg-slate-900 bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border border-yellow-400 border-opacity-40 shadow-xl h-full mt-15">
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold mb-2 text-yellow-400">
                  Teams
                </h2>
                <div className="w-20 h-1 mx-auto bg-cyan-400"></div>
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
                      className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-cyan-300 border-opacity-40 shadow-lg"
                    >
                      <div className="text-center mb-3">
                        <h3 className="text-3xl font-bold mb-2 text-yellow-300">
                          {team.name}
                        </h3>
                        <div className="w-16 h-1 mx-auto mb-3 bg-cyan-300"></div>
                        <div className="text-gray-300 text-xl mb-3">
                          {team.players?.length || 0} Players
                        </div>
                      </div>

                      {/* Players List */}
                      <div className="space-y-2">
                        {team.players && team.players.length > 0 ? (
                          team.players.map((player) => (
                            <div
                              key={player.id}
                              className="text-2xl p-2 rounded bg-slate-700 bg-opacity-80 border border-cyan-200 border-opacity-20 text-white"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {player.name}
                                </span>
                                {player.captain && (
                                  <span className="text-base bg-yellow-400 text-black px-2 py-1 rounded font-bold">
                                    C
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-xl italic">
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
            <div className="bg-slate-900 bg-opacity-95 backdrop-blur-sm rounded-xl p-6 border border-yellow-400 border-opacity-40 shadow-xl h-[1000px]">
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold mb-2 text-yellow-400">
                  Players
                </h2>
                <div className="w-20 h-1 mx-auto bg-cyan-400"></div>
                <p className="text-xl text-gray-400 mt-2">
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

                    // Remove duplicates by player name (in case same player is in multiple teams)
                    const uniquePlayers = playersToShow.filter(
                      (player, index, self) =>
                        index === self.findIndex((p) => p.name === player.name)
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
                        <div className="grid grid-cols-2 gap-2 text-3xl font-bold text-gray-300 mb-2 pb-2 border-b border-gray-600">
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
                                className="grid grid-cols-4 gap-1 items-center p-2 rounded-lg bg-slate-700 bg-opacity-80 border border-cyan-200 border-opacity-20"
                              >
                                <div className="text-center text-2xl font-bold text-yellow-400">
                                  {uniquePlayers.indexOf(player) + 1}
                                </div>
                                <div className="text-3xl font-medium text-white truncate">
                                  {player.name}
                                </div>
                                <div className="text-2xl text-gray-400 truncate">
                                  {player.teamName}
                                </div>
                                <div className="text-right text-3xl font-bold text-yellow-400">
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
                                className="grid grid-cols-4 gap-1 items-center p-2 rounded-lg bg-slate-700 bg-opacity-80 border border-cyan-200 border-opacity-20"
                              >
                                <div className="text-center text-2xl font-bold text-yellow-400">
                                  {uniquePlayers.indexOf(player) + 1}
                                </div>
                                <div className="text-3xl font-medium text-white truncate">
                                  {player.name}
                                </div>
                                <div className="text-2xl text-gray-400 truncate">
                                  {player.teamName}
                                </div>
                                <div className="text-right text-3xl font-bold text-yellow-400">
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
