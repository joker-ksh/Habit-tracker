import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
}

// creates a signed JWT for the given user ID
export const signToken = (userId: Types.ObjectId | string): string => {
  return jwt.sign(
    { userId: userId.toString() },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
};

// verifies a JWT and returns the decoded payload — throws if invalid or expired
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
