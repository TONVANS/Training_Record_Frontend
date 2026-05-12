"use client";

import { useEffect } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { format } from "date-fns";
import { 
  MapPin, 
  Calendar, 
  Monitor, 
  Users, 
  Library, 
  ChevronLeft, 
  Building2, 
  User as UserIcon, 
  Clock, 
  CheckCircle2,
  BookOpen,
  ArrowRight,
  FileText,
  ExternalLink,
  Download
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດລາຍລະອຽດຫຼັກສູດ...</span>
      </div>
    );
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

  const isEnrolled = currentCourse.enrollments && currentCourse.enrollments.length > 0;
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
                {currentCourse.category?.name || "ທົ່ວໄປ"}
              </span>
              <span className={`text-[11px] px-4 py-1.5 rounded-full font-extrabold uppercase tracking-wider border ${
                currentCourse.format === "ONLINE" 
                  ? "bg-sky-50 text-sky-600 border-sky-100" 
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}>
                {currentCourse.format === "ONLINE" ? "ອອນລາຍ" : "ຕົວຈິງ"}
              </span>
              {isEnrolled && (
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> ລົງທະບຽນແລ້ວ
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
              {currentCourse.title}
            </h1>

            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#1275e2]" />
                <span>{format(new Date(currentCourse.start_date), "dd MMM yyyy")} – {format(new Date(currentCourse.end_date), "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#1275e2]" />
                <span>8:30 AM – 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Description */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
              <BookOpen size={24} className="text-[#1275e2]" /> ລາຍລະອຽດຫຼັກສູດ
            </h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                {currentCourse.description || "ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມສຳລັບຫຼັກສູດນີ້."}
              </p>
            </div>
          </div>

          {/* Materials Section */}
          {isEnrolled && currentCourse.materials && currentCourse.materials.length > 0 && (
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
                <FileText size={24} className="text-[#1275e2]" /> ເອກະສານປະກອບການຮຽນ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentCourse.materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.type === 'PDF' 
                      ? `${process.env.NEXT_PUBLIC_API_URL}${material.file_path_or_link}`
                      : material.file_path_or_link
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#1275e2]/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        material.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        {material.type === 'PDF' ? <FileText size={20} /> : <ExternalLink size={20} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {material.type === 'PDF' ? 'ເອກະສານ (PDF)' : 'ລິ້ງເພີ່ມເຕີມ'}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 truncate">
                          {material.type === 'PDF' ? 'ກົດເພື່ອເປີດ ຫຼື ດາວໂຫຼດ' : 'ກົດເພື່ອໄປທີ່ເວັບໄຊ'}
                        </p>
                      </div>
                    </div>
                    <Download size={18} className="text-gray-300 group-hover:text-[#1275e2] transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Location & Trainer Info (Mobile/Tablet Only) */}
          <div className="lg:hidden bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
             <h2 className="text-xl font-extrabold text-gray-900">ຂໍ້ມູນການຈັດການຮຽນ</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ສະຖານທີ່</p>
                  <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" />
                    {currentCourse.format === "ONLINE" ? currentCourse.location : (currentCourse.location || "ແຈ້ງໃຫ້ຊາບພາຍຫຼັງ")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ວິທະຍາກອນ</p>
                  <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <UserIcon size={16} className="text-blue-500" />
                    {currentCourse.trainer || "ຊ່ຽວຊານຈາກພາກສ່ວນກ່ຽວຂ້ອງ"}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
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
                  <p className="text-sm font-bold text-gray-800">{currentCourse.institution || currentCourse.organization || "Lao Training Center"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">ວິທະຍາກອນ</p>
                  <p className="text-sm font-bold text-gray-800">{currentCourse.trainer || "ຊ່ຽວຊານສະເພາະດ້ານ"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">ສະຖານທີ່</p>
                  <p className="text-sm font-bold text-gray-800">
                    {currentCourse.format === "ONLINE" ? "Online Meeting" : (currentCourse.location || "ແຈ້ງພາຍຫຼັງ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
