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
    { href: "/players", label: "Players", icon: "👤" },
  ];

  return (
    <nav className="bg-gray-900 text-yellow-100 shadow-lg border-b border-yellow-600">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center h-auto md:h-16 py-2 md:py-0">
          {/* Title Section */}
          <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <Image
              src="/favicon.png"
              alt="Tournament Icon"
              width={32}
              height={32}
              className="w-8 h-8 md:w-10 md:h-10 mr-2 md:mr-3"
            />
            <span className="text-sm md:text-2xl font-bold text-yellow-100 text-center md:text-left">
              For Managers Tournament
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-wrap justify-center md:justify-end gap-1 md:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm md:text-base font-bold transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-yellow-600 text-yellow-100"
                    : "text-yellow-200 hover:bg-yellow-700 hover:text-yellow-100"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(" ")[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
