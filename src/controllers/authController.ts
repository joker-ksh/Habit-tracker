import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { signToken } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // check if email is already taken
    const existing = await User.findOne({ email });
    if (existing) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    await User.create({ name, email, password });

    sendSuccess(res, 'Registration successful. You can now log in.', undefined, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // password was excluded in the schema model explicitly added in the query/
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    //userId would be stored in this token(used mongoose to generate the userId)
    const token = signToken(user._id as import('mongoose').Types.ObjectId);
    sendSuccess(res, 'Login successful.', { token });
  } catch (err) {
    next(err);
  }
};
