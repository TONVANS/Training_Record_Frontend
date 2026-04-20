// src/app/(site)/sync_data/page.tsx
import SyncDataPanel from "@/components/sync/SyncDataPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sync ຂໍ້ມູນ HRM | Lao Training Management System",
  description: "ລະບົບ Sync ຂໍ້ມູນພະນັກງານ ແລະ ໂຄງສ້າງອົງກອນຈາກ HRM API",
};

export default function SyncDataPage() {
  return (
    <div className='animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out'>
      <SyncDataPanel />
    </div>
  );
}
