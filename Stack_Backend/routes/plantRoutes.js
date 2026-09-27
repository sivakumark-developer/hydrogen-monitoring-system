const express = require("express");

const {
  addPlantData,
  getPlantHistory,
} = require("../controllers/plantController");

const PlantData = require("../models/PlantData");

const router = express.Router();

// Add sample plant data
router.post("/add", addPlantData);

// Get all historical plant data
router.get("/history", getPlantHistory);

// Get latest plant data
router.get("/", async (req, res) => {
  const { period } = req.query;

  console.log("Selected Period:", period);

  try {
    let filter = {};

    const now = new Date();

    if (period === "Today") {
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      filter = {
        createdAt: {
          $gte: startOfDay,
          $lte: now,
        },
      };
    }

    if (period === "Last 24 Hours") {
      const last24Hours = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
      );

      filter = {
        createdAt: {
          $gte: last24Hours,
          $lte: now,
        },
      };
    }

    if (period === "Last 7 Days") {
      const last7Days = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      );

      filter = {
        createdAt: {
          $gte: last7Days,
          $lte: now,
        },
      };
    }

    const data = await PlantData.findOne(filter).sort({
      createdAt: -1,
    });

    if (!data) {
      return res.status(404).json({
        message: "No plant data found for this period",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching plant data:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;