const PlantData = require("../models/PlantData");

// Add plant data
const addPlantData = async (req, res) => {
  try {
    const {
      hydrogenProduction,
      productionTarget,
      powerConsumption,
      waterUsage,
      systemEfficiency,
      electrolyzer01Status,
      electrolyzer02Status,
      electrolyzer03Status,
      plantStatus,
    } = req.body;

    const data = {
      hydrogenProduction,
      productionTarget: productionTarget || 150,
      powerConsumption,
      waterUsage,
      systemEfficiency,
      electrolyzer01Status,
      electrolyzer02Status,
      electrolyzer03Status,
      plantStatus,
    };

    const result = await PlantData.create(data);

    res.status(201).json({
      message: "Plant data added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding plant data:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all historical plant data
const getPlantHistory = async (req, res) => {
  try {
    const data = await PlantData.find().sort({ createdAt: 1 });

    res.json(data);
  } catch (error) {
    console.error("Error fetching plant history:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addPlantData,
  getPlantHistory,
};