const PlantData = require("../models/PlantData");
const ElectrolyzerData = require("../models/ElectrolyzerData");

const getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Get latest plant data
    const plantData = await PlantData.findOne().sort({
      createdAt: -1,
    });

    // Get latest reading for each electrolyzer
    const unitIds = await ElectrolyzerData.distinct("unitId");

    const electrolyzers = await Promise.all(
      unitIds.map(async (unitId) => {
        return await ElectrolyzerData.findOne({ unitId }).sort({
          createdAt: -1,
        });
      })
    );

    // --------------------------------
    // PLANT ALERTS
    // --------------------------------

    if (plantData) {
      // Hydrogen production below target
      if (
        plantData.hydrogenProduction <
        plantData.productionTarget
      ) {
        alerts.push({
          type: "warning",
          category: "Production",
          title: "Hydrogen production below target",
          message: `Current production is ${plantData.hydrogenProduction} kg/day against a target of ${plantData.productionTarget} kg/day.`,
          time: plantData.createdAt,
        });
      }

      // Low system efficiency
      if (plantData.systemEfficiency < 85) {
        alerts.push({
          type: "warning",
          category: "Efficiency",
          title: "Low system efficiency",
          message: `System efficiency is currently ${plantData.systemEfficiency}%.`,
          time: plantData.createdAt,
        });
      }

      // High power consumption
      if (plantData.powerConsumption > 500) {
        alerts.push({
          type: "warning",
          category: "Power",
          title: "High power consumption",
          message: `Power consumption has reached ${plantData.powerConsumption} kW.`,
          time: plantData.createdAt,
        });
      }

      // High water usage
      if (plantData.waterUsage > 900) {
        alerts.push({
          type: "warning",
          category: "Water",
          title: "High water usage",
          message: `Water usage has reached ${plantData.waterUsage} L/day.`,
          time: plantData.createdAt,
        });
      }
    }

    // --------------------------------
    // ELECTROLYZER ALERTS
    // --------------------------------

    electrolyzers
      .filter(Boolean)
      .forEach((unit) => {
        // Maintenance alert
        if (unit.status === "Maintenance") {
          alerts.push({
            type: "critical",
            category: "Electrolyzer",
            title: `${unit.unitName} requires maintenance`,
            message: `${unit.unitName} is currently marked as Maintenance.`,
            unitId: unit.unitId,
            time: unit.createdAt,
          });
        }

        // Low efficiency alert
        if (
          unit.status === "Active" &&
          unit.efficiency > 0 &&
          unit.efficiency < 85
        ) {
          alerts.push({
            type: "warning",
            category: "Electrolyzer",
            title: `${unit.unitName} has low efficiency`,
            message: `${unit.unitName} efficiency is ${unit.efficiency}%.`,
            unitId: unit.unitId,
            time: unit.createdAt,
          });
        }
      });

    // --------------------------------
    // RESPONSE
    // --------------------------------

    res.json({
      totalAlerts: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Error generating alerts:", error);

    res.status(500).json({
      message: "Unable to generate alerts",
      error: error.message,
    });
  }
};

module.exports = {
  getAlerts,
};