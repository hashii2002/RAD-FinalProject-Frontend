import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pawpathLogo from "../assets/pawpath-logo.jpg";

import type { ReportType } from "./report.service";

type ReportData = Record<string, any>;

const COLORS = {
  navy: [16, 42, 67] as [number, number, number],
  teal: [13, 148, 136] as [number, number, number],
  orange: [234, 132, 50] as [number, number, number],
  slate: [71, 85, 105] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const PAGE_WIDTH = 297;
const LEFT = 14;
const RIGHT = 283;
const CONTENT_WIDTH = RIGHT - LEFT;

const formatCurrency = (value: unknown): string => {
  const amount = Number(value || 0);

  return `LKR ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value: unknown): string => {
  if (!value) return "N/A";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB");
};

const formatDateTime = (value: unknown): string => {
  if (!value) return "N/A";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-GB");
};

const textValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
};

const loadLogo = async (): Promise<string> => {
  const response = await fetch(pawpathLogo);

  if (!response.ok) {
    throw new Error("Unable to load PawPath logo.");
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(
      new Error("Unable to read PawPath logo.")
    );

    reader.readAsDataURL(blob);
  });
};

const addSummaryCards = (
  doc: jsPDF,
  cards: { label: string; value: string }[],
  startY: number
): number => {
  const gap = 4;
  const columns = 2;
  const cardWidth = (CONTENT_WIDTH - gap) / columns;
  const cardHeight = 20;

  cards.forEach((card, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;

    const x = LEFT + column * (cardWidth + gap);
    const y = startY + row * (cardHeight + gap);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "F");

    doc.setFillColor(...COLORS.teal);
    doc.roundedRect(x, y, 2, cardHeight, 1, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate);
    doc.text(card.label.toUpperCase(), x + 6, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);

    const value = doc.splitTextToSize(
      card.value,
      cardWidth - 12
    );

    doc.text(value[0], x + 6, y + 15);
  });

  return (
    startY +
    Math.ceil(cards.length / columns) * (cardHeight + gap)
  );
};

const addSectionTitle = (
  doc: jsPDF,
  title: string,
  y: number
): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);
  doc.text(title, LEFT, y);

  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(0.8);
  doc.line(LEFT, y + 2, RIGHT, y + 2);

  return y + 8;
};

const addTable = (
  doc: jsPDF,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  startY: number
): number => {
  let y = addSectionTitle(doc, title, startY);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows.length ? rows : [["No records available"]],
    theme: "grid",
    margin: {
      left: LEFT,
      right: LEFT,
      top: 43,
      bottom: 18,
    },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 3,
      textColor: COLORS.slate,
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
    },
  });

  const finalY = (
    doc as jsPDF & { lastAutoTable: { finalY: number } }
  ).lastAutoTable.finalY;

  return finalY + 12;
};

const addHeaderAndFooter = async (
  doc: jsPDF,
  title: string,
  generatedAt: unknown
): Promise<void> => {
  const logo = await loadLogo();
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    // Header background
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, PAGE_WIDTH, 35, "F");

    // PawPath logo
    doc.addImage(logo, "JPEG", LEFT, 6, 22, 22);

    // Brand name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...COLORS.white);
    doc.text("PAWPATH", 42, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(203, 221, 232);
    doc.text(
      "PET SALES & TRAINING MANAGEMENT SYSTEM",
      42,
      20
    );

    // Report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.text(title, RIGHT, 14, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(203, 221, 232);
    doc.text(
      `Generated: ${formatDateTime(generatedAt)}`,
      RIGHT,
      21,
      { align: "right" }
    );

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(LEFT, 284, RIGHT, 284);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "PawPath | Confidential - Administrator Use Only",
      LEFT,
      290
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      RIGHT,
      290,
      { align: "right" }
    );
  }
};

const buildPetSalesReport = (
  doc: jsPDF,
  data: ReportData
): void => {
  const summary = data.summary || {};
  const sales = Array.isArray(data.sales) ? data.sales : [];

  let y = 45;

  y = addSummaryCards(
    doc,
    [
      {
        label: "Approved Orders",
        value: String(summary.totalApprovedOrders || 0),
      },
      {
        label: "Pets Sold",
        value: String(summary.totalPetsSold || 0),
      },
      {
        label: "Total Sales Value",
        value: formatCurrency(summary.totalSalesValue),
      },
    ],
    y
  );

  y += 5;

  addTable(
    doc,
    "Pet Sales Details",
    [
      "Order ID",
      "Pet Name",
      "Species",
      "Breed",
      "Customer",
      "Sale Date",
      "Price (LKR)",
    ],
    sales.map((sale: ReportData) => [
      textValue(sale.orderId),
      textValue(sale.petName),
      textValue(sale.species),
      textValue(sale.breed),
      textValue(sale.customerName),
      formatDate(sale.saleDate),
      Number(sale.petPrice || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
      }),
    ]),
    y
  );
};

const buildTrainingReport = (
  doc: jsPDF,
  data: ReportData
): void => {
  const summary = data.summary || {};
  const bookings = Array.isArray(data.bookings)
    ? data.bookings
    : [];

  let y = 45;

  y = addSummaryCards(
    doc,
    [
      {
        label: "Total Bookings",
        value: String(summary.total || 0),
      },
      {
        label: "Completed Bookings",
        value: String(summary.completed || 0),
      },
      {
        label: "Average Progress",
        value: `${Number(summary.averageProgress || 0).toFixed(1)}%`,
      },
      {
        label: "Training Sessions",
        value: String(summary.totalSessions || 0),
      },
    ],
    y
  );

  y += 5;

  y = addTable(
    doc,
    "Training Booking Summary",
    [
      "Booking ID",
      "Program",
      "Customer",
      "Trainer",
      "Pet",
      "Status",
      "Progress",
    ],
    bookings.map((booking: ReportData) => [
      textValue(booking.bookingId),
      textValue(booking.trainingProgramName),
      textValue(booking.customerName),
      textValue(booking.trainerName),
      textValue(booking.petName),
      textValue(booking.status),
      `${Number(booking.progressPercentage || 0)}%`,
    ]),
    y
  );

  const sessionRows: (string | number)[][] = [];

  bookings.forEach((booking: ReportData) => {
    const sessions = Array.isArray(booking.sessions)
      ? booking.sessions
      : [];

    sessions.forEach((session: ReportData) => {
      sessionRows.push([
        textValue(booking.bookingId),
        formatDate(session.sessionDate),
        `${Number(session.durationMinutes || 0)} min`,
        textValue(session.petCondition),
        `${Number(session.progressPercentage || 0)}%`,
        textValue(session.trainerNotes),
      ]);
    });
  });

  addTable(
    doc,
    "Training Session Details",
    [
      "Booking ID",
      "Session Date",
      "Duration",
      "Pet Condition",
      "Progress",
      "Trainer Notes",
    ],
    sessionRows,
    y
  );
};

const buildPaymentReport = (
  doc: jsPDF,
  data: ReportData
): void => {
  const summary = data.summary || {};
  const financial = data.financialSummary || {};
  const payments = Array.isArray(data.payments)
    ? data.payments
    : [];

  let y = 45;

  y = addSummaryCards(
    doc,
    [
      {
        label: "Total Payments",
        value: String(summary.total || 0),
      },
      {
        label: "Paid",
        value: String(summary.paid || 0),
      },
      {
        label: "Collected Revenue",
        value: formatCurrency(
          financial.totalCollectedRevenue
        ),
      },
      {
        label: "Outstanding Balance",
        value: formatCurrency(
          financial.totalOutstandingBalance
        ),
      },
    ],
    y
  );

  y += 5;

  y = addTable(
    doc,
    "Payment Records",
    [
      "Payment ID",
      "Type",
      "Reference",
      "Customer",
      "Date",
      "Final Amount",
      "Paid",
      "Balance",
      "Status",
    ],
    payments.map((payment: ReportData) => [
      textValue(payment.paymentId),
      textValue(payment.paymentType),
      textValue(payment.referenceId),
      textValue(payment.customerName),
      formatDate(payment.paymentDate),
      formatCurrency(payment.finalAmount),
      formatCurrency(payment.paidAmount),
      formatCurrency(payment.balance),
      textValue(payment.status),
    ]),
    y
  );

  const transactionRows: (string | number)[][] = [];

  payments.forEach((payment: ReportData) => {
    const transactions = Array.isArray(payment.transactions)
      ? payment.transactions
      : [];

    transactions.forEach((transaction: ReportData) => {
      transactionRows.push([
        textValue(payment.paymentId),
        textValue(transaction.transactionId),
        formatDate(transaction.paymentDate),
        formatCurrency(transaction.amount),
        textValue(transaction.paymentMethod),
        textValue(transaction.referenceNumber),
        textValue(transaction.receivedBy),
      ]);
    });
  });

  addTable(
    doc,
    "Payment Transaction Details",
    [
      "Payment ID",
      "Transaction ID",
      "Date",
      "Amount",
      "Method",
      "Reference",
      "Received By",
    ],
    transactionRows,
    y
  );
};

const buildSystemSummaryReport = (
  doc: jsPDF,
  data: ReportData
): void => {
  const overview = data.overview || {};
  const pets = data.petSummary || {};
  const orders = data.petOrderSummary || {};
  const programs = data.trainingProgramSummary || {};
  const bookings = data.trainingBookingSummary || {};
  const users = data.userSummary || {};
  const payments = data.paymentSummary || {};
  const financial = data.financialSummary || {};

  let y = 45;

  y = addSummaryCards(
    doc,
    [
      {
        label: "Total Users",
        value: String(overview.totalUsers || 0),
      },
      {
        label: "Total Pets",
        value: String(overview.totalPets || 0),
      },
      {
        label: "Training Bookings",
        value: String(overview.totalTrainingBookings || 0),
      },
      {
        label: "Collected Revenue",
        value: formatCurrency(
          financial.totalCollectedRevenue
        ),
      },
      {
        label: "Outstanding Balance",
        value: formatCurrency(
          financial.totalOutstandingBalance
        ),
      },
      {
        label: "Payment Records",
        value: String(overview.totalPaymentRecords || 0),
      },
    ],
    y
  );

  y += 5;

  y = addTable(
    doc,
    "Pet Management Summary",
    ["Category", "Count"],
    [
      ["Total Pets", pets.total || 0],
      ["Available Pets", pets.available || 0],
      ["Sold Pets", pets.sold || 0],
      ["Reserved Pets", pets.reserved || 0],
    ],
    y
  );

  y = addTable(
    doc,
    "Pet Orders Summary",
    ["Category", "Count"],
    [
      ["Total Orders", orders.total || 0],
      ["Pending Orders", orders.pending || 0],
      ["Approved Orders", orders.approved || 0],
      ["Rejected Orders", orders.rejected || 0],
      ["Cancelled Orders", orders.cancelled || 0],
    ],
    y
  );

  y = addTable(
    doc,
    "Training Programs Summary",
    ["Category", "Count"],
    [
      ["Total Programs", programs.total || 0],
      ["Active Programs", programs.active || 0],
      ["Inactive Programs", programs.inactive || 0],
    ],
    y
  );

  y = addTable(
    doc,
    "Training Bookings Summary",
    ["Category", "Count"],
    [
      ["Total Bookings", bookings.total || 0],
      ["Pending", bookings.pending || 0],
      ["Approved", bookings.approved || 0],
      ["Rejected", bookings.rejected || 0],
      ["In Progress", bookings.inProgress || 0],
      ["Completed", bookings.completed || 0],
      ["Cancelled", bookings.cancelled || 0],
    ],
    y
  );

  y = addTable(
    doc,
    "User Summary",
    ["Category", "Count"],
    [
      ["Total Users", users.total || 0],
      ["Administrators", users.admins || 0],
      ["Trainers", users.trainers || 0],
      ["Customers", users.customers || 0],
      ["Active Users", users.active || 0],
      ["Inactive Users", users.inactive || 0],
    ],
    y
  );

  y = addTable(
    doc,
    "Payment Summary",
    ["Category", "Count"],
    [
      ["Total Payments", payments.total || 0],
      ["Paid", payments.paid || 0],
      ["Partially Paid", payments.partiallyPaid || 0],
      ["Unpaid", payments.unpaid || 0],
      ["Refunded", payments.refunded || 0],
    ],
    y
  );

  addTable(
    doc,
    "Financial Summary",
    ["Category", "Amount"],
    [
      [
        "Total Collected Revenue",
        formatCurrency(financial.totalCollectedRevenue),
      ],
      [
        "Total Outstanding Balance",
        formatCurrency(financial.totalOutstandingBalance),
      ],
    ],
    y
  );
};

export const generateReportPDF = async (
  reportType: ReportType,
  data: ReportData
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const reportTitles: Record<ReportType, string> = {
    "pet-sales": "Pet Sales Report",
    training: "Training Management Report",
    payments: "Payment Management Report",
    "system-summary": "System Summary Report",
  };

  const title = reportTitles[reportType];
  const generatedAt = data.reportInfo?.generatedAt || new Date();

  switch (reportType) {
    case "pet-sales":
      buildPetSalesReport(doc, data);
      break;

    case "training":
      buildTrainingReport(doc, data);
      break;

    case "payments":
      buildPaymentReport(doc, data);
      break;

    case "system-summary":
      buildSystemSummaryReport(doc, data);
      break;
  }

  await addHeaderAndFooter(doc, title, generatedAt);

  return doc.output("blob");
};

export const downloadReportPDF = async (
  reportType: ReportType,
  data: ReportData,
  fileName: string
): Promise<void> => {
  const pdfBlob = await generateReportPDF(reportType, data);
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
};