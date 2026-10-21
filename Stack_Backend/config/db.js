const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/hydrogen_monitoring";

    await mongoose.connect(mongoURI);
    console.log("Connected Database:", mongoose.connection.name);
    console.log("Connected Host:", mongoose.connection.host);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;