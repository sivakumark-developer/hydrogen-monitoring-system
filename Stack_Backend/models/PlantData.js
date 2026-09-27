const mongoose = require("mongoose");

const plantDataSchema = new mongoose.Schema(
  {
    hydrogenProduction: {
      type: Number,
      required: true,
    },

    productionTarget: {
      type: Number,
      required: true,
      default: 150,
    },

    powerConsumption: {
      type: Number,
      required: true,
    },

    waterUsage: {
      type: Number,
      required: true,
    },

    systemEfficiency: {
      type: Number,
      required: true,
    },

    electrolyzer01Status: {
      type: String,
      required: true,
    },

    electrolyzer02Status: {
      type: String,
      required: true,
    },

    electrolyzer03Status: {
      type: String,
      required: true,
    },

    plantStatus: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PlantData = mongoose.model("PlantData", plantDataSchema);

module.exports = PlantData;