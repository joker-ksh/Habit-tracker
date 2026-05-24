import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { sendSuccess, sendError } from '../utils/response';

export const createHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    // reject if the user already has a habit with the same title (case-insensitive)
    const existing = await Habit.findOne({
      userId: req.userId,
      title: { $regex: `^${title.trim()}$`, $options: 'i' },
    });
    if (existing) {
      sendError(res, `You already have a habit called "${existing.title}".`, 409);
      return;
    }

    const habit = await Habit.create({
      userId: new Types.ObjectId(req.userId),
      title,
      description,
      frequency,
      tags: tags ?? [],
      reminderTime,
    });

    sendSuccess(res, 'Habit created successfully.', habit, 201);
  } catch (err) {
    next(err);
  }
};

export const getHabits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // pagination — defaults to page 1, limit 10, max limit 100
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip  = (page - 1) * limit;

    // optional tag filter: GET /habits?tag=fitness
    const tag = req.query.tag as string | undefined;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (tag) filter.tags = tag;

    const [habits, total] = await Promise.all([
      Habit.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Habit.countDocuments(filter),
    ]);

    sendSuccess(res, 'Habits retrieved successfully.', {
      habits,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getHabitById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // userId check ensures users can only access their own habits
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.userId });
    if (!habit) {
      sendError(res, 'Habit not found.', 404);
      return;
    }

    sendSuccess(res, 'Habit retrieved successfully.', habit);
  } catch (err) {
    next(err);
  }
};

export const updateHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, frequency, tags, reminderTime } = req.body;

    // if the title is changing, make sure it doesn't clash with another habit
    if (title) {
      const duplicate = await Habit.findOne({
        userId: req.userId,
        title: { $regex: `^${title.trim()}$`, $options: 'i' },
        _id: { $ne: req.params.id }, // exclude the current habit from the check
      });
      if (duplicate) {
        sendError(res, `You already have a habit called "${duplicate.title}".`, 409);
        return;
      }
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, frequency, tags, reminderTime },
      { new: true, runValidators: true }
    );
    if (!habit) {
      sendError(res, 'Habit not found.', 404);
      return;
    }

    sendSuccess(res, 'Habit updated successfully.', habit);
  } catch (err) {
    next(err);
  }
};

export const deleteHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!habit) {
      sendError(res, 'Habit not found.', 404);
      return;
    }

    sendSuccess(res, 'Habit deleted successfully.');
  } catch (err) {
    next(err);
  }
};
