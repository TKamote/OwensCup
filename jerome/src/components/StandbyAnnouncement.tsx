"use client";

import React, { useState, useEffect } from "react";

export default function StandbyAnnouncement() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLive, setIsLive] = useState(false);
  const [selectedTime, setSelectedTime] = useState("15:00");
  const [showTimeSelector, setShowTimeSelector] = useState(true);

  const tournamentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate time options with 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(
        today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000
      );

      // If start time has passed today, set for tomorrow
      if (startTime <= now) {
        startTime.setDate(startTime.getDate() + 1);
      }

      const difference = startTime.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ hours, minutes, seconds });
        setIsLive(false);
      } else {
        setIsLive(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [selectedTime]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-8xl mx-auto">
        {/* Tournament Title */}
        <div className="mb-12">
          <h1 className="text-8xl font-bold text-gray-800 mb-4">
            🏆 TOURNAMENT STREAM 🏆
          </h1>
          <h2 className="text-5xl font-semibold text-gray-700 mb-2">
            Dave&apos;s Tournament
          </h2>
          <p className="text-3xl text-gray-600">{tournamentDate}</p>
        </div>

        {/* Time Selector */}
        {showTimeSelector && (
          <div className="mb-12 bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl border-4 border-green-300">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">
              ⏰ Select Tournament Start Time
            </h3>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="text-3xl font-semibold p-4 rounded-xl border-2 border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:outline-none"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowTimeSelector(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-4 px-8 rounded-xl transition-colors duration-200"
            >
              Start Countdown
            </button>
          </div>
        )}

        {/* Countdown Section */}
        {!showTimeSelector && (
          <div className="mb-12">
            {isLive ? (
              <div className="bg-red-500 text-white p-8 rounded-2xl shadow-2xl">
                <h3 className="text-6xl font-bold mb-4">🔴 LIVE NOW!</h3>
                <p className="text-3xl">Tournament is currently in progress</p>
              </div>
            ) : (
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl border-4 border-blue-300">
                <h3 className="text-4xl font-bold text-gray-800 mb-6">
                  📅 Live Stream Starts In:
                </h3>

                {/* Countdown Timer */}
                <div className="flex justify-center items-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-8xl font-bold text-blue-600 bg-blue-100 rounded-xl p-4 min-w-[120px]">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-2xl font-semibold text-gray-700 mt-2">
                      Hours
                    </div>
                  </div>

                  <div className="text-6xl font-bold text-gray-400">:</div>

                  <div className="text-center">
                    <div className="text-8xl font-bold text-green-600 bg-green-100 rounded-xl p-4 min-w-[120px]">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-2xl font-semibold text-gray-700 mt-2">
                      Minutes
                    </div>
                  </div>

                  <div className="text-6xl font-bold text-gray-400">:</div>

                  <div className="text-center">
                    <div className="text-8xl font-bold text-purple-600 bg-purple-100 rounded-xl p-4 min-w-[120px]">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-2xl font-semibold text-gray-700 mt-2">
                      Seconds
                    </div>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-2xl font-semibold text-gray-800">
                    🕐 Scheduled Time:{" "}
                    {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}{" "}
                    - Today
                  </p>
                </div>

                {/* Reset Button */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowTimeSelector(true)}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-xl font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Change Time
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Message */}
        <div className="bg-white bg-opacity-80 p-6 rounded-xl shadow-lg">
          <p className="text-3xl font-semibold text-gray-800 mb-2">
            📺 Stay tuned for live action!
          </p>
          <p className="text-xl text-gray-600">
            Get ready for an exciting tournament!!!
          </p>
        </div>
      </div>
    </div>
  );
}
