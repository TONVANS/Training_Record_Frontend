// src/store/syncStore.ts
import { create } from "zustand";
import api from "@/util/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
interface SyncResult {
  entity: string;
  synced: number;
  errors: number;
}

interface SyncEntityState {
  isLoading: boolean;
  result: SyncResult | null;
  error: string | null;
  lastSyncedAt: string | null;
}

interface SyncAllResponse {
  success: boolean;
  results: SyncResult[];
}

interface SyncEmployeesAllResponse {
  success: boolean;
  total_synced: number;
  total_errors: number;
  results: SyncResult[];
}

interface ApiErrorResponse {
  message: string;
}

// ── Entity Keys ────────────────────────────────────────
export type SyncEntityKey =
  | "departments"
  | "divisions"
  | "units"
  | "positionGroups"
  | "positionCodes"
  | "positions"
  | "employeesAll";

// ── Store State ────────────────────────────────────────
interface SyncStoreState {
  entities: Record<SyncEntityKey, SyncEntityState>;
  isSyncingAll: boolean;
  syncAllResults: SyncResult[] | null;
  syncAllError: string | null;

  // Individual sync actions
  syncEntity: (key: SyncEntityKey) => Promise<void>;

  // Sync all structure data (departments, divisions, units, positions, etc.)
  syncAllStructure: () => Promise<void>;

  // Sync all employees
  syncAllEmployees: () => Promise<void>;

  // Reset
  clearResults: () => void;
}

// ── Endpoint Mapping ──────────────────────────────────
const SYNC_ENDPOINTS: Record<SyncEntityKey, string> = {
  departments: "/sync/departments",
  divisions: "/sync/divisions",
  units: "/sync/units",
  positionGroups: "/sync/position-groups",
  positionCodes: "/sync/position-codes",
  positions: "/sync/positions",
  employeesAll: "/sync/employees/all",
};

// ── Entity Labels (Lao) ───────────────────────────────
export const SYNC_ENTITY_LABELS: Record<SyncEntityKey, string> = {
  departments: "ພະແນກ (Departments)",
  divisions: "ຝ່າຍ (Divisions)",
  units: "ໜ່ວຍງານ (Units)",
  positionGroups: "ກຸ່ມຕຳແໜ່ງ (Position Groups)",
  positionCodes: "ລະຫັດຕຳແໜ່ງ (Position Codes)",
  positions: "ຕຳແໜ່ງ (Positions)",
  employeesAll: "ພະນັກງານທັງໝົດ (All Employees)",
};

// ── Initial entity state ──────────────────────────────
const initialEntityState: SyncEntityState = {
  isLoading: false,
  result: null,
  error: null,
  lastSyncedAt: null,
};

const initialEntities: Record<SyncEntityKey, SyncEntityState> = {
  departments: { ...initialEntityState },
  divisions: { ...initialEntityState },
  units: { ...initialEntityState },
  positionGroups: { ...initialEntityState },
  positionCodes: { ...initialEntityState },
  positions: { ...initialEntityState },
  employeesAll: { ...initialEntityState },
};

// ── Store ─────────────────────────────────────────────
export const useSyncStore = create<SyncStoreState>()((set, get) => ({
  entities: { ...initialEntities },
  isSyncingAll: false,
  syncAllResults: null,
  syncAllError: null,

  syncEntity: async (key) => {
    // Set loading
    set((state) => ({
      entities: {
        ...state.entities,
        [key]: { ...state.entities[key], isLoading: true, error: null },
      },
    }));

    try {
      const response = await api.post(SYNC_ENDPOINTS[key]);
      const data = response.data;

      // Normalize result — employees/all returns differently
      let result: SyncResult;
      if (key === "employeesAll") {
        const empData = data as SyncEmployeesAllResponse;
        result = {
          entity: "All Employees",
          synced: empData.total_synced ?? 0,
          errors: empData.total_errors ?? 0,
        };
      } else {
        result = data as SyncResult;
      }

      set((state) => ({
        entities: {
          ...state.entities,
          [key]: {
            isLoading: false,
            result,
            error: null,
            lastSyncedAt: new Date().toISOString(),
          },
        },
      }));

      toast.success(`Sync ${SYNC_ENTITY_LABELS[key]} ສຳເລັດ! (${result.synced} ລາຍການ)`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || `ບໍ່ສາມາດ Sync ${SYNC_ENTITY_LABELS[key]} ໄດ້`;

      set((state) => ({
        entities: {
          ...state.entities,
          [key]: {
            ...state.entities[key],
            isLoading: false,
            error: errorMessage,
          },
        },
      }));

      toast.error(errorMessage);
    }
  },

  syncAllStructure: async () => {
    set({ isSyncingAll: true, syncAllResults: null, syncAllError: null });

    try {
      const response = await api.post<SyncAllResponse>("/sync/all");
      const results = response.data.results || [];

      // Update individual entity states from aggregated results
      const now = new Date().toISOString();
      const entityUpdates: Partial<Record<SyncEntityKey, SyncEntityState>> = {};

      const entityMapping: Record<string, SyncEntityKey> = {
        Department: "departments",
        Division: "divisions",
        Unit: "units",
        PositionGroup: "positionGroups",
        PositionCode: "positionCodes",
        Position: "positions",
      };

      for (const r of results) {
        const key = entityMapping[r.entity];
        if (key) {
          entityUpdates[key] = {
            isLoading: false,
            result: r,
            error: null,
            lastSyncedAt: now,
          };
        }
      }

      set((state) => ({
        isSyncingAll: false,
        syncAllResults: results,
        entities: { ...state.entities, ...entityUpdates },
      }));

      const totalSynced = results.reduce((s, r) => s + r.synced, 0);
      toast.success(`Sync ໂຄງສ້າງທັງໝົດສຳເລັດ! (${totalSynced} ລາຍການ)`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "ບໍ່ສາມາດ Sync ໂຄງສ້າງທັງໝົດໄດ້";

      set({ isSyncingAll: false, syncAllError: errorMessage });
      toast.error(errorMessage);
    }
  },

  syncAllEmployees: async () => {
    set((state) => ({
      entities: {
        ...state.entities,
        employeesAll: { ...state.entities.employeesAll, isLoading: true, error: null },
      },
    }));

    try {
      const response = await api.post<SyncEmployeesAllResponse>("/sync/employees/all");
      const data = response.data;

      set((state) => ({
        entities: {
          ...state.entities,
          employeesAll: {
            isLoading: false,
            result: {
              entity: "All Employees",
              synced: data.total_synced ?? 0,
              errors: data.total_errors ?? 0,
            },
            error: null,
            lastSyncedAt: new Date().toISOString(),
          },
        },
      }));

      toast.success(`Sync ພະນັກງານທັງໝົດສຳເລັດ! (${data.total_synced} ຄົນ)`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message || "ບໍ່ສາມາດ Sync ພະນັກງານທັງໝົດໄດ້";

      set((state) => ({
        entities: {
          ...state.entities,
          employeesAll: {
            ...state.entities.employeesAll,
            isLoading: false,
            error: errorMessage,
          },
        },
      }));

      toast.error(errorMessage);
    }
  },

  clearResults: () => {
    set({
      entities: { ...initialEntities },
      isSyncingAll: false,
      syncAllResults: null,
      syncAllError: null,
    });
  },
}));
