"use client";

import React from "react";
import { Search } from "lucide-react";

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export const CatalogHeader = ({ search, onSearchChange }: CatalogHeaderProps) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">ຫຼັກສູດທັງໝົດ</h1>
        <p className="text-sm font-medium text-gray-400 mt-1.5">
          ຄົ້ນຫາ ແລະ ລົງທະບຽນວິຊາທີ່ທ່ານສົນໃຈເພື່ອພັດທະນາທັກສະ
        </p>
      </div>

      <div className="relative w-full md:w-80 shrink-0 group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1275e2] transition-colors" />
        <input
          type="text"
          placeholder="ຄົ້ນຫາຊື່ຫຼັກສູດ..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1275e2]/20 focus:border-[#1275e2] transition-all"
        />
      </div>
    </div>
  );
};
