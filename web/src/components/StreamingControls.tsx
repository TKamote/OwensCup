"use client";

import React, { useState, useEffect } from "react";
import OBSWebSocket from "obs-websocket-js";

interface StreamingControlsProps {
  className?: string;
}

const StreamingControls: React.FC<StreamingControlsProps> = ({
  className = "",
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentScene, setCurrentScene] = useState("TV Display");
  const [cameraConnected, setCameraConnected] = useState(false);
  const [streamingPlatform, setStreamingPlatform] = useState("YouTube");
  const [obsConnected, setObsConnected] = useState(false);
  const [obs, setObs] = useState<OBSWebSocket | null>(null);

  // Connect to OBS WebSocket
  useEffect(() => {
    const connectToOBS = async () => {
      try {
        const obsInstance = new OBSWebSocket();
        await obsInstance.connect("ws://localhost:3001");
        setObs(obsInstance);
        setObsConnected(true);
        console.log("Connected to OBS WebSocket");
      } catch (error) {
        console.error("Failed to connect to OBS:", error);
        setObsConnected(false);
      }
    };

    connectToOBS();

    return () => {
      if (obs) {
        obs.disconnect();
      }
    };
  }, [obs]);

  // Check if camera is connected (Samsung S21)
  useEffect(() => {
    // This would check if the camera is available
    // For now, we'll simulate it
    setCameraConnected(true);
  }, []);

  const scenes = [
    {
      id: "tv-display",
      name: "TV Display",
      description: "Full tournament view",
    },
    {
      id: "stream-overlay",
      name: "Stream Overlay",
      description: "Compact sidebar",
    },
    {
      id: "camera-feed",
      name: "Single Camera",
      description: "Main camera view",
    },
    {
      id: "dual-camera",
      name: "Dual Camera",
      description: "Mobile + FaceTime",
    },
    {
      id: "picture-in-picture",
      name: "Picture-in-Picture",
      description: "Camera + Overlay",
    },
  ];

  const platforms = ["YouTube", "Facebook", "X (Twitter)"];

  const handleStartStreaming = () => {
    setIsStreaming(true);
    // Here you would integrate with OBS or streaming API
    console.log("Starting stream to", streamingPlatform);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    console.log("Stopping stream");
  };

  const handleSceneChange = async (sceneId: string) => {
    setCurrentScene(sceneId);

    if (obs && obsConnected) {
      try {
        // Map scene IDs to actual OBS scene names
        const sceneMap: { [key: string]: string } = {
          "tv-display": "TV Display",
          "stream-overlay": "Stream Overlay",
          "camera-feed": "Single Camera",
          "dual-camera": "Dual Camera",
          "picture-in-picture": "Picture-in-Picture",
        };

        const obsSceneName = sceneMap[sceneId] || sceneId;
        await obs.call("SetCurrentProgramScene", { sceneName: obsSceneName });
        console.log("Successfully switched to scene:", obsSceneName);
      } catch (error) {
        console.error("Failed to switch scene:", error);
      }
    } else {
      console.log("OBS not connected. Scene would be:", sceneId);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-12 ${className}`}>
      <h2 className="text-white text-6xl font-bold mb-12 text-center">
        Streaming Controls
      </h2>

      {/* Connection Status */}
      <div className="mb-12">
        <div className="grid grid-cols-2 gap-6">
          {/* Camera Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-4xl font-bold">
                Camera Status
              </span>
              <div
                className={`px-6 py-3 rounded-full text-2xl font-bold ${
                  cameraConnected
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {cameraConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
            <p className="text-gray-400 text-2xl">
              Samsung S21 {cameraConnected ? "detected" : "not detected"}
            </p>
          </div>

          {/* OBS Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-4xl font-bold">OBS Status</span>
              <div
                className={`px-6 py-3 rounded-full text-2xl font-bold ${
                  obsConnected
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {obsConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
            <p className="text-gray-400 text-2xl">
              OBS Studio {obsConnected ? "connected" : "not connected"}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="mb-12">
        <label className="text-white text-4xl font-bold block mb-4">
          Streaming Platform
        </label>
        <select
          value={streamingPlatform}
          onChange={(e) => setStreamingPlatform(e.target.value)}
          className="w-full p-6 bg-gray-700 text-white rounded-lg border border-gray-600 text-3xl"
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </div>

      {/* Scene Selection */}
      <div className="mb-12">
        <label className="text-white text-4xl font-bold block mb-6">
          Current Scene
        </label>
        <div className="grid grid-cols-2 gap-6">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSceneChange(scene.id)}
              className={`p-8 rounded-lg text-left transition-colors ${
                currentScene === scene.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <div className="font-bold text-3xl mb-2">{scene.name}</div>
              <div className="text-xl opacity-75">{scene.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stream Controls */}
      <div className="flex gap-8 mb-12">
        {!isStreaming ? (
          <button
            onClick={handleStartStreaming}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-8 px-12 rounded-lg transition-colors text-4xl"
          >
            🔴 Start Streaming
          </button>
        ) : (
          <button
            onClick={handleStopStreaming}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-8 px-12 rounded-lg transition-colors text-4xl"
          >
            ⏹️ Stop Streaming
          </button>
        )}
      </div>

      {/* Streaming Status */}
      {isStreaming && (
        <div className="mt-8 p-8 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg mb-12">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold text-4xl">🔴 LIVE</span>
            <span className="text-white text-3xl">
              Streaming to {streamingPlatform}
            </span>
          </div>
          <div className="text-gray-400 text-2xl mt-2">
            Current scene: {currentScene}
          </div>
        </div>
      )}

      {/* OBS Integration Instructions */}
      <div className="mt-8 p-8 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
        <h3 className="text-blue-400 font-bold mb-6 text-3xl">
          OBS Setup Instructions
        </h3>
        <div className="text-gray-300 text-2xl space-y-3">
          <p>1. Open OBS Studio</p>
          <p>2. Add Browser Source for web app</p>
          <p>3. Add Video Capture Device for Samsung S21</p>
          <p>4. Create scenes for each view</p>
          <p>5. Set up streaming to {streamingPlatform}</p>
        </div>
      </div>
    </div>
  );
};

export default StreamingControls;
