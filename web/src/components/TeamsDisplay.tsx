"use client";

import React, { useState, useEffect } from "react";
import { listenToStreamingData, WebTournamentData } from "../services/firebase";

interface TeamsDisplayProps {
  className?: string;
}

const TeamsDisplay: React.FC<TeamsDisplayProps> = ({ className = "" }) => {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
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
        <div className="text-2xl">Waiting for Tournament Data...</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900 text-white p-8 h-screen max-h-[1080px] overflow-hidden ${className}`}
    >
      <div className="grid grid-cols-2 gap-8 h-full">
        {/* Teams Column */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold mb-2 text-blue-400">Teams</h2>
            <div className="w-20 h-1 mx-auto bg-blue-400"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {tournamentData.teams?.slice(0, 4).map((team, index) => (
              <div
                key={team.id}
                className={`bg-gray-700 rounded-lg p-4 border-2 ${
                  index % 2 === 0 ? "border-blue-400" : "border-green-400"
                }`}
              >
                <div className="text-center">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      index % 2 === 0 ? "text-blue-300" : "text-green-300"
                    }`}
                  >
                    {team.name}
                  </h3>
                  <div
                    className={`w-16 h-1 mx-auto mb-3 ${
                      index % 2 === 0 ? "bg-blue-400" : "bg-green-400"
                    }`}
                  ></div>
                  <div className="text-gray-300 text-lg">
                    {team.players?.length || 0} Players
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Players Column */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold mb-2 text-green-400">Players</h2>
            <div className="w-20 h-1 mx-auto bg-green-400"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
            {tournamentData.teams?.slice(0, 4).map((team, teamIndex) => (
              <div
                key={team.id}
                className={`bg-gray-700 rounded-lg p-4 border-2 ${
                  teamIndex % 2 === 0 ? "border-blue-400" : "border-green-400"
                }`}
              >
                <div className="text-center mb-4">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      teamIndex % 2 === 0 ? "text-blue-300" : "text-green-300"
                    }`}
                  >
                    {team.name}
                  </h3>
                  <div
                    className={`w-12 h-1 mx-auto ${
                      teamIndex % 2 === 0 ? "bg-blue-400" : "bg-green-400"
                    }`}
                  ></div>
                </div>

                <div className="space-y-2">
                  {team.players?.map((player, playerIndex) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.captain
                          ? "bg-yellow-600 bg-opacity-30 border border-yellow-400"
                          : "bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                            player.captain
                              ? "bg-yellow-400 text-black"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {playerIndex + 1}
                        </div>
                        <span className="text-sm font-medium">
                          {player.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          player.captain
                            ? "bg-yellow-400 text-black font-bold"
                            : "bg-gray-500 text-gray-300"
                        }`}
                      >
                        {player.captain ? "Captain" : "Player"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsDisplay;
