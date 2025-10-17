"use client";

import React, { useState, useEffect } from "react";
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
      console.log("🔍 TVDisplay received data:", data);
      setTournamentData(data);
    });

    return () => unsubscribe();
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-800 text-8xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${className}`}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-8xl font-bold mb-4 text-gray-800">
            No Tournament Data
          </h2>
          <p className="text-gray-600 text-4xl">
            Waiting for mobile app to push data...
          </p>
          <div className="mt-4">
            <span className="ml-2 text-2xl text-gray-600">Disconnected</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get overall score from mobile app data
  const getOverallScore = (round: WebRound) => {
    if (round.team1Wins !== undefined && round.team2Wins !== undefined) {
      return [round.team1Wins, round.team2Wins];
    }
    return [0, 0];
  };

  // Helper function to get team name by ID (copied from web app)
  const getTeamNameById = (teamId: string) => {
    const team = tournamentData.teams?.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  // Helper function to get match type (copied from web app)
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
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
      style={{ minHeight: "980px" }}
    >
      {/* Live Match Banner - Top Right */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
        <div className="bg-red-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-lg">
          <div className="text-sm md:text-lg font-bold">LIVE MATCH</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {tournamentData.rounds
            .filter((round) => round.matches && round.matches.length > 0)
            .map((round, index) => {
              const roundScores = getOverallScore(round);
              const roundTeam1Name =
                round.matches?.[0]?.team1?.name ||
                getTeamNameById(round.matches?.[0]?.team1?.id || "") ||
                tournamentData.teams?.[0]?.name ||
                "Team 1";
              const roundTeam2Name =
                round.matches?.[0]?.team2?.name ||
                getTeamNameById(round.matches?.[0]?.team2?.id || "") ||
                tournamentData.teams?.[1]?.name ||
                "Team 2";

              return (
                <div
                  key={round.roundName || `round-${index}`}
                  className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-2 md:p-4 text-gray-800 shadow-lg"
                >
                  {/* Overall Score for this round */}
                  {round.roundName === "final" &&
                  (tournamentData.rounds.find(
                    (r) => r.roundName === "semiFinal1"
                  )?.isCompleted !== true ||
                    tournamentData.rounds.find(
                      (r) => r.roundName === "semiFinal2"
                    )?.isCompleted !== true ||
                    (!round.matches?.[0]?.team1?.id &&
                      !round.matches?.[0]?.team1?.name)) ? (
                    <div className="flex items-center justify-center mb-2 md:mb-4">
                      <div className="text-gray-800 font-bold text-lg md:text-2xl">
                        TBD
                      </div>
                      <div className="text-gray-600 font-bold mx-2 md:mx-4 text-2xl md:text-4xl">
                        0 - 0
                      </div>
                      <div className="text-gray-800 font-bold text-lg md:text-2xl">
                        TBD
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-2 md:mb-4">
                      <div className="text-gray-800 font-bold text-lg md:text-2xl">
                        {roundTeam1Name}
                      </div>
                      <div className="text-gray-600 font-bold mx-3 md:mx-6 text-2xl md:text-4xl">
                        {roundScores[0]} - {roundScores[1]}
                      </div>
                      <div className="text-gray-800 font-bold text-lg md:text-2xl">
                        {roundTeam2Name}
                      </div>
                    </div>
                  )}

                  <h4 className="text-white bg-blue-600 p-2 md:p-3 font-bold text-center mb-2 md:mb-4 text-lg md:text-2xl">
                    {round.roundName === "semiFinal1"
                      ? "Semi-Final 1"
                      : round.roundName === "semiFinal2"
                      ? "Semi-Final 2"
                      : round.roundName === "final"
                      ? "Final"
                      : round.roundName || `Round ${index + 1}`}
                  </h4>

                  <div className="space-y-2">
                    {round.matches.map((match, matchIndex) => {
                      // Check if match has started (has at least 1 score)
                      const hasStarted =
                        (match.team1?.score || 0) > 0 ||
                        (match.team2?.score || 0) > 0;
                      const matchBgColor = hasStarted
                        ? "bg-green-200 border-green-400"
                        : "bg-gray-200 border-gray-300";

                      return (
                        <div
                          key={
                            match.matchId ||
                            `${round.roundName || index}-match-${matchIndex}`
                          }
                          className={`${matchBgColor} rounded p-1 md:p-2 border transition-colors duration-300`}
                        >
                          {/* Match Type */}
                          <div
                            className={`text-base md:text-xl font-bold mb-1 md:mb-2 text-center ${
                              hasStarted ? "text-green-800" : "text-gray-800"
                            }`}
                          >
                            Match {matchIndex + 1}: {getMatchType(matchIndex)}
                            {hasStarted && (
                              <span className="ml-1 md:ml-2 text-sm md:text-base">
                                ● IN PROGRESS
                              </span>
                            )}
                          </div>

                          {/* Teams in Row */}
                          <div className="flex items-center justify-center">
                            {/* Team 1 */}
                            <div className="flex items-center justify-end flex-1 pr-2 md:pr-4">
                              <div className="text-gray-800 text-base md:text-xl font-bold mr-2 md:mr-4">
                                {round.roundName === "final" &&
                                (tournamentData.rounds.find(
                                  (r) => r.roundName === "semiFinal1"
                                )?.isCompleted !== true ||
                                  tournamentData.rounds.find(
                                    (r) => r.roundName === "semiFinal2"
                                  )?.isCompleted !== true ||
                                  (!match.team1?.id && !match.team1?.name))
                                  ? "TBD"
                                  : match.team1?.name ||
                                    getTeamNameById(match.team1?.id || "") ||
                                    "Team 1"}
                              </div>
                              <div className="text-gray-600 text-base md:text-xl font-bold">
                                {match.team1?.score || 0}
                              </div>
                            </div>

                            <div className="text-gray-800 text-base md:text-xl font-bold mx-2 md:mx-4">
                              vs
                            </div>

                            {/* Team 2 */}
                            <div className="flex items-center justify-start flex-1 pl-2 md:pl-4">
                              <div className="text-gray-600 text-base md:text-xl font-bold">
                                {match.team2?.score || 0}
                              </div>
                              <div className="text-gray-800 text-base md:text-xl font-bold ml-2 md:ml-4">
                                {round.roundName === "final" &&
                                (tournamentData.rounds.find(
                                  (r) => r.roundName === "semiFinal1"
                                )?.isCompleted !== true ||
                                  tournamentData.rounds.find(
                                    (r) => r.roundName === "semiFinal2"
                                  )?.isCompleted !== true ||
                                  (!match.team2?.id && !match.team2?.name))
                                  ? "TBD"
                                  : match.team2?.name ||
                                    getTeamNameById(match.team2?.id || "") ||
                                    "Team 2"}
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
  );
};

export default TVDisplay;
