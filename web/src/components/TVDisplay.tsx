"use client";

import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import {
  listenToStreamingData,
  WebTournamentData,
  WebRound,
} from "../services/firebase";

interface TVDisplayProps {
  className?: string;
}

const TVDisplay: React.FC<TVDisplayProps> = ({ className = "" }) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Listen to tournament data
  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
      setTournamentData(data);
    });

    return () => unsubscribe();
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div
        className={`fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 ${className}`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-4xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${className}`}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-4xl font-bold mb-4">No Tournament Data</h2>
          <p className="text-gray-600 text-2xl">
            Waiting for mobile app to push data...
          </p>
          <div className="mt-4">
            <span className="ml-2 text-lg text-gray-500">Disconnected</span>
          </div>
        </div>
      </div>
    );
  }

  // const rounds = Array.isArray(tournamentData.rounds)
  //   ? tournamentData.rounds
  //   : [];

  // Helper function to get overall score from mobile app data
  const getOverallScore = (round: WebRound) => {
    // The mobile app sends team1Wins and team2Wins in the round data
    if (round.team1Wins !== undefined && round.team2Wins !== undefined) {
      return [round.team1Wins, round.team2Wins];
    }

    // Fallback: return [0, 0] if no overall score data
    return [0, 0];
  };

  // Helper function to get team name by ID
  const getTeamNameById = (teamId: string) => {
    const team = tournamentData.teams?.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  // Helper function to get match type
  const getMatchType = (matchIndex: number): string => {
    switch (matchIndex) {
      case 0:
        return "Team Match";
      case 1:
        return "1st Doubles";
      case 2:
        return "1st Singles";
      case 3:
        return "2nd Doubles";
      case 4:
        return "2nd Singles";
      case 5:
        return "2nd Team Match";
      case 6:
        return "3rd Doubles";
      case 7:
        return "3rd Singles";
      case 8:
        return "4th Singles";
      default:
        return "Match";
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      <Navigation />

      <div
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          paddingLeft: "80px",
          paddingRight: "80px",
        }}
        className="overflow-y-auto h-full"
      >
        {/* Tournament Title */}
        <div className="text-center mb-6">
          <h1 className="text-white text-6xl font-bold">OwensCup Tournament</h1>
        </div>

        {/* Live Match Display */}
        <div className="bg-gray-800 rounded-lg mb-4" style={{ height: "60px" }}>
          <div className="flex items-center justify-between h-full px-6">
            <div className="text-white text-3xl font-bold bg-red-500 px-4 py-2 rounded">
              LIVE MATCH
            </div>
            <div className="text-white text-xl">
              Powered by OwensCup Tournament System
            </div>
          </div>
        </div>

        {/* Tournament Bracket */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournamentData.rounds
              .filter((round) => round.matches && round.matches.length > 0)
              .map((round, index) => {
                const roundScores = getOverallScore(round);
                const roundTeam1Name =
                  round.matches?.[0]?.team1?.name ||
                  getTeamNameById(round.matches?.[0]?.team1Id || "") ||
                  tournamentData.teams?.[0]?.name ||
                  "Team 1";
                const roundTeam2Name =
                  round.matches?.[0]?.team2?.name ||
                  getTeamNameById(round.matches?.[0]?.team2Id || "") ||
                  tournamentData.teams?.[1]?.name ||
                  "Team 2";

                return (
                  <div
                    key={round.roundName || round.name || `round-${index}`}
                    className={`p-6 rounded-lg ${
                      round.isActive
                        ? "bg-gray-700 border-2 border-green-500"
                        : "bg-gray-700"
                    }`}
                  >
                    {/* Overall Score for this round */}
                    {round.roundName === "final" &&
                    (tournamentData.rounds.find(
                      (r) => r.roundName === "semiFinal1"
                    )?.isCompleted !== true ||
                      tournamentData.rounds.find(
                        (r) => r.roundName === "semiFinal2"
                      )?.isCompleted !== true ||
                      (!round.matches?.[0]?.team1Id &&
                        !round.matches?.[0]?.team1?.name)) ? (
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-white text-4xl font-bold">TBD</div>
                        <div className="text-yellow-300 text-8xl font-bold mx-4">
                          0 - 0
                        </div>
                        <div className="text-white text-4xl font-bold">TBD</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center mb-4">
                        <div className="text-white text-4xl font-bold">
                          {roundTeam1Name}
                        </div>
                        <div className="text-yellow-300 text-8xl font-bold mx-4">
                          {roundScores[0]} - {roundScores[1]}
                        </div>
                        <div className="text-white text-4xl font-bold">
                          {roundTeam2Name}
                        </div>
                      </div>
                    )}

                    <h4 className="text-white text-6xl font-bold mb-4">
                      {round.roundName === "semiFinal1"
                        ? "Semifinal 1"
                        : round.roundName === "semiFinal2"
                        ? "Semifinal 2"
                        : round.roundName === "final"
                        ? "Final"
                        : round.roundName || round.name || `Round ${index + 1}`}
                    </h4>
                    <div className="space-y-4">
                      {round.matches.map((match, matchIndex) => {
                        return (
                          <div
                            key={
                              match.id ||
                              `${
                                round.roundName || round.name || index
                              }-match-${matchIndex}`
                            }
                            className="text-2xl p-3 relative"
                          >
                            {/* Background with border radius */}
                            <div
                              className={`absolute inset-0 rounded-[5px] ${
                                match.isLive ||
                                (match.team1Score && match.team1Score > 0) ||
                                (match.team2Score && match.team2Score > 0) ||
                                (match.team1?.score && match.team1.score > 0) ||
                                (match.team2?.score && match.team2.score > 0)
                                  ? "bg-gray-900 border-2 border-gray-700"
                                  : match.isCompleted
                                  ? "bg-green-500 bg-opacity-30 border-2 border-green-400"
                                  : "bg-gray-600"
                              }`}
                            ></div>

                            {/* Content */}
                            <div className="relative z-10">
                              {/* Match Type */}
                              <div className="text-white text-3xl font-bold mb-2 text-center">
                                Match {matchIndex + 1}:{" "}
                                {getMatchType(matchIndex)}
                              </div>

                              {/* Teams in Row */}
                              <div className="flex items-center justify-center">
                                {/* Team 1 */}
                                <div className="flex items-center justify-end flex-1 pr-4">
                                  <div className="text-white text-3xl font-bold mr-4">
                                    {round.roundName === "final" &&
                                    (tournamentData.rounds.find(
                                      (r) => r.roundName === "semiFinal1"
                                    )?.isCompleted !== true ||
                                      tournamentData.rounds.find(
                                        (r) => r.roundName === "semiFinal2"
                                      )?.isCompleted !== true ||
                                      (!match.team1Id && !match.team1?.name))
                                      ? "TBD"
                                      : match.team1?.name ||
                                        getTeamNameById(match.team1Id || "") ||
                                        "Team 1"}
                                  </div>
                                  <div className="text-yellow-300 text-4xl font-bold">
                                    {match.team1Score ||
                                      match.team1?.score ||
                                      0}
                                  </div>
                                </div>

                                <div className="text-white text-2xl font-bold mx-4">
                                  vs
                                </div>

                                {/* Team 2 */}
                                <div className="flex items-center justify-start flex-1 pl-4">
                                  <div className="text-yellow-300 text-4xl font-bold">
                                    {match.team2Score ||
                                      match.team2?.score ||
                                      0}
                                  </div>
                                  <div className="text-white text-3xl font-bold ml-4">
                                    {round.roundName === "final" &&
                                    (tournamentData.rounds.find(
                                      (r) => r.roundName === "semiFinal1"
                                    )?.isCompleted !== true ||
                                      tournamentData.rounds.find(
                                        (r) => r.roundName === "semiFinal2"
                                      )?.isCompleted !== true ||
                                      (!match.team2Id && !match.team2?.name))
                                      ? "TBD"
                                      : match.team2?.name ||
                                        getTeamNameById(match.team2Id || "") ||
                                        "Team 2"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVDisplay;
