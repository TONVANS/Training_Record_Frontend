"use client";
import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Search, ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { useCategoryStore } from "@/store/categoryStore";
import Link from "next/link";
import { LoadingState } from "@/components/client/LoadingState";
import { MyLearningHeader } from "@/components/client/learning/MyLearningHeader";
import { EnrollmentCard } from "@/components/client/learning/EnrollmentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  COMPLETED: { label: "ສຳເລັດແລ້ວ", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", border: "border-emerald-200/50" },
  IN_PROGRESS: { label: "ກຳລັງຮຽນ", color: "text-[#1275e2]", bg: "bg-blue-50", dot: "bg-[#1275e2]", border: "border-blue-200/50" },
  ENROLLED: { label: "ລົງທະບຽນແລ້ວ", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500", border: "border-amber-200/50" },
};

export default function MyLearningPage() {
  const { enrollments, enrollmentsMeta, isLoading, fetchMyEnrollments, uploadCertificate } = useEmployeeStore();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [loadingCertId, setLoadingCertId] = useState<number | null>(null);
  const [loadingMaterialId, setLoadingMaterialId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState("ALL");
  const [locationType, setLocationType] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openFilterCategory, setOpenFilterCategory] = useState(false);

  const { categories, fetchCategories } = useCategoryStore();

  const totalPages = enrollmentsMeta ? Math.ceil(enrollmentsMeta.total / enrollmentsMeta.limit) : 1;

  const getPageNumbers = (): (number | "...")[] => {
    if (!enrollmentsMeta) return [];
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMyEnrollments({
      page,
      limit: 6,
      title: debouncedSearch || undefined,
      format: format !== "ALL" ? format : undefined,
      location_type: locationType !== "ALL" ? locationType : undefined,
      category_id: categoryId !== "ALL" ? Number(categoryId) : undefined,
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    });
  }, [debouncedSearch, page, format, locationType, categoryId, startDate, endDate, fetchMyEnrollments]);

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
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : '' : ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;

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
      setLoadingId(null);
    }
  };

  if (isLoading && enrollments.length === 0) {
    return <LoadingState message="ກຳລັງໂຫຼດຂໍ້ມູນການຮຽນ..." />;
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
      
      {/* ── Header ── */}
      <MyLearningHeader />

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1275e2] transition-colors" />
          <Input
            type="text"
            placeholder="ຄົ້ນຫາຊື່ຫຼັກສູດ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-gray-200 h-10"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">ຮູບແບບການຮຽນ</Label>
            <Select value={format} onValueChange={(v) => { setFormat(v); setPage(1); }}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 h-10">
                <SelectValue placeholder="ທັງໝົດ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ທັງໝົດ</SelectItem>
                <SelectItem value="ONLINE">ອອນລາຍ (ONLINE)</SelectItem>
                <SelectItem value="ONSITE">ຮຽນຢູ່ສະຖານທີ່ (ONSITE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">ສະຖານທີ່</Label>
            <Select value={locationType} onValueChange={(v) => { setLocationType(v); setPage(1); }}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 h-10">
                <SelectValue placeholder="ທັງໝົດ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ທັງໝົດ</SelectItem>
                <SelectItem value="DOMESTIC">ພາຍໃນປະເທດ (DOMESTIC)</SelectItem>
                <SelectItem value="INTERNATIONAL">ຕ່າງປະເທດ (INTERNATIONAL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">ໝວດໝູ່</Label>
            <Popover open={openFilterCategory} onOpenChange={setOpenFilterCategory}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openFilterCategory}
                  className="w-full justify-between bg-gray-50 border-gray-200 font-normal h-10 text-sm hover:bg-gray-50"
                >
                  <span className="truncate">
                    {categoryId !== "ALL"
                      ? categories.find((cat) => String(cat.id) === categoryId)?.name
                      : "ທັງໝົດ"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-full" align="start">
                <Command>
                  <CommandInput placeholder="ຄົ້ນຫາໝວດໝູ່..." />
                  <CommandList>
                    <CommandEmpty>ບໍ່ພົບໝວດໝູ່ທີ່ຄົ້ນຫາ.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="ALL"
                        onSelect={() => {
                          setCategoryId("ALL");
                          setPage(1);
                          setOpenFilterCategory(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", categoryId === "ALL" ? "opacity-100" : "opacity-0")} />
                        ທັງໝົດ
                      </CommandItem>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => {
                            setCategoryId(String(cat.id));
                            setPage(1);
                            setOpenFilterCategory(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", categoryId === String(cat.id) ? "opacity-100" : "opacity-0")} />
                          {cat.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">ເລີ່ມຕົ້ນວັນທີ</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-50 border-gray-200 h-10"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">ສິ້ນສຸດວັນທີ</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-50 border-gray-200 h-10"
            />
          </div>
        </div>
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
          {enrollments.map((enrollment) => (
            <React.Fragment key={enrollment.id}>
              <EnrollmentCard
                enrollment={enrollment}
                statusMap={statusMap}
                onDownloadMaterial={(id, url) => downloadFile(url, setLoadingMaterialId, id)}
                loadingMaterialId={loadingMaterialId}
                onDownloadCertificate={(id, url) => downloadFile(url, setLoadingCertId, id)}
                loadingCertId={loadingCertId}
                onUploadCertificate={(id) => fileInputRefs.current[id]?.click()}
                uploadingId={uploadingId}
              />
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                ref={(el) => { fileInputRefs.current[enrollment.id] = el; }}
                onChange={(e) => handleFileChange(enrollment.id, e.target.files?.[0])}
              />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {enrollmentsMeta && enrollmentsMeta.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 mt-8 gap-4">
          <p className="text-sm text-gray-500 font-medium">
            ສະແດງ {Math.min((enrollmentsMeta.page - 1) * enrollmentsMeta.limit + 1, enrollmentsMeta.total)} ຫາ {Math.min(enrollmentsMeta.page * enrollmentsMeta.limit, enrollmentsMeta.total)} ຈາກທັງໝົດ {enrollmentsMeta.total} ລາຍການ
          </p>
          {totalPages > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, idx) => (
                  <PaginationItem key={idx}>
                    {pageNum === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => setPage(pageNum as number)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage((p) => p + 1)}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

    </div>
  );
}