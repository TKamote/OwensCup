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
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center h-auto md:h-16 py-2 md:py-0">
          {/* Title Section */}
          <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <Image
              src="/favicon.png"
              alt="Tournament Icon"
              width={24}
              height={24}
              className="w-6 h-6 md:w-8 md:h-8 mr-1 md:mr-2"
            />
            <span className="text-xs md:text-xl font-bold text-gray-800 text-center md:text-left">
              Jerome&apos;s Tournament Stream
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-wrap justify-center md:justify-end gap-1 md:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-emerald-200 text-emerald-800"
                    : "text-gray-600 hover:bg-emerald-100 hover:text-emerald-800"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
