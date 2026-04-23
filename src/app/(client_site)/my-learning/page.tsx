"use client";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Download, Link as LinkIcon, BookOpen, Award, Calendar, Monitor, MapPin, Loader2, UploadCloud, FileText, CheckCircle2, Search } from "lucide-react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import Link from "next/link";
import Image from "next/image";

const statusMap: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  COMPLETED: { label: "ສຳເລັດແລ້ວ", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", border: "border-emerald-200/50" },
  IN_PROGRESS: { label: "ກຳລັງຮຽນ", color: "text-[#1275e2]", bg: "bg-blue-50", dot: "bg-[#1275e2]", border: "border-blue-200/50" },
  ENROLLED: { label: "ລົງທະບຽນແລ້ວ", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500", border: "border-amber-200/50" },
};

export default function MyLearningPage() {
  const { enrollments, isLoading, fetchMyEnrollments, uploadCertificate } = useEmployeeStore();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadingCertId, setLoadingCertId] = useState<number | null>(null);
  const [loadingMaterialId, setLoadingMaterialId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyEnrollments();
  }, [fetchMyEnrollments]);

  const handleFileChange = async (enrollmentId: number, file?: File) => {
    if (!file) return;
    try {
      setUploadingId(enrollmentId);
      await uploadCertificate(enrollmentId, file);
    } finally {
      setUploadingId(null);
    }
  };

  const downloadFile = async (url: string, setLoadingId: (id: number | null) => void, id: number) => {
    try {
      setLoadingId(id);
      setIsDownloading(true);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : '' : ''}`
        }
      });

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`Network error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;

      // Extract filename from disposition or URL
      const disposition = response.headers.get("content-disposition");
      let filename = url.split('/').pop()?.split('?')[0] || "document";
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("ດາວໂຫຼດລົ້ມເຫຼວ:", error);
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
      setLoadingId(null);
    }
  };

  if (isLoading && enrollments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#1275e2]/20 border-t-[#1275e2] rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-500 animate-pulse">ກຳລັງໂຫຼດຂໍ້ມູນການຮຽນ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* ── Header ── */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100/80">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">ການຮຽນຂອງຂ້ອຍ</h1>
        <p className="text-sm font-medium text-gray-400 mt-1.5">
          ຕິດຕາມວິຊາທີ່ທ່ານລົງທະບຽນ, ດາວໂຫຼດເອກະສານ ແລະ ຈັດການໃບຢັ້ງຢືນຂອງທ່ານໄດ້ທີ່ນີ້.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <BookOpen size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">ຍັງບໍ່ມີປະຫວັດການຮຽນ</h3>
          <p className="text-sm font-medium text-gray-500 mb-6">ທ່ານຍັງບໍ່ໄດ້ລົງທະບຽນວິຊາໃດເທື່ອ.</p>
          <Link href="/catalog" className="bg-[#1275e2] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-lg shadow-[#1275e2]/20 hover:bg-[#0a468c] transition-all hover:-translate-y-0.5">
            ຄົ້ນຫາຫຼັກສູດດຽວນີ້
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enrollment) => {
            const cfg = statusMap[enrollment.status] ?? {
              label: enrollment.status, color: "text-gray-600", bg: "bg-gray-50", dot: "bg-gray-400", border: "border-gray-200"
            };

            return (
              <div key={enrollment.id} className="bg-white rounded-[2rem] border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-[#1275e2]/5 transition-all duration-300 overflow-hidden group">
                
                {/* 📌 Accent Top Line */}
                <div className="h-2 w-full bg-gradient-to-r from-[#0a468c] via-[#1275e2] to-[#4fa3f7]" />

                <div className="p-6 md:p-8">
                  {/* ── Title & Status ── */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug flex-1 group-hover:text-[#1275e2] transition-colors">
                      {enrollment.course.title}
                    </h2>
                    <span className={`shrink-0 inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* ── Meta Info ── */}
                  <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium text-gray-600 bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded-md shadow-sm text-[#1275e2]"><Calendar size={14} /></div>
                      <span>ລົງທະບຽນ: <span className="font-bold text-gray-900">{format(new Date(enrollment.enrolled_at), "dd MMM yyyy")}</span></span>
                    </div>
                    <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 bg-white rounded-md shadow-sm ${enrollment.course.format === 'ONLINE' ? 'text-sky-500' : 'text-orange-500'}`}>
                        {enrollment.course.format === "ONLINE" ? <Monitor size={14} /> : <MapPin size={14} />}
                      </div>
                      <span>ຮູບແບບ: <span className="font-bold text-gray-900">{enrollment.course.format === "ONLINE" ? "ອອນລາຍ" : "ຕົວຈິງ"}</span></span>
                    </div>
                  </div>

                  {/* ── Materials ── */}
                  {enrollment.course.materials && enrollment.course.materials.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100/80">
                      <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-[#1275e2]" /> ເອກະສານປະກອບການຮຽນ
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {enrollment.course.materials.map((mat) => (
                          <button
                            key={mat.id}
                            onClick={() =>
                              mat.type === 'PDF' 
                                ? downloadFile(`${process.env.NEXT_PUBLIC_API_URL}/employee-portal/courses/materials/${mat.id}/file`, setLoadingMaterialId, mat.id) 
                                : window.open(mat.file_path_or_link, '_blank')
                            }
                            disabled={loadingMaterialId === mat.id}
                            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all duration-200 disabled:opacity-60 text-left group/btn"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 group-hover/btn:bg-white group-hover/btn:text-[#1275e2] flex items-center justify-center shrink-0 transition-colors">
                              {loadingMaterialId === mat.id ? <Loader2 size={18} className="animate-spin text-[#1275e2]" /> 
                                : mat.type === 'PDF' ? <FileText size={18} className="text-gray-400 group-hover/btn:text-[#1275e2]" /> 
                                : <LinkIcon size={18} className="text-gray-400 group-hover/btn:text-[#1275e2]" />
                              }
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-gray-800 truncate group-hover/btn:text-[#1275e2] transition-colors">
                                {mat.type === 'PDF' ? 'ດາວໂຫຼດ PDF' : 'ເປີດລິ້ງພາຍນອກ'}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{mat.type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Certificate Actions ── */}
                  <div className="mt-8 pt-6 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-gray-50/50 p-6 rounded-2xl border border-gray-50">
                    <div className="flex-1">
                      <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                        <Award size={18} className="text-amber-500" /> ໃບຢັ້ງຢືນ (Certificate)
                      </h3>
                      {enrollment.certificate_url ? (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-1">
                          <CheckCircle2 size={14} /> ມີໃບຢັ້ງຢືນໃນລະບົບແລ້ວ
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-gray-400 mt-1">ຍັງບໍ່ມີການອັບໂຫຼດໃບຢັ້ງຢືນເທື່ອ</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      {/* View Cert Button */}
                      {enrollment.certificate_url && (
                        <button
                          onClick={() => downloadFile(`${process.env.NEXT_PUBLIC_API_URL}/employee-portal/enrollments/${enrollment.id}/certificate/file`, setLoadingCertId, enrollment.id)}
                          disabled={loadingCertId === enrollment.id}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-sm font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 w-full sm:w-auto"
                        >
                          {loadingCertId === enrollment.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={2.5} />}
                          ດາວໂຫຼດໃບຢັ້ງຢືນ
                        </button>
                      )}

                      {/* Upload Cert Button */}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[enrollment.id] = el; }}
                        onChange={(e) => handleFileChange(enrollment.id, e.target.files?.[0])}
                      />
                      <button
                        onClick={() => fileInputRefs.current[enrollment.id]?.click()}
                        disabled={uploadingId === enrollment.id}
                        className={`inline-flex items-center justify-center gap-2 text-sm font-extrabold py-3.5 px-6 rounded-xl transition-all border-2 border-dashed w-full sm:w-auto ${
                          enrollment.certificate_url 
                            ? "bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-[#1275e2]" 
                            : "bg-blue-50/50 border-blue-200 text-[#1275e2] hover:bg-blue-100 hover:border-[#1275e2]/50"
                        } disabled:opacity-50`}
                      >
                        {uploadingId === enrollment.id ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} strokeWidth={2.5} />}
                        {enrollment.certificate_url ? "ອັບໂຫຼດແທນທີ່" : "ອັບໂຫຼດໃບຢັ້ງຢືນ"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}