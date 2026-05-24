import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { User } from '../models/User';
import { sendError } from '../utils/response';

// adds userId to every authenticated request so controllers can use it
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // expect "Authorization: Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'No token provided. Authorization denied.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // double-check the user still exists in the DB (handles deleted accounts)
    const user = await User.findById(decoded.userId).select('_id');
    if (!user) {
      sendError(res, 'User belonging to this token no longer exists.', 401);
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 401);
  }
};
