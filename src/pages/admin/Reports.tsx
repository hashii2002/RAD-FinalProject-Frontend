import { useState } from "react";
import {
  FileText,
  PawPrint,
  GraduationCap,
  Wallet,
  ChartNoAxesCombined,
  Eye,
  Download,
  Loader2,
  FileDown,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import api from "../../service/api";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  fileName: string;
  icon: React.ElementType;
  color: string;
  background: string;
  features: string[];
}

const reports: ReportItem[] = [
  {
    id: "pet-sales",
    title: "Pet Sales Report",
    description:
      "View detailed pet sales information, customer orders and sales performance.",
    endpoint: "/reports/pet-sales",
    fileName: "PawPath-Pet-Sales-Report.pdf",
    icon: PawPrint,
    color: "text-blue-600",
    background: "bg-blue-50",
    features: [
      "Pet sales summary",
      "Order status details",
      "Customer information",
      "Sales performance",
    ],
  },
  {
    id: "training",
    title: "Training Report",
    description:
      "Analyze training bookings, trainer assignments, sessions and training progress.",
    endpoint: "/reports/training",
    fileName: "PawPath-Training-Report.pdf",
    icon: GraduationCap,
    color: "text-teal-600",
    background: "bg-teal-50",
    features: [
      "Training booking summary",
      "Trainer assignments",
      "Training session details",
      "Progress information",
    ],
  },
  {
    id: "payments",
    title: "Payment Report",
    description:
      "Review payment transactions, discounts, received payments and outstanding balances.",
    endpoint: "/reports/payments",
    fileName: "PawPath-Payment-Report.pdf",
    icon: Wallet,
    color: "text-orange-600",
    background: "bg-orange-50",
    features: [
      "Payment summary",
      "Payment transactions",
      "Discount information",
      "Outstanding balances",
    ],
  },
  {
    id: "system-summary",
    title: "System Summary Report",
    description:
      "Get an overall overview of PawPath system activities and management performance.",
    endpoint: "/reports/system-summary",
    fileName: "PawPath-System-Summary-Report.pdf",
    icon: ChartNoAxesCombined,
    color: "text-purple-600",
    background: "bg-purple-50",
    features: [
      "Total users overview",
      "Pet management summary",
      "Training overview",
      "Financial summary",
    ],
  },
];

const Reports = () => {
  const [loadingReport, setLoadingReport] = useState<string | null>(
    null
  );

  const [loadingAction, setLoadingAction] = useState<
    "view" | "download" | null
  >(null);

  const [errorMessage, setErrorMessage] = useState("");

  const getErrorMessage = async (error: unknown): Promise<string> => {
    const axiosError = error as {
      response?: {
        data?: unknown;
      };
      message?: string;
    };

    const responseData = axiosError.response?.data;

    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        const parsed = JSON.parse(text);
        return parsed.message || "Unable to generate report.";
      } catch {
        return "Unable to generate report. Please try again.";
      }
    }

    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData
    ) {
      return String(
        (responseData as { message: string }).message
      );
    }

    return axiosError.message || "Something went wrong.";
  };

  const handleViewReport = async (report: ReportItem) => {
    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      setErrorMessage(
        "Please allow pop-ups in your browser to view PDF reports."
      );
      return;
    }

    setLoadingReport(report.id);
    setLoadingAction("view");
    setErrorMessage("");

    try {
      newWindow.document.write(`
        <html>
          <head>
            <title>Loading Report...</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #18365C;
              }
            </style>
          </head>
          <body>
            <h3>Generating your PawPath report...</h3>
          </body>
        </html>
      `);

      const response = await api.get(report.endpoint, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      newWindow.location.href = pdfUrl;

      const releaseUrl = () => URL.revokeObjectURL(pdfUrl);

      newWindow.addEventListener("beforeunload", releaseUrl, {
        once: true,
      });
    } catch (error) {
      newWindow.close();
      setErrorMessage(await getErrorMessage(error));
    } finally {
      setLoadingReport(null);
      setLoadingAction(null);
    }
  };

  const handleDownloadReport = async (report: ReportItem) => {
    setLoadingReport(report.id);
    setLoadingAction("download");
    setErrorMessage("");

    try {
      const response = await api.get(report.endpoint, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = report.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      setErrorMessage(await getErrorMessage(error));
    } finally {
      setLoadingReport(null);
      setLoadingAction(null);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>

              <span className="text-sm font-semibold text-indigo-600">
                PAWPATH MANAGEMENT
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Generate, view and download detailed reports about
              pet sales, training activities and financial operations.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-teal-600" />

            <div>
              <p className="text-xs font-medium text-slate-400">
                ACCESS LEVEL
              </p>
              <p className="text-sm font-semibold text-slate-700">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Report Information */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available Reports
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {reports.length}
                </h2>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Management report categories
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Report Format
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  PDF
                </h2>
              </div>

              <div className="rounded-xl bg-orange-50 p-3">
                <FileDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Printable and downloadable documents
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Generated Date
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {new Date().toLocaleDateString("en-GB")}
                </h2>
              </div>

              <div className="rounded-xl bg-teal-50 p-3">
                <CalendarDays className="h-6 w-6 text-teal-600" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Current report generation date
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Report Generation Failed
              </p>
              <p className="mt-1 text-sm text-red-600">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => setErrorMessage("")}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Report Cards */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Reports
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a report to view or download.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {reports.map((report) => {
            const Icon = report.icon;
            const isLoading = loadingReport === report.id;

            return (
              <div
                key={report.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg sm:p-6"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.background}`}
                  >
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    PDF REPORT
                  </span>
                </div>

                {/* Card Content */}
                <div className="mt-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {report.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {report.description}
                  </p>
                </div>

                {/* Report Features */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Report Includes
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {report.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={() => handleViewReport(report)}
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading && loadingAction === "view" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                    View Report
                  </button>

                  <button
                    onClick={() => handleDownloadReport(report)}
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading && loadingAction === "download" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}

                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}

        </div>

        {/* Bottom Information */}
        <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Report Information
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                All reports are generated using the latest available
                information in the PawPath database. Reports are
                accessible only to authorized administrators.
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Reports;

