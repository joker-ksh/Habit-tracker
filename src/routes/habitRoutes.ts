import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createHabit, getHabits, getHabitById, updateHabit, deleteHabit } from '../controllers/habitController';
import { trackHabit, getHabitHistory } from '../controllers/trackingController';
import { validate } from '../middlewares/validationMiddleware';
import { protect } from '../middlewares/authMiddleware';
import { apiRateLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

router.use(protect, apiRateLimiter);

const validId = param('id').isMongoId().withMessage('Invalid habit ID.');

// POST — all required fields must be present
const createBody = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('description').optional().trim(),
  body('frequency').isIn(['daily', 'weekly']).withMessage('Frequency must be daily or weekly.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
  body('reminderTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Reminder time must be in HH:MM format.'),
];

// PUT — every field is optional, only validate what's provided
const updateBody = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.'),
  body('description').optional().trim(),
  body('frequency').optional().isIn(['daily', 'weekly']).withMessage('Frequency must be daily or weekly.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
  body('reminderTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Reminder time must be in HH:MM format.'),
];

// Habits CRUD
router.post('/',      createBody,             validate, createHabit);
router.get('/',       [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
], validate, getHabits);
router.get('/:id',    validId,                validate, getHabitById);
router.put('/:id',    [validId, ...updateBody], validate, updateHabit);
router.delete('/:id', validId,                validate, deleteHabit);

// Tracking
router.post('/:id/track',  validId, validate, trackHabit);
router.get('/:id/history', validId, validate, getHabitHistory);

export default router;
