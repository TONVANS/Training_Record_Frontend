"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface InfoItem {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
}

interface ProfileInfoCardProps {
  title: string;
  icon: LucideIcon;
  iconColorClass: string;
  bgColorClass: string;
  items: InfoItem[];
}

export const ProfileInfoCard = ({ title, icon: Icon, iconColorClass, bgColorClass, items }: ProfileInfoCardProps) => {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center ${iconColorClass}`}>
          <Icon size={20} />
        </div>
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
      </div>

      <div className="space-y-4 flex-1">
        {items.map(({ icon: ItemIcon, label, value }) => (
          <div key={label} className="group p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-white hover:border-[#1275e2]/20 hover:shadow-sm transition-all flex items-start gap-4">
            <div className="mt-0.5 w-8 h-8 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center shrink-0 text-[#1275e2] group-hover:scale-110 transition-transform">
              <ItemIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <div className="text-sm font-bold text-gray-900 leading-snug mt-1 truncate">
                {value || <span className="text-gray-400 font-medium">ບໍ່ມີຂໍ້ມູນ</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
