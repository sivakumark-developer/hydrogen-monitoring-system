import React, { useEffect, useState } from "react";
import axios from "axios";

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();

  let backgroundColor = "#e2e8f0";
  let textColor = "#475569";

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "operational"
  ) {
    backgroundColor = "#dcfce7";
    textColor = "#166534";
  } else if (normalizedStatus === "maintenance") {
    backgroundColor = "#ffedd5";
    textColor = "#c2410c";
  } else if (normalizedStatus === "warning") {
    backgroundColor = "#fef9c3";
    textColor = "#a16207";
  } else if (normalizedStatus === "shutdown") {
    backgroundColor = "#fee2e2";
    textColor = "#b91c1c";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "20px",
        backgroundColor,
        color: textColor,
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {status ?? "N/A"}
    </span>
  );
};

const PlantData = ({ onBack }) => {
  const [plantHistory, setPlantHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [electrolyzerFilter, setElectrolyzerFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const fetchPlantHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/plant/history"
      );

      console.log("Plant History:", response.data);

      setPlantHistory(response.data);
    } catch (error) {
      console.error("Plant History Error:", error);

      setError(
        "Unable to load plant history. Please check whether the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantHistory();
  }, []);

  // Get latest record
  const latestRecord =
    plantHistory.length > 0
      ? plantHistory.reduce((latest, current) => {
          return new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest;
        })
      : null;

  // Calculate average efficiency
  const averageEfficiency =
    plantHistory.length > 0
      ? (
          plantHistory.reduce(
            (total, record) =>
              total + Number(record.systemEfficiency || 0),
            0
          ) / plantHistory.length
        ).toFixed(1)
      : "0";

  // Filter plant history
  const filteredPlantHistory = plantHistory.filter((record) => {
    const matchesStatus =
        statusFilter === "All" ||
        record.plantStatus === statusFilter;

    const matchesElectrolyzer =
        electrolyzerFilter === "All" ||
        record.electrolyzer01Status === electrolyzerFilter ||
        record.electrolyzer02Status === electrolyzerFilter ||
        record.electrolyzer03Status === electrolyzerFilter;

    const matchesDate =
        dateFilter === "" ||
        new Date(record.createdAt).toLocaleDateString("en-CA") === dateFilter;

    return matchesStatus && matchesElectrolyzer && matchesDate;
    });

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <h1>Plant Data Management</h1>
          <p>View and manage historical plant data</p>
        </div>

        <button className="nav-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </header>

      <main className="dashboard plant-data-dashboard">

        {/* SUMMARY CARDS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Total Records */}
          <div
            className="panel"
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Total Records
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: 0,
              }}
            >
              {filteredPlantHistory.length}
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Showing {filteredPlantHistory.length} of {plantHistory.length} records
            </p>
          </div>

          {/* Latest Hydrogen Production */}
          <div
            className="panel"
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Latest H₂ Production
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: 0,
              }}
            >
              {latestRecord?.hydrogenProduction ?? "N/A"}
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              kg/day
            </p>
          </div>

          {/* Average Efficiency */}
          <div
            className="panel"
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Average Efficiency
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: 0,
              }}
            >
              {averageEfficiency}%
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Across all records
            </p>
          </div>

          {/* Plant Status */}
          <div
            className="panel"
            style={{ textAlign: "center" }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              Current Plant Status
            </p>

            <h2
              style={{
                fontSize: "24px",
                margin: 0,
              }}
            >
              {latestRecord?.plantStatus ?? "N/A"}
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "6px",
              }}
            >
              Latest reading
            </p>
          </div>
        </section>

        {/* PLANT DATA HISTORY */}
        <section className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2>Plant Data History</h2>

              <p>
                Historical hydrogen production and plant performance records
              </p>

              <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "16px",
                    flexWrap: "wrap",
                }}
                >
                {/* Plant Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#ffffff",
                    fontSize: "14px",
                    cursor: "pointer",
                    }}
                >
                    <option value="All">All Plant Status</option>
                    <option value="Operational">Operational</option>
                    <option value="Warning">Warning</option>
                    <option value="Shutdown">Shutdown</option>
                </select>

                {/* Electrolyzer Filter */}
                <select
                    value={electrolyzerFilter}
                    onChange={(e) => setElectrolyzerFilter(e.target.value)}
                    style={{
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#ffffff",
                    fontSize: "14px",
                    cursor: "pointer",
                    }}
                >
                    <option value="All">All Electrolyzers</option>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Warning">Warning</option>
                    <option value="Shutdown">Shutdown</option>
                </select>

                {/* Date Filter */}
                <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                    padding: "9px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#ffffff",
                    fontSize: "14px",
                    cursor: "pointer",
                }}
                />

                {/* Clear Filters */}
                <button
                    onClick={() => {
                        setStatusFilter("All");
                        setElectrolyzerFilter("All");
                        setDateFilter("");
                    }}
                    style={{
                    padding: "9px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    fontSize: "14px",
                    cursor: "pointer",
                    }}
                >
                    Clear Filters
                </button>
                </div>

            </div>

            <button
              className="refresh-button"
              onClick={fetchPlantHistory}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading plant history...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : plantHistory.length === 0 ? (
            <p>No plant data records found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1100px",
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Date & Time</th>
                    <th style={tableHeaderStyle}>H₂ Production</th>
                    <th style={tableHeaderStyle}>Target</th>
                    <th style={tableHeaderStyle}>Power</th>
                    <th style={tableHeaderStyle}>Water</th>
                    <th style={tableHeaderStyle}>Efficiency</th>
                    <th style={tableHeaderStyle}>E1</th>
                    <th style={tableHeaderStyle}>E2</th>
                    <th style={tableHeaderStyle}>E3</th>
                    <th style={tableHeaderStyle}>Plant Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlantHistory.map((record, index) => (
                    <tr key={record._id || index}>
                      <td style={tableCellStyle}>
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleString()
                          : "N/A"}
                      </td>

                      <td style={tableCellStyle}>
                        {record.hydrogenProduction ?? "N/A"} kg/day
                      </td>

                      <td style={tableCellStyle}>
                        {record.productionTarget ?? "N/A"} kg/day
                      </td>

                      <td style={tableCellStyle}>
                        {record.powerConsumption ?? "N/A"} kW
                      </td>

                      <td style={tableCellStyle}>
                        {record.waterUsage ?? "N/A"} L/day
                      </td>

                      <td style={tableCellStyle}>
                        {record.systemEfficiency ?? "N/A"}%
                      </td>

                      <td style={tableCellStyle}>
                        <StatusBadge status={record.electrolyzer01Status} />
                        </td>

                        <td style={tableCellStyle}>
                        <StatusBadge status={record.electrolyzer02Status} />
                        </td>

                        <td style={tableCellStyle}>
                        <StatusBadge status={record.electrolyzer03Status} />
                        </td>

                        <td style={tableCellStyle}>
                        <StatusBadge status={record.plantStatus} />
                        </td>
                  
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

export default PlantData;