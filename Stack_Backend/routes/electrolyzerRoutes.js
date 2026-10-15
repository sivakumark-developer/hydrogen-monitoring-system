console.log("✅ Electrolyzer routes loaded");

const express = require("express");

const {
  addElectrolyzerData,
  getElectrolyzerData,
  getElectrolyzerHistory,
} = require("../controllers/electrolyzerController");

const router = express.Router();

router.post("/add", addElectrolyzerData);

router.get("/history", getElectrolyzerHistory);

router.get("/", getElectrolyzerData);

module.exports = router;