"use client";

import React, { useState, useEffect } from "react";
import {
  listenToStreamingData,
  WebTournamentData,
  WebRound,
  WebMatch,
} from "../services/firebase";

interface StreamingOverlayProps {
  className?: string;
}

const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  className = "",
}) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
      console.log("StreamingOverlay received data:", data);
      console.log("Rounds data:", data?.rounds);
      console.log(
        "Rounds order:",
        data?.rounds?.map((r) => r.roundName || r.name)
      );
      console.log("Teams data:", data?.teams);
      if (data?.rounds?.[0]) {
        console.log("First round:", data.rounds[0]);
        console.log("First round matches:", data.rounds[0].matches);
      }
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
            <div className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="ml-2 text-lg text-gray-500">Disconnected</span>
          </div>
        </div>
      </div>
    );
  }

  const rounds = Array.isArray(tournamentData.rounds)
    ? tournamentData.rounds
    : [];

  // Find the current round (first incomplete round or last round)
  const currentRound =
    rounds.find((round: WebRound) => !round?.isCompleted) ||
    rounds[rounds.length - 1];

  // Find the current match (first incomplete match in current round)
  const currentMatch = currentRound?.matches?.find?.(
    (match: WebMatch) => !match?.isCompleted
  );

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

  // Calculate overall score for current round (not used in current layout)
  // const overallScores = currentRound?.matches
  //   ? calculateOverallScore(
  //       currentRound.matches,
  //       currentRound.matches[0]?.team1Id,
  //       currentRound.matches[0]?.team2Id
  //     )
  //   : [0, 0];

  // Get team names for current round (not used in current layout)
  // const team1Name = currentRound?.matches?.[0]?.team1Id
  //   ? getTeamNameById(currentRound.matches[0].team1Id)
  //   : tournamentData.teams?.[0]?.name || "Team 1";
  // const team2Name = currentRound?.matches?.[0]?.team2Id
  //   ? getTeamNameById(currentRound.matches[0].team2Id)
  //   : tournamentData.teams?.[1]?.name || "Team 2";

  return (
    <div className={`fixed inset-0 bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-6">
        {/* Navigation Access for TV Display */}
        <div className="flex justify-center">
          <div className="flex gap-4">
            <a
              href="/streaming"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              📡 Streaming Controls
            </a>
            <a
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              ⚙️ Admin
            </a>
            <a
              href="/explore"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              🔍 Explore
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          paddingLeft: "80px",
          paddingRight: "80px",
        }}
        className="overflow-y-auto h-full"
      >
        {currentMatch ? (
          <>
            {/* Live Match Display */}
            <div
              className="bg-gray-800 rounded-lg mb-4"
              style={{ height: "60px" }}
            >
              <div className="flex items-center justify-between h-full px-6">
                <div className="text-white text-3xl font-bold bg-red-500 px-4 py-2 rounded">
                  LIVE MATCH
                </div>
                <div className="text-white text-lg font-medium">
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
                    // Get overall score from mobile app data
                    const roundScores = getOverallScore(round);

                    // Get team names for this round
                    const roundTeam1Name = round.matches?.[0]?.team1Id
                      ? getTeamNameById(round.matches[0].team1Id)
                      : round.matches?.[0]?.team1?.name ||
                        tournamentData.teams?.[0]?.name ||
                        "Team 1";
                    const roundTeam2Name = round.matches?.[0]?.team2Id
                      ? getTeamNameById(round.matches[0].team2Id)
                      : round.matches?.[0]?.team2?.name ||
                        tournamentData.teams?.[1]?.name ||
                        "Team 2";

                    // Debug: Log team data for overall score
                    console.log(`Round ${index + 1} team data:`, {
                      roundName: round.roundName,
                      team1Id: round.matches?.[0]?.team1Id,
                      team2Id: round.matches?.[0]?.team2Id,
                      team1Name: round.matches?.[0]?.team1?.name,
                      team2Name: round.matches?.[0]?.team2?.name,
                      resolvedTeam1Name: roundTeam1Name,
                      resolvedTeam2Name: roundTeam2Name,
                      isCompleted: round.isCompleted,
                      matchesCount: round.matches?.length || 0,
                    });

                    // Special debug for Final round
                    if (round.roundName === "final") {
                      console.log("🏆 FINAL ROUND UPDATE:", {
                        hasTeam1: !!round.matches?.[0]?.team1Id,
                        hasTeam2: !!round.matches?.[0]?.team2Id,
                        team1Name: roundTeam1Name,
                        team2Name: roundTeam2Name,
                        willShowPlaceholder:
                          !round.matches?.[0]?.team1Id ||
                          !round.matches?.[0]?.team2Id,
                      });
                    }

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
                            !round.matches?.[0]?.team1?.name) ||
                          (!round.matches?.[0]?.team2Id &&
                            !round.matches?.[0]?.team2?.name)) ? (
                          <div className="flex items-center justify-center mb-4">
                            <div className="text-gray-400 text-4xl font-bold">
                              TBD
                            </div>
                            <div className="text-gray-400 text-8xl font-bold mx-4">
                              - -
                            </div>
                            <div className="text-gray-400 text-4xl font-bold">
                              TBD
                            </div>
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
                            : round.roundName ||
                              round.name ||
                              `Round ${index + 1}`}
                        </h4>
                        <div className="space-y-4">
                          {round.matches.map((match, matchIndex) => {
                            // Debug: Log match data to see what we're receiving
                            console.log(`Match ${matchIndex + 1} data:`, {
                              isLive: match.isLive,
                              isCompleted: match.isCompleted,
                              team1Score: match.team1Score,
                              team2Score: match.team2Score,
                              team1ScoreNested: match.team1?.score,
                              team2ScoreNested: match.team2?.score,
                            });

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
                                    (match.team1Score &&
                                      match.team1Score > 0) ||
                                    (match.team2Score &&
                                      match.team2Score > 0) ||
                                    (match.team1?.score &&
                                      match.team1.score > 0) ||
                                    (match.team2?.score &&
                                      match.team2.score > 0)
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
                                          (!match.team1Id &&
                                            !match.team1?.name))
                                          ? "TBD"
                                          : match.team1?.name ||
                                            getTeamNameById(
                                              match.team1Id || ""
                                            ) ||
                                            "Team 1"}
                                      </div>
                                      <div className="text-yellow-300 text-6xl font-bold">
                                        {match.team1?.score ||
                                          match.team1Score ||
                                          0}
                                      </div>
                                    </div>

                                    {/* VS */}
                                    <div className="text-white text-2xl font-bold mx-6">
                                      vs
                                    </div>

                                    {/* Team 2 */}
                                    <div className="flex items-center justify-start flex-1 pl-4">
                                      <div className="text-yellow-300 text-6xl font-bold mr-4">
                                        {match.team2?.score ||
                                          match.team2Score ||
                                          0}
                                      </div>
                                      <div className="text-white text-3xl font-bold">
                                        {round.roundName === "final" &&
                                        (tournamentData.rounds.find(
                                          (r) => r.roundName === "semiFinal1"
                                        )?.isCompleted !== true ||
                                          tournamentData.rounds.find(
                                            (r) => r.roundName === "semiFinal2"
                                          )?.isCompleted !== true ||
                                          (!match.team2Id &&
                                            !match.team2?.name))
                                          ? "TBD"
                                          : match.team2?.name ||
                                            getTeamNameById(
                                              match.team2Id || ""
                                            ) ||
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
          </>
        ) : (
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-white text-4xl font-bold mb-4">
                Tournament Setup
              </h2>
              <p className="text-gray-300 text-2xl mb-6">
                Waiting for matches to begin...
              </p>

              {/* Teams Display */}
              <div className="grid grid-cols-2 gap-6">
                {tournamentData.teams.map((team) => (
                  <div key={team.id} className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-white font-bold mb-3 text-3xl">
                      {team.name}
                    </h3>
                    <div className="text-gray-300 text-xl">
                      {team.players.length} players
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingOverlay;
