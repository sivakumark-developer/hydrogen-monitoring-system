import axios from "axios";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [period, setPeriod] = useState("Today");
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );

  const [plantData, setPlantData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [backendStatus, setBackendStatus] = useState(false);

  // Plant data entry form
  const [formData, setFormData] = useState({
    hydrogenProduction: "",
    productionTarget: "150",
    powerConsumption: "",
    waterUsage: "",
    systemEfficiency: "",
    electrolyzer01Status: "Active",
    electrolyzer02Status: "Active",
    electrolyzer03Status: "Maintenance",
    plantStatus: "Operational",
  });

  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [savingData, setSavingData] = useState(false);

  // Filter history according to selected period
  const getFilteredHistoryData = () => {
    const now = new Date();

    if (period === "Today") {
      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return (
          recordDate.getFullYear() === now.getFullYear() &&
          recordDate.getMonth() === now.getMonth() &&
          recordDate.getDate() === now.getDate()
        );
      });
    }

    if (period === "Last 24 Hours") {
      const last24Hours = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
      );

      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return recordDate >= last24Hours && recordDate <= now;
      });
    }

    if (period === "Last 7 Days") {
      const last7Days = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return recordDate >= last7Days && recordDate <= now;
      });
    }

    return historyData;
  };

  const filteredHistoryData = getFilteredHistoryData();

  // Chart data
  const productionData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    hydrogen: item.hydrogenProduction,
  }));

  const powerData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    power: item.powerConsumption,
  }));

  const waterData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    water: item.waterUsage,
  }));

  // Fetch latest plant data
  const fetchPlantData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/plant?period=${encodeURIComponent(
          selectedPeriod
        )}`
      );

      console.log("Plant Data:", response.data);

      setPlantData(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Plant Data Error:", error);

      setError(
        "Unable to load plant data. Please check whether the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data
  const fetchHistoryData = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/plant/history"
      );

      console.log("History Data:", response.data);

      setHistoryData(response.data);
            } catch (error) {
          console.error("History Data Error:", error);

            setError(
            "Unable to load historical data. Please check whether the backend server is running."
          ) ;
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantData();
    fetchHistoryData();
    checkBackendStatus();

    const refreshInterval = setInterval(() => {
      fetchPlantData();
      fetchHistoryData();
      checkBackendStatus();
      setLastUpdated("Just now");
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);
  // Refresh dashboard
  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchPlantData(period);
      await fetchHistoryData();
      await checkBackendStatus();

      setLastUpdated("Just now");
    } finally {
      setRefreshing(false);
    }
  };

  // Test backend connection
  const checkBackendStatus = async () => {
    try {
      await axios.get("http://localhost:5000/");

      setBackendStatus(true);
    } catch (error) {
      setBackendStatus(false);
    }
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Submit new plant data
  const handleAddPlantData = async (e) => {
    e.preventDefault();

    setFormMessage("");
    setFormError("");

    if (
      formData.hydrogenProduction === "" ||
      formData.productionTarget === "" ||
      formData.powerConsumption === "" ||
      formData.waterUsage === "" ||
      formData.systemEfficiency === ""
    ) {
      setFormError("Please fill all required plant values.");
      return;
    }

    const hydrogenProduction = Number(formData.hydrogenProduction);
    const productionTarget = Number(formData.productionTarget);
    const powerConsumption = Number(formData.powerConsumption);
    const waterUsage = Number(formData.waterUsage);
    const systemEfficiency = Number(formData.systemEfficiency);

    if (
      Number.isNaN(hydrogenProduction) ||
      Number.isNaN(productionTarget) ||
      Number.isNaN(powerConsumption) ||
      Number.isNaN(waterUsage) ||
      Number.isNaN(systemEfficiency)
    ) {
      setFormError("Please enter valid numeric values.");
      return;
    }

    if (
      hydrogenProduction < 0 ||
      productionTarget < 0 ||
      powerConsumption < 0 ||
      waterUsage < 0
    ) {
      setFormError("Production, power, and water values cannot be negative.");
      return;
    }

    if (systemEfficiency < 0 || systemEfficiency > 100) {
      setFormError("System efficiency must be between 0 and 100.");
      return;
    }

    try {
      setSavingData(true);

      const payload = {
        hydrogenProduction,
        productionTarget,
        powerConsumption,
        waterUsage,
        systemEfficiency,

        electrolyzer01Status: formData.electrolyzer01Status,
        electrolyzer02Status: formData.electrolyzer02Status,
        electrolyzer03Status: formData.electrolyzer03Status,

        plantStatus: formData.plantStatus,
      };

      const response = await axios.post(
        "http://localhost:5000/api/plant/add",
        payload
      );

      console.log("New Plant Data:", response.data);

      setFormMessage("Plant data added successfully.");
      setFormError("");

      // Reset form
      setFormData({
        hydrogenProduction: "",
        productionTarget: "150",
        powerConsumption: "",
        waterUsage: "",
        systemEfficiency: "",
        electrolyzer01Status: "Active",
        electrolyzer02Status: "Active",
        electrolyzer03Status: "Maintenance",
        plantStatus: "Operational",
      });

      // Update dashboard immediately
      await fetchPlantData();
      await fetchHistoryData();

      setLastUpdated("Just now");
    } catch (error) {
      console.error("Add Plant Data Error:", error);

      setFormMessage("");

      setFormError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to add plant data. Please check the backend."
      );
    } finally {
      setSavingData(false);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <h1>Hydrogen Monitoring System</h1>
          <p>Production Plant Monitoring Dashboard</p>
        </div>

        <div className="header-right">
          <div className="status">
            <span
              className="status-dot"
              style={{
                backgroundColor: backendStatus ? "green" : "red",
              }}
            ></span>

            {backendStatus ? "System Online" : "System Offline"}
          </div>

          <div className="updated">
            Last updated: {lastUpdated}
          </div>
        </div>
      </header>

      <main className="dashboard">
        {/* Plant Overview */}
        <section className="overview panel">
          <div className="overview-title">
            <div>
              <h2>Plant Overview</h2>
              <p>Real-time hydrogen production monitoring</p>
            </div>

            <div className="controls">
              <select
                value={period}
                onChange={(e) => {
                  const selectedPeriod = e.target.value;

                  setPeriod(selectedPeriod);
                  fetchPlantData(selectedPeriod);
                }}
              >
                <option>Today</option>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>

              <button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-item">
              <span>Plant Status</span>

              <strong className="online-text">
                {loading
                  ? "Loading..."
                  : plantData?.plantStatus ?? "Unknown"}
              </strong>
            </div>

            <div className="overview-item">
              <span>Production Target</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${plantData?.productionTarget ?? 0} kg/day`}
              </strong>
            </div>

            <div className="overview-item">
              <span>Current Production</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${plantData?.hydrogenProduction ?? 0} kg/day`}
              </strong>
            </div>

            <div className="overview-item">
              <span>Active Units</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${
                      [
                        plantData?.electrolyzer01Status,
                        plantData?.electrolyzer02Status,
                        plantData?.electrolyzer03Status,
                      ].filter((status) => status === "Active").length
                    } / 3`}
              </strong>
            </div>
          </div>

          {error && (
            <p style={{ marginTop: "12px" }}>
              {error}
            </p>
          )}
        </section>

        {/* ====================================================== */}
        {/* ADD PLANT DATA */}
        {/* ====================================================== */}

        <section
          className="panel"
          style={{
            gridColumn: "1 / -1",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="panel-header">
            <div>
              <h2>Add Plant Data</h2>
              <p>Enter the latest plant monitoring values</p>
            </div>
          </div>

          <form onSubmit={handleAddPlantData}>
            <div className="plant-form-grid">
              {/* Hydrogen Production */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Hydrogen Production (kg/day)
                </label>

                <input
                  type="number"
                  name="hydrogenProduction"
                  value={formData.hydrogenProduction}
                  onChange={handleFormChange}
                  placeholder="Example: 132"
                  min="0"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Production Target */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Production Target (kg/day)
                </label>

                <input
                  type="number"
                  name="productionTarget"
                  value={formData.productionTarget}
                  onChange={handleFormChange}
                  placeholder="Example: 150"
                  min="0"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Power Consumption */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Power Consumption (kW)
                </label>

                <input
                  type="number"
                  name="powerConsumption"
                  value={formData.powerConsumption}
                  onChange={handleFormChange}
                  placeholder="Example: 465"
                  min="0"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Water Usage */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Water Usage (L/day)
                </label>

                <input
                  type="number"
                  name="waterUsage"
                  value={formData.waterUsage}
                  onChange={handleFormChange}
                  placeholder="Example: 835"
                  min="0"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* System Efficiency */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  System Efficiency (%)
                </label>

                <input
                  type="number"
                  name="systemEfficiency"
                  value={formData.systemEfficiency}
                  onChange={handleFormChange}
                  placeholder="Example: 89"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Plant Status */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Plant Status
                </label>

                <select
                  name="plantStatus"
                  value={formData.plantStatus}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Operational">
                    Operational
                  </option>

                  <option value="Warning">
                    Warning
                  </option>

                  <option value="Shutdown">
                    Shutdown
                  </option>
                </select>
              </div>

              {/* Electrolyzer 01 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Electrolyzer 01
                </label>

                <select
                  name="electrolyzer01Status"
                  value={formData.electrolyzer01Status}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">
                    Maintenance
                  </option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Electrolyzer 02 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Electrolyzer 02
                </label>

                <select
                  name="electrolyzer02Status"
                  value={formData.electrolyzer02Status}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">
                    Maintenance
                  </option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Electrolyzer 03 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                  }}
                >
                  Electrolyzer 03
                </label>

                <select
                  name="electrolyzer03Status"
                  value={formData.electrolyzer03Status}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">
                    Maintenance
                  </option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div style={{ marginTop: "22px" }}>
              <button
                className="add-plant-button"
                type="submit"
                disabled={savingData}
              >
                {savingData
                  ? "Saving..."
                  : "Add Plant Data"}
              </button>
            </div>

            {/* Success message */}
            {formMessage && (
              <p
                style={{
                  marginTop: "12px",
                  fontWeight: "600",
                }}
              >
                {formMessage}
              </p>
            )}

            {/* Error message */}
            {formError && (
              <p
                style={{
                  marginTop: "12px",
                  fontWeight: "600",
                }}
              >
                {formError}
              </p>
            )}
          </form>
        </section>

        {/* ====================================================== */}
        {/* SUMMARY CARDS */}
        {/* ====================================================== */}

        <div className="card">
          <h3>Hydrogen Output</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.hydrogenProduction ?? 0} kg/day`}
          </div>

          <p>Current production</p>
        </div>

        <div className="card">
          <h3>Power Consumption</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.powerConsumption ?? 0} kW`}
          </div>

          <p>Current usage</p>
        </div>

        <div className="card">
          <h3>Water Usage</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.waterUsage ?? 0} L/day`}
          </div>

          <p>Current consumption</p>
        </div>

        <div className="card">
          <h3>System Efficiency</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.systemEfficiency ?? 0}%`}
          </div>

          <p>Overall efficiency</p>
        </div>

        {/* ====================================================== */}
        {/* HYDROGEN PRODUCTION */}
        {/* ====================================================== */}

        <section className="panel production-panel">
          <div className="panel-header">
            <div>
              <h2>Hydrogen Production</h2>
              <p>
                Production rate throughout the selected period
              </p>
            </div>

            <span className="unit-label">
              kg/day
            </span>
          </div>

          <div className="chart-container">
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : productionData.length === 0 ? (
              <p>
                No production data available for this period.
              </p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                {productionData.length > 0 ? (
                <LineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="time"
                    label={{
                      value: "Time",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />

                  <YAxis
                    label={{
                      value: "Hydrogen Production (kg/day)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="hydrogen"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  No production data available for this period.
                </div>
              )}
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ====================================================== */}
        {/* ELECTROLYZER STATUS */}
        {/* ====================================================== */}

        <section className="panel">
          <h2>Electrolyzer Status</h2>

          <div className="electrolyzer">
            <div>
              <strong>
                Electrolyzer 01
              </strong>

              <p>
                Hydrogen production unit
              </p>
            </div>

            <span className="active">
              {loading
                ? "Loading..."
                : plantData?.electrolyzer01Status ??
                  "Unknown"}
            </span>
          </div>

          <div className="electrolyzer">
            <div>
              <strong>
                Electrolyzer 02
              </strong>

              <p>
                Hydrogen production unit
              </p>
            </div>

            <span className="active">
              {loading
                ? "Loading..."
                : plantData?.electrolyzer02Status ??
                  "Unknown"}
            </span>
          </div>

          <div className="electrolyzer">
            <div>
              <strong>
                Electrolyzer 03
              </strong>

              <p>
                Hydrogen production unit
              </p>
            </div>

            <span className="active">
              {loading
                ? "Loading..."
                : plantData?.electrolyzer03Status ??
                  "Unknown"}
            </span>
          </div>
        </section>

        {/* ====================================================== */}
        {/* POWER CONSUMPTION */}
        {/* ====================================================== */}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Power Consumption</h2>
              <p>Plant electrical usage</p>
            </div>

            <div>
              <span className="unit-label">
                kW
              </span>

              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                {powerData.length} records
              </span>
            </div>
          </div>

          <div className="chart-container">
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : powerData.length === 0 ? (
              <p>
                No power data available for this period.
              </p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                {powerData.length > 0 ? (
              <LineChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  label={{
                    value: "Power Consumption (kW)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                No power consumption data available for this period.
              </div>
            )}
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ====================================================== */}
        {/* WATER USAGE */}
        {/* ====================================================== */}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Water Usage</h2>
              <p>Plant water consumption</p>
            </div>

            <span className="unit-label">
              L/day
            </span>
          </div>

          <div className="chart-container">
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : waterData.length === 0 ? (
              <p>
                No water data available for this period.
              </p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                {waterData.length > 0 ? (
                  <LineChart data={waterData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="time"
                      label={{
                        value: "Time",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />

                    <YAxis
                      label={{
                        value: "Water Usage (L/day)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="water"
                      stroke="#0891b2"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    No water usage data available for this period.
                  </div>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ====================================================== */}
        {/* PLANT PERFORMANCE */}
        {/* ====================================================== */}

        <section className="panel performance-panel">
          <h2>Plant Performance</h2>

          <div className="performance-grid">

            {/* Production Efficiency */}
            <div className="performance-item">
              <span>Production Efficiency</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${plantData?.systemEfficiency ?? 0}%`}
              </strong>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      plantData?.systemEfficiency ?? 0,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Power Efficiency */}
            <div className="performance-item">
              <span>Power Efficiency</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${
                      plantData?.powerConsumption
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              Math.round(
                                (500 / plantData.powerConsumption) * 100
                              )
                            )
                          )
                        : 0
                    }%`}
              </strong>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      plantData?.powerConsumption
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              Math.round(
                                (500 / plantData.powerConsumption) * 100
                              )
                            )
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Water Efficiency */}
            <div className="performance-item">
              <span>Water Efficiency</span>

              <strong>
                {loading
                  ? "Loading..."
                  : `${
                      plantData?.waterUsage
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              Math.round(
                                (900 / plantData.waterUsage) * 100
                              )
                            )
                          )
                        : 0
                    }%`}
              </strong>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      plantData?.waterUsage
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              Math.round(
                                (900 / plantData.waterUsage) * 100
                              )
                            )
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

          </div>
        </section>

        {/* ====================================================== */}
        {/* ALERTS */}
        {/* ====================================================== */}

        <section className="panel alerts-panel">
          <h2>Plant Alerts</h2>

          {/* Electrolyzer 03 Alert */}
          <div className="alert warning">
            <div>
              <strong>Electrolyzer 03</strong>

              <p>
                {loading
                  ? "Checking unit status..."
                  : plantData?.electrolyzer03Status === "Maintenance"
                  ? "Unit currently under maintenance"
                  : plantData?.electrolyzer03Status === "Active"
                  ? "Unit is operating normally"
                  : "Unit is currently inactive"}
              </p>
            </div>

            <span>
              {loading
                ? "Checking..."
                : plantData?.electrolyzer03Status ?? "Unknown"}
            </span>
          </div>

          {/* Overall Plant Alert */}
          <div className="alert normal">
            <div>
              <strong>System Status</strong>

              <p>
                {loading
                  ? "Checking plant status..."
                  : plantData?.plantStatus === "Operational"
                  ? "Plant is operating normally"
                  : plantData?.plantStatus === "Warning"
                  ? "Plant requires attention"
                  : plantData?.plantStatus === "Shutdown"
                  ? "Plant is currently shut down"
                  : "Plant status unavailable"}
              </p>
            </div>

            <span>
              {loading
                ? "Checking..."
                : plantData?.plantStatus ?? "Unknown"}
            </span>
          </div>
        </section>


      </main>
    </div>
  );
}

export default App;