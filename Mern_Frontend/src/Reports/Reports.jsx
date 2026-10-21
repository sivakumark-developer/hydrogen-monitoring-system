import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import { jsPDF } from "jspdf";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const API_URL = "https://hydrogen-monitoring-system.onrender.com/api/plant";

const PERIODS = {
  TODAY: "Today",
  LAST_24_HOURS: "Last 24 Hours",
  LAST_7_DAYS: "Last 7 Days",
  ALL_RECORDS: "All Records",
  CUSTOM: "Custom Date Range",
};

const panelStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.045)",
};

const buttonStyle = {
  padding: "10px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontWeight: "600",
};

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#334155",
  background: "#ffffff",
  width: "100%",
  boxSizing: "border-box",
};

const formatDateTime = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "N/A"
    : parsed.toLocaleString();
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
};

const toChartNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();

  let backgroundColor = "#e2e8f0";
  let textColor = "#475569";

  if (["active", "operational"].includes(normalized)) {
    backgroundColor = "#dcfce7";
    textColor = "#166534";
  } else if (normalized === "maintenance") {
    backgroundColor = "#ffedd5";
    textColor = "#c2410c";
  } else if (normalized === "warning") {
    backgroundColor = "#fef9c3";
    textColor = "#a16207";
  } else if (["shutdown", "inactive"].includes(normalized)) {
    backgroundColor = "#fee2e2";
    textColor = "#b91c1c";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "20px",
        backgroundColor,
        color: textColor,
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {status || "N/A"}
    </span>
  );
};

const ReportCard = ({ title, value, unit, description }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "22px",
      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.045)",
      minWidth: 0,
    }}
  >
    <p
      style={{
        margin: "0 0 8px",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      {title}
    </p>

    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
      <span
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#0f172a",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>

      {unit && (
        <span style={{ fontSize: "13px", color: "#64748b" }}>{unit}</span>
      )}
    </div>

    <p
      style={{
        margin: "8px 0 0",
        color: "#94a3b8",
        fontSize: "12px",
      }}
    >
      {description}
    </p>
  </div>
);

const ChartEmptyMessage = ({ message }) => (
  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#64748b",
      fontSize: "14px",
      textAlign: "center",
      padding: "20px",
      boxSizing: "border-box",
    }}
  >
    {message}
  </div>
);

const ChartPanel = ({ title, description, children }) => (
  <div style={panelStyle}>
    <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>{title}</h3>

    <p
      style={{
        margin: "0 0 20px",
        color: "#64748b",
        fontSize: "13px",
      }}
    >
      {description}
    </p>

    <div
      style={{
        width: "100%",
        height: "340px",
        minWidth: 0,
        minHeight: "340px",
        position: "relative",
      }}
    >
      {children}
    </div>
  </div>
);

const Reports = ({ onBack }) => {
  const [plantHistory, setPlantHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState(
    PERIODS.ALL_RECORDS
  );

  const [customStartDate, setCustomStartDate] = useState(
    getLocalDateString()
  );

  const [customEndDate, setCustomEndDate] = useState(
    getLocalDateString()
  );

  const fetchPlantHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/plant/history");

      if (!Array.isArray(response.data)) {
        throw new Error("The history API did not return an array.");
      }

      console.log("Reports: records received:", response.data.length);
      console.log("Reports: first record:", response.data[0]);

      setPlantHistory(response.data);
    } catch (err) {
      console.error("Reports Error:", err);

      setError(
        "Unable to load report data. Check the backend server and the /api/plant/history endpoint."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlantHistory();
  }, [fetchPlantHistory]);

  const sortedHistory = useMemo(() => {
    return [...plantHistory].sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();

      return dateB - dateA;
    });
  }, [plantHistory]);

  const filteredHistory = useMemo(() => {
    const now = new Date();
    let startTime;
    let endTime = now.getTime();

    if (selectedPeriod === PERIODS.TODAY) {
      startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();

      endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).getTime();
    } else if (selectedPeriod === PERIODS.LAST_24_HOURS) {
      startTime = now.getTime() - 24 * 60 * 60 * 1000;
    } else if (selectedPeriod === PERIODS.LAST_7_DAYS) {
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (selectedPeriod === PERIODS.CUSTOM) {
      if (
        !customStartDate ||
        !customEndDate ||
        customStartDate > customEndDate
      ) {
        return [];
      }

      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T00:00:00`);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return [];
      }

      startTime = start.getTime();

      endTime = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate() + 1
      ).getTime();
    } else {
      return sortedHistory;
    }

    return sortedHistory.filter((record) => {
      const timestamp = new Date(record.createdAt || "").getTime();

      return (
        Number.isFinite(timestamp) &&
        timestamp >= startTime &&
        timestamp < endTime
      );
    });
  }, [
    sortedHistory,
    selectedPeriod,
    customStartDate,
    customEndDate,
  ]);

  const latestRecord = filteredHistory[0] || null;

  // Convert each record into finite numeric values for Recharts.
  // Keep the timestamp numeric so the time axis can render chronologically.
  const chartData = useMemo(() => {
    return filteredHistory
      .map((record) => {
        const timestamp = new Date(record.createdAt || "").getTime();

        if (!Number.isFinite(timestamp)) return null;

        return {
          timestamp,
          label: new Date(timestamp).toLocaleDateString(),
          production: toChartNumber(record.hydrogenProduction),
          target: toChartNumber(record.productionTarget),
          efficiency: toChartNumber(record.systemEfficiency),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredHistory]);

  const productionChartData = useMemo(
    () =>
      chartData.filter(
        (record) =>
          record.production !== null || record.target !== null
      ),
    [chartData]
  );

  const efficiencyChartData = useMemo(
    () =>
      chartData.filter((record) => record.efficiency !== null),
    [chartData]
  );

  useEffect(() => {
    console.log("REPORT FILTER:", selectedPeriod);
    console.log("REPORT FILTERED RECORDS:", filteredHistory.length);
    console.log("PRODUCTION CHART DATA:", productionChartData);
    console.log("EFFICIENCY CHART DATA:", efficiencyChartData);
    console.log("FIRST PRODUCTION RECORD:", productionChartData[0]);
  }, [
    selectedPeriod,
    filteredHistory,
    productionChartData,
    efficiencyChartData,
  ]);

  const getAverage = (field) => {
    const values = filteredHistory
      .map((record) => toChartNumber(record[field]))
      .filter((value) => value !== null);

    if (!values.length) return "N/A";

    return (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toFixed(1);
  };

  const averageProduction = getAverage("hydrogenProduction");
  const averageEfficiency = getAverage("systemEfficiency");
  const averagePower = getAverage("powerConsumption");
  const averageWater = getAverage("waterUsage");

  const productionAchievement =
    latestRecord &&
    toChartNumber(latestRecord.productionTarget) > 0 &&
    toChartNumber(latestRecord.hydrogenProduction) !== null
      ? (
          (toChartNumber(latestRecord.hydrogenProduction) /
            toChartNumber(latestRecord.productionTarget)) *
          100
        ).toFixed(1)
      : "N/A";

  const latestDate = latestRecord
    ? formatDateTime(latestRecord.createdAt)
    : "N/A";

  const periodDescription = () => {
    if (selectedPeriod === PERIODS.CUSTOM) {
      return `${customStartDate || "Not selected"} to ${
        customEndDate || "Not selected"
      }`;
    }

    if (selectedPeriod === PERIODS.TODAY) {
      return `Today (${getLocalDateString()})`;
    }

    if (selectedPeriod === PERIODS.LAST_24_HOURS) {
      return "Last 24 hours";
    }

    if (selectedPeriod === PERIODS.LAST_7_DAYS) {
      return "Last 7 days";
    }

    return "All available historical records";
  };

  const downloadPDF = () => {
    if (!latestRecord || !filteredHistory.length) {
      setError("No plant data is available for the selected period.");
      return;
    }

    try {
      setDownloading(true);
      setError("");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      const addPageIfNeeded = (requiredHeight = 12) => {
        if (y + requiredHeight > pageHeight - 19) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      const addSectionTitle = (title) => {
        addPageIfNeeded(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, y);
        y += 8;
      };

      const addRow = (label, value) => {
        const text = `${label}: ${formatValue(value)}`;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(text, contentWidth - 4);
        addPageIfNeeded(lines.length * 5.5 + 3);
        doc.text(lines, margin + 2, y);
        y += lines.length * 5.5 + 2;
      };

      const drawLineChart = ({
        title,
        data,
        series,
        minValue = 0,
        maxValue,
        unit,
      }) => {
        doc.addPage();
        y = 20;
        addSectionTitle(title);

        const chartX = margin + 15;
        const chartY = y + 5;
        const chartW = contentWidth - 22;
        const chartH = 78;
        const validValues = data.flatMap((row) =>
          series.map((item) => row[item.key]).filter(
            (value) => Number.isFinite(value)
          )
        );

        if (!validValues.length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text("No valid data is available for this chart.", margin, chartY + 12);
          y = chartY + 25;
          return;
        }

        const actualMax = maxValue ?? Math.max(...validValues, 1) * 1.12;
        const actualMin = minValue;
        const range = actualMax - actualMin || 1;

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        for (let i = 0; i <= 4; i += 1) {
          const gridY = chartY + chartH - (i / 4) * chartH;
          doc.line(chartX, gridY, chartX + chartW, gridY);
          const tickValue = actualMin + (range * i) / 4;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(`${tickValue.toFixed(0)}${unit}`, chartX - 3, gridY + 2, {
            align: "right",
          });
        }

        doc.line(chartX, chartY, chartX, chartY + chartH);
        doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

        const pointX = (index) =>
          chartX + (data.length <= 1 ? chartW / 2 : (index / (data.length - 1)) * chartW);
        const pointY = (value) =>
          chartY + chartH - ((value - actualMin) / range) * chartH;

        series.forEach((item) => {
          doc.setDrawColor(...item.rgb);
          doc.setFillColor(...item.rgb);
          doc.setLineWidth(0.7);
          let previous = null;

          data.forEach((row, index) => {
            const value = row[item.key];
            if (!Number.isFinite(value)) {
              previous = null;
              return;
            }
            const point = { x: pointX(index), y: pointY(value) };
            if (previous) {
              doc.line(previous.x, previous.y, point.x, point.y);
            }
            doc.circle(point.x, point.y, 0.65, "F");
            previous = point;
          });
        });

        let legendX = chartX;
        const legendY = chartY + chartH + 9;
        series.forEach((item) => {
          doc.setDrawColor(...item.rgb);
          doc.setLineWidth(1.2);
          doc.line(legendX, legendY - 1, legendX + 7, legendY - 1);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(item.name, legendX + 9, legendY + 1);
          legendX += 9 + doc.getTextWidth(item.name) + 10;
        });

        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        if (data.length > 0) {
          doc.text(data[0].label || "", chartX, chartY + chartH + 18);
          const lastLabel = data[data.length - 1].label || "";
          doc.text(lastLabel, chartX + chartW, chartY + chartH + 18, { align: "right" });
        }
        y = chartY + chartH + 27;
      };

      // Cover/header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 49, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("HYDROGEN MONITORING SYSTEM", margin, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Plant Performance Report", margin, 24);
      doc.setFontSize(9);
      const periodLines = doc.splitTextToSize(
        `Selected period: ${periodDescription()}`,
        contentWidth
      );
      doc.text(periodLines, margin, 32);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 44);

      y = 59;
      addSectionTitle("1. Performance Summary");
      addRow("Selected Period", periodDescription());
      addRow("Average Hydrogen Production", `${averageProduction} kg/day`);
      addRow("Production Achievement", `${productionAchievement}%`);
      addRow("Average System Efficiency", `${averageEfficiency}%`);
      addRow("Average Power Consumption", `${averagePower} kW`);
      addRow("Average Water Usage", `${averageWater} L/day`);
      addRow("Historical Records Analyzed", filteredHistory.length);

      y += 3;
      addSectionTitle("2. Latest Plant Reading");
      addRow("Hydrogen Production", `${formatValue(latestRecord.hydrogenProduction)} kg/day`);
      addRow("Production Target", `${formatValue(latestRecord.productionTarget)} kg/day`);
      addRow("Power Consumption", `${formatValue(latestRecord.powerConsumption)} kW`);
      addRow("Water Usage", `${formatValue(latestRecord.waterUsage)} L/day`);
      addRow("System Efficiency", `${formatValue(latestRecord.systemEfficiency)}%`);
      addRow("Latest Reading Date", latestDate);

      y += 3;
      addSectionTitle("3. Equipment and Plant Status");
      addRow("Electrolyzer 01", latestRecord.electrolyzer01Status);
      addRow("Electrolyzer 02", latestRecord.electrolyzer02Status);
      addRow("Electrolyzer 03", latestRecord.electrolyzer03Status);
      addRow("Overall Plant Status", latestRecord.plantStatus);

      // PDF charts are drawn directly with jsPDF, so no additional package is required.
      const pdfChartData = [...chartData].sort((a, b) => a.timestamp - b.timestamp);
      drawLineChart({
        title: "4. Hydrogen Production Trend",
        data: pdfChartData.map((row) => ({
          label: row.label,
          production: row.production,
          target: row.target,
        })),
        series: [
          { key: "production", name: "Actual Production", rgb: [37, 99, 235] },
          { key: "target", name: "Production Target", rgb: [249, 115, 22] },
        ],
        unit: "",
      });
      drawLineChart({
        title: "5. System Efficiency Trend",
        data: pdfChartData.map((row) => ({
          label: row.label,
          efficiency: row.efficiency,
        })),
        series: [
          { key: "efficiency", name: "System Efficiency", rgb: [22, 163, 74] },
        ],
        maxValue: 100,
        unit: "%",
      });

      // Historical readings table, split across pages when required.
      doc.addPage();
      y = 20;
      addSectionTitle("6. Historical Plant Readings");

      const columns = [
        { label: "Date / Time", key: "createdAt", width: 42 },
        { label: "Production", key: "hydrogenProduction", width: 25 },
        { label: "Target", key: "productionTarget", width: 22 },
        { label: "Power", key: "powerConsumption", width: 20 },
        { label: "Water", key: "waterUsage", width: 21 },
        { label: "Efficiency", key: "systemEfficiency", width: 25 },
      ];
      const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
      const tableX = (pageWidth - tableWidth) / 2;
      const rowHeight = 7;

      const drawTableHeader = () => {
        doc.setFillColor(226, 232, 240);
        doc.rect(tableX, y - 5, tableWidth, rowHeight + 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(15, 23, 42);
        let x = tableX;
        columns.forEach((column) => {
          doc.text(column.label, x + 1, y);
          x += column.width;
        });
        y += rowHeight;
      };
      drawTableHeader();

      const recordsForTable = [...filteredHistory].sort(
        (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
      );

      recordsForTable.forEach((record, index) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
          drawTableHeader();
        }

        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(tableX, y - 4.5, tableWidth, rowHeight, "F");
        }

        const values = [
          formatDateTime(record.createdAt),
          formatValue(record.hydrogenProduction),
          formatValue(record.productionTarget),
          formatValue(record.powerConsumption),
          formatValue(record.waterUsage),
          formatValue(record.systemEfficiency),
        ];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(51, 65, 85);
        let x = tableX;
        values.forEach((value, columnIndex) => {
          const column = columns[columnIndex];
          let text = String(value);
          while (doc.getTextWidth(text) > column.width - 2 && text.length > 4) {
            text = `${text.slice(0, -4)}...`;
          }
          doc.text(text, x + 1, y);
          x += column.width;
        });
        doc.setDrawColor(226, 232, 240);
        doc.line(tableX, y + 2, tableX + tableWidth, y + 2);
        y += rowHeight;
      });

      // Footer and page numbers are applied after all pages have been created.
      const totalPages = doc.internal.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Hydrogen Production Plant Monitoring System", margin, pageHeight - 8);
        doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 8, {
          align: "right",
        });
      }

      const safePeriod = selectedPeriod
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_");
      const dateSuffix =
        selectedPeriod === PERIODS.CUSTOM
          ? `${customStartDate}_to_${customEndDate}`
          : getLocalDateString();

      doc.save(`Hydrogen_Plant_Report_${safePeriod}_${dateSuffix}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      setError("Unable to generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const noRecords =
    !loading && !error && filteredHistory.length === 0;

  const chartAxisStyle = {
    fontSize: 11,
    fill: "#64748b",
  };

  const tooltipStyle = {
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1700px",
        margin: "0 auto",
        padding: "30px 40px 45px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#0f172a" }}>
            Plant Performance Report
          </h2>

          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>
            Summary of hydrogen production plant performance
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={fetchPlantHistory}
            disabled={loading}
            style={{
              ...buttonStyle,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>

          <button
            onClick={downloadPDF}
            disabled={loading || downloading || !latestRecord}
            style={{
              ...buttonStyle,
              border: "none",
              background:
                loading || downloading || !latestRecord
                  ? "#94a3b8"
                  : "#2563eb",
              color: "#ffffff",
              cursor:
                loading || downloading || !latestRecord
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </button>

          <button onClick={onBack} style={buttonStyle}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ ...panelStyle, textAlign: "center" }}>
          Loading report data...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "14px",
            padding: "20px",
            color: "#b91c1c",
            marginBottom: "20px",
          }}
        >
          {error}

          <button
            onClick={fetchPlantHistory}
            style={{ ...buttonStyle, marginLeft: "12px" }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={panelStyle}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>
              Report Period
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
                alignItems: "end",
              }}
            >
              <div>
                <label
                  htmlFor="report-period"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Select Period
                </label>

                <select
                  id="report-period"
                  value={selectedPeriod}
                  onChange={(event) => {
                    setSelectedPeriod(event.target.value);
                    setError("");
                  }}
                  style={inputStyle}
                >
                  {Object.values(PERIODS).map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPeriod === PERIODS.CUSTOM && (
                <>
                  <div>
                    <label
                      htmlFor="report-start-date"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Start Date
                    </label>

                    <input
                      id="report-start-date"
                      type="date"
                      value={customStartDate}
                      max={customEndDate || undefined}
                      onChange={(event) => {
                        setCustomStartDate(event.target.value);
                        setError("");
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="report-end-date"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      End Date
                    </label>

                    <input
                      id="report-end-date"
                      type="date"
                      value={customEndDate}
                      min={customStartDate || undefined}
                      onChange={(event) => {
                        setCustomEndDate(event.target.value);
                        setError("");
                      }}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: "13px",
              }}
            >
              <strong>Selected period:</strong> {periodDescription()}
              <br />
              <strong>Matching records:</strong> {filteredHistory.length}
            </div>
          </div>

          {noRecords && (
            <div
              style={{
                ...panelStyle,
                textAlign: "center",
                padding: "36px 24px",
              }}
            >
              <h3 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                No Readings Found
              </h3>

              <p style={{ color: "#64748b", margin: 0 }}>
                No historical plant readings were found for this period.
                Choose another period or select a different date range.
              </p>
            </div>
          )}

          {filteredHistory.length > 0 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "18px",
                  marginBottom: "24px",
                }}
              >
                <ReportCard
                  title="Average Production"
                  value={averageProduction}
                  unit="kg/day"
                  description="Average hydrogen production"
                />

                <ReportCard
                  title="Production Achievement"
                  value={productionAchievement}
                  unit="%"
                  description="Latest production versus target"
                />

                <ReportCard
                  title="Average Efficiency"
                  value={averageEfficiency}
                  unit="%"
                  description="Average system efficiency"
                />

                <ReportCard
                  title="Average Power"
                  value={averagePower}
                  unit="kW"
                  description="Average power consumption"
                />

                <ReportCard
                  title="Average Water"
                  value={averageWater}
                  unit="L/day"
                  description="Average water consumption"
                />

                <ReportCard
                  title="Total Records"
                  value={filteredHistory.length}
                  description="Records in selected period"
                />
              </div>

              <ChartPanel
                title="Hydrogen Production Trend"
                description="Actual hydrogen production compared with the production target for the selected period."
              >
                {productionChartData.length === 0 ? (
                  <ChartEmptyMessage message="No valid production or target values are available for this period." />
                ) : (
                  <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
                    <LineChart
                      width={1000}
                      height={300}
                      data={productionChartData}
                      margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

                      <XAxis
                        dataKey="label"
                        type="category"
                        tick={chartAxisStyle}
                        minTickGap={30}
                        tickLine={false}
                        axisLine={{ stroke: "#cbd5e1" }}
                      />

                      <YAxis
                        type="number"
                        domain={[0, "auto"]}
                        tick={chartAxisStyle}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                        label={{
                          value: "kg/day",
                          angle: -90,
                          position: "insideLeft",
                          style: { fill: "#64748b", fontSize: 12 },
                        }}
                      />

                      <Tooltip
                        labelFormatter={(value) => value}
                        formatter={(value, name) => [
                          value == null ? "N/A" : `${value} kg/day`,
                          name,
                        ]}
                        contentStyle={tooltipStyle}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="production"
                        name="Actual Production"
                        stroke="#2563eb"
                        strokeWidth={3}
                        connectNulls
                        dot={{ r: 3, fill: "#2563eb" }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />

                      <Line
                        type="monotone"
                        dataKey="target"
                        name="Production Target"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        connectNulls
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </div>
                )}
              </ChartPanel>

              <ChartPanel
                title="System Efficiency Trend"
                description="Historical system efficiency readings for the selected reporting period."
              >
                {efficiencyChartData.length === 0 ? (
                  <ChartEmptyMessage message="No valid system efficiency values are available for this period." />
                ) : (
                  <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
                    <LineChart
                      width={1000}
                      height={300}
                      data={efficiencyChartData}
                      margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />

                      <XAxis
                        dataKey="label"
                        type="category"
                        tick={chartAxisStyle}
                        minTickGap={30}
                        tickLine={false}
                        axisLine={{ stroke: "#cbd5e1" }}
                      />

                      <YAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        tick={chartAxisStyle}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                        label={{
                          value: "Efficiency",
                          angle: -90,
                          position: "insideLeft",
                          style: { fill: "#64748b", fontSize: 12 },
                        }}
                      />

                      <Tooltip
                        labelFormatter={(value) => value}
                        formatter={(value) => [
                          value == null ? "N/A" : `${value}%`,
                          "System Efficiency",
                        ]}
                        contentStyle={tooltipStyle}
                      />

                      <Legend />

                      <ReferenceLine
                        y={90}
                        stroke="#f97316"
                        strokeDasharray="6 4"
                        label={{
                          value: "90% Reference",
                          fill: "#f97316",
                          fontSize: 11,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        name="System Efficiency"
                        stroke="#16a34a"
                        strokeWidth={3}
                        connectNulls
                        dot={{ r: 3, fill: "#16a34a" }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </div>
                )}
              </ChartPanel>

              <div style={panelStyle}>
                <h3 style={{ margin: "0 0 18px", color: "#0f172a" }}>
                  Latest Plant Performance
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {[
                    [
                      "Hydrogen Production",
                      `${formatValue(latestRecord.hydrogenProduction)} kg/day`,
                    ],
                    [
                      "Production Target",
                      `${formatValue(latestRecord.productionTarget)} kg/day`,
                    ],
                    [
                      "Power Consumption",
                      `${formatValue(latestRecord.powerConsumption)} kW`,
                    ],
                    [
                      "Water Usage",
                      `${formatValue(latestRecord.waterUsage)} L/day`,
                    ],
                    [
                      "System Efficiency",
                      `${formatValue(latestRecord.systemEfficiency)}%`,
                    ],
                    ["Latest Reading", latestDate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p
                        style={{
                          margin: "0 0 8px",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        {label}
                      </p>

                      <strong style={{ color: "#0f172a" }}>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={panelStyle}>
                <h3 style={{ margin: "0 0 18px", color: "#0f172a" }}>
                  Equipment &amp; Plant Status
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {[
                    ["Electrolyzer 01", latestRecord.electrolyzer01Status],
                    ["Electrolyzer 02", latestRecord.electrolyzer02Status],
                    ["Electrolyzer 03", latestRecord.electrolyzer03Status],
                    ["Overall Plant", latestRecord.plantStatus],
                  ].map(([label, status]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{ color: "#334155", fontWeight: "500" }}>
                        {label}
                      </span>

                      <StatusBadge status={status} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  ...panelStyle,
                  background: "#f8fafc",
                  boxShadow: "none",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px",
                    color: "#0f172a",
                    fontSize: "18px",
                  }}
                >
                  Report Information
                </h3>

                <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                  Data source: Hydrogen Monitoring System
                </p>

                <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                  Selected period: {periodDescription()}
                </p>

                <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                  Records analyzed: {filteredHistory.length}
                </p>

                <p style={{ margin: "6px 0", color: "#475569", fontSize: "14px" }}>
                  Latest reading: {latestDate}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;