const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const plantRoutes = require("./routes/plantRoutes");
const electrolyzerRoutes = require("./routes/electrolyzerRoutes");
const alertsRoutes = require("./routes/alertsRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.originalUrl);
  console.log("Request Body:", req.body);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Hydrogen Monitoring System Backend is running!",
  });
});

app.use("/api/plant", plantRoutes);
app.use("/api/electrolyzers", electrolyzerRoutes);
app.use("/api/alerts", alertsRoutes);

app.get("/api/alerts-test", (req, res) => {
  res.json({
    message: "Alerts API route is working",
  });
});

app.get("/api/electrolyzers-test", (req, res) => {
  res.json({
    message: "Electrolyzer API route is working",
  });
});

// TEMPORARY TEST ROUTE
app.get("/api/test-history", (req, res) => {
  res.json({
    message: "History route is working",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});