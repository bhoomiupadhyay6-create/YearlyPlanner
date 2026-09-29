const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const goalRoutes = require('./routes/goalRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  const configuredUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (configuredUri) {
    await mongoose.connect(configuredUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
    return;
  }

  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log('MongoMemoryServer connected');
}

app.use(cors());
app.use(express.json());

connectDatabase().catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/goals', goalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});