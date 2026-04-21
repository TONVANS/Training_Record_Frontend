// src/components/ui/ReportPagination.tsx
"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/report";

interface Props {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ReportPagination({ pagination, onPageChange, isLoading }: Props) {
  const { page, totalPages, total, pageSize, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem   = Math.min(page * pageSize, total);

  // สร้าง page numbers แบบ window (แสดงแค่ 5 หน้ารอบๆ หน้าปัจจุบัน)
  const getPageNumbers = () => {
    const delta  = 2;
    const range: number[] = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (page - delta > 2)        range.unshift(-1); // ellipsis ซ้าย
    if (page + delta < totalPages - 1) range.push(-2); // ellipsis ขวา
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
      {/* Info */}
      <p className="text-xs text-gray-500">
        ສະແດງ <span className="font-semibold text-gray-700">{startItem}–{endItem}</span>{" "}
        ຈາກທັງໝົດ <span className="font-semibold text-gray-700">{total}</span> ຫຼັກສູດ
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage || isLoading}
        >
          <ChevronsLeft size={14} />
        </Button>
        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
        >
          <ChevronLeft size={14} />
        </Button>

        {getPageNumbers().map((p, i) =>
          p < 0 ? (
            <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className={`h-7 w-7 text-xs ${p === page ? "bg-indigo-600 text-white hover:bg-indigo-700" : ""}`}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
        >
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="outline" size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  );
}