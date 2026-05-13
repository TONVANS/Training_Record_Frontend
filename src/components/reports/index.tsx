// src/components/reports/index.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { FileText, Printer, Eye, Loader2, Filter, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useReportStore } from "@/store/report/reportStore";
import { ReportPeriodType } from "@/types/report";
import { format } from "date-fns";
import {
    generatePreviewHtmlUrl,
    downloadReportPDF,
    formatCurrency,
    fetchAllReportPagesForPDF,
} from "@/util/pdfReport";
import { toast } from "sonner";
import { ReportPagination } from "@/components/ui/ReportPagination";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function TrainingReport() {
    const {
        reportData,
        isLoading,
        currentPage,
        fetchReport,
        setPage,
    } = useReportStore();

    const [isDownloading, setIsDownloading] = useState(false);
    const currentYear = new Date().getFullYear();
    const [filterYear, setFilterYear] = useState<number>(currentYear);
    const [filterType, setFilterType] = useState<ReportPeriodType>("MONTHLY");
    const [filterValue, setFilterValue] = useState<number>(new Date().getMonth() + 1);

    // State ສຳລັບຄວບຄຸມການເປີດ/ປິດ Popover ປີ
    const [isYearPopoverOpen, setIsYearPopoverOpen] = useState(false);

    // 💡 Generate Years Array
    const yearGridOptions = useMemo(() => {
        const startYear = 2000;
        const endYear = currentYear + 2;
        const totalYears = endYear - startYear + 1;
        return Array.from({ length: totalYears }, (_, i) => endYear - i);
    }, [currentYear]);

    // ເມື່ອ filter ປ່ຽນ → reset ໄປໜ້າ 1
    useEffect(() => {
        const valueToSend = filterType === "YEARLY" ? undefined : filterValue;
        fetchReport(filterYear, filterType, valueToSend, 1);
    }, [filterYear, filterType, filterValue, fetchReport]);

    // ອັບເດດໃຫ້ຮັບຄ່າ String ຈາກ shadcn Select
    const handleTypeChange = (value: string) => {
        const newType = value as ReportPeriodType;
        setFilterType(newType);
        if (newType !== "YEARLY") setFilterValue(1);
    };

    // Preview/PDF
    const handlePreview = async () => {
        if (!reportData) return;
        toast.info("ກຳລັງກຽມຂໍ້ມູນສຳລັບສະແດງຕົວຢ່າງ (ອາດໃຊ້ເວລາໜ້ອຍໜຶ່ງ)...");
        try {
            const allData = await fetchAllReportPagesForPDF(reportData.report_info, 100);
            const url = generatePreviewHtmlUrl(allData);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch {
            toast.error("ເກີດຂໍ້ຜິດພາດໃນການກຽມຂໍ້ມູນ");
        }
    };

    const handleDownloadPdf = async () => {
        if (!reportData) return;
        setIsDownloading(true);
        toast.info("ກຳລັງດຶງຂໍ້ມູນທັງໝົດເພື່ອສ້າງ PDF...");
        try {
            const allData = await fetchAllReportPagesForPDF(reportData.report_info, 100);
            await downloadReportPDF(allData);
            toast.success("Print PDF ສຳເລັດແລ້ວ!");
        } catch {
            toast.error("ເກີດຂໍ້ຜິດພາດໃນການສ້າງ PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrevYear = () => setFilterYear(prev => prev - 1);
    const handleNextYear = () => setFilterYear(prev => prev + 1);

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header & Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-background p-4 rounded-xl border shadow-sm">
                
                {/* 1. Title Area */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            ລາຍງານການຝຶກອົບຮົມ
                        </h2>
                        <p className="text-sm text-muted-foreground">Training Summary Report</p>
                    </div>
                </div>

                {/* 2. Controls Area (Filters + Actions) */}
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* --- Filter Group --- */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* ປະເພດລາຍງານ */}
                        <div className="flex items-center">
                            <Select value={filterType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-[150px] bg-background">
                                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="ເລືອກປະເພດ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">ປະຈຳເດືອນ</SelectItem>
                                    <SelectItem value="QUARTERLY">ປະຈຳໄຕມາດ</SelectItem>
                                    <SelectItem value="HALF_YEARLY">ປະຈຳ 6 ເດືອນ</SelectItem>
                                    <SelectItem value="YEARLY">ປະຈຳປີ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ຊ່ວງເວລາ (ເດືອນ, ໄຕມາດ, 6ເດືອນ) */}
                        {filterType !== "YEARLY" && (
                            <Select 
                                value={filterValue.toString()} 
                                onValueChange={(val) => setFilterValue(Number(val))}
                            >
                                <SelectTrigger className="w-[160px] bg-background">
                                    <SelectValue placeholder="ເລືອກຊ່ວງເວລາ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterType === "MONTHLY" && 
                                        Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>ເດືອນ {i + 1}</SelectItem>
                                        ))
                                    }
                                    {filterType === "QUARTERLY" && 
                                        Array.from({ length: 4 }, (_, i) => (
                                            <SelectItem key={i + 1} value={(i + 1).toString()}>ໄຕມາດ {i + 1}</SelectItem>
                                        ))
                                    }
                                    {filterType === "HALF_YEARLY" && [
                                        <SelectItem key={1} value="1">6 ເດືອນຕົ້ນປີ (1-6)</SelectItem>,
                                        <SelectItem key={2} value="2">6 ເດືອນທ້າຍປີ (7-12)</SelectItem>
                                    ]}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Year Stepper (Shadcn Style) */}
                        <div className="flex items-center border rounded-md bg-background shadow-sm h-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevYear}
                                className="h-full w-9 rounded-r-none border-r text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50"
                                title="ປີກ່ອນໜ້າ"
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <Popover open={isYearPopoverOpen} onOpenChange={setIsYearPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="h-full rounded-none px-3 font-semibold text-foreground hover:text-indigo-600 hover:bg-indigo-50 min-w-[80px]"
                                    >
                                        <CalendarDays size={14} className="mr-2 text-muted-foreground" />
                                        {filterYear}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3" align="end">
                                    <div className="mb-3 font-medium text-sm text-foreground">ເລືອກປີຄ.ສ.</div>
                                    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                                        {yearGridOptions.map((year) => (
                                            <button
                                                key={year}
                                                onClick={() => {
                                                    setFilterYear(year);
                                                    setIsYearPopoverOpen(false);
                                                }}
                                                className={`py-1.5 text-sm rounded-md transition-colors ${
                                                    filterYear === year
                                                        ? 'bg-indigo-600 text-white font-medium'
                                                        : 'hover:bg-indigo-50 text-foreground'
                                                }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextYear}
                                className="h-full w-9 rounded-l-none border-l text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50"
                                title="ປີຖັດໄປ"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Divider (ສະແດງສະເພາະຈໍໃຫຍ່) */}
                    <div className="hidden md:block w-px h-8 bg-border mx-1" />

                    {/* --- Action Group --- */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            onClick={handlePreview}
                            disabled={!reportData || reportData.data.length === 0}
                            variant="outline"
                            className="flex-1 md:flex-none gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                        >
                            <Eye size={18} />
                            <span>ເບິ່ງຕົວຢ່າງ</span>
                        </Button>
                        <Button
                            onClick={handleDownloadPdf}
                            disabled={!reportData || reportData.data.length === 0 || isDownloading}
                            className="flex-1 md:flex-none gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer size={18} />}
                            <span>Print PDF</span>
                        </Button>
                    </div>

                </div>
            </div>

            {/* Table Section */}
            <div className="bg-background rounded-xl border shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <Table className="min-w-[1200px]">
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-b text-xs">
                                <TableHead rowSpan={3} className="text-center w-10 border-r align-middle text-foreground">ລ/ດ</TableHead>
                                <TableHead rowSpan={3} className="border-r w-44 align-middle text-foreground">ຫົວຂໍ້ຝຶກອົບຮົມ</TableHead>
                                <TableHead colSpan={7} className="text-center border-r text-foreground">ຈຳນວນຜູ້ເຂົ້າຝຶກ</TableHead>
                                <TableHead colSpan={2} className="text-center border-r text-foreground">ໄລຍະເວລາ</TableHead>
                                <TableHead rowSpan={3} className="text-center border-r w-12 align-middle text-foreground">ມື້</TableHead>
                                <TableHead colSpan={2} className="text-center border-r text-foreground">ສະຖານທີ່</TableHead>
                                <TableHead rowSpan={3} className="border-r w-28 align-middle text-foreground">ສະຖາບັນ/ອົງກອນ</TableHead>
                                <TableHead rowSpan={3} className="text-center border-r w-16 align-middle text-foreground">ຮູບແບບ</TableHead>
                                <TableHead rowSpan={3} className="text-right border-r w-24 align-middle text-foreground">ງົບປະມານ<br />(ກີບ)</TableHead>
                                <TableHead rowSpan={3} className="border-r w-14 align-middle text-foreground">ໝາຍເຫດ</TableHead>
                            </TableRow>
                            <TableRow className="border-b text-xs bg-muted/30">
                                <TableHead colSpan={3} className="text-center border-r font-normal text-blue-700">ເຕັກນິກ</TableHead>
                                <TableHead colSpan={3} className="text-center border-r font-normal text-green-700">ບໍລິຫານ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-semibold w-12 align-middle text-foreground">ລວມ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-24 align-middle text-foreground">ມື້ເລີ່ມ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-24 align-middle text-foreground">ມື້ສິ້ນສຸດ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-12 align-middle text-foreground">ໃນ</TableHead>
                                <TableHead rowSpan={2} className="text-center border-r font-normal w-12 align-middle text-foreground">ນອກ</TableHead>
                            </TableRow>
                            <TableRow className="border-b text-[10px] bg-muted/20">
                                <TableHead className="text-center border-r font-normal w-10 text-blue-600">ຊາຍ</TableHead>
                                <TableHead className="text-center border-r font-normal w-10 text-pink-500">ຍິງ</TableHead>
                                <TableHead className="text-center border-r font-normal w-10 text-foreground">ລວມ</TableHead>
                                <TableHead className="text-center border-r font-normal w-10 text-blue-600">ຊາຍ</TableHead>
                                <TableHead className="text-center border-r font-normal w-10 text-pink-500">ຍິງ</TableHead>
                                <TableHead className="text-center border-r font-normal w-10 text-foreground">ລວມ</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={18} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                                        <p className="text-muted-foreground">ກຳລັງໂຫຼດຂໍ້ມູນລາຍງານ...</p>
                                    </TableCell>
                                </TableRow>
                            ) : reportData?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={18} className="h-32 text-center text-muted-foreground">
                                        ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງເວລານີ້
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {reportData?.data.map((row) => (
                                        <TableRow key={row.no} className="border-b hover:bg-muted/50 text-xs">
                                            <TableCell className="text-center border-r">{row.no}</TableCell>
                                            <TableCell className="font-medium border-r truncate max-w-[180px]" title={row.course_title}>
                                                {row.course_title}
                                            </TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{row.attendees.technical.male || "-"}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{row.attendees.technical.female || "-"}</TableCell>
                                            <TableCell className="text-center border-r font-medium">{row.attendees.technical.total || "-"}</TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{row.attendees.administrative.male || "-"}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{row.attendees.administrative.female || "-"}</TableCell>
                                            <TableCell className="text-center border-r font-medium">{row.attendees.administrative.total || "-"}</TableCell>
                                            <TableCell className="text-center border-r font-bold text-indigo-700">{row.attendees.total.total || "-"}</TableCell>
                                            <TableCell className="text-center border-r">{format(new Date(row.duration.start_date), "dd/MM")}</TableCell>
                                            <TableCell className="text-center border-r">{format(new Date(row.duration.end_date), "dd/MM")}</TableCell>
                                            <TableCell className="text-center border-r">{row.duration.total_days}</TableCell>
                                            <TableCell className="text-center border-r">{row.location.is_domestic ? "✓" : ""}</TableCell>
                                            <TableCell className="text-center border-r">{row.location.is_international ? "✓" : ""}</TableCell>
                                            <TableCell className="border-r truncate max-w-[110px]" title={row.institution}>{row.institution}</TableCell>
                                            <TableCell className="text-center border-r">{row.format}</TableCell>
                                            <TableCell className="text-right border-r font-medium text-foreground">{formatCurrency(row.budget)}</TableCell>
                                            <TableCell className="border-r" />
                                        </TableRow>
                                    ))}

                                    {/* Summary */}
                                    {reportData?.summary && (
                                        <TableRow className="bg-indigo-50/50 font-semibold border-t-2 border-indigo-200 text-xs">
                                            <TableCell colSpan={2} className="text-right border-r text-indigo-900 pr-2">
                                                ລວມທັງໝົດ ({reportData.summary.total_courses} ຫຼັກສູດ)
                                            </TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{reportData.summary.total_technical_male}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{reportData.summary.total_technical_female}</TableCell>
                                            <TableCell className="text-center border-r">{reportData.summary.total_technical}</TableCell>
                                            <TableCell className="text-center border-r text-blue-700">{reportData.summary.total_administrative_male}</TableCell>
                                            <TableCell className="text-center border-r text-pink-500">{reportData.summary.total_administrative_female}</TableCell>
                                            <TableCell className="text-center border-r">{reportData.summary.total_administrative}</TableCell>
                                            <TableCell className="text-center border-r font-bold text-indigo-700">{reportData.summary.total_attendees}</TableCell>
                                            <TableCell colSpan={2} className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_days}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_domestic}</TableCell>
                                            <TableCell className="text-center border-r text-indigo-700">{reportData.summary.total_international}</TableCell>
                                            <TableCell className="border-r" />
                                            <TableCell className="text-center border-r text-indigo-700 font-normal text-[10px]">
                                                ON:{reportData.summary.total_online} / IN:{reportData.summary.total_onsite}
                                            </TableCell>
                                            <TableCell className="text-right border-r text-indigo-900">{formatCurrency(reportData.summary.total_budget)}</TableCell>
                                            <TableCell className="border-r" />
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {reportData?.pagination && (
                    <ReportPagination
                        pagination={reportData.pagination}
                        onPageChange={(p) => setPage(p)}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}