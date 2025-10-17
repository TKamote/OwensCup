"use client";

import React, { useState, useEffect } from "react";
import {
  listenToStreamingData,
  WebTournamentData,
  WebRound,
} from "../services/firebase";

interface StreamOverlayProps {
  className?: string;
}

const StreamOverlay: React.FC<StreamOverlayProps> = ({ className = "" }) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
      setTournamentData(data);
    });

    return () => unsubscribe();
  }, []);

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div
        className={`fixed inset-0 bg-black flex items-center justify-center ${className}`}
      >
        <div className="text-white text-4xl">Loading...</div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div
        className={`fixed inset-0 bg-black flex items-center justify-center ${className}`}
      >
        <div className="text-white text-3xl">
          Waiting for Tournament Data...
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

  // Helper function to get team name by ID
  const getTeamNameById = (teamId: string) => {
    const team = tournamentData.teams?.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  const rounds = Array.isArray(tournamentData.rounds)
    ? tournamentData.rounds
    : [];

  const semifinal1 = rounds.find((r) => r.roundName === "semiFinal1");
  const semifinal2 = rounds.find((r) => r.roundName === "semiFinal2");
  const final = rounds.find((r) => r.roundName === "final");

  // Helper function to get the last 2 ongoing or completed matches
  const getLastTwoActiveMatches = (round: WebRound | undefined) => {
    if (!round?.matches) return [];

    // Return only the first 2 matches
    return round.matches.slice(0, 2);
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
    <div
      className={`fixed top-26 left-0 w-120 h-auto bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden border-4 border-yellow-500 ${className} p-4`}
    >
      {/* LIVE Indicator with Animation */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-3xl font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
        🔴 LIVE
      </div>

      <div className="flex flex-col h-full space-y-1 overflow-hidden">
        {/* Semifinal 1 Section */}
        {semifinal1 && !hiddenSections.includes("semifinal1") && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-2 border border-gray-700 shadow-lg mt-0.5 mb-0.5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-3xl font-bold bg-blue-600 px-3 py-2 rounded-lg">
                🥉 SF1
              </h2>
              <button
                onClick={() =>
                  setHiddenSections((prev) => [...prev, "semifinal1"])
                }
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 font-bold text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Overall Score with Enhanced Styling */}
            <div className="bg-gray-700 rounded-lg p-2.5 mb-3 border border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {semifinal1.matches?.[0]?.team1?.name ||
                    getTeamNameById(semifinal1.matches?.[0]?.team1?.id || "") ||
                    "Team 1"}
                </div>
                <div className="text-yellow-300 text-3xl font-bold mx-1 bg-black px-3.5 py-0.5 rounded-lg border border-yellow-400">
                  {getOverallScore(semifinal1)[0]} -{" "}
                  {getOverallScore(semifinal1)[1]}
                </div>
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {semifinal1.matches?.[0]?.team2?.name ||
                    getTeamNameById(semifinal1.matches?.[0]?.team2?.id || "") ||
                    "Team 2"}
                </div>
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(semifinal1).map((match, index) => {
                const matchIndex = semifinal1.matches?.indexOf(match) || 0;
                const isLive =
                  (match.team1?.score || 0) > 0 ||
                  (match.team2?.score || 0) > 0;
                return (
                  <div
                    key={match.matchId || `sf1-match-${index}`}
                    className={`bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-0.5 border-l-2 ${
                      isLive ? "border-red-500" : "border-gray-600"
                    } shadow-lg`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="text-white text-3xl font-bold text-center">
                        M{matchIndex + 1}: {getMatchType(matchIndex)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-3xl font-semibold text-center flex-1">
                        {match.team1?.name ||
                          getTeamNameById(match.team1?.id || "") ||
                          "Team 1"}
                      </div>
                      <div className="text-yellow-300 text-3xl font-bold bg-gray-900 px-3.5 py-0.5 rounded-lg border border-yellow-400">
                        {match.team1?.score || match.team1?.score || 0} -{" "}
                        {match.team2?.score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-3xl font-semibold text-center flex-1">
                        {match.team2?.name ||
                          getTeamNameById(match.team2?.id || "") ||
                          "Team 2"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Semifinal 2 Section */}
        {semifinal2 && !hiddenSections.includes("semifinal2") && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-3xl font-bold bg-blue-600 px-3 py-2 rounded-lg">
                🥉 SF2
              </h2>
              <button
                onClick={() =>
                  setHiddenSections((prev) => [...prev, "semifinal2"])
                }
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Overall Score with Enhanced Styling */}
            <div className="bg-gray-700 rounded-lg p-2.5 mb-3 border border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {semifinal2.matches?.[0]?.team1?.name ||
                    getTeamNameById(semifinal2.matches?.[0]?.team1?.id || "") ||
                    "Team 1"}
                </div>
                <div className="text-yellow-300 text-3xl font-bold mx-1 bg-black px-3.5 py-0.5 rounded-lg border border-yellow-400">
                  {getOverallScore(semifinal2)[0]} -{" "}
                  {getOverallScore(semifinal2)[1]}
                </div>
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {semifinal2.matches?.[0]?.team2?.name ||
                    getTeamNameById(semifinal2.matches?.[0]?.team2?.id || "") ||
                    "Team 2"}
                </div>
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(semifinal2).map((match, index) => {
                const matchIndex = semifinal2.matches?.indexOf(match) || 0;
                const isLive =
                  (match.team1?.score || 0) > 0 ||
                  (match.team2?.score || 0) > 0;
                return (
                  <div
                    key={match.matchId || `sf2-match-${index}`}
                    className={`bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-0.5 border-l-2 ${
                      isLive ? "border-red-500" : "border-gray-600"
                    } shadow-lg`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="text-white text-3xl font-bold text-center">
                        M{matchIndex + 1}: {getMatchType(matchIndex)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-3xl font-semibold text-center flex-1">
                        {match.team1?.name ||
                          getTeamNameById(match.team1?.id || "") ||
                          "Team 1"}
                      </div>
                      <div className="text-yellow-300 text-3xl font-bold mx-1">
                        {match.team1?.score || match.team1?.score || 0} -{" "}
                        {match.team2?.score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-3xl font-semibold text-center flex-1">
                        {match.team2?.name ||
                          getTeamNameById(match.team2?.id || "") ||
                          "Team 2"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Section - Only show if semifinals are completed */}
        {final && semifinal1?.isCompleted && semifinal2?.isCompleted && (
          <div className="bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-900 rounded-lg p-3 border-2 border-yellow-500 shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-3 rounded-lg shadow-lg">
                🏆 FINAL
              </h2>
            </div>

            {/* Overall Score with Championship Styling */}
            <div className="bg-black rounded-lg p-3 mb-3 border-2 border-yellow-400 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {final.matches?.[0]?.team1?.name ||
                    getTeamNameById(final.matches?.[0]?.team1?.id || "") ||
                    "TBD"}
                </div>
                <div className="text-3xl font-bold mx-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-0.5 rounded-lg border-2 border-yellow-300 shadow-lg">
                  {getOverallScore(final)[0]} - {getOverallScore(final)[1]}
                </div>
                <div className="text-white text-3xl font-bold text-center flex-1">
                  {final.matches?.[0]?.team2?.name ||
                    getTeamNameById(final.matches?.[0]?.team2?.id || "") ||
                    "TBD"}
                </div>
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(final).map((match, index) => {
                const matchIndex = final.matches?.indexOf(match) || 0;
                return (
                  <div
                    key={match.matchId || `final-match-${index}`}
                    className="bg-gray-700 rounded-lg p-2"
                  >
                    <div className="text-white text-3xl font-bold mb-3 text-center">
                      M{matchIndex + 1}: {getMatchType(matchIndex)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-3xl">
                        {match.team1?.name ||
                          getTeamNameById(match.team1?.id || "") ||
                          "TBD"}
                      </div>
                      <div className="text-yellow-300 text-3xl font-bold">
                        {match.team1?.score || match.team1?.score || 0} -{" "}
                        {match.team2?.score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-3xl">
                        {match.team1?.name ||
                          getTeamNameById(match.team1?.id || "") ||
                          "TBD"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Section - Show placeholder when semifinals are not completed */}
        {final && (!semifinal1?.isCompleted || !semifinal2?.isCompleted) && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-3xl font-bold">Final</h2>
            </div>

            {/* Overall Score - Placeholder */}
            <div className="flex items-center justify-center mb-3">
              <div className="text-white text-3xl font-bold">TBD</div>
              <div className="text-yellow-300 text-3xl font-bold mx-2">
                0 - 0
              </div>
              <div className="text-white text-3xl font-bold">TBD</div>
            </div>

            {/* Placeholder message */}
            <div className="text-center text-gray-400 text-3xl">
              Waiting for semifinals to complete...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamOverlay;
