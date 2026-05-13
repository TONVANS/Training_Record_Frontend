"use client";

import React from "react";
import { BookOpen, MapPin, User as UserIcon } from "lucide-react";
import { PortalCourse } from "@/store/useEmployeeStore";

interface CourseDetailsProps {
  course: PortalCourse;
}

export const CourseDetails = ({ course }: CourseDetailsProps) => {
  return (
    <div className="lg:col-span-2 space-y-6 md:space-y-8">
      {/* Description */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
          <BookOpen size={24} className="text-[#1275e2]" /> ລາຍລະອຽດຫຼັກສູດ
        </h2>
        <div className="prose prose-blue max-w-none">
          <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
            {course.description || "ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມສຳລັບຫຼັກສູດນີ້."}
          </p>
        </div>
      </div>

      {/* Location & Trainer Info (Mobile/Tablet Only) */}
      <div className="lg:hidden bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
         <h2 className="text-xl font-extrabold text-gray-900">ຂໍ້ມູນການຈັດການຮຽນ</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ສະຖານທີ່</p>
              <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                {course.format === "ONLINE" ? course.location : (course.location || "ແຈ້ງໃຫ້ຊາບພາຍຫຼັງ")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ວິທະຍາກອນ</p>
              <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                <UserIcon size={16} className="text-blue-500" />
                {course.trainer || "ຊ່ຽວຊານຈາກພາກສ່ວນກ່ຽວຂ້ອງ"}
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};
