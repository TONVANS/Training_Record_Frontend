// src/components/reports/ReportByDepartment.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Users, Printer, Eye, Loader2, Filter, Check, ChevronsUpDown, ChevronRight, CalendarDays, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useDepartmentReportStore } from "@/store/report/departmentReportStore";
import { ReportPeriodType } from "@/types/report";
import { format } from "date-fns";
import { downloadDepartmentReportPDF, generateDepartmentPreviewHtmlUrl, fetchAllDeptReportPagesForPDF } from "@/util/pdfDepartmentReport";
import { toast } from "sonner";
import { ReportPagination } from "@/components/ui/ReportPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function ReportByDepartment() {
    const { reportData, departments, isLoading, fetchReport, fetchDepartments, setPage, currentPage } = useDepartmentReportStore();
    const [isDownloading, setIsDownloading] = useState(false);
    const [openDeptCombobox, setOpenDeptCombobox] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");

    const currentYear = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState<number>(currentYear);
    const [filterType, setFilterType] = useState<ReportPeriodType>("MONTHLY");
    const [filterValue, setFilterValue] = useState<number>(new Date().getMonth() + 1);

    // State สำหรับควบคุมการเปิด/ปิด Popover ปี
    const [isYearPopoverOpen, setIsYearPopoverOpen] = useState(false);

    // 💡 Generate Years Array (เรียงจากใหม่ไปเก่า) - ให้ครอบคลุมช่วงปีที่เหมาะสม
    const yearGridOptions = useMemo(() => {
        const startYear = 2010;
        const endYear = currentYear + 2;
        const totalYears = endYear - startYear + 1;
        return Array.from({ length: totalYears }, (_, i) => endYear - i);
    }, [currentYear]);

    useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

    useEffect(() => {
        if (departments.length > 0 && selectedDeptId === "") {
            setSelectedDeptId(departments[0].id);
        }
    }, [departments, selectedDeptId]);

    useEffect(() => {
        if (selectedDeptId === "") return;
        const valueToSend = filterType === "YEARLY" ? undefined : filterValue;
        fetchReport(Number(selectedDeptId), filterYear, filterType, valueToSend);
    }, [selectedDeptId, filterYear, filterType, filterValue, fetchReport]);

    const handleTypeChange = (value: string) => {
        const newType = value as ReportPeriodType;
        setFilterType(newType);
        if (newType !== "YEARLY") setFilterValue(1);
    };

    const renderValueOptions = () => {
        if (filterType === "MONTHLY")
            return Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>ເດືອນ {i + 1}</SelectItem>
            ));
        if (filterType === "QUARTERLY")
            return Array.from({ length: 4 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>ໄຕມາດ {i + 1}</SelectItem>
            ));
        if (filterType === "HALF_YEARLY")
            return [
                <SelectItem key={1} value="1">6 ເດືອນຕົ້ນປີ (1-6)</SelectItem>,
                <SelectItem key={2} value="2">6 ເດືອນທ້າຍປີ (7-12)</SelectItem>,
            ];
        return null;
    };

    const handlePreview = async () => {
        if (!reportData || !selectedDeptId) return;
        toast.info("ກຳລັງກຽມຂໍ້ມູນ...");
        try {
            // ✅ ใช้ Batch Fetch ดึงทีละ 50 
            const allData = await fetchAllDeptReportPagesForPDF(reportData.report_info, 50);

            const url = generateDepartmentPreviewHtmlUrl(allData);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch {
            toast.error("ເກີດຂໍ້ຜິດພາດໃນການກຽມຂໍ້ມູນ");
        }
    };

    const handleDownloadPdf = async () => {
        if (!reportData || !selectedDeptId) return;
        setIsDownloading(true);
        toast.info("ກຳລັງດຶງຂໍ້ມູນທັງໝົດເພື່ອສ້າງ PDF...");
        try {
            // ✅ ใช้ Batch Fetch
            const allData = await fetchAllDeptReportPagesForPDF(reportData.report_info, 50);

            await downloadDepartmentReportPDF(allData);
            toast.success("Print PDF ສຳເລັດແລ້ວ!");
        } catch {
            toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    const selectedDeptName = departments.find((d) => d.id === Number(selectedDeptId))?.name;

    // Helper functions สำหรับปุ่ม เลื่อนปี
    const handlePrevYear = () => setFilterYear(prev => prev - 1);
    const handleNextYear = () => setFilterYear(prev => prev + 1);

    return (
        <div className="space-y-4 h-full flex flex-col">

            {/* ── Header & Filter ── */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

                {/* Left: Title */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                        <Users size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                            ລາຍງານການຝຶກອົບຮົມ (ແຍກຝ່າຍ)
                        </h2>
                        <p className="text-sm text-gray-500 truncate">
                            {reportData
                                ? `ຂໍ້ມູນຂອງ: ${reportData.report_info.department.name}`
                                : selectedDeptName
                                    ? `ຂໍ້ມູນຂອງ: ${selectedDeptName}`
                                    : "Training Report by Department"}
                        </p>
                    </div>
                </div>

                {/* Right: Controls & Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-stretch sm:items-center gap-3">

                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-200 w-full sm:w-auto">

                        {/* 1. Department Selector */}
                        <Popover open={openDeptCombobox} onOpenChange={setOpenDeptCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openDeptCombobox}
                                    disabled={departments.length === 0}
                                    className="h-9 sm:w-[200px] w-full justify-between bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                                >
                                    <div className="flex items-center truncate">
                                        <Filter size={14} className="text-gray-400 mr-2 shrink-0" />
                                        <span className="truncate font-medium text-gray-700">
                                            {departments.length === 0 ? "ກຳລັງໂຫຼດ..." : selectedDeptName ?? "ເລືອກຝ່າຍ"}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-gray-400" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="ຄົ້ນຫາຝ່າຍ..." />
                                    <CommandList>
                                        <CommandEmpty>ບໍ່ພົບຝ່າຍທີ່ຄົ້ນຫາ.</CommandEmpty>
                                        <CommandGroup>
                                            {departments.map((dept) => (
                                                <CommandItem
                                                    key={dept.id}
                                                    value={dept.name}
                                                    onSelect={() => {
                                                        setSelectedDeptId(dept.id);
                                                        setOpenDeptCombobox(false);
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <Check className={cn(
                                                        "mr-2 h-4 w-4 text-indigo-600",
                                                        selectedDeptId === dept.id ? "opacity-100" : "opacity-0"
                                                    )} />
                                                    {dept.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <div className="hidden sm:block w-px h-5 bg-gray-300 mx-1" />

                        {/* 2. Period Type & Value (Upgraded to shadcn Select) */}
                        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                            <Select value={filterType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-9 bg-white border-gray-200 min-w-[120px] shadow-sm font-medium text-gray-700">
                                    <SelectValue placeholder="ເລືອກປະເພດ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">ປະຈຳເດືອນ</SelectItem>
                                    <SelectItem value="QUARTERLY">ປະຈຳໄຕມາດ</SelectItem>
                                    <SelectItem value="HALF_YEARLY">ປະຈຳ 6 ເດືອນ</SelectItem>
                                    <SelectItem value="YEARLY">ປະຈຳປີ</SelectItem>
                                </SelectContent>
                            </Select>

                            {filterType !== "YEARLY" && (
                                <Select
                                    value={filterValue.toString()}
                                    onValueChange={(val) => setFilterValue(Number(val))}
                                >
                                    <SelectTrigger className="h-9 bg-white border-gray-200 min-w-[110px] shadow-sm font-medium text-gray-700">
                                        <SelectValue placeholder="ເລືອກຊ່ວງ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {renderValueOptions()}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* 3. Year Stepper Control */}
                        <div className="flex items-center bg-white rounded-md border border-gray-200 shadow-sm">
                            <button
                                onClick={handlePrevYear}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-md transition-colors"
                                title="ປີກ່ອນໜ້າ"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="w-px h-4 bg-gray-200" />

                            <Popover open={isYearPopoverOpen} onOpenChange={setIsYearPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors min-w-[70px] justify-center">
                                        <CalendarDays size={14} className="text-gray-400" />
                                        {filterYear}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3" align="end">
                                    <div className="mb-2 font-medium text-sm text-gray-700">ເລືອກປີ</div>
                                    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                                        {yearGridOptions.map((year) => (
                                            <button
                                                key={year}
                                                onClick={() => {
                                                    setFilterYear(year);
                                                    setIsYearPopoverOpen(false);
                                                }}
                                                className={cn(
                                                    "py-1.5 text-sm rounded-md transition-all",
                                                    filterYear === year
                                                        ? "bg-indigo-600 text-white font-bold shadow-md"
                                                        : "hover:bg-indigo-50 text-gray-700 font-medium"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <div className="w-px h-4 bg-gray-200" />

                            <button
                                onClick={handleNextYear}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-md transition-colors"
                                title="ປີຖັດໄປ"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            onClick={handlePreview}
                            disabled={!reportData || reportData.data.length === 0}
                            variant="outline"
                            className="flex-1 sm:flex-none h-10 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white"
                        >
                            <Eye size={18} />
                            <span>ເບິ່ງຕົວຢ່າງ</span>
                        </Button>
                        <Button
                            onClick={handleDownloadPdf}
                            disabled={!reportData || reportData.data.length === 0 || isDownloading}
                            className="flex-1 sm:flex-none h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            {isDownloading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Printer size={18} />}
                            <span>Print PDF</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Table Area ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1
                            overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                    <Table className="min-w-[1200px] text-xs">
                        <TableHeader className="bg-gray-50/80 sticky top-0 z-10">

                            {/* Row 1 */}
                            <TableRow className="border-b border-gray-200">
                                <TableHead rowSpan={3} className="text-center w-8 border-r align-middle sticky left-0 bg-gray-50 z-20">ລ/ດ</TableHead>
                                <TableHead rowSpan={3} className="border-r w-24 align-middle text-center sticky left-8 bg-gray-50 z-20">ລະຫັດ</TableHead>
                                <TableHead rowSpan={3} className="border-r w-40 align-middle sticky left-28 bg-gray-50 z-20">ຊື່ ແລະ ນາມສະກຸນ</TableHead>
                                <TableHead rowSpan={3} className="border-r w-32 align-middle">ຕຳແໜ່ງ</TableHead>
                                <TableHead rowSpan={3} className="border-r w-44 align-middle">ຫົວຂໍ້ຝຶກອົບຮົມ</TableHead>
                                <TableHead colSpan={7} className="text-center border-r">ຈຳນວນຜູ້ເຂົ້າຝຶກ</TableHead>
                                <TableHead colSpan={2} className="text-center border-r">ໄລຍະເວລາ</TableHead>
                                <TableHead rowSpan={3} className="text-center border-r w-10 align-middle">ມື້</TableHead>
                                <TableHead colSpan={2} className="text-center border-r">ສະຖານທີ່</TableHead>
                                <TableHead rowSpan={3} className="border-r w-28 align-middle">ສະຖາບັນ/ອົງກອນ</TableHead>
                                <TableHead rowSpan={3} className="text-center border-r w-16 align-middle">ຮູບແບບ</TableHead>
                                <TableHead rowSpan={3} className="w-12 align-middle">ໝາຍເຫດ</TableHead>
                            </TableRow>

                            {/* Row 2 */}
                            <TableRow className="border-b border-gray-200 bg-gray-50/50">
                                <TableHead colSpan={3} className="text-center border-r font-normal text-blue-700">ເຕັກນິກ</TableHead>
                                <TableHead colSpan={3} className="text-center border-r font-normal text-green-700">ບໍລິຫານ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-semibold w-10 align-middle">ລວມ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-16 align-middle">ມື້ເລີ່ມ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-16 align-middle">ມື້ສິ້ນສຸດ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-10 align-middle">ໃນ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-10 align-middle">ນອກ</TableHead>
                            </TableRow>

                            {/* Row 3 */}
                            <TableRow className="border-b border-gray-200 bg-gray-50/30">
                                <TableHead className="text-center border-r font-normal w-8 text-blue-600">ຊ</TableHead>
                                <TableHead className="text-center border-r font-normal w-8 text-pink-500">ຍ</TableHead>
                                <TableHead className="text-center border-r font-normal w-8">ລວມ</TableHead>
                                <TableHead className="text-center border-r font-normal w-8 text-blue-600">ຊ</TableHead>
                                <TableHead className="text-center border-r font-normal w-8 text-pink-500">ຍ</TableHead>
                                <TableHead className="text-center border-r font-normal w-8">ລວມ</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={21} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                                        <p className="text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...</p>
                                    </TableCell>
                                </TableRow>
                            ) : reportData?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={21} className="h-32 text-center text-gray-500">
                                        ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງເວລານີ້ຂອງຝ່າຍນີ້
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {reportData?.data.map((course) => {
                                        const attendees = course.attendee_list || [];
                                        const rowSpan = attendees.length > 0 ? attendees.length : 1;

                                        if (attendees.length === 0) {
                                            return (
                                                <TableRow key={course.no} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <TableCell className="text-center border-r font-medium sticky left-0 bg-white">{course.no}</TableCell>
                                                    <TableCell className="text-center border-r text-gray-400 sticky left-8 bg-white">-</TableCell>
                                                    <TableCell className="border-r text-gray-400 sticky left-28 bg-white">-</TableCell>
                                                    <TableCell className="border-r text-gray-400">-</TableCell>
                                                    <TableCell className="font-medium border-r">{course.course_title}</TableCell>
                                                    <TableCell className="text-center border-r text-blue-700">{course.attendees.technical.male || "-"}</TableCell>
                                                    <TableCell className="text-center border-r text-pink-500">{course.attendees.technical.female || "-"}</TableCell>
                                                    <TableCell className="text-center border-r font-medium">{course.attendees.technical.total || "-"}</TableCell>
                                                    <TableCell className="text-center border-r text-blue-700">{course.attendees.administrative.male || "-"}</TableCell>
                                                    <TableCell className="text-center border-r text-pink-500">{course.attendees.administrative.female || "-"}</TableCell>
                                                    <TableCell className="text-center border-r font-medium">{course.attendees.administrative.total || "-"}</TableCell>
                                                    <TableCell className="text-center border-r font-bold text-indigo-700">{course.attendees.total.total || "-"}</TableCell>
                                                    <TableCell className="text-center border-r">{format(new Date(course.duration.start_date), "dd/MM/yy")}</TableCell>
                                                    <TableCell className="text-center border-r">{format(new Date(course.duration.end_date), "dd/MM/yy")}</TableCell>
                                                    <TableCell className="text-center border-r">{course.duration.total_days}</TableCell>
                                                    <TableCell className="text-center border-r">{course.location.is_domestic ? "✓" : ""}</TableCell>
                                                    <TableCell className="text-center border-r">{course.location.is_international ? "✓" : ""}</TableCell>
                                                    <TableCell className="border-r truncate max-w-[120px]" title={course.institution}>{course.institution || "-"}</TableCell>
                                                    <TableCell className="text-center border-r">{course.format}</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            );
                                        }

                                        return attendees.map((emp, idx) => (
                                            <TableRow key={`${course.no}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                                                {idx === 0 && (
                                                    <TableCell rowSpan={rowSpan} className="text-center border-r font-medium align-top pt-2 sticky left-0 bg-white z-1">
                                                        {course.no}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center border-r font-medium text-indigo-600 sticky left-8 bg-white z-1">
                                                    {emp.employee_code}
                                                </TableCell>
                                                <TableCell className="border-r font-medium sticky left-28 bg-white z-1">
                                                    {emp.full_name}
                                                </TableCell>
                                                <TableCell className="border-r text-gray-600 text-[11px]">{emp.position}</TableCell>
                                                {idx === 0 && (
                                                    <>
                                                        <TableCell rowSpan={rowSpan} className="font-medium border-r align-top pt-2">{course.course_title}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r text-blue-700 align-top pt-2">{course.attendees.technical.male || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r text-pink-500 align-top pt-2">{course.attendees.technical.female || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r font-medium align-top pt-2">{course.attendees.technical.total || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r text-blue-700 align-top pt-2">{course.attendees.administrative.male || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r text-pink-500 align-top pt-2">{course.attendees.administrative.female || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r font-medium align-top pt-2">{course.attendees.administrative.total || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r font-bold text-indigo-700 align-top pt-2">{course.attendees.total.total || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{format(new Date(course.duration.start_date), "dd/MM/yy")}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{format(new Date(course.duration.end_date), "dd/MM/yy")}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{course.duration.total_days}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{course.location.is_domestic ? "✓" : ""}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{course.location.is_international ? "✓" : ""}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="border-r align-top pt-2 max-w-[120px] truncate" title={course.institution}>{course.institution || "-"}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="text-center border-r align-top pt-2">{course.format}</TableCell>
                                                        <TableCell rowSpan={rowSpan} className="align-top pt-2"></TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ));
                                    })}

                                    {/* Summary Row */}
                                    {reportData?.summary && (
                                        <TableRow className="bg-indigo-50 font-semibold border-t-2 border-indigo-200">
                                            <TableCell colSpan={5} className="text-right border-r text-indigo-900 pr-3 sticky left-0 bg-indigo-50">
                                                ລວມທັງໝົດ ({reportData.summary.total_courses} ຫຼັກສູດ)
                                            </TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{reportData.summary.total_technical_male}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{reportData.summary.total_technical_female}</TableCell>
                                            <TableCell className="text-center border-r">{reportData.summary.total_technical}</TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{reportData.summary.total_administrative_male}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{reportData.summary.total_administrative_female}</TableCell>
                                            <TableCell className="text-center border-r">{reportData.summary.total_administrative}</TableCell>
                                            <TableCell className="text-center border-r font-bold text-indigo-700 text-sm">{reportData.summary.total_attendees}</TableCell>
                                            <TableCell colSpan={2} className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_days}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_domestic}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_international}</TableCell>
                                            <TableCell className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700 font-normal text-[10px]">
                                                ON:{reportData.summary.total_online} / IN:{reportData.summary.total_onsite}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {reportData?.pagination && (
                    <ReportPagination
                        pagination={reportData.pagination}
                        onPageChange={(p) => setPage(Number(selectedDeptId), p)}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}