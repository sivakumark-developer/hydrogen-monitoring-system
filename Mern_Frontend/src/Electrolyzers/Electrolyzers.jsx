import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function Electrolyzers({ onBack }) {
  console.log("🔥 ELECTROLYZER COMPONENT LOADED");

  const [electrolyzers, setElectrolyzers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [readingData, setReadingData] = useState({
    unitId: "01",
    hydrogenOutput: "",
    powerConsumption: "",
    efficiency: "",
    status: "Active",
    operatingCondition: "Normal",
  });

  const [savingReading, setSavingReading] = useState(false);

  // ======================================================
  // FETCH LATEST ELECTROLYZER DATA
  // ======================================================

  const fetchElectrolyzers = async () => {
    console.log("🔥 fetchElectrolyzers CALLED");

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/electrolyzers"
      );

      console.log("Electrolyzer Data:", response.data);

      setElectrolyzers(response.data);
    } catch (error) {
      console.error("Error fetching electrolyzer data:", error);

      setError("Unable to load electrolyzer data.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH ELECTROLYZER HISTORY
  // ======================================================

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/electrolyzers/history"
      );

      console.log("Electrolyzer History:", response.data);

      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching electrolyzer history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ======================================================
  // SAVE NEW ELECTROLYZER READING
  // ======================================================

  const handleSaveReading = async (e) => {
    e.preventDefault();

    try {
      setSavingReading(true);

      const selectedUnit = electrolyzers.find(
        (unit) => unit.unitId === readingData.unitId
      );

      if (!selectedUnit) {
        alert("Selected electrolyzer was not found.");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/electrolyzers/add",
        {
          unitId: readingData.unitId,
          unitName: selectedUnit.unitName,
          status: readingData.status,
          hydrogenOutput: Number(readingData.hydrogenOutput),
          powerConsumption: Number(readingData.powerConsumption),
          efficiency: Number(readingData.efficiency),
          operatingCondition: readingData.operatingCondition,
        }
      );

      setReadingData({
        unitId: "01",
        hydrogenOutput: "",
        powerConsumption: "",
        efficiency: "",
        status: "Active",
        operatingCondition: "Normal",
      });

      await fetchElectrolyzers();
      await fetchHistory();

      alert("New electrolyzer reading recorded successfully.");
    } catch (error) {
      console.error("Error saving electrolyzer reading:", error);

      alert("Unable to save electrolyzer reading.");
    } finally {
      setSavingReading(false);
    }
  };

  // ======================================================
  // LOAD DATA WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    console.log("🔥 USE EFFECT RUNNING");

    fetchElectrolyzers();
    fetchHistory();
  }, []);

  // ======================================================
  // CALCULATIONS
  // ======================================================

  const activeUnits = electrolyzers.filter(
    (unit) => unit.status === "Active"
  ).length;

  const maintenanceUnits = electrolyzers.filter(
    (unit) => unit.status === "Maintenance"
  ).length;

  const totalHydrogenOutput = electrolyzers.reduce(
    (total, unit) => total + Number(unit.hydrogenOutput || 0),
    0
  );

  // ======================================================
  // CHART DATA
  // ======================================================

  const chartData = history.map((record) => ({
    time: record.createdAt
      ? new Date(record.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",

    unitId: record.unitId,

    unitName: record.unitName,

    hydrogenOutput: Number(record.hydrogenOutput || 0),
  }));

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Electrolyzer Monitoring</h1>

            <p>
              Monitor individual electrolyzer units and their operating
              performance.
            </p>
          </div>

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

        <div className="electrolyzer-summary">
          <div>
            <span>System Status</span>

            <strong>Loading...</strong>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Electrolyzer Monitoring</h1>

            <p>
              Monitor individual electrolyzer units and their operating
              performance.
            </p>
          </div>

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

        <div className="electrolyzer-summary">
          <div>
            <span>System Status</span>

            <strong>{error}</strong>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN ELECTROLYZER PAGE
  // ======================================================

  return (
    <div className="page-container">
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <div className="page-header">
        <div>
          <h1>Electrolyzer Monitoring</h1>

          <p>
            Monitor individual electrolyzer units and their operating
            performance.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
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

          <div className="page-status">
            <span className="status-dot"></span>

            Plant Monitoring Active
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* NO DATA */}
      {/* ====================================================== */}

      {electrolyzers.length === 0 ? (
        <div className="electrolyzer-summary">
          <div>
            <span>System Status</span>

            <strong>No electrolyzer data available</strong>
          </div>
        </div>
      ) : (
        <>
          {/* ====================================================== */}
          {/* ELECTROLYZER CARDS */}
          {/* ====================================================== */}

          <div className="electrolyzer-grid">
            {electrolyzers.map((unit) => (
              <div className="electrolyzer-card" key={unit._id}>
                <div className="electrolyzer-card-header">
                  <div>
                    <span className="unit-label">
                      UNIT {unit.unitId}
                    </span>

                    <h2>{unit.unitName}</h2>
                  </div>

                  <span
                    className={`electrolyzer-status ${
                      unit.status === "Active"
                        ? "status-active"
                        : unit.status === "Maintenance"
                        ? "status-maintenance"
                        : "status-inactive"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="electrolyzer-condition">
                  <span>Operating Condition</span>

                  <strong>{unit.operatingCondition}</strong>
                </div>

                <div className="electrolyzer-metrics">
                  <div className="metric-box">
                    <span>Hydrogen Output</span>

                    <strong>
                      {unit.hydrogenOutput} kg/day
                    </strong>
                  </div>

                  <div className="metric-box">
                    <span>Power Consumption</span>

                    <strong>
                      {unit.powerConsumption} kW
                    </strong>
                  </div>

                  <div className="metric-box">
                    <span>Efficiency</span>

                    <strong>{unit.efficiency}%</strong>
                  </div>

                  <div className="metric-box">
                    <span>Last Updated</span>

                    <strong>
                      {unit.updatedAt
                        ? new Date(
                            unit.updatedAt
                          ).toLocaleTimeString()
                        : "Just now"}
                    </strong>
                  </div>
                </div>

                <div className="efficiency-section">
                  <div className="efficiency-header">
                    <span>Efficiency</span>

                    <strong>{unit.efficiency}%</strong>
                  </div>

                  <div className="efficiency-bar">
                    <div
                      className="efficiency-fill"
                      style={{
                        width: `${unit.efficiency}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ====================================================== */}
          {/* SUMMARY */}
          {/* ====================================================== */}

          <div className="electrolyzer-summary">
            <div>
              <span>Total Units</span>

              <strong>{electrolyzers.length}</strong>
            </div>

            <div>
              <span>Active Units</span>

              <strong>{activeUnits}</strong>
            </div>

            <div>
              <span>Maintenance</span>

              <strong>{maintenanceUnits}</strong>
            </div>

            <div>
              <span>Total Hydrogen Output</span>

              <strong>{totalHydrogenOutput} kg/day</strong>
            </div>
          </div>

          {/* ====================================================== */}
          {/* RECORD NEW READING */}
          {/* ====================================================== */}

          <div className="record-reading">
            <div className="record-reading-header">
              <div>
                <h2>Record New Reading</h2>

                <p>
                  Enter the latest operating data for an electrolyzer
                  unit.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveReading}
              className="reading-form"
            >
              <div className="form-field">
                <label>Electrolyzer Unit</label>

                <select
                  value={readingData.unitId}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      unitId: e.target.value,
                    })
                  }
                >
                  {electrolyzers.map((unit) => (
                    <option
                      key={unit._id}
                      value={unit.unitId}
                    >
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Hydrogen Output (kg/day)</label>

                <input
                  type="number"
                  min="0"
                  value={readingData.hydrogenOutput}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      hydrogenOutput: e.target.value,
                    })
                  }
                  placeholder="e.g. 55"
                  required
                />
              </div>

              <div className="form-field">
                <label>Power Consumption (kW)</label>

                <input
                  type="number"
                  min="0"
                  value={readingData.powerConsumption}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      powerConsumption: e.target.value,
                    })
                  }
                  placeholder="e.g. 170"
                  required
                />
              </div>

              <div className="form-field">
                <label>Efficiency (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={readingData.efficiency}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      efficiency: e.target.value,
                    })
                  }
                  placeholder="e.g. 95"
                  required
                />
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  value={readingData.status}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Active">Active</option>

                  <option value="Maintenance">
                    Maintenance
                  </option>

                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-field">
                <label>Operating Condition</label>

                <select
                  value={readingData.operatingCondition}
                  onChange={(e) =>
                    setReadingData({
                      ...readingData,
                      operatingCondition: e.target.value,
                    })
                  }
                >
                  <option value="Normal">Normal</option>

                  <option value="Warning">Warning</option>

                  <option value="Maintenance Required">
                    Maintenance Required
                  </option>
                </select>
              </div>

              <div className="reading-form-action">
                <button
                  type="submit"
                  disabled={savingReading}
                >
                  {savingReading
                    ? "Saving..."
                    : "Record Reading"}
                </button>
              </div>
            </form>
          </div>

          {/* ====================================================== */}
          {/* HYDROGEN OUTPUT TREND */}
          {/* ====================================================== */}

          <div className="electrolyzer-chart">
            <div className="electrolyzer-chart-header">
              <div>
                <h2>Hydrogen Output Trend</h2>

                <p>
                  Historical hydrogen production recorded for
                  electrolyzer units.
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div className="history-message">
                Loading performance chart...
              </div>
            ) : history.length === 0 ? (
              <div className="history-message">
                No historical data available for the chart.
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <LineChart
                  width={850}
                  height={320}
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 40,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[0, "auto"]}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value} kg/day`,
                      "Hydrogen Output",
                    ]}
                    labelFormatter={(label) =>
                      `Time: ${label}`
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="hydrogenOutput"
                    name="Hydrogen Output"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </div>
            )}
          </div>

          {/* ====================================================== */}
          {/* PERFORMANCE HISTORY */}
          {/* ====================================================== */}

          <div className="performance-history">
            <div className="performance-history-header">
              <div>
                <h2>Performance History</h2>

                <p>
                  Recorded electrolyzer performance from the
                  monitoring system.
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div className="history-message">
                Loading performance history...
              </div>
            ) : history.length === 0 ? (
              <div className="history-message">
                No historical performance data available.
              </div>
            ) : (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Hydrogen Output</th>
                      <th>Power Consumption</th>
                      <th>Efficiency</th>
                      <th>Recorded At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((record) => (
                      <tr key={record._id}>
                        <td>{record.unitName}</td>

                        <td>
                          <span
                            className={`history-status ${
                              record.status === "Active"
                                ? "status-active"
                                : record.status ===
                                  "Maintenance"
                                ? "status-maintenance"
                                : "status-inactive"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td>
                          {record.hydrogenOutput} kg/day
                        </td>

                        <td>
                          {record.powerConsumption} kW
                        </td>

                        <td>{record.efficiency}%</td>

                        <td>
                          {record.createdAt
                            ? new Date(
                                record.createdAt
                              ).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Electrolyzers;