"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCurrentStreamingData,
  WebTournamentData,
} from "@/services/firebase";

export default function AdminPage() {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCurrentStreamingData();
        setTournamentData(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tournament data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-4">📡</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Tournament Data
          </h2>
          <p className="text-gray-600">
            Mobile app hasn&apos;t pushed any data yet.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Make sure to:
            <ul className="list-disc list-inside mt-2">
              <li>Set up teams in the mobile app</li>
              <li>Switch to &quot;Streaming&quot; mode</li>
              <li>Push data to web</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const safeTeams = Array.isArray(tournamentData.teams)
    ? tournamentData.teams
    : [];
  const safeRounds = Array.isArray(tournamentData.rounds)
    ? tournamentData.rounds
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Tournament Admin
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800">Tournament</h3>
              <p className="text-blue-600">{tournamentData.name}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800">Status</h3>
              <p className="text-green-600 capitalize">
                {tournamentData.status}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800">Mode</h3>
              <p className="text-purple-600 capitalize">
                {tournamentData.streamingMode}
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Last updated:{" "}
            {new Date(tournamentData.lastWebUpdate).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Teams</h2>
            <div className="space-y-3">
              {safeTeams.map((team) => (
                <div key={team.id} className="border rounded-lg p-3">
                  <h3 className="font-bold text-gray-800">{team.name}</h3>
                  <div className="text-sm text-gray-600">
                    {team.players.length} players
                  </div>
                  <div className="mt-2">
                    {Array.isArray(team.players) &&
                      team.players.map((player) => (
                        <span
                          key={player.id}
                          className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1"
                        >
                          {player.name} {player.captain && "👑"}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rounds</h2>
            <div className="space-y-3">
              {safeRounds.map((round) => (
                <div
                  key={round.id}
                  className={`border rounded-lg p-3 ${
                    round.isActive ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <h3 className="font-bold text-gray-800 flex items-center">
                    {round.name}
                    {round.isActive && (
                      <span className="ml-2 text-green-600 text-sm">
                        ● ACTIVE
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {Array.isArray(round.matches) &&
                      round.matches.map((match) => (
                        <div
                          key={match.id}
                          className={`text-sm p-2 rounded ${
                            match.isLive
                              ? "bg-red-100 border border-red-300"
                              : match.isCompleted
                              ? "bg-green-100 border border-green-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <div className="font-medium">
                            {
                              safeTeams.find((t) => t.id === match.team1Id)
                                ?.name
                            }{" "}
                            vs{" "}
                            {
                              safeTeams.find((t) => t.id === match.team2Id)
                                ?.name
                            }
                          </div>
                          <div className="text-gray-600">
                            {match.team1Score} - {match.team2Score}
                            {match.isLive && (
                              <span className="ml-2 text-red-600 font-bold">
                                LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Streaming Overlay
          </Link>
        </div>
      </div>
    </div>
  );
}
