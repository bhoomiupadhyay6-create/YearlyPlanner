const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const useMongoStorage = process.env.GOAL_STORAGE === "mongodb";
const goalRoutes = require(useMongoStorage
  ? "./routes/goalRoutes"
  : "./routes/goalRoutes.memory");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const clientDistPath = path.join(__dirname, "../../client/dist");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Yearly Planner backend is working!" });
});

app.use("/api/goals", goalRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

if (useMongoStorage) {
  const mongoose = require("mongoose");
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
      console.log("MongoDB connection failed:", error.message);
    });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});