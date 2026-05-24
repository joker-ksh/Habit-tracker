import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// central error handler — catches everything passed to next(err)
export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode ?? 500;
  const message    = err.message || 'Internal Server Error';

  // MongoDB duplicate key (e.g. unique email or habit title)
  if ((err as NodeJS.ErrnoException & { code?: number }).code === 11000) {
    const keyValue = (err as unknown as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    res.status(400).json({ success: false, message: `Duplicate value for ${field}. Please use a different value.` });
    return;
  }

  // Mongoose schema validation failed
  if (err.name === 'ValidationError') {
    const errors = Object.values(
      (err as unknown as { errors: Record<string, { message: string }> }).errors
    ).map((e) => e.message);
    res.status(400).json({ success: false, message: errors.join(', ') });
    return;
  }

  // invalid MongoDB ObjectId in a route param
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid ID format.' });
    return;
  }

  // in development, include the stack trace to help with debugging
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

// catches requests to routes that don't exist
export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: 'Route not found.' });
};
