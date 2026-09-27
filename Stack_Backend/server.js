const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const plantRoutes = require("./routes/plantRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hydrogen Monitoring System Backend is running!",
  });
});

app.use("/api/plant", plantRoutes);

// TEMPORARY TEST ROUTE
app.get("/api/test-history", (req, res) => {
  res.json({
    message: "History route is working",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});