import {
  addDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatDistance,
  formatDistanceToNow,
  isFuture,
  isPast,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';

// Date formatting utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: Date | string, formatString: string = 'MMM d, yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid date';
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  },

  // Format date and time for display
  formatDateTime: (date: Date | string): string => {
    return dateUtils.formatDate(date, 'MMM d, yyyy \'at\' h:mm a');
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Invalid date';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Invalid date';
    }
  },

  // Format time ago (e.g., "2 hours ago")
  formatTimeAgo: (date: Date | string): string => {
    return dateUtils.formatRelativeTime(date);
  },

  // Format duration between two dates
  formatDuration: (startDate: Date | string, endDate: Date | string): string => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      if (!isValid(start) || !isValid(end)) return 'Invalid dates';
      return formatDistance(start, end);
    } catch (error) {
      console.error('Error formatting duration:', error);
      return 'Invalid dates';
    }
  },

  // Check if date is today
  isToday: (date: Date | string): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isToday(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Check if date is yesterday
  isYesterday: (date: Date | string): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isYesterday(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Check if date is tomorrow
  isTomorrow: (date: Date | string): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isTomorrow(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Check if date is in the past
  isPast: (date: Date | string): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isPast(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Check if date is in the future
  isFuture: (date: Date | string): boolean => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isFuture(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Get difference in days
  getDaysDifference: (startDate: Date | string, endDate: Date | string): number => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      return differenceInDays(end, start);
    } catch (error) {
      return 0;
    }
  },

  // Get difference in hours
  getHoursDifference: (startDate: Date | string, endDate: Date | string): number => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      return differenceInHours(end, start);
    } catch (error) {
      return 0;
    }
  },

  // Get difference in minutes
  getMinutesDifference: (startDate: Date | string, endDate: Date | string): number => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      return differenceInMinutes(end, start);
    } catch (error) {
      return 0;
    }
  },

  // Get start of day
  getStartOfDay: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return startOfDay(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Get end of day
  getEndOfDay: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return endOfDay(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Get start of week
  getStartOfWeek: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return startOfWeek(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Get end of week
  getEndOfWeek: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return endOfWeek(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Get start of month
  getStartOfMonth: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return startOfMonth(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Get end of month
  getEndOfMonth: (date: Date | string): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return endOfMonth(dateObj);
    } catch (error) {
      return new Date();
    }
  },

  // Add days to date
  addDays: (date: Date | string, days: number): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return addDays(dateObj, days);
    } catch (error) {
      return new Date();
    }
  },

  // Subtract days from date
  subDays: (date: Date | string, days: number): Date => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return subDays(dateObj, days);
    } catch (error) {
      return new Date();
    }
  },

  // Check if date is overdue (past due date)
  isOverdue: (dueDate: Date | string): boolean => {
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
      return isPast(dateObj) && !isToday(dateObj);
    } catch (error) {
      return false;
    }
  },

  // Get due date status
  getDueDateStatus: (dueDate: Date | string): 'overdue' | 'due-today' | 'due-soon' | 'upcoming' => {
    try {
      const dateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;

      if (isPast(dateObj) && !isToday(dateObj)) {
        return 'overdue';
      }

      if (isToday(dateObj)) {
        return 'due-today';
      }

      const daysUntilDue = differenceInDays(dateObj, new Date());
      if (daysUntilDue <= 3) {
        return 'due-soon';
      }

      return 'upcoming';
    } catch (error) {
      return 'upcoming';
    }
  },

  // Format due date with status
  formatDueDateWithStatus: (dueDate: Date | string): { text: string; status: string; color: string } => {
    const status = dateUtils.getDueDateStatus(dueDate);

    let color = 'text-gray-600';
    switch (status) {
      case 'overdue':
        color = 'text-red-600';
        break;
      case 'due-today':
        color = 'text-orange-600';
        break;
      case 'due-soon':
        color = 'text-yellow-600';
        break;
      case 'upcoming':
        color = 'text-green-600';
        break;
    }

    return {
      text: dateUtils.formatDate(dueDate, 'MMM d, yyyy'),
      status,
      color,
    };
  },

  // Get calendar week number
  getWeekNumber: (date: Date | string): number => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      const start = startOfWeek(dateObj);
      const firstDayOfYear = startOfDay(new Date(dateObj.getFullYear(), 0, 1));
      return Math.ceil(((start.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7);
    } catch (error) {
      return 1;
    }
  },

  // Check if two dates are the same day
  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    try {
      const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
      const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
      return d1.toDateString() === d2.toDateString();
    } catch (error) {
      return false;
    }
  },

  // Get business days between two dates
  getBusinessDays: (startDate: Date | string, endDate: Date | string): number => {
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      let count = 0;
      let current = new Date(start);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          count++;
        }
        current = addDays(current, 1);
      }

      return count;
    } catch (error) {
      return 0;
    }
  },
};

// Export individual functions for convenience
export const {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTimeAgo,
  formatDuration,
  isToday: checkIsToday,
  isYesterday: checkIsYesterday,
  isTomorrow: checkIsTomorrow,
  isPast: checkIsPast,
  isFuture: checkIsFuture,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  addDays: addDaysToDate,
  subDays: subtractDaysFromDate,
  isOverdue,
  getDueDateStatus,
  formatDueDateWithStatus,
  getWeekNumber,
  isSameDay,
  getBusinessDays,
} = dateUtils;

export default dateUtils;
