"use client";
import { useEffect, useMemo } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import { LoadingState } from "@/components/client/LoadingState";
import { WelcomeBanner } from "@/components/client/dashboard/WelcomeBanner";
import { StatCard } from "@/components/client/dashboard/StatCard";
import { RecentActivity } from "@/components/client/dashboard/RecentActivity";

export default function DashboardPage() {
  const { profile, enrollments, isLoading, fetchProfile, fetchMyEnrollments } = useEmployeeStore();

  useEffect(() => {
    fetchProfile();
    fetchMyEnrollments();
  }, [fetchProfile, fetchMyEnrollments]);

  const stats = useMemo(() => {
    const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;
    const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
    return { inProgress, completed, total: enrollments.length };
  }, [enrollments]);

  if (isLoading) {
    return <LoadingState message="ກຳລັງໂຫຼດຂໍ້ມູນ..." />;
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    IN_PROGRESS: { label: "ກຳລັງຮຽນ", color: "text-amber-700", bg: "bg-amber-50" },
    COMPLETED: { label: "ສຳເລັດແລ້ວ", color: "text-emerald-700", bg: "bg-emerald-50" },
    ENROLLED: { label: "ລົງທະບຽນແລ້ວ", color: "text-blue-700", bg: "bg-blue-50" },
  };

  const statItems = [
    { icon: Clock, label: "ກຳລັງດຳເນີນການ", value: stats.inProgress, accent: "text-amber-500", bg: "from-amber-50 to-orange-50/50", iconBg: "bg-amber-100/50" },
    { icon: CheckCircle, label: "ຮຽນສຳເລັດແລ້ວ", value: stats.completed, accent: "text-emerald-500", bg: "from-emerald-50 to-green-50/50", iconBg: "bg-emerald-100/50" },
    { icon: BookOpen, label: "ລົງທະບຽນທັງໝົດ", value: stats.total, accent: "text-blue-500", bg: "from-blue-50 to-indigo-50/50", iconBg: "bg-blue-100/50" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

      {/* ── Luxury Welcome Banner ── */}
      <WelcomeBanner 
        firstName={profile?.first_name_la} 
        lastName={profile?.last_name_la} 
      />

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {statItems.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity enrollments={enrollments} statusConfig={statusConfig} />
    </div>
  );
}