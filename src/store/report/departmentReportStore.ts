// src/store/report/departmentReportStore.ts
import { create } from 'zustand';
import {
  DepartmentTrainingReportResponse,
  ReportPeriodType,
} from '@/types/report';
import { toast } from 'sonner';
import api from '@/util/axios';

export interface Department {
  id:     number;
  code:   string | null;
  name:   string;
  status: string | null;
}

interface DepartmentReportState {
  reportData:  DepartmentTrainingReportResponse | null;
  departments: Department[];
  isLoading:   boolean;
  error:       string | null;
  currentPage: number;
  pageSize:    number;
  fetchReport: (
    departmentId: number,
    year:         number,
    type:         ReportPeriodType,
    value?:       number,
    page?:        number,
    pageSize?:    number,
  ) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  setPage: (departmentId: number, page: number) => void;
}

export const useDepartmentReportStore = create<DepartmentReportState>(
  (set, get) => ({
    reportData:  null,
    departments: [],
    isLoading:   false,
    error:       null,
    currentPage: 1,
    pageSize:    30,

    setPage: (departmentId, page) => {
      const prev = get().reportData;
      if (!prev) return;
      const { year, period_type, period_value } = prev.report_info;
      get().fetchReport(
        departmentId,
        year,
        period_type,
        period_value ?? 1,
        page,
        get().pageSize,
      );
    },

    fetchDepartments: async () => {
      try {
        const response = await api.get<Department[]>('/employees/departments/all');
        set({ departments: response.data });
      } catch (error: any) {
        toast.error('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນພະແນກ/ຝ່າຍ');
      }
    },

    fetchReport: async (
      departmentId,
      year,
      type,
      value,
      page = 1,
      pageSize = 10,
    ) => {
      set({ isLoading: true, error: null, currentPage: page, pageSize });
      try {
        const response = await api.get<DepartmentTrainingReportResponse>(
          '/reports/department-training',
          { params: { departmentId, year, type, value, page, pageSize } },
        );
        set({ reportData: response.data, isLoading: false });
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານຝ່າຍ';
        set({ error: message, isLoading: false, reportData: null });
        toast.error(message);
      }
    },
  }),
);