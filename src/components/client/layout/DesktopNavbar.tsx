"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DesktopNavbarProps {
  navItems: NavItem[];
  pathname: string;
}

export const DesktopNavbar = ({ navItems, pathname }: DesktopNavbarProps) => {
  return (
    <nav className="hidden md:flex fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm z-50 h-16 items-center px-8">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">

        {/* 📌 Logo Section */}
        <Link href="/employee_dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 overflow-hidden">
            <Image
              src="/app1/images/logo/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight group-hover:text-[#1275e2] transition-colors">
            Lao Training
          </span>
        </Link>

        {/* 📌 Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-[#1275e2]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
