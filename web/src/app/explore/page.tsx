"use client";

import React, { useState } from "react";
import Link from "next/link";
import { exploreFirebaseData } from "@/services/firebase";

export default function ExplorePage() {
  const [isExploring, setIsExploring] = useState(false);
  const [explorationComplete, setExplorationComplete] = useState(false);

  const handleExplore = async () => {
    setIsExploring(true);
    setExplorationComplete(false);

    // Clear console first
    console.clear();

    const success = await exploreFirebaseData();
    setExplorationComplete(true);
    setIsExploring(false);

    if (success) {
      alert(
        "✅ Firebase exploration complete! Check the browser console (F12) for detailed results."
      );
    } else {
      alert(
        "❌ Firebase exploration failed. Check the browser console for errors."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔍 Firebase Data Explorer
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool will explore your existing Firebase data to help us
              understand what you have and what we should keep or delete.
            </p>

            <button
              onClick={handleExplore}
              disabled={isExploring}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isExploring
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isExploring ? "🔍 Exploring..." : "🔍 Explore Firebase Data"}
            </button>
          </div>

          {explorationComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-bold mb-2">
                ✅ Exploration Complete!
              </h3>
              <p className="text-green-700 text-sm">
                Check your browser console (Press F12 → Console tab) to see
                detailed results. The console will show:
              </p>
              <ul className="text-green-700 text-sm mt-2 list-disc list-inside">
                <li>📁 All collections in your Firebase</li>
                <li>📡 Streaming data (if any)</li>
                <li>👥 User data and tournament data</li>
                <li>🔍 Any errors or permission issues</li>
              </ul>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-bold mb-2">📋 Next Steps:</h3>
            <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
              <li>Click &quot;Explore Firebase Data&quot; above</li>
              <li>Open browser console (F12 → Console)</li>
              <li>Share the console output with me</li>
              <li>I&apos;ll recommend what to keep/delete</li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/admin"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors mr-4"
            >
              ← Back to Admin
            </Link>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Streaming Overlay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
