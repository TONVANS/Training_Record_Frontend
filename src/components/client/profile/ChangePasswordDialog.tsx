"use client";

import React from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isSubmitting: boolean;
}

export const ChangePasswordDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isSubmitting,
}: ChangePasswordDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl md:rounded-[2rem] p-5 sm:p-6 overflow-hidden border-0 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">

        <DialogHeader className="flex flex-col items-center text-center pb-0">
          <div className="w-12 h-12 bg-blue-50/80 border border-blue-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
            <KeyRound className="text-[#1275e2]" size={24} strokeWidth={2} />
          </div>
          <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight">
            ປ່ຽນລະຫັດຜ່ານ
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 font-medium">
            ປ້ອນລະຫັດຜ່ານເກົ່າ ແລະ ກຳນົດລະຫັດຜ່ານໃໝ່ລຸ່ມນີ້
          </DialogDescription>
        </DialogHeader>

        <form id="change-pwd-form" onSubmit={onSubmit} className="grid gap-2 py-2">
          <div className="space-y-1.5 text-left px-1">
            <Label htmlFor="old_password" className="text-xs font-bold text-gray-700 ml-1">
              ລະຫັດຜ່ານເກົ່າ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="old_password"
              type="password"
              placeholder="ປ້ອນລະຫັດຜ່ານປັດຈຸບັນ"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="h-10 rounded-xl border-gray-200 bg-gray-50/50 focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400 transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="relative flex items-center py-1.5">
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
            <div className="flex-shrink-0 mx-3 text-[10px] font-extrabold text-[#1275e2] uppercase tracking-wider bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-full">
              ຕັ້ງລະຫັດຜ່ານໃໝ່
            </div>
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
          </div>

          <div className="bg-[#1275e2]/[0.03] p-3 rounded-xl border border-[#1275e2]/10 space-y-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="new_password" className="text-xs font-bold text-[#0a468c] ml-1">
                ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new_password"
                type="password"
                placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-10 rounded-xl border-[#1275e2]/20 bg-white focus-visible:border-[#1275e2] focus-visible:ring-1 focus-visible:ring-[#1275e2] transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="confirm_password" className="text-xs font-bold text-[#0a468c] ml-1">
                ຢືນຢັນລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-10 rounded-xl border-[#1275e2]/20 bg-white focus-visible:border-[#1275e2] focus-visible:ring-1 focus-visible:ring-[#1275e2] transition-all px-3 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-2 pt-3 border-t border-gray-50">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 h-10 bg-white border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700 font-extrabold text-sm rounded-xl transition-all shadow-sm"
          >
            ຍົກເລີກ
          </Button>
          <Button
            type="submit"
            form="change-pwd-form"
            disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
            className="w-full sm:w-1/2 h-10 bg-[#1275e2] border-2 border-[#1275e2] hover:border-[#0f62c0] hover:bg-[#0f62c0] text-white font-extrabold text-sm rounded-xl transition-all shadow-sm relative overflow-hidden"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            <span>ບັນທຶກລະຫັດຜ່ານ</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
