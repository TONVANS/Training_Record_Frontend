"use client";

import React from "react";
import Link from "next/link";

export const DesktopFooter = () => {
  return (
    <footer className="hidden md:block bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 font-medium">
        <p>&copy; {new Date().getFullYear()} Lao Training System. ສະຫງວນລິຂະສິດ.</p>
        <div className="flex gap-6 mt-2 sm:mt-0">
          <Link href="#" className="hover:text-[#1275e2] transition-colors">ເງື່ອນໄຂການນຳໃຊ້</Link>
          <Link href="#" className="hover:text-[#1275e2] transition-colors">ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ</Link>
        </div>
      </div>
    </footer>
  );
};
