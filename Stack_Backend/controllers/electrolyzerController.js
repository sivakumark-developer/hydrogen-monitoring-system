const ElectrolyzerData = require("../models/ElectrolyzerData");

// Add electrolyzer data
const addElectrolyzerData = async (req, res) => {
  try {
    const {
      unitId,
      unitName,
      status,
      hydrogenOutput,
      powerConsumption,
      efficiency,
      operatingCondition,
    } = req.body;

    const data = await ElectrolyzerData.create({
      unitId,
      unitName,
      status,
      hydrogenOutput,
      powerConsumption,
      efficiency,
      operatingCondition,
    });

    res.status(201).json({
      message: "Electrolyzer data added successfully",
      data,
    });
  } catch (error) {
    console.error("Error adding electrolyzer data:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get latest electrolyzer data for each unit
const getElectrolyzerData = async (req, res) => {
  try {
    console.log("Database:", ElectrolyzerData.db.name);
    console.log("Host:", ElectrolyzerData.db.host);
    console.log("Collection:", ElectrolyzerData.collection.name);
    console.log("Documents:", await ElectrolyzerData.countDocuments());
    const unitIds = await ElectrolyzerData.distinct("unitId");

    const latestData = await Promise.all(
      unitIds.map(async (unitId) => {
        return await ElectrolyzerData.findOne({ unitId }).sort({
          createdAt: -1,
        });
      })
    );

    const data = latestData
      .filter(Boolean)
      .sort((a, b) => a.unitId.localeCompare(b.unitId));

    res.json(data);
  } catch (error) {
    console.error("Error fetching electrolyzer data:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get electrolyzer historical data
const getElectrolyzerHistory = async (req, res) => {
  try {
    const { unitId } = req.query;

    const filter = unitId ? { unitId } : {};

    const data = await ElectrolyzerData.find(filter).sort({
      createdAt: 1,
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching electrolyzer history:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addElectrolyzerData,
  getElectrolyzerData,
  getElectrolyzerHistory,
};