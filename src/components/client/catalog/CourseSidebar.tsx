"use client";

import React from "react";
import { CheckCircle2, ArrowRight, Building2, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { PortalCourse } from "@/store/useEmployeeStore";

interface CourseSidebarProps {
  course: PortalCourse;
  isEnrolled: boolean;
  enrollmentStatus: string | null;
}

export const CourseSidebar = ({ course, isEnrolled, enrollmentStatus }: CourseSidebarProps) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Status & Action Card */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-[#1275e2]/5 border border-gray-100 space-y-6 sticky top-24">
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900">ການລົງທະບຽນ</h3>
          
          {isEnrolled ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-700 font-bold mb-1">
                  <CheckCircle2 size={20} />
                  ທ່ານລົງທະບຽນແລ້ວ
                </div>
                <p className="text-xs text-emerald-600 font-medium ml-8">
                  ສະຖານະ: {enrollmentStatus === 'COMPLETED' ? 'ຮຽນສຳເລັດແລ້ວ' : enrollmentStatus === 'IN_PROGRESS' ? 'ກຳລັງຮຽນ' : 'ລົງທະບຽນແລ້ວ'}
                </p>
              </div>
              <Link 
                href="/my-learning"
                className="w-full flex items-center justify-center gap-2 bg-[#1275e2] hover:bg-[#0a468c] text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
              >
                ໄປທີ່ການຮຽນຂອງຂ້ອຍ <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm font-medium text-blue-800 leading-relaxed">
                  ຫຼັກສູດນີ້ກຳລັງເປີດໃຫ້ລົງທະບຽນ. ກະລຸນາຕິດຕໍ່ຜູ້ຈັດການຝ່າຍບຸກຄົນ ຫຼື ແອັດມິນເພື່ອລົງທະບຽນ.
                </p>
              </div>
              <button 
                disabled
                className="w-full bg-gray-100 text-gray-400 font-extrabold py-4 rounded-2xl cursor-not-allowed border border-gray-200"
              >
                ລົງທະບຽນ (Admin Only)
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-5">
          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">ຂໍ້ມູນອື່ນໆ</h3>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ອົງກອນ/ສະຖາບັນ</p>
              <p className="text-sm font-bold text-gray-800">{course.institution || course.organization || "Lao Training Center"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Users size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ວິທະຍາກອນ</p>
              <p className="text-sm font-bold text-gray-800">{course.trainer || "ຊ່ຽວຊານສະເພາະດ້ານ"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ສະຖານທີ່</p>
              <p className="text-sm font-bold text-gray-800">
                {course.format === "ONLINE" ? "Online Meeting" : (course.location || "ແຈ້ງພາຍຫຼັງ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
