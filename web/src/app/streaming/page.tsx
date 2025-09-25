"use client";

import React, { useState, useEffect } from "react";
import {
  listenToStreamingData,
  WebTournamentData,
} from "../../services/firebase";

export default function StreamingControls() {
  const [tournamentData, setTournamentData] =
    useState<WebTournamentData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [streamingSettings, setStreamingSettings] = useState({
    isStreaming: false,
    streamUrl: "",
    streamKey: "",
    quality: "1080p",
    bitrate: "5000",
  });

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = listenToStreamingData((data) => {
      console.log("StreamingControls received data:", data);
      setTournamentData(data);
    });

    return () => unsubscribe();
  }, []);

  const handleStreamingToggle = () => {
    setStreamingSettings((prev) => ({
      ...prev,
      isStreaming: !prev.isStreaming,
    }));
  };

  const handleSettingChange = (key: string, value: string) => {
    setStreamingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Streaming Controls</h1>
          <p className="text-gray-300 text-xl">
            Control your tournament stream settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Streaming Settings */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Stream Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-2">
                  Stream URL
                </label>
                <input
                  type="text"
                  value={streamingSettings.streamUrl}
                  onChange={(e) =>
                    handleSettingChange("streamUrl", e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="rtmp://your-server.com/live"
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-2">
                  Stream Key
                </label>
                <input
                  type="password"
                  value={streamingSettings.streamKey}
                  onChange={(e) =>
                    handleSettingChange("streamKey", e.target.value)
                  }
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="your-stream-key"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium mb-2">
                    Quality
                  </label>
                  <select
                    value={streamingSettings.quality}
                    onChange={(e) =>
                      handleSettingChange("quality", e.target.value)
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium mb-2">
                    Bitrate (kbps)
                  </label>
                  <input
                    type="number"
                    value={streamingSettings.bitrate}
                    onChange={(e) =>
                      handleSettingChange("bitrate", e.target.value)
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStreamingToggle}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-xl ${
                    streamingSettings.isStreaming
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } transition-colors`}
                >
                  {streamingSettings.isStreaming
                    ? "Stop Stream"
                    : "Start Stream"}
                </button>
              </div>
            </div>
          </div>

          {/* Tournament Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Tournament Status</h2>

            {tournamentData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">Tournament:</span>
                  <span className="text-xl font-bold">
                    {tournamentData.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg">Status:</span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-green-400 font-bold">LIVE</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg">Mode:</span>
                  <span className="text-xl font-bold uppercase">
                    {tournamentData.streamingMode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg">Teams:</span>
                  <span className="text-xl font-bold">
                    {tournamentData.teams?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg">Rounds:</span>
                  <span className="text-xl font-bold">
                    {tournamentData.rounds?.length || 0}
                  </span>
                </div>

                <div className="pt-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-2">Current Round</h3>
                    {tournamentData.rounds?.[0] ? (
                      <div>
                        <p className="text-xl font-bold">
                          {tournamentData.rounds[0].roundName || "Round 1"}
                        </p>
                        <p className="text-gray-300">
                          {tournamentData.rounds[0].matches?.length || 0}{" "}
                          matches
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">No active round</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-4">
                  No tournament data available
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-red-400">Disconnected</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 py-4 px-6 rounded-lg font-bold text-lg transition-colors">
              Open Display View
            </button>

            <button className="bg-purple-600 hover:bg-purple-700 py-4 px-6 rounded-lg font-bold text-lg transition-colors">
              Test Stream
            </button>

            <button className="bg-orange-600 hover:bg-orange-700 py-4 px-6 rounded-lg font-bold text-lg transition-colors">
              Export Settings
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400">
          <p>
            Last updated:{" "}
            {tournamentData
              ? new Date(tournamentData.lastWebUpdate).toLocaleTimeString()
              : "Never"}
          </p>
        </div>
      </div>
    </div>
  );
}
