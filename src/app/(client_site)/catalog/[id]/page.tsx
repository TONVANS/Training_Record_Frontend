"use client";

import { useEffect } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { 
  ChevronLeft, 
  Library, 
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { LoadingState } from "@/components/client/LoadingState";
import { CourseHero } from "@/components/client/catalog/CourseHero";
import { CourseDetails } from "@/components/client/catalog/CourseDetails";
import { CourseSidebar } from "@/components/client/catalog/CourseSidebar";
import { CourseMaterials } from "@/components/client/catalog/CourseMaterials";

export default function CourseDetailPage() {
  const { currentCourse, isLoading, fetchCourseById } = useEmployeeStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      fetchCourseById(parseInt(id));
    }
  }, [id, fetchCourseById]);

  if (isLoading && !currentCourse) {
    return <LoadingState message="ກຳລັງໂຫຼດລາຍລະອຽດຫຼັກສູດ..." />;
  }

  if (!currentCourse) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <Library size={40} className="text-gray-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">ບໍ່ພົບຫຼັກສູດ</h3>
          <p className="text-sm font-medium text-gray-500 mt-2">ຫຼັກສູດທີ່ທ່ານຊອກຫາອາດຈະຖືກລຶບ ຫຼື ບໍ່ມີຢູ່ໃນລະບົບ</p>
        </div>
        <button 
          onClick={() => router.push("/catalog")}
          className="bg-[#1275e2] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-[#0a468c] transition-all"
        >
          ກັບໄປໜ້າຫຼັກສູດ
        </button>
      </div>
    );
  }

  const isEnrolled = !!(currentCourse.enrollments && currentCourse.enrollments.length > 0);
  const enrollmentStatus = isEnrolled ? currentCourse.enrollments![0].status : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-10">
      
      {/* ── Navigation ── */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1275e2] transition-colors group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        ກັບຄືນ
      </button>

      {/* ── Hero Section ── */}
      <CourseHero course={currentCourse} isEnrolled={isEnrolled} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <CourseDetails course={currentCourse} />

          {/* Materials Section */}
          {isEnrolled && currentCourse.materials && currentCourse.materials.length > 0 && (
            <CourseMaterials materials={currentCourse.materials} />
          )}
        </div>

        {/* ── Sidebar ── */}
        <CourseSidebar 
          course={currentCourse} 
          isEnrolled={isEnrolled} 
          enrollmentStatus={enrollmentStatus} 
        />
      </div>
    </div>
  );
}
