const express = require("express");

const {
  addPlantData,
  getPlantHistory,
} = require("../controllers/plantController");

const PlantData = require("../models/PlantData");

const router = express.Router();

// Add plant data
router.post("/add", (req, res, next) => {
  console.log("DIAGNOSTIC: Correct plantRoutes.js received POST /add");
  console.log("DIAGNOSTIC: Request body =", req.body);

  res.setHeader("X-Plant-Route-Diagnostic", "hydrogen-monitoring-system");

  next();
}, addPlantData);

// Get all historical plant data
router.get("/history", getPlantHistory);

// Get the latest plant data for the selected period
router.get("/", async (req, res) => {
  try {
    const { period } = req.query;

    console.log("Selected Period:", period);

    const now = new Date();
    let filter = {};

    if (period === "Today") {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      filter.createdAt = {
        $gte: startOfDay,
        $lt: startOfTomorrow,
      };
    } else if (period === "Last 24 Hours") {
      const last24Hours = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
      );

      filter.createdAt = {
        $gte: last24Hours,
        $lte: now,
      };
    } else if (period === "Last 7 Days") {
      const last7Days = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      filter.createdAt = {
        $gte: last7Days,
        $lte: now,
      };
    }

    console.log(
      "Plant data filter:",
      JSON.stringify(filter, null, 2)
    );

    // Try to find a record matching the selected period.
    let data = await PlantData.findOne(filter).sort({
      createdAt: -1,
    });

    // If today's data is unavailable, return the latest available
    // reading so the dashboard does not fail unnecessarily.
    if (!data && period === "Today") {
      console.log(
        "No reading found for today. Checking the latest available reading."
      );

      data = await PlantData.findOne({}).sort({
        createdAt: -1,
      });
    }

    // Return an empty result instead of a 404 error.
    if (!data) {
      return res.status(200).json({
        message: "No plant data is available yet.",
        hydrogenProduction: 0,
        productionTarget: 150,
        powerConsumption: 0,
        waterUsage: 0,
        systemEfficiency: 0,
        electrolyzer01Status: "Inactive",
        electrolyzer02Status: "Inactive",
        electrolyzer03Status: "Inactive",
        plantStatus: "No Data",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Error fetching plant data:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch plant data.",
      error: error.message,
    });
  }
});

module.exports = router;