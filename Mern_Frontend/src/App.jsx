import React from "react";
import api from "./api/axiosConfig";
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

import Electrolyzers from "./Electrolyzers/Electrolyzers";
import Analytics from "./Analytics/Analytics";
import PlantData from "./PlantData/PlantData";
import Reports from "./Reports/Reports";
import Profile from "./Profile/Profile";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import { getCurrentUser, logoutUser } from "./api/auth";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authPage, setAuthPage] = useState("login");
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await getCurrentUser();
        setAuthUser(response.user);
      } catch (error) {
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);
  const [period, setPeriod] = useState("All Records");
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );

  const [plantData, setPlantData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
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
    if (!Array.isArray(historyData)) {
      return [];
    }

    if (period === "All Records") {
      return historyData;
    }

    const now = new Date();

    if (period === "Today") {
      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return (
          !isNaN(recordDate.getTime()) &&
          recordDate.toDateString() === now.toDateString()
        );
      });
    }

    if (period === "Last 24 Hours") {
      const last24Hours = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
      );

      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return (
          !isNaN(recordDate.getTime()) &&
          recordDate >= last24Hours &&
          recordDate <= now
        );
      });
    }

    if (period === "Last 7 Days") {
      const last7Days = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      return historyData.filter((item) => {
        const recordDate = new Date(item.createdAt);

        return (
          !isNaN(recordDate.getTime()) &&
          recordDate >= last7Days &&
          recordDate <= now
        );
      });
    }

    return historyData;
  };

  const filteredHistoryData = getFilteredHistoryData();

  // Chart data
  const productionData = filteredHistoryData
    .filter(
      (item) =>
        item.createdAt &&
        item.hydrogenProduction !== null &&
        item.hydrogenProduction !== undefined &&
        Number.isFinite(Number(item.hydrogenProduction))
    )
    .map((item) => ({
      time: new Date(item.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      hydrogen: Number(item.hydrogenProduction),
    }));
  
  const powerData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    power: Number(item.powerConsumption),
  }));

  const waterData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    water: Number(item.waterUsage),
  }));

  const efficiencyData = filteredHistoryData.map((item) => ({
    time: new Date(item.createdAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    efficiency: Number(item.systemEfficiency),
  }));

  console.log("HISTORY DATA:", historyData);
  console.log("HISTORY DATA COUNT:", historyData?.length);

  console.log("Selected Period:", period);
  console.log("Filtered History Count:", filteredHistoryData.length);
  console.log("Hydrogen Chart Data:", productionData);
  console.log("Efficiency Chart Data:", efficiencyData);

    console.log("FILTERED HISTORY:", filteredHistoryData);
    console.log("PRODUCTION DATA:", productionData);
    console.log("POWER DATA:", powerData);
    console.log("WATER DATA:", waterData);

  console.log("First Hydrogen Data:", productionData[0]);
  console.log("First Efficiency Data:", efficiencyData[0]);
  console.log("Hydrogen Values:", productionData.map((item) => item.hydrogen));
  console.log("Efficiency Values:", efficiencyData.map((item) => item.efficiency));

  // Fetch latest plant data
  const fetchPlantData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/plant?period=${encodeURIComponent(selectedPeriod)}`
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

  // Fetch alerts data
  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);

      const response = await api.get("/api/alerts");

      console.log("Alerts Data:", response.data);

      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Alerts Data Error:", error);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Fetch historical data
  const fetchHistoryData = async () => {
    try {
      setHistoryLoading(true);

      const response = await api.get("/api/plant/history");

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
    // Do not request protected dashboard data until a user is authenticated.
    if (!authUser) {
      return undefined;
    }

    fetchPlantData();
    fetchHistoryData();
    checkBackendStatus();
    fetchAlerts();

    const refreshInterval = setInterval(() => {
      fetchPlantData();
      fetchHistoryData();
      checkBackendStatus();
      fetchAlerts();
      setLastUpdated("Just now");
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [authUser]);
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
      await api.get("/");

      setBackendStatus(true);
    } catch (error) {
      setBackendStatus(false);
    }
  };

  // Log out and return to the login screen.
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setAuthUser(null);
      setAuthPage("login");
      setCurrentPage("dashboard");
    }
  };

  // Authentication screens must be rendered only after all hooks above
  // have been called, so the order of hooks remains consistent.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Checking your session...</p>
      </div>
    );
  }

  if (!authUser) {
    if (authPage === "signup") {
      return (
        <Signup
          onSignup={(user) => setAuthUser(user)}
          onSwitchToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={(user) => setAuthUser(user)}
        onSwitchToSignup={() => setAuthPage("signup")}
      />
    );
  }

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

      const response = await api.post(
        "/api/plant/add",
        payload,
        { withCredentials: true }
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

  if (currentPage === "electrolyzers") {
    return (
      <Electrolyzers
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }
  
  if (currentPage === "analytics") {
    return <Analytics onBack={() => setCurrentPage("dashboard")} />;
  }

  if (currentPage === "plantData") {
    return <PlantData onBack={() => setCurrentPage("dashboard")} />;
  }

  if (currentPage === "reports") {
    return <Reports onBack={() => setCurrentPage("dashboard")} />;
  }

  if (currentPage === "profile") {
    return (
      <Profile
        user={authUser}
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">

        <nav className="main-navigation">
          <button
            className={currentPage === "dashboard" ? "nav-button active" : "nav-button"}
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={
              currentPage === "electrolyzers"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setCurrentPage("electrolyzers")}
          >
            Electrolyzers
          </button>

          <button
            className={
              currentPage === "analytics"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => setCurrentPage("analytics")}
          >
            Analytics
          </button>

            <button
              className={
                currentPage === "plantData"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => setCurrentPage("plantData")}
            >
              Plant Data
            </button>


            <button
              className={
                currentPage === "reports"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => setCurrentPage("reports")}
            >
              Reports
            </button>

            <button
              className={
                currentPage === "profile"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => setCurrentPage("profile")}
            >
              Profile
            </button>

        </nav>

        <div>
          <h1>Hydrogen Monitoring System</h1>
          <p>Production Plant Monitoring Dashboard</p>
        </div>

        <div className="header-right">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span>
              Signed in{authUser?.name ? ` as ${authUser.name}` : authUser?.email ? ` as ${authUser.email}` : ""}
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>

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
                <option>All Records</option>
              </select>

              <button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-item">
              <span>Plant Status</span>

              <strong
                className={`plant-status ${
                  plantData?.plantStatus === "Operational"
                    ? "plant-operational"
                    : plantData?.plantStatus === "Warning"
                    ? "plant-warning"
                    : plantData?.plantStatus === "Shutdown"
                    ? "plant-shutdown"
                    : ""
                }`}
              >
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

        <div className="card kpi-card">
          <h3>Hydrogen Output</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.hydrogenProduction ?? 0} kg/day`}
          </div>

          <p>
            Target:{" "}
            {loading
              ? "..."
              : `${plantData?.productionTarget ?? 0} kg/day`}
          </p>

          {!loading && plantData && (
            <div className="kpi-progress">
              <div
                className="kpi-progress-fill"
                style={{
                  width: `${Math.min(
                    ((plantData.hydrogenProduction ?? 0) /
                      (plantData.productionTarget || 1)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        <div className="card kpi-card">
          <h3>Power Consumption</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.powerConsumption ?? 0} kW`}
          </div>

          <p>Current plant electrical usage</p>
        </div>

        <div className="card kpi-card">
          <h3>Water Usage</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.waterUsage ?? 0} L/day`}
          </div>

          <p>Current plant water consumption</p>
        </div>

        <div className="card kpi-card">
          <h3>System Efficiency</h3>

          <div className="value">
            {loading
              ? "Loading..."
              : `${plantData?.systemEfficiency ?? 0}%`}
          </div>

          <p>Overall system efficiency</p>

          {!loading && plantData && (
            <div className="kpi-progress">
              <div
                className="kpi-progress-fill"
                style={{
                  width: `${Math.min(
                    plantData.systemEfficiency ?? 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          )}
        </div>

        {/* ====================================================== */}
        {/* HYDROGEN PRODUCTION */}
        {/* ====================================================== */}

        <section className="panel production-panel">
          <div className="panel-header">
            <div>
              <h2>Hydrogen Production</h2>
              <p>Production rate throughout the selected period</p>
            </div>

            <span className="unit-label">kg/day</span>
          </div>

          <div
            className="chart-container"
            style={{
              width: "100%",
              height: "320px",
              minWidth: 0,
              overflow: "visible",
            }}
          >
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : productionData.length === 0 ? (
              <p>No production data available for this period.</p>
            ) : (
              <LineChart
                width={1100}
                height={320}
                data={productionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -15,
                  }}
                />

                <YAxis
                  type="number"
                  domain={["auto", "auto"]}
                  label={{
                    value: "Hydrogen Production (kg/day)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value} kg/day`,
                    "Hydrogen Production",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />

                <Line
                  type="monotone"
                  dataKey="hydrogen"
                  name="Hydrogen Production"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
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

            <span
              className={
                plantData?.electrolyzer01Status === "Active"
                  ? "active"
                  : "inactive"
              }
            >
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

            <span
              className={
                plantData?.electrolyzer02Status === "Active"
                  ? "active"
                  : "inactive"
              }
            >
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

            <span
              className={
                plantData?.electrolyzer03Status === "Active"
                  ? "active"
                  : "inactive"
              }
            >
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

          <div
            className="chart-container"
            style={{
              width: "100%",
              height: "320px",
              minWidth: 0,
            }}
          >
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : powerData.length === 0 ? (
              <p>
                No power data available for this period.
              </p>
            ) : (
              <LineChart
                width={800}
                height={320}
                data={powerData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -15,
                  }}
                />

                <YAxis
                  label={{
                    value: "Power Consumption (kW)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    `Time: ${String(label)}`
                  }
                  formatter={(value) => [
                    `${value} kW`,
                    "Power Consumption",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="power"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
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

          <div
            className="chart-container"
            style={{
              width: "100%",
              height: "320px",
              minWidth: 0,
            }}
          >
            {historyLoading ? (
              <p>Loading historical data...</p>
            ) : waterData.length === 0 ? (
              <p>
                No water data available for this period.
              </p>
            ) : (
              <LineChart
                width={800}
                height={320}
                data={waterData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="time"
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -15,
                  }}
                />

                <YAxis
                  label={{
                    value: "Water Usage (L/day)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    `Time: ${String(label)}`
                  }
                  formatter={(value) => [
                    `${value} L/day`,
                    "Water Usage",
                  ]}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2>Plant Alerts</h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Current plant and electrolyzer alerts
              </p>
            </div>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                background:
                  alerts.length > 0 ? "#fee2e2" : "#dcfce7",
                color:
                  alerts.length > 0 ? "#b91c1c" : "#166534",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {alerts.length} Active
            </span>
          </div>

          {alertsLoading ? (
            <p>Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <div className="alert normal">
              <div>
                <strong>No Active Alerts</strong>

                <p>
                  Plant operations are currently normal.
                </p>
              </div>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div
                key={index}
                className={`alert ${
                  alert.type === "critical"
                    ? "critical"
                    : "warning"
                }`}
              >
                <div> 
                  <strong>
                    {alert.type === "critical" ? "🔴" : "⚠️"}{" "}
                    {alert.title}
                  </strong>

                  <p>{alert.message}</p>
                </div>

                <span>{alert.category}</span>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
}

export default App;