"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: string;
  bg: string;
  iconBg: string;
}

export const StatCard = ({ icon: Icon, label, value, accent, bg, iconBg }: StatCardProps) => {
  return (
    <div className={`relative bg-gradient-to-br ${bg} rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/80 overflow-hidden group hover:shadow-lg transition-all duration-300`}>
      {/* Decorative circle */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/40 pointer-events-none" />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-4xl font-extrabold ${accent} leading-none`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={22} className={accent} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
