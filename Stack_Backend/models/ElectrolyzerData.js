const mongoose = require("mongoose");

const electrolyzerDataSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true,
    },

    unitName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    hydrogenOutput: {
      type: Number,
      required: true,
    },

    powerConsumption: {
      type: Number,
      required: true,
    },

    efficiency: {
      type: Number,
      required: true,
    },

    operatingCondition: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ElectrolyzerData = mongoose.model(
  "ElectrolyzerData",
  electrolyzerDataSchema,
  "electrolyzerdatas"
);

module.exports = ElectrolyzerData;