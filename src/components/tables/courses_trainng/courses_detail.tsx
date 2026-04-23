// src/components/tables/courses_trainng/courses_detail.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    DollarSign,
    Users,
    BookOpen,
    ExternalLink,
    Clock,
    LayoutDashboard,
    Plus,
    Trash2,
    FileText,
    Link as LinkIcon,
    Download,
    Loader2,
    Building2,
    GraduationCap,
    UserCheck,
    Edit,
    Info,
    CheckCircle2,
    Globe,
    History,
    UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useCourseStore } from "@/store/courseStore";
import { TrainingFormat, CourseStatus, LocationType } from "@/types/common";
import { AddParticipantModal } from "./add_participant_modal";
import api from "@/util/axios";
import { toast } from "sonner";

// Status configuration matching the table for consistency
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  [CourseStatus.ACTIVE]: { label: "ກຳລັງດຳເນີນ", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Clock },
  [CourseStatus.SCHEDULED]: { label: "ລໍຖ້າເປີດສອນ", className: "bg-sky-50 text-sky-700 border-sky-200", icon: Calendar },
  [CourseStatus.COMPLETED]: { label: "ສຳເລັດແລ້ວ", className: "bg-slate-100 text-slate-600 border-slate-200", icon: CheckCircle2 },
  [CourseStatus.CANCELLED]: { label: "ຍົກເລີກ", className: "bg-red-50 text-red-600 border-red-200", icon: Trash2 },
};

const getMaterialUrl = (material: { id: number; type: string; file_path_or_link: string }) => {
    if (material.type === "URL") {
        return material.file_path_or_link;
    }
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    return `${baseURL}/training/materials/${material.id}/download`;
};

export default function CourseDetail() {
    const params = useParams();
    const router = useRouter();
    const courseId = Number(params?.id);

    const { selectedCourse, fetchCourseById, isLoading } = useCourseStore();
    const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);

    const [deletingMaterialId, setDeletingMaterialId] = useState<number | null>(null);
    const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
    const [isLoadingPreviewId, setIsLoadingPreviewId] = useState<number | null>(null);

    const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<number | null>(null);
    const [isDeletingEnrollment, setIsDeletingEnrollment] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourseById(courseId);
        }
    }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleParticipantAdded = () => {
        if (courseId) fetchCourseById(courseId);
    };

    const handleDeleteMaterial = async () => {
        if (!deletingMaterialId || !courseId) return;
        setIsDeletingMaterial(true);
        try {
            await api.delete(`/training/courses/${courseId}/materials/${deletingMaterialId}`);
            toast.success("ລົບເອກະສານສຳເລັດແລ້ວ");
            fetchCourseById(courseId);
        } catch {
            toast.error("ບໍ່ສາມາດລົບເອກະສານໄດ້");
        } finally {
            setIsDeletingMaterial(false);
            setDeletingMaterialId(null);
        }
    };

    const handleDeleteEnrollment = async () => {
        if (!deletingEnrollmentId) return;
        setIsDeletingEnrollment(true);
        try {
            await api.delete(`/enrollments/${deletingEnrollmentId}`);
            toast.success("ນຳຜູ້ເຂົ້າຮ່ວມອອກສຳເລັດ");
            fetchCourseById(courseId);
        } catch {
            toast.error("ບໍ່ສາມາດລົບໄດ້");
        } finally {
            setIsDeletingEnrollment(false);
            setDeletingEnrollmentId(null);
        }
    };

    const downloadMaterial = async (material: any) => {
        if (material.type === "URL") {
            window.open(material.file_path_or_link, "_blank");
            return;
        }

        try {
            setIsLoadingPreviewId(material.id);
            const token = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : '';
            const downloadUrl = getMaterialUrl(material);

            const response = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Network error: ${response.statusText}`);

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;

            const disposition = response.headers.get("content-disposition");
            let filename = downloadUrl.split('/').pop()?.split('?')[0] || "document";
            if (disposition && disposition.indexOf("filename=") !== -1) {
                const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
                if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
            }
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("ບໍ່ສາມາດດາວໂຫຼດເອກະສານໄດ້");
        } finally {
            setIsLoadingPreviewId(null);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("la-LA", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading || !selectedCourse) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">ກຳລັງໂຫລດຂໍ້ມູນລາຍລະອຽດ...</p>
            </div>
        );
    }

    const course = selectedCourse;
    const statusCfg = STATUS_CONFIG[course.status] || { label: course.status, className: "bg-gray-50 text-gray-600 border-gray-200", icon: Info };
    const StatusIcon = statusCfg.icon;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-gray-100 shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                {course.title}
                            </h1>
                            <Badge variant="outline" className={`h-6 px-2.5 font-medium ${statusCfg.className} flex items-center gap-1.5`}>
                                <StatusIcon size={12} />
                                {statusCfg.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 font-medium">
                                <LayoutDashboard size={14} className="text-blue-500" />
                                {course.category?.name || "ທົ່ວໄປ"}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="flex items-center gap-1.5">
                                <Users size={14} />
                                {course.enrollments?.length || 0} ຜູ້ເຂົ້າຮ່ວມ
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content (Left) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Information Overview */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                <Info className="w-5 h-5 text-blue-600" />
                                ລາຍລະອຽດ & ເນື້ອໃນຫຼັກສູດ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-[15px] bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                {course.description || "ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ"}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-emerald-100 transition-colors group">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                            <Calendar className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">ໄລຍະເວລາ</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-emerald-100 transition-colors group">
                                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                                            <DollarSign className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">ງົບປະມານການຝຶກ</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {course.budget ? Number(course.budget).toLocaleString() : "0"} KIP
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-emerald-100 transition-colors group">
                                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                                            <MapPin className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                                ສະຖານທີ່ ({course.format})
                                            </p>
                                            <div className="text-sm font-bold text-gray-900 truncate">
                                                {course.format === TrainingFormat.ONLINE ? (
                                                    <a href={course.location || "#"} target="_blank" rel="noreferrer" 
                                                       className="text-blue-600 hover:underline flex items-center gap-1">
                                                        {course.location || "ບໍ່ລະບຸລິ້ງ"} <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span>{course.location_type === LocationType.DOMESTIC ? course.location : (course.country || "ຕ່າງປະເທດ")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:border-emerald-100 transition-colors group">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                            <UserCheck className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">ວິທະຍາກອນ</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {course.trainer || "ບໍ່ລະບຸວິທະຍາກອນ"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="bg-gray-100" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <GraduationCap className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">ສະຖາບັນຝຶກອົບຮົມ</p>
                                        <p className="text-sm font-semibold text-gray-700">{course.institution || "—"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <Building2 className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">ໜ່ວຍງານ / ອົງການຈັດຝຶກ</p>
                                        <p className="text-sm font-semibold text-gray-700">{course.organization || "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participants Table */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-gray-100">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    ລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ
                                </CardTitle>
                                <CardDescription>ລວມທັງໝົດ {course.enrollments?.length || 0} ລາຍຊື່</CardDescription>
                            </div>
                            <Button
                                onClick={() => setIsAddParticipantModalOpen(true)}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                ຈັດການຜູ້ເຂົ້າຮ່ວມ
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow>
                                        <TableHead className="w-16 text-center font-bold text-[11px] uppercase tracking-wider text-gray-500">ລຳດັບ</TableHead>
                                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">ລະຫັດພະນັກງານ</TableHead>
                                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">ຊື່ ແລະ ນາມສະກຸນ</TableHead>
                                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-gray-500">ສະຖານະ</TableHead>
                                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-gray-500 pr-6">ວັນທີລົງທະບຽນ</TableHead>
                                        <TableHead className="w-16"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.enrollments && course.enrollments.length > 0 ? (
                                        course.enrollments.map((enrollment, index) => (
                                            <TableRow key={enrollment.id} className="hover:bg-emerald-50/30 transition-colors group">
                                                <TableCell className="text-center text-gray-400 font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-bold text-gray-700">
                                                  <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100">{enrollment.employee?.employee_code}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">
                                                    {enrollment.employee?.first_name_la} {enrollment.employee?.last_name_la}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-medium text-[10px]">
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 text-gray-500 font-medium text-sm">
                                                    {formatDate(enrollment.enrolled_at)}
                                                </TableCell>
                                                <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                                            onClick={() => setDeletingEnrollmentId(enrollment.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                                    <Users size={32} className="opacity-20" />
                                                    <p className="text-sm font-medium">ຍັງບໍ່ມີຜູ້ເຂົ້າຮ່ວມໃນຫຼັກສູດນີ້</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (Right) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Materials Sidebar */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-gray-100">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                ເອກະສານ & ສື່ການສອນ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {course.materials && course.materials.length > 0 ? (
                                <div className="space-y-3">
                                    {course.materials.map((material, idx) => {
                                        const isUrl = material.type === "URL";
                                        return (
                                            <div key={material.id} className="flex flex-col p-3 rounded-xl border border-gray-100 bg-white shadow-xs hover:border-blue-200 transition-all group">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`p-2 rounded-lg ${isUrl ? "bg-blue-50" : "bg-orange-50"} shrink-0`}>
                                                        {isUrl ? <LinkIcon size={16} className="text-blue-600" /> : <FileText size={16} className="text-orange-600" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-800 truncate mb-0.5">
                                                          {isUrl ? "ລິ້ງຂໍ້ມູນ / URL" : `ເອກະສານປະກອບທີ ${idx + 1}`}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate font-mono">
                                                          {material.file_path_or_link.split('/').pop()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-auto">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 rounded-md"
                                                      onClick={() => downloadMaterial(material)}
                                                      disabled={isLoadingPreviewId === material.id}
                                                    >
                                                      {isLoadingPreviewId === material.id ? (
                                                        <Loader2 size={12} className="animate-spin mr-1.5" />
                                                      ) : (
                                                        isUrl ? <ExternalLink size={12} className="mr-1.5" /> : <Download size={12} className="mr-1.5" />
                                                      )}
                                                      {isUrl ? "ເປີດລິ້ງ" : "ດາວໂຫຼດ"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                        onClick={() => setDeletingMaterialId(material.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <BookOpen size={24} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-xs font-medium text-slate-400">ຍັງບໍ່ມີເອກະສານປະກອບ</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meta Data Sidebar */}
                    <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                      <CardHeader className="bg-slate-50/50 pb-3 border-b border-gray-100">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          ຂໍ້ມູນລະບົບ
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <History size={14} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ສ້າງເມື່ອ</p>
                            <p className="text-xs font-bold text-slate-700">{formatDate(course.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Clock size={14} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ອັບເດດລ່າສຸດ</p>
                            <p className="text-xs font-bold text-slate-700">{formatDate(course.updated_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Globe size={14} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ຮູບແບບການຮຽນ</p>
                            <p className="text-xs font-bold text-slate-700">{course.format}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals & Dialogs */}
            <AddParticipantModal
                courseId={courseId}
                courseTitle={course.title}
                isOpen={isAddParticipantModalOpen}
                onClose={() => setIsAddParticipantModalOpen(false)}
                onParticipantAdded={handleParticipantAdded}
            />

            <AlertDialog open={deletingMaterialId !== null} onOpenChange={(v) => !v && setDeletingMaterialId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>ຢືນຢັນການລົບເອກະສານ</AlertDialogTitle>
                        <AlertDialogDescription>
                            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບເອກະສານນີ້? ຂໍ້ມູນຈະບໍ່ສາມາດກູ້ຄືນໄດ້.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingMaterial} className="rounded-xl">ຍົກເລີກ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMaterial} disabled={isDeletingMaterial}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                            {isDeletingMaterial ? "ກຳລັງລົບ..." : "ຢືນຢັນລົບ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deletingEnrollmentId !== null} onOpenChange={(v) => !v && setDeletingEnrollmentId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>ນຳຜູ້ເຂົ້າຮ່ວມອອກ</AlertDialogTitle>
                        <AlertDialogDescription>
                            ທ່ານຕ້ອງການນຳພະນັກງານຄົນນີ້ອອກຈາກຫຼັກສູດນີ້ແທ້ບໍ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingEnrollment} className="rounded-xl">ຍົກເລີກ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEnrollment} disabled={isDeletingEnrollment}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                            {isDeletingEnrollment ? "ກຳລັງລົບ..." : "ນຳອອກ"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
