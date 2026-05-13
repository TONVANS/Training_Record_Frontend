"use client";
import { useEffect, useState } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { useCategoryStore } from "@/store/categoryStore";
import { Library, Search, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/client/LoadingState";
import { EmptyState } from "@/components/client/EmptyState";
import { CatalogHeader } from "@/components/client/catalog/CatalogHeader";
import { CourseCard } from "@/components/client/catalog/CourseCard";
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

export default function CatalogPage() {
  const { availableCourses, coursesMeta, isLoading, fetchAvailableCourses } = useEmployeeStore();
  const { categories, fetchCategories } = useCategoryStore();
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState("ALL");
  const [locationType, setLocationType] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [openFilterCategory, setOpenFilterCategory] = useState(false);

  const router = useRouter();
  
  const totalPages = coursesMeta ? Math.ceil(coursesMeta.total / coursesMeta.limit) : 1;

  const getPageNumbers = (): (number | "...")[] => {
    if (!coursesMeta) return [];
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
    fetchAvailableCourses({
      page,
      limit: 6,
      title: debouncedSearch || undefined,
      format: format !== "ALL" ? format : undefined,
      location_type: locationType !== "ALL" ? locationType : undefined,
      category_id: categoryId !== "ALL" ? Number(categoryId) : undefined,
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
    });
  }, [debouncedSearch, page, format, locationType, categoryId, startDate, endDate, fetchAvailableCourses]);

  if (isLoading && availableCourses.length === 0) {
    return <LoadingState message="ກຳລັງໂຫຼດຫຼັກສູດ..." />;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* ── Header & Search ── */}
      <CatalogHeader search={search} onSearchChange={setSearch} />

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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

      {/* ── Courses Grid ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={() => router.push(`/catalog/${course.id}`)} 
          />
        ))}

        {/* ── Empty State ── */}
        {availableCourses.length === 0 && !isLoading && (
          <EmptyState
            icon={search ? Search : Library}
            title={search ? "ບໍ່ພົບຫຼັກສູດທີ່ຄົ້ນຫາ" : "ຍັງບໍ່ມີຫຼັກສູດເປີດສອນ"}
            description={search
              ? "ກະລຸນາລອງໃຊ້ຄຳຄົ້ນຫາອື່ນ"
              : "ຂະນະນີ້ຍັງບໍ່ມີວິຊາທີ່ເປີດໃຫ້ບໍລິການ ກະລຸນາກັບມາເບິ່ງໃໝ່ພາຍຫຼັງ"}
          />
        )}
      </div>

      {/* ── Pagination ── */}
      {coursesMeta && coursesMeta.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 mt-8 gap-4">
          <p className="text-sm text-gray-500 font-medium">
            ສະແດງ {Math.min((coursesMeta.page - 1) * coursesMeta.limit + 1, coursesMeta.total)} ຫາ {Math.min(coursesMeta.page * coursesMeta.limit, coursesMeta.total)} ຈາກທັງໝົດ {coursesMeta.total} ຫຼັກສູດ
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