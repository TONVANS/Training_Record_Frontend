"use client";

import React from "react";
import { FileText, ExternalLink, Download, Loader2 } from "lucide-react";

interface PortalMaterial {
  id: number;
  type: string;
  file_path_or_link: string;
  created_at: string;
}

interface CourseMaterialsProps {
  materials: PortalMaterial[];
  onDownload?: (material: PortalMaterial) => void;
  loadingId?: number | null;
  variant?: 'default' | 'compact';
}

export const CourseMaterials = ({ 
  materials, 
  onDownload, 
  loadingId,
  variant = 'default'
}: CourseMaterialsProps) => {
  if (!materials || materials.length === 0) return null;

  const isCompact = variant === 'compact';

  return (
    <div className={`bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 space-y-6 ${isCompact ? 'mt-8 pt-6 border-t border-gray-100/80 p-0 shadow-none border-0' : ''}`}>
      <h2 className={`${isCompact ? 'text-sm' : 'text-xl'} font-extrabold text-gray-900 flex items-center gap-3`}>
        <FileText size={isCompact ? 18 : 24} className="text-[#1275e2]" /> ເອກະສານປະກອບການຮຽນ
      </h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isCompact ? 'lg:grid-cols-3 gap-3' : ''}`}>
        {materials.map((material) => {
          const isDownloading = loadingId === material.id;
          
          const Content = (
            <>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  material.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {isDownloading ? <Loader2 size={20} className="animate-spin" /> : 
                   material.type === 'PDF' ? <FileText size={20} /> : <ExternalLink size={20} />}
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
            </>
          );

          if (onDownload) {
            return (
              <button
                key={material.id}
                onClick={() => onDownload(material)}
                disabled={isDownloading}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#1275e2]/30 hover:shadow-md transition-all group text-left w-full"
              >
                {Content}
              </button>
            );
          }

          return (
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
              {Content}
            </a>
          );
        })}
      </div>
    </div>
  );
};
