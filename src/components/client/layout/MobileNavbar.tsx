"use client";

import React from "react";
import Image from "next/image";

export const MobileNavbar = () => {
  return (
    <nav className="md:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm z-50 h-14 flex items-center px-5">
      {/* 📌 Logo Section (Mobile) */}
      <div className="flex items-center gap-2.5">
         <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 overflow-hidden">
            <Image 
              src="/app1/images/logo/logo.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
         </div>
         <div className="font-extrabold text-lg text-gray-900 tracking-tight">
           Lao Training
         </div>
      </div>
    </nav>
  );
};
