import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Analytics = ({ onBack }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/plant/history");

      console.log("Analytics Data:", response.data);

      setHistoryData(response.data);
    } catch (error) {
      console.error("Analytics Data Error:", error);

      setError(
        "Unable to load analytics data. Please check whether the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const chartData = historyData.map((item) => ({
    time: new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    hydrogenProduction: item.hydrogenProduction,
    powerConsumption: item.powerConsumption,
    waterUsage: item.waterUsage,
    efficiency: item.systemEfficiency,
  }));

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
            marginBottom: "25px",
        }}
        >
        <div
            style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            }}
        >
            <h1
            style={{
                margin: 0,
                fontSize: "28px",
                color: "#0f172a",
            }}
            >
            Plant Analytics
            </h1>

            <button
            onClick={onBack}
            style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
            }}
            >
            ← Back to Dashboard
            </button>
        </div>

        <p
            style={{
            marginTop: "8px",
            color: "#64748b",
            }}
        >
            Historical analysis of hydrogen production, power consumption,
            water usage and system efficiency.
        </p>
        </div>

      {loading && <p>Loading analytics data...</p>}

      {error && (
        <div
          style={{
            padding: "15px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && historyData.length === 0 && (
        <div
          style={{
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "10px",
          }}
        >
          No historical plant data available.
        </div>
      )}

      {!loading && !error && historyData.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ color: "#64748b", margin: 0 }}>
                Data Records
              </p>

              <h2 style={{ margin: "8px 0 0" }}>
                {historyData.length}
              </h2>
            </div>

            <div
              style={{
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ color: "#64748b", margin: 0 }}>
                Latest Production
              </p>

              <h2 style={{ margin: "8px 0 0" }}>
                {
                  historyData[historyData.length - 1]
                    .hydrogenProduction
                }{" "}
                kg/day
              </h2>
            </div>

            <div
              style={{
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ color: "#64748b", margin: 0 }}>
                Latest Efficiency
              </p>

              <h2 style={{ margin: "8px 0 0" }}>
                {
                  historyData[historyData.length - 1]
                    .systemEfficiency
                }
                %
              </h2>
            </div>

            <div
              style={{
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p style={{ color: "#64748b", margin: 0 }}>
                Latest Power
              </p>

              <h2 style={{ margin: "8px 0 0" }}>
                {
                  historyData[historyData.length - 1]
                    .powerConsumption
                }{" "}
                kW
              </h2>
            </div>
          </div>

          <section
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "25px",
              overflowX: "auto",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Hydrogen Production Trend
            </h2>

            <LineChart
              width={850}
              height={350}
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="hydrogenProduction"
                name="Hydrogen Production"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </section>

          <section
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              overflowX: "auto",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Plant Performance Trends
            </h2>

            <LineChart
              width={850}
              height={350}
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="powerConsumption"
                name="Power Consumption"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="waterUsage"
                name="Water Usage"
                stroke="#0891b2"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="efficiency"
                name="System Efficiency"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;