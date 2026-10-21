const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");

const plantRoutes = require("./routes/plantRoutes");
const electrolyzerRoutes = require("./routes/electrolyzerRoutes");
const alertsRoutes = require("./routes/alertsRoutes");
const authRoutes = require("./routes/authRoutes");

const { protect } = require("./middleware/authMiddleware");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hydrogen-monitoring-frontend.onrender.com",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header and approved frontends
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Safe request logging — never log passwords or request bodies
app.use((req, res, next) => {
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.originalUrl);
  next();
});

// Backend health check
app.get("/", (req, res) => {
  res.json({
    message: "Hydrogen Monitoring System Backend is running!",
  });
});

// Public authentication routes
app.use("/api/auth", authRoutes);

// Protected application APIs
app.use("/api/plant", protect, plantRoutes);
app.use("/api/electrolyzers", protect, electrolyzerRoutes);
app.use("/api/alerts", protect, alertsRoutes);

// Temporary test routes
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

app.get("/api/test-history", (req, res) => {
  res.json({
    message: "History route is working",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
