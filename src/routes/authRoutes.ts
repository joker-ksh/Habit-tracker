import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';
import { validate } from '../middlewares/validationMiddleware';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
], validate, register);

router.post('/login', [
  body('email').trim().isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
], validate, login);

export default router;
