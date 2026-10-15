const mongoose = require("mongoose");

const electrolyzerStatuses = [
  "Active",
  "Inactive",
  "Maintenance",
];

const plantStatuses = [
  "Operational",
  "Stopped",
  "Maintenance",
];

const plantDataSchema = new mongoose.Schema(
  {
    hydrogenProduction: {
      type: Number,
      required: [true, "Hydrogen production is required."],
      min: [0, "Hydrogen production cannot be negative."],
    },

    productionTarget: {
      type: Number,
      required: [true, "Production target is required."],
      default: 150,
      min: [0.01, "Production target must be greater than zero."],
    },

    powerConsumption: {
      type: Number,
      required: [true, "Power consumption is required."],
      min: [0, "Power consumption cannot be negative."],
    },

    waterUsage: {
      type: Number,
      required: [true, "Water usage is required."],
      min: [0, "Water usage cannot be negative."],
    },

    systemEfficiency: {
      type: Number,
      required: [true, "System efficiency is required."],
      min: [0, "System efficiency cannot be below 0%."],
      max: [100, "System efficiency cannot exceed 100%."],
    },

    electrolyzer01Status: {
      type: String,
      required: [true, "Electrolyzer 01 status is required."],
      enum: {
        values: electrolyzerStatuses,
        message: "Invalid status for Electrolyzer 01.",
      },
    },

    electrolyzer02Status: {
      type: String,
      required: [true, "Electrolyzer 02 status is required."],
      enum: {
        values: electrolyzerStatuses,
        message: "Invalid status for Electrolyzer 02.",
      },
    },

    electrolyzer03Status: {
      type: String,
      required: [true, "Electrolyzer 03 status is required."],
      enum: {
        values: electrolyzerStatuses,
        message: "Invalid status for Electrolyzer 03.",
      },
    },

    plantStatus: {
      type: String,
      required: [true, "Plant status is required."],
      enum: {
        values: plantStatuses,
        message: "Invalid plant status.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const PlantData = mongoose.model("PlantData", plantDataSchema);

module.exports = PlantData;