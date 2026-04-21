// src/store/report/reportStore.ts
import { create } from 'zustand';
import { TrainingReportResponse, ReportPeriodType } from '@/types/report';
import { toast } from 'sonner';
import api from '@/util/axios';

interface ReportState {
  reportData:  TrainingReportResponse | null;
  isLoading:   boolean;
  error:       string | null;
  // Pagination helpers
  currentPage: number;
  pageSize:    number;
  fetchReport: (
    year:      number,
    type:      ReportPeriodType,
    value?:    number,
    page?:     number,
    pageSize?: number,
  ) => Promise<void>;
  setPage: (page: number) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reportData:  null,
  isLoading:   false,
  error:       null,
  currentPage: 1,
  pageSize:    30,

  setPage: (page) => {
    // เรียก fetchReport ด้วยหน้าใหม่โดยใช้ params เดิม
    const prev = get().reportData;
    if (!prev) return;
    const { year, period_type, period_value } = prev.report_info;
    get().fetchReport(year, period_type, period_value ?? 1, page, get().pageSize);
  },

  fetchReport: async (year, type, value, page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null, currentPage: page, pageSize });
    try {
      const response = await api.get<TrainingReportResponse>('/reports/training', {
        params: { year, type, value, page, pageSize },
      });
      set({ reportData: response.data, isLoading: false });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ';
      set({ error: message, isLoading: false, reportData: null });
      toast.error(message);
    }
  },
}));