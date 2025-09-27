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
        <div className="text-white text-2xl">
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

    // Filter matches that have scores (ongoing or completed)
    const activeMatches = round.matches.filter(
      (match) =>
        (match.team1Score && match.team1Score > 0) ||
        (match.team2Score && match.team2Score > 0) ||
        (match.team1?.score && match.team1.score > 0) ||
        (match.team2?.score && match.team2.score > 0) ||
        match.isCompleted ||
        match.isLive
    );

    // Return the last 2 matches
    return activeMatches.slice(-2);
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
      className={`fixed top-16 right-0 bottom-0 w-1/5 bg-black overflow-y-auto ${className} p-4`}
    >
      {/* LIVE Indicator */}
      <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
        LIVE
      </div>

      {/* Tournament Title */}
      <div className="text-center mb-6 pt-4">
        <h1 className="text-white text-3xl font-bold">OwensCup Tournament</h1>
      </div>

      <div className="space-y-8">
        {/* Semifinal 1 Section */}
        {semifinal1 && !hiddenSections.includes("semifinal1") && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-3xl font-bold">Semifinal 1</h2>
              <button
                onClick={() =>
                  setHiddenSections((prev) => [...prev, "semifinal1"])
                }
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">
                {semifinal1.matches?.[0]?.team1?.name ||
                  getTeamNameById(semifinal1.matches?.[0]?.team1Id || "") ||
                  "Team 1"}
              </div>
              <div className="text-yellow-300 text-4xl font-bold mx-4">
                {getOverallScore(semifinal1)[0]} -{" "}
                {getOverallScore(semifinal1)[1]}
              </div>
              <div className="text-white text-2xl font-bold">
                {semifinal1.matches?.[0]?.team2?.name ||
                  getTeamNameById(semifinal1.matches?.[0]?.team2Id || "") ||
                  "Team 2"}
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(semifinal1).map((match, index) => {
                const matchIndex = semifinal1.matches?.indexOf(match) || 0;
                return (
                  <div
                    key={match.id || `sf1-match-${index}`}
                    className="bg-gray-700 rounded-lg p-3"
                  >
                    <div className="text-white text-xl font-bold mb-2 text-center">
                      Match {matchIndex + 1}: {getMatchType(matchIndex)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-base">
                        {match.team1?.name ||
                          getTeamNameById(match.team1Id || "") ||
                          "Team 1"}
                      </div>
                      <div className="text-yellow-300 text-2xl font-bold">
                        {match.team1Score || match.team1?.score || 0} -{" "}
                        {match.team2Score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-base">
                        {match.team2?.name ||
                          getTeamNameById(match.team2Id || "") ||
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
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-3xl font-bold">Semifinal 2</h2>
              <button
                onClick={() =>
                  setHiddenSections((prev) => [...prev, "semifinal2"])
                }
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">
                {semifinal2.matches?.[0]?.team1?.name ||
                  getTeamNameById(semifinal2.matches?.[0]?.team1Id || "") ||
                  "Team 1"}
              </div>
              <div className="text-yellow-300 text-4xl font-bold mx-4">
                {getOverallScore(semifinal2)[0]} -{" "}
                {getOverallScore(semifinal2)[1]}
              </div>
              <div className="text-white text-2xl font-bold">
                {semifinal2.matches?.[0]?.team2?.name ||
                  getTeamNameById(semifinal2.matches?.[0]?.team2Id || "") ||
                  "Team 2"}
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(semifinal2).map((match, index) => {
                const matchIndex = semifinal2.matches?.indexOf(match) || 0;
                return (
                  <div
                    key={match.id || `sf2-match-${index}`}
                    className="bg-gray-700 rounded-lg p-3"
                  >
                    <div className="text-white text-xl font-bold mb-2 text-center">
                      Match {matchIndex + 1}: {getMatchType(matchIndex)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-base">
                        {match.team1?.name ||
                          getTeamNameById(match.team1Id || "") ||
                          "Team 1"}
                      </div>
                      <div className="text-yellow-300 text-2xl font-bold">
                        {match.team1Score || match.team1?.score || 0} -{" "}
                        {match.team2Score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-base">
                        {match.team2?.name ||
                          getTeamNameById(match.team2Id || "") ||
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
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-3xl font-bold">Final</h2>
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">
                {final.matches?.[0]?.team1?.name ||
                  getTeamNameById(final.matches?.[0]?.team1Id || "") ||
                  "TBD"}
              </div>
              <div className="text-yellow-300 text-4xl font-bold mx-4">
                {getOverallScore(final)[0]} - {getOverallScore(final)[1]}
              </div>
              <div className="text-white text-2xl font-bold">
                {final.matches?.[0]?.team2?.name ||
                  getTeamNameById(final.matches?.[0]?.team2Id || "") ||
                  "TBD"}
              </div>
            </div>

            {/* Individual Matches */}
            <div className="space-y-3">
              {getLastTwoActiveMatches(final).map((match, index) => {
                const matchIndex = final.matches?.indexOf(match) || 0;
                return (
                  <div
                    key={match.id || `final-match-${index}`}
                    className="bg-gray-700 rounded-lg p-3"
                  >
                    <div className="text-white text-xl font-bold mb-2 text-center">
                      Match {matchIndex + 1}: {getMatchType(matchIndex)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-base">
                        {match.team1?.name ||
                          getTeamNameById(match.team1Id || "") ||
                          "TBD"}
                      </div>
                      <div className="text-yellow-300 text-2xl font-bold">
                        {match.team1Score || match.team1?.score || 0} -{" "}
                        {match.team2Score || match.team2?.score || 0}
                      </div>
                      <div className="text-white text-base">
                        {match.team2?.name ||
                          getTeamNameById(match.team1Id || "") ||
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
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-3xl font-bold">Final</h2>
            </div>

            {/* Overall Score - Placeholder */}
            <div className="flex items-center justify-center mb-4">
              <div className="text-white text-2xl font-bold">TBD</div>
              <div className="text-yellow-300 text-4xl font-bold mx-4">
                0 - 0
              </div>
              <div className="text-white text-2xl font-bold">TBD</div>
            </div>

            {/* Placeholder message */}
            <div className="text-center text-gray-400 text-lg">
              Waiting for semifinals to complete...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamOverlay;
