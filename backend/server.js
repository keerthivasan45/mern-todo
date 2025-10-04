import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Task from './models/Task.js';

dotenv.config();

const app = express();

// CORS: permissive in dev, restricted in prod
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8888',
  process.env.FRONTEND_ORIGIN, // e.g., https://your-site.netlify.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());

// MongoDB connection (prefer MONGODB_URI; fallback to MONGO_URI if present)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI in environment.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// Health check
app.get('/', (_req, res) => res.status(200).send('Backend is working!'));

// ===== MERN To-Do API routes =====
app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Text is required' });
    const newTask = await Task.create({ text });
    res.status(201).json(newTask);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

