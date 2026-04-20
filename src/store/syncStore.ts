// src/store/syncStore.ts
import { create } from "zustand";
import api from "@/util/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────
export interface SyncResult {
  entity: string;
  synced: number;
  errors: number;
}

export interface SyncProgressEvent {
  type: "start" | "progress" | "entity_complete" | "complete" | "error";
  percent: number;
  entity?: string;
  message: string;
  result?: SyncResult;
  results?: SyncResult[];
  currentDept?: string;
  completedDepts?: number;
  totalDepts?: number;
}

export interface SyncEntityState {
  isLoading: boolean;
  result: SyncResult | null;
  error: string | null;
  lastSyncedAt: string | null;
  /** 0–100 */
  progress: number;
  progressMessage: string;
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
  /** overall progress for syncAll (0–100) */
  syncAllProgress: number;
  syncAllProgressMessage: string;

  syncEntity: (key: SyncEntityKey) => Promise<void>;
  syncAllStructure: () => Promise<void>;
  syncAllEmployees: () => Promise<void>;
  clearResults: () => void;
}

// ── Endpoint Mapping ──────────────────────────────────
/** SSE stream endpoints (GET) */
const STREAM_ENDPOINTS: Partial<Record<SyncEntityKey, string>> = {
  departments: "/sync/stream/departments",
  divisions: "/sync/stream/divisions",
  units: "/sync/stream/units",
  positionGroups: "/sync/stream/position-groups",
  positionCodes: "/sync/stream/position-codes",
  positions: "/sync/stream/positions",
  employeesAll: "/sync/stream/employees/all",
};

/** Fallback POST endpoints (non-streaming) */
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
  departments: "ຝ່າຍ (Departments)",
  divisions: "ພະແນກ (Divisions)",
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
  progress: 0,
  progressMessage: "",
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

// ── Helpers ───────────────────────────────────────────

/**
 * Build the full SSE URL from the path.
 */
function getSseUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3400`
      : "http://localhost:3400");
  return `${base}${path}`;
}

/**
 * Read the JWT token from localStorage (same source as the axios interceptor).
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    const parsed = raw ? JSON.parse(raw)?.state : null;
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Open an SSE connection via fetch() so we can send an Authorization header.
 * EventSource does NOT support custom headers — this is the correct replacement.
 * Returns a cleanup function that aborts the stream.
 */
function openSseStream(
  url: string,
  onEvent: (event: SyncProgressEvent) => void,
  onDone: () => void,
  onError: (msg: string) => void
): () => void {
  const controller = new AbortController();
  const token = getAuthToken();

  fetch(url, {
    method: "GET",
    signal: controller.signal,
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        onError(`SSE ຜິດພາດ: HTTP ${response.status}`);
        onDone();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE format: each message is separated by "\n\n"
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? ""; // keep the incomplete last chunk

        for (const part of parts) {
          // Extract the "data: ..." line
          const dataLine = part
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          const jsonStr = dataLine.slice(5).trim();
          try {
            const data: SyncProgressEvent = JSON.parse(jsonStr);
            onEvent(data);
            if (data.type === "complete" || data.type === "error") {
              reader.cancel();
              onDone();
              return;
            }
          } catch {
            // ignore parse errors on individual events
          }
        }
      }

      // Stream ended naturally
      onDone();
    })
    .catch((err: Error) => {
      if (err.name === "AbortError") return; // intentional cancel, ignore
      onError(`ການເຊື່ອມຕໍ່ SSE ຂາດ: ${err.message}`);
      onDone();
    });

  return () => controller.abort();
}

// ── Store ─────────────────────────────────────────────
export const useSyncStore = create<SyncStoreState>()((set, get) => ({
  entities: { ...initialEntities },
  isSyncingAll: false,
  syncAllResults: null,
  syncAllError: null,
  syncAllProgress: 0,
  syncAllProgressMessage: "",

  // ── Individual entity sync via SSE ──────────────────
  syncEntity: async (key) => {
    const streamUrl = STREAM_ENDPOINTS[key];

    // Set loading / reset progress
    set((state) => ({
      entities: {
        ...state.entities,
        [key]: {
          ...state.entities[key],
          isLoading: true,
          error: null,
          progress: 0,
          progressMessage: "",
        },
      },
    }));

    if (!streamUrl) {
      // Fallback: POST without streaming
      try {
        const response = await api.post(SYNC_ENDPOINTS[key]);
        const data = response.data;

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
              progress: 100,
              progressMessage: "ສຳເລັດ",
            },
          },
        }));
        toast.success(`Sync ${SYNC_ENTITY_LABELS[key]} ສຳເລັດ! (${result.synced} ລາຍການ)`);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.message ||
          `ບໍ່ສາມາດ Sync ${SYNC_ENTITY_LABELS[key]} ໄດ້`;
        set((state) => ({
          entities: {
            ...state.entities,
            [key]: {
              ...state.entities[key],
              isLoading: false,
              error: errorMessage,
              progress: 0,
            },
          },
        }));
        toast.error(errorMessage);
      }
      return;
    }

    // SSE streaming
    return new Promise<void>((resolve) => {
      openSseStream(
        getSseUrl(streamUrl),
        (event) => {
          if (event.type === "complete") {
            const result = event.result ?? event.results?.[0] ?? null;
            set((state) => ({
              entities: {
                ...state.entities,
                [key]: {
                  isLoading: false,
                  result: result ?? state.entities[key].result,
                  error: null,
                  lastSyncedAt: new Date().toISOString(),
                  progress: 100,
                  progressMessage: event.message,
                },
              },
            }));
            toast.success(
              `Sync ${SYNC_ENTITY_LABELS[key]} ສຳເລັດ!${result ? ` (${result.synced} ລາຍການ)` : ""}`
            );
          } else if (event.type === "error") {
            set((state) => ({
              entities: {
                ...state.entities,
                [key]: {
                  ...state.entities[key],
                  isLoading: false,
                  error: event.message,
                  progress: 0,
                  progressMessage: "",
                },
              },
            }));
            toast.error(event.message);
          } else {
            // progress / entity_complete / start
            set((state) => ({
              entities: {
                ...state.entities,
                [key]: {
                  ...state.entities[key],
                  progress: event.percent,
                  progressMessage: event.message,
                  // update result on entity_complete
                  ...(event.type === "entity_complete" && event.result
                    ? { result: event.result }
                    : {}),
                },
              },
            }));
          }
        },
        () => resolve(),
        (errMsg) => {
          set((state) => ({
            entities: {
              ...state.entities,
              [key]: {
                ...state.entities[key],
                isLoading: false,
                error: errMsg,
                progress: 0,
                progressMessage: "",
              },
            },
          }));
          toast.error(errMsg);
          resolve();
        }
      );
    });
  },

  // ── Sync All Structure via SSE ──────────────────────
  syncAllStructure: async () => {
    set({
      isSyncingAll: true,
      syncAllResults: null,
      syncAllError: null,
      syncAllProgress: 0,
      syncAllProgressMessage: "",
    });

    const entityMapping: Record<string, SyncEntityKey> = {
      Department: "departments",
      Division: "divisions",
      Unit: "units",
      PositionGroup: "positionGroups",
      PositionCode: "positionCodes",
      Position: "positions",
    };

    return new Promise<void>((resolve) => {
      openSseStream(
        getSseUrl("/sync/stream/all"),
        (event) => {
          if (event.type === "complete") {
            const results = event.results ?? [];
            const now = new Date().toISOString();
            const entityUpdates: Partial<Record<SyncEntityKey, SyncEntityState>> = {};

            for (const r of results) {
              const k = entityMapping[r.entity];
              if (k) {
                entityUpdates[k] = {
                  isLoading: false,
                  result: r,
                  error: null,
                  lastSyncedAt: now,
                  progress: 100,
                  progressMessage: "ສຳເລັດ",
                };
              }
            }

            const totalSynced = results.reduce((s, r) => s + r.synced, 0);

            set((state) => ({
              isSyncingAll: false,
              syncAllResults: results,
              syncAllProgress: 100,
              syncAllProgressMessage: event.message,
              entities: { ...state.entities, ...entityUpdates },
            }));

            toast.success(`Sync ໂຄງສ້າງທັງໝົດສຳເລັດ! (${totalSynced} ລາຍການ)`);
          } else if (event.type === "error") {
            set({
              isSyncingAll: false,
              syncAllError: event.message,
              syncAllProgress: 0,
              syncAllProgressMessage: "",
            });
            toast.error(event.message);
          } else {
            // progress / entity_complete
            set((state) => {
              const updates: Partial<SyncStoreState> = {
                syncAllProgress: event.percent,
                syncAllProgressMessage: event.message,
              };

              // Update individual entity progress
              if (event.entity) {
                const k = entityMapping[event.entity];
                if (k) {
                  updates.entities = {
                    ...state.entities,
                    [k]: {
                      ...state.entities[k],
                      isLoading: event.type !== "entity_complete",
                      progress: event.percent,
                      progressMessage: event.message,
                      ...(event.type === "entity_complete" && event.result
                        ? {
                          result: event.result,
                          lastSyncedAt: new Date().toISOString(),
                          progress: 100,
                          progressMessage: "ສຳເລັດ",
                        }
                        : {}),
                    },
                  };
                }
              }

              return updates;
            });
          }
        },
        () => resolve(),
        (errMsg) => {
          set({ isSyncingAll: false, syncAllError: errMsg });
          toast.error(errMsg);
          resolve();
        }
      );
    });
  },

  // ── Sync All Employees via SSE ──────────────────────
  syncAllEmployees: async () => {
    set((state) => ({
      entities: {
        ...state.entities,
        employeesAll: {
          ...state.entities.employeesAll,
          isLoading: true,
          error: null,
          progress: 0,
          progressMessage: "",
        },
      },
    }));

    return new Promise<void>((resolve) => {
      openSseStream(
        getSseUrl("/sync/stream/employees/all"),
        (event) => {
          if (event.type === "complete") {
            const results = event.results ?? [];
            const totalSynced = results.reduce((s, r) => s + r.synced, 0);
            const totalErrors = results.reduce((s, r) => s + r.errors, 0);

            set((state) => ({
              entities: {
                ...state.entities,
                employeesAll: {
                  isLoading: false,
                  result: {
                    entity: "All Employees",
                    synced: totalSynced,
                    errors: totalErrors,
                  },
                  error: null,
                  lastSyncedAt: new Date().toISOString(),
                  progress: 100,
                  progressMessage: event.message,
                },
              },
            }));
            toast.success(`Sync ພະນັກງານທັງໝົດສຳເລັດ! (${totalSynced} ຄົນ)`);
          } else if (event.type === "error") {
            set((state) => ({
              entities: {
                ...state.entities,
                employeesAll: {
                  ...state.entities.employeesAll,
                  isLoading: false,
                  error: event.message,
                  progress: 0,
                  progressMessage: "",
                },
              },
            }));
            toast.error(event.message);
          } else {
            set((state) => ({
              entities: {
                ...state.entities,
                employeesAll: {
                  ...state.entities.employeesAll,
                  progress: event.percent,
                  progressMessage: event.message,
                },
              },
            }));
          }
        },
        () => resolve(),
        (errMsg) => {
          set((state) => ({
            entities: {
              ...state.entities,
              employeesAll: {
                ...state.entities.employeesAll,
                isLoading: false,
                error: errMsg,
                progress: 0,
                progressMessage: "",
              },
            },
          }));
          toast.error(errMsg);
          resolve();
        }
      );
    });
  },

  clearResults: () => {
    set({
      entities: { ...initialEntities },
      isSyncingAll: false,
      syncAllResults: null,
      syncAllError: null,
      syncAllProgress: 0,
      syncAllProgressMessage: "",
    });
  },
}));