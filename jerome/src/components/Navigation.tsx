"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "TV Display", icon: "📺" },
    { href: "/stream", label: "Streaming", icon: "📡" },
    { href: "/standby", label: "Standby", icon: "⏰" },
    { href: "/teams", label: "Teams", icon: "👥" },
    { href: "/players", label: "Players", icon: "🏃" },
  ];

  return (
    <nav className="bg-white text-gray-800 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image
              src="/favicon.png"
              alt="Tournament Icon"
              width={32}
              height={32}
              className="w-8 h-8 mr-2"
            />
            <span className="text-sm md:text-xl font-bold text-gray-800">
              Jerome&apos;s Tournament Stream
            </span>
          </div>

          <div className="flex space-x-1 md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-emerald-200 text-emerald-800"
                    : "text-gray-600 hover:bg-emerald-100 hover:text-emerald-800"
                }`}
              >
                <span className="mr-1 md:mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
