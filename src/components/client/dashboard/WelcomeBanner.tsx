"use client";

import React from "react";
import { Flame } from "lucide-react";

interface WelcomeBannerProps {
  firstName?: string;
  lastName?: string;
}

export const WelcomeBanner = ({ firstName, lastName }: WelcomeBannerProps) => {
  return (
    <div className="relative bg-linear-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] text-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-blue-900/10 overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#ffb13b]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md shadow-sm">
            <Flame size={16} className="text-[#ffb13b]" fill="currentColor" />
          </span>
          <span className="text-xs font-bold text-blue-100 uppercase tracking-widest drop-shadow-sm">ສືບຕໍ່ພັດທະນາຕົນເອງ!</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-2">
          ສະບາຍດີ, {firstName ?? "ທ່ານ"} {lastName}!
        </h1>
        <p className="text-sm md:text-base text-blue-100/90 max-w-md font-medium">
          ທ່ານພ້ອມທີ່ຈະຮຽນຮູ້ສິ່ງໃໝ່ໆ ແລະ ຍົກລະດັບທັກສະຂອງທ່ານແລ້ວຫຼືຍັງ?
        </p>
      </div>
    </div>
  );
};
