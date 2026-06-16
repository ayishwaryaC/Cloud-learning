const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-service:27017/appdb';
const port = process.env.PORT || 5000;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.get('/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  const status = state === 1 ? 'up' : 'degraded';
  res.status(state === 1 ? 200 : 503).json({
    service: 'backend',
    status,
    mongoState: state
  });
});

app.get('/api/messages', async (_req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(20);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const message = await Message.create({ text: text.trim() });
    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages', async (_req, res) => {
  try {
    const result = await Message.deleteMany({});
    return res.json({
      ok: true,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
