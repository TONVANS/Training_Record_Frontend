// src/types/report.ts

export type ReportPeriodType = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

// ✅ เพิ่ม ReportInfo ที่ถูก import ใน pdfReport.ts และ pdfDepartmentReport.ts
export interface ReportInfo {
  year:         number;
  period_type:  ReportPeriodType;
  period_value: number | null;
  report_date:  string;
}

export interface DeptReportInfo extends ReportInfo {
  department: { id: number; name: string };
}

// ─── Shared ───────────────────────────────────────────────
export interface AttendeeCount {
  male:  number;
  female: number;
  total: number;
}

export interface CourseAttendees {
  technical:      AttendeeCount;
  administrative: AttendeeCount;
  total:          AttendeeCount;
}

export interface CourseDuration {
  start_date: string;
  end_date:   string;
  total_days: number;
}

export interface CourseLocation {
  is_domestic:      boolean;
  is_international: boolean;
  detail:           string;
}

export interface ReportSummary {
  total_technical_male:        number;
  total_technical_female:      number;
  total_technical:             number;
  total_administrative_male:   number;
  total_administrative_female: number;
  total_administrative:        number;
  total_male:                  number;
  total_female:                number;
  total_attendees:             number;
  total_courses:               number;
  total_days:                  number;
  total_domestic:              number;
  total_international:         number;
  total_online:                number;
  total_onsite:                number;
  total_budget:                number;
}

export interface PaginationMeta {
  page:        number;
  pageSize:    number;
  total:       number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Overview Report ──────────────────────────────────────
export interface TrainingReportItem {
  no:           number;
  course_title: string;
  budget:       number;
  attendees:    CourseAttendees;
  duration:     CourseDuration;
  location:     CourseLocation;
  institution:  string;
  format:       string;
}

export interface TrainingReportResponse {
  report_info: ReportInfo;       // ✅ ใช้ ReportInfo แทน inline object
  pagination:  PaginationMeta;
  summary:     ReportSummary;
  data:        TrainingReportItem[];
}

// ─── Department Report ────────────────────────────────────
export interface AttendeeEmployee {
  employee_code: string;
  full_name:     string;  // "ທ່ານ ນາງ ສົມໃຈ ..." มีคำนำหน้าแล้ว
  prefix:        string;  // "ທ່ານ" | "ທ່ານ ນາງ"
  first_name:    string;
  last_name:     string;
  gender:        'MALE' | 'FEMALE' | null;
  position:      string;
  department:    string;
}

export interface DepartmentReportItem {
  no:            number;
  course_title:  string;
  attendee_list: AttendeeEmployee[];
  attendees:     CourseAttendees;
  duration:      CourseDuration;
  location:      CourseLocation;
  institution:   string;
  format:        string;
}

export interface DepartmentTrainingReportResponse {
  report_info: DeptReportInfo;   // ✅ ใช้ DeptReportInfo
  pagination:  PaginationMeta;
  summary:     ReportSummary;
  data:        DepartmentReportItem[];
}