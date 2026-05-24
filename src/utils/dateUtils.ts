import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// returns today as a UTC midnight Date — used when saving tracking logs
// storing as midnight means date comparisons work regardless of timezone
export const getTodayUTC = (): Date => {
  return dayjs.utc().startOf('day').toDate();
};

// normalises any Date to UTC midnight for safe date-only comparisons
export const toUTCMidnight = (date: Date): Date => {
  return dayjs.utc(date).startOf('day').toDate();
};

// returns the last N days as UTC midnight Date objects, newest first
export const getLastNDays = (n: number): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < n; i++) {
    days.push(dayjs.utc().subtract(i, 'day').startOf('day').toDate());
  }
  return days;
};

// formats a Date as a YYYY-MM-DD string
export const formatDate = (date: Date): string => {
  return dayjs.utc(date).format('YYYY-MM-DD');
};
