const PlantData = require("../models/PlantData");

// Add plant data with input validation
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
    } = req.body || {};

    // Validate numeric values
    const numericFields = {
      hydrogenProduction,
      powerConsumption,
      waterUsage,
      systemEfficiency,
    };

    const values = {};

    for (const [field, value] of Object.entries(numericFields)) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing field: ${field}`,
        });
      }

      values[field] = Number(value);
    }

    // Reject negative hydrogen production
    console.log(
      "VALIDATION CHECK - hydrogenProduction:",
      values.hydrogenProduction
    );

    if (values.hydrogenProduction < 0) {
      console.log("VALIDATION REJECTED: Negative hydrogen production");

      return res.status(400).json({
        success: false,
        message: "Hydrogen production cannot be negative.",
      });
    }

    // Reject negative power consumption
    if (values.powerConsumption < 0) {
      return res.status(400).json({
        success: false,
        message: "Power consumption cannot be negative.",
      });
    }

    // Reject negative water usage
    if (values.waterUsage < 0) {
      return res.status(400).json({
        success: false,
        message: "Water usage cannot be negative.",
      });
    }

    // Efficiency must be between 0 and 100
    if (
      values.systemEfficiency < 0 ||
      values.systemEfficiency > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "System efficiency must be between 0 and 100.",
      });
    }

    // Validate production target
    const target =
      productionTarget === undefined ||
      productionTarget === null ||
      productionTarget === ""
        ? 150
        : Number(productionTarget);

    if (!Number.isFinite(target) || target <= 0) {
      return res.status(400).json({
        success: false,
        message: "Production target must be a positive number.",
      });
    }

    // Validate electrolyzer statuses
    const validElectrolyzerStatuses = [
      "Active",
      "Inactive",
      "Maintenance",
    ];

    const status01 = electrolyzer01Status || "Inactive";
    const status02 = electrolyzer02Status || "Inactive";
    const status03 = electrolyzer03Status || "Inactive";

    for (const [field, status] of Object.entries({
      electrolyzer01Status: status01,
      electrolyzer02Status: status02,
      electrolyzer03Status: status03,
    })) {
      if (!validElectrolyzerStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status for ${field}.`,
        });
      }
    }

    // Validate plant status
    const validPlantStatuses = [
      "Operational",
      "Stopped",
      "Maintenance",
    ];

    const finalPlantStatus = plantStatus || "Operational";

    if (!validPlantStatuses.includes(finalPlantStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plant status.",
      });
    }

    // Save only after all validations pass
    const result = await PlantData.create({
      hydrogenProduction: values.hydrogenProduction,
      productionTarget: target,
      powerConsumption: values.powerConsumption,
      waterUsage: values.waterUsage,
      systemEfficiency: values.systemEfficiency,
      electrolyzer01Status: status01,
      electrolyzer02Status: status02,
      electrolyzer03Status: status03,
      plantStatus: finalPlantStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Plant data added successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error adding plant data:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Plant data validation failed.",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add plant data.",
    });
  }
};

// Get plant history
const getPlantHistory = async (req, res) => {
  try {
    const data = await PlantData.find().sort({
      createdAt: 1,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching plant history:", error);

    return res.status(500).json({
      message: "Failed to fetch plant history.",
    });
  }
};

module.exports = {
  addPlantData,
  getPlantHistory,
};