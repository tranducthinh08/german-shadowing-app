import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import youtubeRoutes from './routes/youtube.routes.js';
import dictRoutes from './routes/dict.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/youtube', youtubeRoutes);
app.use('/api/dict', dictRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Only listen when running locally (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
