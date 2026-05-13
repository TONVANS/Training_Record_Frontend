"use client";
import { useEffect, useState } from "react";
import { useEmployeeStore } from "@/store/useEmployeeStore";
import { Phone, Mail, Building, Briefcase, LogOut, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth/authStore";
import { toast } from "sonner";
import { LoadingState } from "@/components/client/LoadingState";
import { ProfileHero } from "@/components/client/profile/ProfileHero";
import { ProfileInfoCard } from "@/components/client/profile/ProfileInfoCard";
import { ChangePasswordDialog } from "@/components/client/profile/ChangePasswordDialog";

export default function ProfilePage() {
  const { profile, isLoading, fetchProfile } = useEmployeeStore();
  const { logout, changePassword } = useAuthStore();
  const router = useRouter();

  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }

    setIsSubmittingPwd(true);
    try {
      const result = await changePassword(oldPassword, newPassword);
      toast.success(result?.message || "ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!");

      setIsChangePwdOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ");
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  if (isLoading && !profile) {
    return <LoadingState message="ກຳລັງໂຫຼດຂໍ້ມູນໂປຣໄຟລ໌..." />;
  }

  if (!profile) return null;

  const contactItems = [
    { icon: Mail, value: profile.email || "ບໍ່ມີອີເມວ", label: "ອີເມວ (Email)" },
    { icon: Phone, value: profile.phone || "ບໍ່ມີເບີໂທລະສັບ", label: "ເບີໂທ (Phone)" },
  ];

  const orgItems = [
    { icon: Building, label: "ກົມ (Department)", value: profile.department?.name },
    { icon: Building, label: "ພະແນກ (Division)", value: profile.division?.name },
    { icon: Building, label: "ໜ່ວຍງານ (Unit)", value: profile.unit?.name },
    { icon: Briefcase, label: "ຕຳແໜ່ງ (Position)", value: profile.position?.name },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-500">

      {/* ── Hero Card ── */}
      <ProfileHero profile={profile} />

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <ProfileInfoCard 
          title="ຂໍ້ມູນຕິດຕໍ່" 
          icon={Phone} 
          iconColorClass="text-sky-500" 
          bgColorClass="bg-sky-50" 
          items={contactItems} 
        />
        <ProfileInfoCard 
          title="ຂໍ້ມູນອົງກອນ" 
          icon={Building} 
          iconColorClass="text-emerald-500" 
          bgColorClass="bg-emerald-50" 
          items={orgItems} 
        />
      </div>

      {/* ── Action Buttons ── */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => setIsChangePwdOpen(true)}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700 font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-sm group"
        >
          <Lock size={18} className="group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
          ປ່ຽນລະຫັດຜ່ານ
        </button>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-white border-2 border-red-100 hover:border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-extrabold text-sm py-4 px-6 rounded-2xl transition-all shadow-sm group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          ອອກຈາກລະບົບ
        </button>
      </div>

      <ChangePasswordDialog 
        isOpen={isChangePwdOpen}
        onOpenChange={setIsChangePwdOpen}
        onSubmit={handleChangePassword}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        isSubmitting={isSubmittingPwd}
      />
    </div>
  );
}