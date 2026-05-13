"use client";

import React from "react";
import { Calendar, Monitor, MapPin, Library, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { PortalCourse } from "@/store/useEmployeeStore";

interface CourseCardProps {
  course: PortalCourse;
  onClick: () => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-[#1275e2]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
      onClick={onClick}
    >
      {/* 📌 Card Image Placeholder / Accent Banner */}
      <div className="h-28 bg-linear-to-br from-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center">
          <Library size={40} className="text-blue-200/50 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#1275e2] to-[#0a468c]" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#1275e2]/10 text-[#1275e2] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {course.category?.name || "ທົ່ວໄປ"}
          </span>
          <span
            className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
              course.format === "ONLINE"
                ? "bg-sky-50 text-sky-600 border border-sky-100"
                : "bg-orange-50 text-orange-600 border border-orange-100"
            }`}
          >
            {course.format === "ONLINE" ? "ອອນລາຍ" : "ຕົວຈິງ"}
          </span>
        </div>

        {/* Title & Description */}
        <div className="mb-6 flex-1">
          <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[#1275e2] transition-colors line-clamp-2">
            {course.title}
          </h2>
          {course.description && (
            <p className="text-sm font-medium text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-2.5 text-xs font-medium text-gray-600 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
               <Calendar size={14} className="text-[#1275e2]" />
            </div>
            <span className="truncate">
              {format(new Date(course.start_date), "dd MMM yyyy")} – {format(new Date(course.end_date), "dd MMM yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${course.format === 'ONLINE' ? 'bg-sky-50 text-sky-500' : 'bg-orange-50 text-orange-500'}`}>
              {course.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />}
            </div>
            <span className="truncate">
              {course.format === "ONLINE"
                ? course.location || "Online Meeting"
                : course.location_type === "INTERNATIONAL"
                ? course.country
                : course.location || "ແຈ້ງໃຫ້ຊາບພາຍຫຼັງ"}
            </span>
          </div>
        </div>

        {/* View Detail Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-[#1275e2] text-gray-700 hover:text-white text-sm font-bold py-3.5 rounded-xl transition-colors group-hover:shadow-md">
          ລາຍລະອຽດ <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
