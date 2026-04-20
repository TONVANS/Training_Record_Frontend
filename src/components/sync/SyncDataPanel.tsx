// src/components/sync/SyncDataPanel.tsx
"use client";

import React, { useCallback } from "react";
import {
  RefreshCw,
  Building2,
  GitBranch,
  Layers,
  Users,
  Briefcase,
  Hash,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowDownToLine,
  Zap,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  useSyncStore,
  SYNC_ENTITY_LABELS,
  type SyncEntityKey,
} from "@/store/syncStore";
import { cn } from "@/lib/utils";

// ── Icon Mapping ──────────────────────────────────────
const ENTITY_ICONS: Record<SyncEntityKey, React.ReactNode> = {
  departments: <Building2 size={22} />,
  divisions: <GitBranch size={22} />,
  units: <Layers size={22} />,
  positionGroups: <Shield size={22} />,
  positionCodes: <Hash size={22} />,
  positions: <Briefcase size={22} />,
  employeesAll: <Users size={22} />,
};

const ENTITY_GRADIENTS: Record<SyncEntityKey, string> = {
  departments: "from-blue-500 to-blue-600",
  divisions: "from-indigo-500 to-indigo-600",
  units: "from-violet-500 to-violet-600",
  positionGroups: "from-cyan-500 to-cyan-600",
  positionCodes: "from-teal-500 to-teal-600",
  positions: "from-emerald-500 to-emerald-600",
  employeesAll: "from-amber-500 to-orange-500",
};

const ENTITY_DESCRIPTIONS: Record<SyncEntityKey, string> = {
  departments: "ດຶງຂໍ້ມູນຝ່າຍຈາກລະບົບ HRM",
  divisions: "ດຶງຂໍ້ມູນພະແນກຈາກ HRM",
  units: "ດຶງຂໍ້ມູນໜ່ວຍງານຈາກ HRM",
  positionGroups: "ດຶງຂໍ້ມູນກຸ່ມຕຳແໜ່ງຈາກ HRM",
  positionCodes: "ດຶງຂໍ້ມູນລະຫັດຕຳແໜ່ງຈາກ HRM",
  positions: "ດຶງຂໍ້ມູນຕຳແໜ່ງຈາກ HRM",
  employeesAll: "ດຶງຂໍ້ມູນພະນັກງານທຸກຝ່າຍ",
};

// ── Progress color by value ───────────────────────────
function progressColor(pct: number) {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-blue-400";
}

// ── Single Sync Card ──────────────────────────────────
function SyncCard({ entityKey }: { entityKey: SyncEntityKey }) {
  const { entities, syncEntity } = useSyncStore();
  const state = entities[entityKey];

  const handleSync = useCallback(() => {
    if (entityKey === "employeesAll") {
      useSyncStore.getState().syncAllEmployees();
    } else {
      syncEntity(entityKey);
    }
  }, [entityKey, syncEntity]);

  const formatTime = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleTimeString("lo-LA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const isLoading = state.isLoading;
  const pct = state.progress ?? 0;

  return (
    <div
      id={`sync-card-${entityKey}`}
      className={cn(
        "group relative bg-white rounded-2xl border shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200",
        state.error && "border-red-200 bg-red-50/30"
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "h-1 w-full bg-linear-to-r transition-all duration-500",
          isLoading
            ? "from-blue-400 via-purple-400 to-blue-400 animate-[shimmer_2s_ease-in-out_infinite]"
            : state.result
              ? "from-emerald-400 to-emerald-500"
              : state.error
                ? "from-red-400 to-red-500"
                : ENTITY_GRADIENTS[entityKey]
        )}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-105",
                `bg-linear-to-br ${ENTITY_GRADIENTS[entityKey]}`
              )}
            >
              {ENTITY_ICONS[entityKey]}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {SYNC_ENTITY_LABELS[entityKey]}
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {ENTITY_DESCRIPTIONS[entityKey]}
              </p>

              {/* ── Progress Bar (visible when loading) ── */}
              {isLoading && (
                <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
                      <Loader2 size={11} className="animate-spin" />
                      {state.progressMessage || "ກຳລັງໂຫຼດ..."}
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2 bg-blue-100"
                    indicatorClassName={cn(
                      "transition-all duration-500",
                      progressColor(pct)
                    )}
                  />
                </div>
              )}

              {/* Result Badge (when done) */}
              {state.result && !isLoading && (
                <div className="flex items-center gap-3 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Badge
                    variant="outline"
                    className="text-emerald-700 bg-emerald-50 border-emerald-200 font-bold text-xs gap-1.5 px-2.5 py-1"
                  >
                    <CheckCircle2 size={13} />
                    Synced: {state.result.synced}
                  </Badge>
                  {state.result.errors > 0 && (
                    <Badge
                      variant="outline"
                      className="text-red-700 bg-red-50 border-red-200 font-bold text-xs gap-1.5 px-2.5 py-1"
                    >
                      <XCircle size={13} />
                      Errors: {state.result.errors}
                    </Badge>
                  )}
                </div>
              )}

              {/* Error Message */}
              {state.error && !isLoading && (
                <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Badge
                    variant="outline"
                    className="text-red-700 bg-red-50 border-red-200 font-bold text-xs gap-1.5 px-2.5 py-1"
                  >
                    <AlertTriangle size={13} />
                    {state.error}
                  </Badge>
                </div>
              )}

              {/* Last Synced Time */}
              {state.lastSyncedAt && (
                <p className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2 font-medium">
                  <Clock size={11} />
                  ອັບເດດລ່າສຸດ: {formatTime(state.lastSyncedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Right: Sync Button */}
          <Button
            id={`sync-btn-${entityKey}`}
            onClick={handleSync}
            disabled={isLoading}
            size="sm"
            className={cn(
              "shrink-0 rounded-xl h-10 px-4 font-bold text-xs shadow-md transition-all duration-300",
              isLoading
                ? "bg-gray-100 text-gray-400 shadow-none"
                : "bg-linear-to-r from-[#1275e2] to-[#0f62c0] hover:from-[#0f62c0] hover:to-[#0a468c] text-white hover:shadow-lg hover:shadow-blue-500/20"
            )}
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-1.5 transition-transform",
                isLoading && "animate-spin"
              )}
            />
            {isLoading ? `${pct}%` : "Sync"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sync All Progress Banner ──────────────────────────
function SyncAllProgressBanner() {
  const { isSyncingAll, syncAllProgress, syncAllProgressMessage } =
    useSyncStore();

  if (!isSyncingAll) return null;

  return (
    <div className="relative z-10 mt-6 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="text-white animate-spin" />
          <span className="text-white font-bold text-sm">
            {syncAllProgressMessage || "ກຳລັງ Sync..."}
          </span>
        </div>
        <span className="text-white/90 font-black text-lg tabular-nums">
          {syncAllProgress}%
        </span>
      </div>

      {/* Progress bar inside the banner */}
      <div className="relative h-3 w-full rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#ffb13b] transition-all duration-500 ease-out"
          style={{ width: `${syncAllProgress}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────
export default function SyncDataPanel() {
  const {
    isSyncingAll,
    syncAllStructure,
    syncAllResults,
    clearResults,
    syncAllProgress,
  } = useSyncStore();
  const entities = useSyncStore((s) => s.entities);

  const isAnythingSyncing =
    isSyncingAll || Object.values(entities).some((e) => e.isLoading);

  const structureKeys: SyncEntityKey[] = [
    "departments",
    "divisions",
    "units",
    "positionGroups",
    "positionCodes",
    "positions",
  ];

  const totalSynced = syncAllResults
    ? syncAllResults.reduce((s, r) => s + r.synced, 0)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* ── Hero Banner ── */}
      <div className="relative bg-linear-to-br from-[#0a468c] via-[#0f62c0] to-[#1275e2] rounded-3xl p-8 sm:p-10 shadow-xl shadow-blue-900/10 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] bg-[#ffb13b]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <ArrowDownToLine size={24} className="text-[#ffb13b]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                Sync ຂໍ້ມູນ <span className="text-[#ffb13b]">(HRM)</span>
              </h1>
            </div>
            <p className="text-blue-100 font-medium text-sm sm:text-base max-w-lg opacity-90">
              ດຶງຂໍ້ມູນໂຄງສ້າງອົງກອນ ແລະ ພະນັກງານຈາກລະບົບ HRM
              ມາອັບເດດໃນລະບົບ Training Management.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              id="sync-all-structure-btn"
              onClick={syncAllStructure}
              disabled={isAnythingSyncing}
              className={cn(
                "flex-1 md:flex-none rounded-xl h-12 px-6 font-bold shadow-lg transition-all duration-300",
                isSyncingAll
                  ? "bg-white/10 text-white/70"
                  : "bg-[#ffb13b] hover:bg-[#e59e35] text-blue-950 hover:shadow-xl hover:shadow-amber-500/20"
              )}
            >
              {isSyncingAll ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  {syncAllProgress}% ກຳລັງ Sync...
                </>
              ) : (
                <>
                  <Zap size={18} className="mr-2" />
                  Sync ໂຄງສ້າງທັງໝົດ
                </>
              )}
            </Button>

            <Button
              id="sync-clear-btn"
              variant="secondary"
              onClick={clearResults}
              disabled={isAnythingSyncing}
              className="bg-white/10 hover:bg-white/20 text-white border-0 shadow-none backdrop-blur-md rounded-xl h-12 px-5 font-bold"
            >
              ລ້າງຜົນ
            </Button>
          </div>
        </div>

        {/* Progress banner (during syncAll) */}
        <SyncAllProgressBanner />

        {/* Sync All Results Summary (after complete) */}
        {syncAllResults && !isSyncingAll && (
          <div className="relative z-10 mt-6 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} className="text-emerald-300" />
              <span className="text-white font-bold text-sm">
                Sync ໂຄງສ້າງສຳເລັດ — ທັງໝົດ {totalSynced} ລາຍການ
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {syncAllResults.map((r) => (
                <Badge
                  key={r.entity}
                  variant="outline"
                  className={cn(
                    "text-xs font-bold px-3 py-1.5",
                    r.errors > 0
                      ? "text-red-200 border-red-400/30 bg-red-500/10"
                      : "text-emerald-200 border-emerald-400/30 bg-emerald-500/10"
                  )}
                >
                  {r.errors > 0 ? (
                    <XCircle size={12} className="mr-1" />
                  ) : (
                    <CheckCircle2 size={12} className="mr-1" />
                  )}
                  {r.entity}: {r.synced}
                  {r.errors > 0 && ` (${r.errors} err)`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Organization Structure Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#1275e2] to-[#0f62c0] text-white flex items-center justify-center shadow-md">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">
              ໂຄງສ້າງອົງກອນ
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              ຝ່າຍ, ພະແນກ, ໜ່ວຍງານ ແລະ ຕຳແໜ່ງ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {structureKeys.map((key) => (
            <SyncCard key={key} entityKey={key} />
          ))}
        </div>
      </div>

      {/* ── Employees Section ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">
              ຂໍ້ມູນພະນັກງານ
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Sync ພະນັກງານຈາກທຸກພະແນກ (ໃຊ້ເວລາດົນ)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <SyncCard entityKey="employeesAll" />
        </div>

        {/* Employee progress detail (expanded when syncing) */}
        {entities.employeesAll.isLoading && entities.employeesAll.progress > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                {entities.employeesAll.progressMessage}
              </p>
              <span className="text-sm font-black text-blue-700 tabular-nums">
                {entities.employeesAll.progress}%
              </span>
            </div>
            <Progress
              value={entities.employeesAll.progress}
              className="h-2.5 bg-blue-200"
              indicatorClassName={cn(
                "transition-all duration-500",
                progressColor(entities.employeesAll.progress)
              )}
            />
          </div>
        )}

        {/* Warning note */}
        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle
            size={18}
            className="text-amber-600 shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-bold text-amber-800">ໝາຍເຫດ</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              ການ Sync ພະນັກງານທັງໝົດຈະ Sync ທຸກຝ່າຍເທື່ອລະພະແນກ
              ອາດໃຊ້ເວລາຫຼາຍນາທີ. ກະລຸນາຢ່າປິດໜ້ານີ້ ຫຼື refresh
              ໃນຂະນະທີ່ກຳລັງ Sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}