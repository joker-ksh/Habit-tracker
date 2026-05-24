import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { sendError } from '../utils/response';

// limits each user to 100 requests per hour
// authenticated requests are keyed by userId so each user gets their own counter
// unauthenticated requests fall back to IP (IPv6-safe via ipKeyGenerator)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  standardHeaders: true,  // sends RateLimit headers in the response
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.userId) return `user:${req.userId}`;
    return ipKeyGenerator(req.ip ?? '');
  },
  handler: (_req, res) => {
    sendError(res, 'Too many requests. You have exceeded the 100 requests/hour limit.', 429);
  },
});
