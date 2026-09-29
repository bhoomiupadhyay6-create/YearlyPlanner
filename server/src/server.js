require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const goalRoutes = require('./routes/goalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  const configuredUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (configuredUri) {
    await mongoose.connect(configuredUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
    return;
  }

  const memoryServer = await MongoMemoryServer.create();
  const mongoUri = memoryServer.getUri();
  await mongoose.connect(mongoUri);
  console.log('MongoMemoryServer connected successfully');
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/goals', goalRoutes);

connectDatabase().catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});