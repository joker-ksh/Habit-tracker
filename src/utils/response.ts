import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// all success responses go through here — keeps the shape consistent
export const sendSuccess = <T>(res: Response, message: string, data?: T, statusCode = 200): Response => {
  const body: ApiResponse<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

// all error responses go through here
export const sendError = (res: Response, message: string, statusCode = 500, data?: unknown): Response => {
  const body: ApiResponse = { success: false, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};
