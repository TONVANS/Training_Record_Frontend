"use client";

import React from "react";
import { Target, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { PortalEnrollment } from "@/store/useEmployeeStore";

interface RecentActivityProps {
  enrollments: PortalEnrollment[];
  statusConfig: Record<string, { label: string; color: string; bg: string }>;
}

export const RecentActivity = ({ enrollments, statusConfig }: RecentActivityProps) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 p-6 md:p-8 overflow-hidden relative">
      <Target className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">ການເຄື່ອນໄຫວຫຼ້າສຸດ</h2>
          <p className="text-sm font-medium text-gray-400 mt-0.5">ປະຫວັດການລົງທະບຽນຂອງຂ້ອຍ</p>
        </div>
        <Link href="/my-learning" className="flex items-center gap-1 text-sm font-bold text-[#1275e2] hover:text-[#0a468c] hover:underline transition-colors bg-blue-50 px-3 py-1.5 rounded-xl">
          ເບິ່ງທັງໝົດ <ArrowRight size={14} />
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen size={28} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-700">ຍັງບໍ່ມີປະຫວັດການຮຽນ</p>
          <p className="text-sm text-gray-400 mt-1 font-medium mb-6">ຄົ້ນຫາຫຼັກສູດທີ່ໜ້າສົນໃຈເພື່ອເລີ່ມຕົ້ນພັດທະນາຕົນເອງ</p>
          <Link href="/catalog" className="inline-flex items-center justify-center bg-[#1275e2] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#0a468c] transition-colors">
            ໄປທີ່ໜ້າຫຼັກສູດ
          </Link>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {enrollments.slice(0, 5).map((enrollment) => {
            const cfg = statusConfig[enrollment.status] ?? { label: enrollment.status, color: "text-gray-600", bg: "bg-gray-100" };
            return (
              <div
                key={enrollment.id}
                className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#1275e2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-1.5 h-12 bg-gradient-to-b from-[#1275e2] to-[#4fa3f7] rounded-full flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1275e2] transition-colors truncate">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">ຮູບແບບ: {enrollment.course.format === 'ONLINE' ? 'ອອນລາຍ' : 'ຕົວຈິງ'}</p>
                  </div>
                </div>
                <span className={`self-start sm:self-center flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl ${cfg.bg} ${cfg.color} border border-current/10`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
