"use client";

import React from "react";
import { Library, CheckCircle2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { PortalCourse } from "@/store/useEmployeeStore";

interface CourseHeroProps {
  course: PortalCourse;
  isEnrolled: boolean;
}

export const CourseHero = ({ course, isEnrolled }: CourseHeroProps) => {
  return (
    <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -ml-10 -mb-10 opacity-60 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-start">
        {/* Icon/Image Placeholder */}
        <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-3xl bg-linear-to-br from-[#1275e2] to-[#0a468c] flex items-center justify-center shadow-xl shadow-blue-500/20">
          <Library size={48} className="text-white" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#1275e2]/10 text-[#1275e2] px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-[#1275e2]/20">
              {course.category?.name || "ທົ່ວໄປ"}
            </span>
            <span className={`text-[11px] px-4 py-1.5 rounded-full font-extrabold uppercase tracking-wider border ${
              course.format === "ONLINE" 
                ? "bg-sky-50 text-sky-600 border-sky-100" 
                : "bg-orange-50 text-orange-600 border-orange-100"
            }`}>
              {course.format === "ONLINE" ? "ອອນລາຍ" : "ຕົວຈິງ"}
            </span>
            {isEnrolled && (
              <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> ລົງທະບຽນແລ້ວ
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
            {course.title}
          </h1>

          <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#1275e2]" />
              <span>{format(new Date(course.start_date), "dd MMM yyyy")} – {format(new Date(course.end_date), "dd MMM yyyy")}</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#1275e2]" />
              <span>8:30 AM – 4:00 PM</span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
