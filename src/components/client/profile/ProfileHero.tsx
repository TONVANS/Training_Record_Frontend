"use client";

import React from "react";
import { User } from "lucide-react";
import { EmployeeProfile } from "@/store/useEmployeeStore";

interface ProfileHeroProps {
  profile: EmployeeProfile;
}

export const ProfileHero = ({ profile }: ProfileHeroProps) => {
  const fullNameLa = `${profile.first_name_la || ""} ${profile.last_name_la || ""}`.trim();

  return (
    <div className="relative bg-gradient-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] text-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-blue-900/10 overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ffb13b]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 shrink-0 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
          <User size={40} className="text-white/80" />
        </div>

        {/* Info */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
            ໂປຣໄຟລ໌ພະນັກງານ
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
            {fullNameLa || "ທ່ານ"}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            {profile.employee_code && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                ID: {profile.employee_code}
              </span>
            )}
            {profile.position?.name && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl">
                {profile.position.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
