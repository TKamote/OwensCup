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
          <div className="text-white text-xl">Loading...</div>
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
          <div className="text-red-500 text-2xl mb-4">📡</div>
          <h2 className="text-xl font-bold mb-2">No Tournament Data</h2>
          <p className="text-gray-600">
            Waiting for mobile app to push data...
          </p>
          <div className="mt-4">
            <div className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span className="ml-2 text-sm text-gray-500">Disconnected</span>
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

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 ${className}`}
    >
      {/* Header */}
      <div className="bg-black bg-opacity-30 p-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">
              {tournamentData.name || "Tournament"}
            </h1>
            <p className="text-blue-200 text-lg">
              {currentRound?.roundName || "Tournament Setup"}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              <span className="text-green-300 text-sm">LIVE</span>
            </div>
            <p className="text-gray-300 text-sm">
              Mode: {tournamentData.streamingMode.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          paddingLeft: "120px",
          paddingRight: "120px",
        }}
        className="overflow-y-auto h-full"
      >
        {currentMatch ? (
          <>
            {/* Live Match Display */}
            <div
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg mb-2"
              style={{ height: "50px" }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl font-bold bg-red-500 px-2 py-1 rounded">
                  LIVE MATCH
                </div>
              </div>
            </div>

            {/* Tournament Bracket */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-black text-2xl font-bold mb-2">
                Tournament Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tournamentData.rounds.map((round, index) => (
                  <div
                    key={round.roundName || round.name || `round-${index}`}
                    className={`p-8 rounded-lg ${
                      round.isActive
                        ? "bg-green-500 bg-opacity-30"
                        : "bg-gray-500 bg-opacity-20"
                    }`}
                  >
                    <h4 className="text-white text-xl font-bold mb-4">
                      {round.roundName || round.name || `Round ${index + 1}`}
                    </h4>
                    <div className="space-y-4">
                      {round.matches.map((match, matchIndex) => (
                        <div
                          key={
                            match.id ||
                            `${
                              round.roundName || round.name || index
                            }-match-${matchIndex}`
                          }
                          className={`text-lg p-4 rounded ${
                            match.isLive
                              ? "bg-red-500 bg-opacity-50"
                              : match.isCompleted
                              ? "bg-green-500 bg-opacity-30"
                              : "bg-gray-500 bg-opacity-20"
                          }`}
                        >
                          <div className="text-white text-xl font-bold">
                            <span className="text-white">
                              {match.team1?.name || match.team1Id || "Team 1"}
                            </span>{" "}
                            <span className="text-yellow-300 text-2xl font-bold">
                              {match.team1?.score || match.team1Score || 0}
                            </span>{" "}
                            <span className="text-white">vs</span>{" "}
                            <span className="text-yellow-300 text-2xl font-bold">
                              {match.team2?.score || match.team2Score || 0}
                            </span>{" "}
                            <span className="text-white">
                              {match.team2?.name || match.team2Id || "Team 2"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-white text-2xl font-bold mb-4">
                Tournament Setup
              </h2>
              <p className="text-blue-200 text-lg mb-6">
                Waiting for matches to begin...
              </p>

              {/* Teams Display */}
              <div className="grid grid-cols-2 gap-4">
                {tournamentData.teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white bg-opacity-20 rounded-lg p-4"
                  >
                    <h3 className="text-white font-bold mb-2">{team.name}</h3>
                    <div className="text-blue-200 text-sm">
                      {team.players.length} players
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-4">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <div>
            Last updated:{" "}
            {new Date(tournamentData.lastWebUpdate).toLocaleTimeString()}
          </div>
          <div>Powered by OwensCup Tournament System</div>
        </div>
      </div>
    </div>
  );
};

export default StreamingOverlay;
