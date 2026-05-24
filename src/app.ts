import './config/env'; // must be first — loads and validates .env
import express from 'express';
import { connectDB } from './config/database';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import habitRoutes from './routes/habitRoutes';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

const app = express();

// parse incoming JSON bodies (limit to 10kb to avoid large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// simple health check — useful for uptime monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Habit Tracker API is running.' });
});

// main routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// 404 handler for unknown routes, then the global error handler
app.use(notFound);
app.use(errorHandler);

// connect to MongoDB then start the server
const start = async (): Promise<void> => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
};

start();

export default app;
