"use client";
import { usePathname } from "next/navigation";
import { Home, Library, BookOpen, User } from "lucide-react";
import React from "react";
import { DesktopNavbar } from "@/components/client/layout/DesktopNavbar";
import { MobileNavbar } from "@/components/client/layout/MobileNavbar";
import { DesktopFooter } from "@/components/client/layout/DesktopFooter";
import { MobileBottomTabBar } from "@/components/client/layout/MobileBottomTabBar";

export default function ClientSiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "ໜ້າຫຼັກ", href: "/employee_dashboard", icon: Home },
    { label: "ຫຼັກສູດ", href: "/catalog", icon: Library },
    { label: "ການຮຽນຂອງຂ້ອຍ", href: "/my-learning", icon: BookOpen },
    { label: "ໂປຣໄຟລ໌", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── Desktop Top Navbar ── */}
      <DesktopNavbar navItems={navItems} pathname={pathname} />

      {/* ── Mobile Top Navbar ── */}
      <MobileNavbar />

      {/* ── Main Content ── */}
      <main className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-28 md:pt-24 md:pb-12 grow flex flex-col">
        {children}
      </main>

      {/* ── Desktop Footer ── */}
      <DesktopFooter />

      {/* ── Mobile Bottom Tab Bar (Floating Design) ── */}
      <MobileBottomTabBar navItems={navItems} pathname={pathname} />

    </div>
  );
}