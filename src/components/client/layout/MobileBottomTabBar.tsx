// src/components/client/layout/MobileBottomTabBar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface MobileBottomTabBarProps {
  navItems: NavItem[];
  pathname: string;
}

export const MobileBottomTabBar = ({ navItems, pathname }: MobileBottomTabBarProps) => {
  return (
    <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl h-16 flex justify-around items-center px-2 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                isActive ? "text-[#1275e2]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? "bg-blue-50 scale-110" : "scale-100"}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide transition-all ${isActive ? "opacity-100" : "opacity-80"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
