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
      name: "Stream + 3 Cam",
      description: "3 cameras + overlay",
    },
    {
      id: "picture-in-picture",
      name: "Picture-in-Picture",
      description: "Camera + Overlay",
    },
    {
      id: "obs-virtual-camera",
      name: "OBS Virtual Camera",
      description: "OBS composite output",
    },
    {
      id: "switch-cam-overlay",
      name: "Switch Cam + Overlay",
      description: "Switch between cameras + overlay",
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
          "dual-camera": "Stream + 3 Cam",
          "picture-in-picture": "Picture-in-Picture",
          "obs-virtual-camera": "OBS Virtual Camera",
          "switch-cam-overlay": "Switch Cam + Overlay",
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

      {/* Platform Selection & Stream Controls */}
      <div className="mb-12">
        <div className="grid grid-cols-2 gap-6">
          {/* Platform Selection */}
          <div>
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

          {/* Stream Controls */}
          <div>
            <label className="text-white text-4xl font-bold block mb-4">
              Stream Control
            </label>
            {!isStreaming ? (
              <button
                onClick={handleStartStreaming}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-6 rounded-lg transition-colors text-3xl"
              >
                🔴 Start Streaming
              </button>
            ) : (
              <button
                onClick={handleStopStreaming}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-6 px-6 rounded-lg transition-colors text-3xl"
              >
                ⏹️ Stop Streaming
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scene Selection */}
      <div className="mb-12">
        <label className="text-white text-4xl font-bold block mb-6">
          Current Scene
        </label>
        <div className="grid grid-cols-3 gap-4">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleSceneChange(scene.id)}
              className={`p-4 rounded-lg text-left transition-colors ${
                currentScene === scene.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {/* Scene Preview Thumbnail */}
              <div className="w-full h-40 bg-gray-600 rounded-lg mb-2 flex items-center justify-center text-6xl">
                {scene.id === "tv-display" && "📺"}
                {scene.id === "stream-overlay" && "📊"}
                {scene.id === "camera-feed" && "📹"}
                {scene.id === "dual-camera" && "📱📹"}
                {scene.id === "picture-in-picture" && "🖼️"}
                {scene.id === "obs-virtual-camera" && "🎬"}
                {scene.id === "switch-cam-overlay" && "🔄📊"}
              </div>
              <div className="font-bold text-2xl mb-1">{scene.name}</div>
              <div className="text-lg opacity-75">{scene.description}</div>
            </button>
          ))}

          {/* OBS Status Card - Always at the end */}
          <div
            className={`p-4 rounded-lg text-left border-2 ${
              obsConnected
                ? "bg-green-900 border-green-500"
                : "bg-red-900 border-red-500"
            }`}
          >
            {/* OBS Status Thumbnail */}
            <div
              className={`w-full h-40 rounded-lg mb-2 flex items-center justify-center ${
                obsConnected ? "bg-green-700" : "bg-red-700"
              }`}
            >
              <div className="text-3xl font-bold text-white">
                {obsConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
            <div className="font-bold text-3xl text-white">OBS Status</div>
          </div>
        </div>
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
    </div>
  );
};

export default StreamingControls;
