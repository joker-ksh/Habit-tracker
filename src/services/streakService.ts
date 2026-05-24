import { Types } from 'mongoose';
import { TrackingLog } from '../models/TrackingLog';
import { formatDate, getTodayUTC } from '../utils/dateUtils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// calculates how many consecutive days a habit has been completed up to today
// if today isn't logged yet, it checks from yesterday so the streak isn't broken mid-day
export const calculateStreak = async (habitId: Types.ObjectId | string): Promise<number> => {
  const logs = await TrackingLog.find({ habitId })
    .sort({ completedOn: -1 })
    .select('completedOn')
    .lean();

  if (logs.length === 0) return 0;

  // use a Set for O(1) date lookups
  const completedDates = new Set(logs.map((log) => formatDate(log.completedOn)));

  const today     = formatDate(getTodayUTC());
  const yesterday = dayjs.utc().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');

  // streak is only active if today or yesterday was completed
  const startDate = completedDates.has(today)
    ? today
    : completedDates.has(yesterday)
    ? yesterday
    : null;

  if (!startDate) return 0;

  // walk backwards day by day until we hit a gap
  let streak  = 0;
  let current = dayjs.utc(startDate);

  while (completedDates.has(current.format('YYYY-MM-DD'))) {
    streak++;
    current = current.subtract(1, 'day');
  }

  return streak;
};

// returns the last 7 days as an array with a completed flag for each day
export const getLast7DaysLogs = async (
  habitId: Types.ObjectId | string
): Promise<{ date: string; completed: boolean }[]> => {
  const sevenDaysAgo = dayjs.utc().subtract(6, 'day').startOf('day').toDate();

  const logs = await TrackingLog.find({
    habitId,
    completedOn: { $gte: sevenDaysAgo },
  })
    .select('completedOn')
    .lean();

  const completedDates = new Set(logs.map((log) => formatDate(log.completedOn)));

  // build the 7-day array from oldest to newest
  const result: { date: string; completed: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = dayjs.utc().subtract(i, 'day').startOf('day').format('YYYY-MM-DD');
    result.push({ date, completed: completedDates.has(date) });
  }

  return result;
};
