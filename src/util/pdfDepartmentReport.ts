// src/util/pdfDepartmentReport.ts
import {
  DepartmentTrainingReportResponse,
  DepartmentReportItem,
  DeptReportInfo,
} from "@/types/report";
import { format } from "date-fns";
import { formatCurrency } from "./pdfReport";
import api from "@/util/axios";

// ─── Helper ───────────────────────────────────────────────
const getReportTitle = (info: DeptReportInfo): string => {
  if (info.period_type === "MONTHLY")
    return `ເດືອນ ${info.period_value} / ${info.year}`;
  if (info.period_type === "QUARTERLY")
    return `ໄຕມາດ ${info.period_value} / ${info.year}`;
  if (info.period_type === "HALF_YEARLY")
    return `6 ເດືອນ${info.period_value === 1 ? "ຕົ້ນ" : "ທ້າຍ"}ປີ / ${info.year}`;
  if (info.period_type === "YEARLY") return `ປີ ${info.year}`;
  return `${info.year}`;
};

// ─── Batch Fetch (แทน pageSize: 9999) ────────────────────
export async function fetchAllDeptReportPagesForPDF(
  info: DeptReportInfo,
  batchSize = 50,
): Promise<DepartmentTrainingReportResponse> {
  const allItems: DepartmentReportItem[] = [];
  let page = 1;
  let hasNextPage = true;
  let lastResponse: DepartmentTrainingReportResponse | null = null;

  while (hasNextPage) {
    const { data } = await api.get<DepartmentTrainingReportResponse>(
      "/reports/department-training",
      {
        params: {
          departmentId: info.department.id,
          year:         info.year,
          type:         info.period_type,
          value:        info.period_value ?? 1,
          page,
          pageSize:     batchSize,
        },
      },
    );

    allItems.push(...data.data);
    hasNextPage  = data.pagination.hasNextPage;
    lastResponse = data;
    page++;
  }

  return { ...lastResponse!, data: allItems };
}

// ─── HTML Generator ───────────────────────────────────────
export const generateDepartmentReportHTML = (
  report: DepartmentTrainingReportResponse,
): string => {
  const currentDate = format(new Date(), "dd/MM/yyyy");
  const reportTitle = getReportTitle(report.report_info);
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const deptName = report.report_info.department.name;

  const dataBodies = report.data
    .map((course) => {
      const hasAttendees =
        course.attendee_list && course.attendee_list.length > 0;
      const rowSpan = hasAttendees ? course.attendee_list.length : 1;

      let bodyHtml = `<tbody class="course-group">`;

      if (!hasAttendees) {
        bodyHtml += `
          <tr>
            <td class="col-no">${course.no}</td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="col-title">${course.course_title}</td>
            <td class="col-num">${course.attendees.technical.male || "-"}</td>
            <td class="col-num">${course.attendees.technical.female || "-"}</td>
            <td class="col-num"><b>${course.attendees.technical.total || "-"}</b></td>
            <td class="col-num">${course.attendees.administrative.male || "-"}</td>
            <td class="col-num">${course.attendees.administrative.female || "-"}</td>
            <td class="col-num"><b>${course.attendees.administrative.total || "-"}</b></td>
            <td class="col-num"><b>${course.attendees.total.total || "-"}</b></td>
            <td class="col-date">${format(new Date(course.duration.start_date), "dd/MM/yy")}</td>
            <td class="col-date">${format(new Date(course.duration.end_date), "dd/MM/yy")}</td>
            <td class="col-num">${course.duration.total_days}</td>
            <td class="col-num">${course.location.is_domestic ? "✓" : ""}</td>
            <td class="col-num">${course.location.is_international ? "✓" : ""}</td>
            <td class="col-inst">${course.institution || "-"}</td>
            <td class="col-num">${course.format}</td>
            <td class="col-remark"></td>
          </tr>`;
      } else {
        course.attendee_list.forEach((emp, idx) => {
          bodyHtml += `<tr>`;
          if (idx === 0) {
            const rs = `rowspan="${rowSpan}"`;
            bodyHtml += `
              <td ${rs} class="col-no">${course.no}</td>
              <td class="col-code">${emp.employee_code}</td>
              <td class="col-name">${emp.full_name}</td>
              <td class="col-pos">${emp.position}</td>
              <td ${rs} class="col-title">${course.course_title}</td>
              <td ${rs} class="col-num">${course.attendees.technical.male || "-"}</td>
              <td ${rs} class="col-num">${course.attendees.technical.female || "-"}</td>
              <td ${rs} class="col-num"><b>${course.attendees.technical.total || "-"}</b></td>
              <td ${rs} class="col-num">${course.attendees.administrative.male || "-"}</td>
              <td ${rs} class="col-num">${course.attendees.administrative.female || "-"}</td>
              <td ${rs} class="col-num"><b>${course.attendees.administrative.total || "-"}</b></td>
              <td ${rs} class="col-num"><b>${course.attendees.total.total || "-"}</b></td>
              <td ${rs} class="col-date">${format(new Date(course.duration.start_date), "dd/MM/yy")}</td>
              <td ${rs} class="col-date">${format(new Date(course.duration.end_date), "dd/MM/yy")}</td>
              <td ${rs} class="col-num">${course.duration.total_days}</td>
              <td ${rs} class="col-num">${course.location.is_domestic ? "✓" : ""}</td>
              <td ${rs} class="col-num">${course.location.is_international ? "✓" : ""}</td>
              <td ${rs} class="col-inst">${course.institution || "-"}</td>
              <td ${rs} class="col-num">${course.format}</td>
              <td ${rs} class="col-remark"></td>`;
          } else {
            bodyHtml += `
              <td class="col-code">${emp.employee_code}</td>
              <td class="col-name">${emp.full_name}</td>
              <td class="col-pos">${emp.position}</td>`;
          }
          bodyHtml += `</tr>`;
        });
      }

      bodyHtml += `</tbody>`;
      return bodyHtml;
    })
    .join("");

  const summaryHtml = `
    <tbody class="summary-body">
      <tr class="summary-row">
        <td colspan="5" style="text-align:right;padding-right:8px;">
          ລວມທັງໝົດ (${report.summary.total_courses} ຫຼັກສູດ):
        </td>
        <td class="col-num">${report.summary.total_technical_male}</td>
        <td class="col-num">${report.summary.total_technical_female}</td>
        <td class="col-num">${report.summary.total_technical}</td>
        <td class="col-num">${report.summary.total_administrative_male}</td>
        <td class="col-num">${report.summary.total_administrative_female}</td>
        <td class="col-num">${report.summary.total_administrative}</td>
        <td class="col-num"><b>${report.summary.total_attendees}</b></td>
        <td colspan="2"></td>
        <td class="col-num">${report.summary.total_days}</td>
        <td class="col-num">${report.summary.total_domestic}</td>
        <td class="col-num">${report.summary.total_international}</td>
        <td></td>
        <td class="col-num" style="font-size:8px;">
          (ON:${report.summary.total_online} IN:${report.summary.total_onsite})
        </td>
        <td></td>
      </tr>
    </tbody>`;

  const signaturesHTML =
    report.report_info.period_type === "MONTHLY"
      ? `<div class="signature-box">
           <div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div>
           <div class="signature-line"></div>
         </div>
         <div class="signature-box">
           <div><strong>ຜູ້ສັງລວມ</strong></div>
           <div class="signature-line"></div>
         </div>`
      : `<div class="signature-box">
           <div><strong>ຫົວໜ້າພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ</strong></div>
           <div class="signature-line"></div>
         </div>
         <div class="signature-box">
           <div><strong>ຜູ້ສັງລວມ</strong></div>
           <div class="signature-line"></div>
         </div>`;

  return `<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <title>Department Training Report — ${deptName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Phetsarath OT', 'Saysettha OT', sans-serif;
      background: #fff; color: #000;
      font-size: 10px; line-height: 1.6; padding: 20px;
    }
    .container { width: 100%; margin: 0 auto; }
    .text-center { text-align: center; }
    .header-nation {
      text-align: center; font-weight: 700;
      font-size: 14px; margin-bottom: 20px; line-height: 1.6;
    }
    .header-info {
      display: flex; justify-content: space-between; align-items: flex-start;
      font-size: 11px; margin-bottom: 24px; line-height: 1.8;
    }
    .header-left   { flex: 1; text-align: left; }
    .header-center { flex: 1; text-align: center; }
    .header-right  { flex: 1; text-align: right; }
    .header-logo   { width: 70px; height: auto; object-fit: contain; }
    .report-title {
      text-align: center; font-weight: 700;
      font-size: 14px; margin: 20px 0 16px; line-height: 1.8;
    }
    .report-subtitle { font-size: 12px; font-weight: normal; }
    table {
      width: 100%; border-collapse: collapse;
      table-layout: fixed; margin-bottom: 28px;
    }
    th, td {
      border: 1px solid #000; padding: 5px 3px;
      word-wrap: break-word; overflow-wrap: break-word;
      line-height: 1.5; vertical-align: middle;
    }
    th { text-align: center; font-weight: 700; font-size: 9.5px; }
    td { font-size: 9.5px; }
    .course-group  { page-break-inside: avoid; }
    .col-no     { width: 2.5%;  text-align: center; }
    .col-code   { width: 4.5%;  text-align: center; }
    .col-name   { width: 9%; }
    .col-pos    { width: 8%; }
    .col-title  { width: 13%;   text-align: left; padding-left: 4px; }
    .col-num    { width: 4%;    text-align: center; }
    .col-date   { width: 4.5%;  text-align: center; }
    .col-inst   { width: 7%; }
    .col-remark { width: 4.5%; }
    .summary-body { page-break-inside: avoid; }
    .summary-row td {
      font-weight: 700;
      border-top: 2px solid #000; border-bottom: 2px solid #000;
      padding-top: 8px; padding-bottom: 6px;
    }
    .signatures {
      display: flex; justify-content: space-between;
      margin-top: 40px; padding: 0 30px;
      font-size: 11px; line-height: 1.8; page-break-inside: avoid;
    }
    .signature-box  { text-align: center; width: 260px; }
    .signature-line { margin-top: 70px; border-bottom: 1px dotted #000; }
    @media print {
      @page { size: A4 landscape; margin: 8mm; }
      body  { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead { display: table-header-group; }
      tr    { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="container" id="pdf-content">
  <div class="header-nation">
    ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ<br>
    ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
  </div>
  <div class="header-info">
    <div class="header-left">
      ລັດວິສາຫະກິດໄຟຟ້າລາວ<br>
      ຝ່າຍບຸກຄະລາກອນ<br>
      ພະແນກວາງແຜນ ແລະ ພັດທະນາບຸກຄະລາກອນ
    </div>
    <div class="header-center">
      <img src="${baseUrl}/app1/images/logo/logo.png" alt="Logo"
           class="header-logo" onerror="this.style.display='none'" />
    </div>
    <div class="header-right">
      ເລກທີ............/ຟຟລ.ຝບກ.ພວພ<br>
      ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ ${currentDate}
    </div>
  </div>
  <div class="report-title">
    ສັງລວມການຝຶກອົບຮົມ ${deptName}<br>
    <span class="report-subtitle">ປະຈຳ ${reportTitle}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th rowspan="3" class="col-no">ລ/ດ</th>
        <th rowspan="3" class="col-code">ລະຫັດ<br>ພະນັກງານ</th>
        <th rowspan="3" class="col-name">ຊື່ ແລະ ນາມສະກຸນ</th>
        <th rowspan="3" class="col-pos">ຕຳແໜ່ງ</th>
        <th rowspan="3" class="col-title">ຫົວຂໍ້ຝຶກອົບຮົມ</th>
        <th colspan="7">ຈຳນວນຜູ້ເຂົ້າຝຶກ</th>
        <th colspan="2">ໄລຍະເວລາ</th>
        <th rowspan="3" class="col-num">ຈຳນວນ<br>ມື້</th>
        <th colspan="2">ສະຖານທີ່ຝຶກ</th>
        <th rowspan="3" class="col-inst">ຊື່ສະຖາບັນ/<br>ອົງກອນ</th>
        <th rowspan="3" class="col-num">ຮູບແບບ<br>ການຝຶກ</th>
        <th rowspan="3" class="col-remark">ໝາຍເຫດ</th>
      </tr>
      <tr>
        <th colspan="3">ເຕັກນິກ</th>
        <th colspan="3">ບໍລິຫານ</th>
        <th rowspan="2" class="col-num">ລວມ</th>
        <th rowspan="2" class="col-date">ມື້ເລີ່ມ</th>
        <th rowspan="2" class="col-date">ມື້ສິ້ນສຸດ</th>
        <th rowspan="2" class="col-num">ພາຍໃນ</th>
        <th rowspan="2" class="col-num">ຕ່າງ<br>ປະເທດ</th>
      </tr>
      <tr>
        <th class="col-num">ຊາຍ</th>
        <th class="col-num">ຍິງ</th>
        <th class="col-num">ລວມ</th>
        <th class="col-num">ຊາຍ</th>
        <th class="col-num">ຍິງ</th>
        <th class="col-num">ລວມ</th>
      </tr>
    </thead>
    ${
      report.data.length > 0
        ? dataBodies + summaryHtml
        : `<tbody><tr><td colspan="21" style="text-align:center;padding:40px;font-weight:bold;">
             ບໍ່ມີຂໍ້ມູນການຝຶກອົບຮົມໃນຊ່ວງເວລານີ້
           </td></tr></tbody>`
    }
  </table>
  <div class="signatures">${signaturesHTML}</div>
</div>
</body>
</html>`;
};

export const generateDepartmentPreviewHtmlUrl = (
  report: DepartmentTrainingReportResponse,
): string => {
  const html = generateDepartmentReportHTML(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
};

export const downloadDepartmentReportPDF = (
  report: DepartmentTrainingReportResponse,
): void => {
  const html = generateDepartmentReportHTML(report);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert(
      "ກະລຸນາອະນຸຍາດ (Allow) ໃຫ້ Pop-ups ເຮັດວຽກໃນ Browser ຂອງທ່ານ",
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    ${html}
    <script>
      window.onload = function () {
        setTimeout(function () { window.print(); }, 500);
        window.onafterprint = function () { window.close(); };
      };
    <\/script>
  `);
  printWindow.document.close();
};