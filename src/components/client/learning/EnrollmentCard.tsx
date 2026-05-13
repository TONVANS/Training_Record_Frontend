"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar, Monitor, MapPin, Award, CheckCircle2, Download, UploadCloud, Loader2 } from "lucide-react";
import { CourseMaterials } from "@/components/client/catalog/CourseMaterials";
import { PortalEnrollment } from "@/store/useEmployeeStore";

interface EnrollmentCardProps {
  enrollment: PortalEnrollment;
  statusMap: Record<string, { label: string; color: string; bg: string; dot: string; border: string }>;
  onDownloadMaterial: (materialId: number, url: string) => void;
  loadingMaterialId: number | null;
  onDownloadCertificate: (enrollmentId: number, url: string) => void;
  loadingCertId: number | null;
  onUploadCertificate: (enrollmentId: number) => void;
  uploadingId: number | null;
}

export const EnrollmentCard = ({
  enrollment,
  statusMap,
  onDownloadMaterial,
  loadingMaterialId,
  onDownloadCertificate,
  loadingCertId,
  onUploadCertificate,
  uploadingId
}: EnrollmentCardProps) => {
  const cfg = statusMap[enrollment.status] ?? {
    label: enrollment.status, color: "text-gray-600", bg: "bg-gray-50", dot: "bg-gray-400", border: "border-gray-200"
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-[#1275e2]/5 transition-all duration-300 overflow-hidden group">
      
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
          <CourseMaterials 
            materials={enrollment.course.materials} 
            variant="compact"
            onDownload={(mat) => mat.type === 'PDF' 
              ? onDownloadMaterial(mat.id, `${process.env.NEXT_PUBLIC_API_URL}/employee-portal/courses/materials/${mat.id}/file`)
              : window.open(mat.file_path_or_link, '_blank')
            }
            loadingId={loadingMaterialId}
          />
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
                onClick={() => onDownloadCertificate(enrollment.id, `${process.env.NEXT_PUBLIC_API_URL}/employee-portal/enrollments/${enrollment.id}/certificate/file`)}
                disabled={loadingCertId === enrollment.id}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-sm font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 w-full sm:w-auto"
              >
                {loadingCertId === enrollment.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={2.5} />}
                ດາວໂຫຼດໃບຢັ້ງຢືນ
              </button>
            )}

            {/* Upload Cert Button */}
            <button
              onClick={() => onUploadCertificate(enrollment.id)}
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
};
