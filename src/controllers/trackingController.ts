import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { TrackingLog } from '../models/TrackingLog';
import { sendSuccess, sendError } from '../utils/response';
import { getTodayUTC } from '../utils/dateUtils';
import { calculateStreak, getLast7DaysLogs } from '../services/streakService';

export const trackHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habitId = req.params.id as string;

    // make sure the habit exists and belongs to this user
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) {
      sendError(res, 'Habit not found.', 404);
      return;
    }

    const today = getTodayUTC();

    // only one log per habit per day is allowed
    const alreadyTracked = await TrackingLog.findOne({ habitId, completedOn: today });
    if (alreadyTracked) {
      sendError(res, 'Habit already marked as done for today.', 409);
      return;
    }

    const log = await TrackingLog.create({
      habitId: new Types.ObjectId(habitId),
      userId: new Types.ObjectId(req.userId),
      completedOn: today,
    });

    sendSuccess(res, 'Habit marked as completed for today.', log, 201);
  } catch (err) {
    next(err);
  }
};

export const getHabitHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habitId = req.params.id as string;

    // make sure the habit exists and belongs to this user
    const habit = await Habit.findOne({ _id: habitId, userId: req.userId });
    if (!habit) {
      sendError(res, 'Habit not found.', 404);
      return;
    }

    // fetch history and streak in parallel to save time
    const [history, streak] = await Promise.all([
      getLast7DaysLogs(habitId),
      calculateStreak(habitId),
    ]);

    sendSuccess(res, 'Habit history retrieved successfully.', {
      habit: { id: habit._id, title: habit.title, frequency: habit.frequency },
      streak,
      history,
    });
  } catch (err) {
    next(err);
  }
};
