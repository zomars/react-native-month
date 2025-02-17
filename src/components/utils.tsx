import { addDays, getNumberOfDaysInMonth } from '../utils/date';
import { changedDate, sameDate } from '../utils/validations';
import { MonthProps, DayType } from '../types';

const MONDAY_FIRST = [6, 0, 1, 2, 3, 4, 5];

function dayShouldBeActive(
  date: Date,
  startDate: Date,
  endDate: Date,
  firstDayOfMonth: Date,
  lastDayOfMonth: Date
) {
  if (date > lastDayOfMonth) {
    return endDate > lastDayOfMonth && startDate <= lastDayOfMonth;
  }

  return startDate < firstDayOfMonth && endDate >= firstDayOfMonth;
}

export function getMonthDays(
  month: number,
  year: number,
  firstDayMonday: boolean,
  disableRange: boolean,
  disabledDays: { [key: string]: any },
  disableOffsetDays: boolean,
  startDate?: Date,
  endDate?: Date,
  minDate?: Date,
  maxDate?: Date
): DayType[] {
  if (minDate instanceof Date) minDate.setHours(0, 0, 0, 0);
  if (maxDate instanceof Date) maxDate.setHours(0, 0, 0, 0);
  if (startDate instanceof Date) startDate.setHours(0, 0, 0, 0);
  if (endDate instanceof Date) endDate.setHours(0, 0, 0, 0);

  const firstMonthDay = new Date(year, month, 1);
  const lastMonthDay = new Date(year, month + 1, 0);

  const daysToAdd = getNumberOfDaysInMonth(month, year);
  const days: DayType[] = [];

  const startWeekOffset = firstDayMonday
    ? MONDAY_FIRST[firstMonthDay.getDay()]
    : firstMonthDay.getDay();
  const daysToCompleteRows = (startWeekOffset + daysToAdd) % 7;
  const lastRowNextMonthDays = daysToCompleteRows ? 7 - daysToCompleteRows : 0;

  for (let i = -startWeekOffset; i < daysToAdd + lastRowNextMonthDays; i++) {
    const date: Date = addDays(firstMonthDay, i);
    const day = date.getDate();
    const month = date.getMonth();
    const fullDay = day < 10 ? `0${day}` : day.toString();
    const fullMonth = month < 10 ? `0${month + 1}` : (month + 1).toString();
    const id = `${date.getFullYear()}-${fullMonth}-${fullDay}`;

    let isOnSelectableRange = !minDate && !maxDate;

    isOnSelectableRange =
      (!minDate || (minDate && date >= minDate)) &&
      (!maxDate || (maxDate && date <= maxDate));

    const isOutOfRange = !!(
      (minDate && date < minDate) ||
      (maxDate && date > maxDate)
    );
    const isMonthDate = i >= 0 && i < daysToAdd;
    let isStartDate = false;
    let isEndDate = false;
    let isActive = false;

    if (endDate && startDate && !disableRange) {
      isStartDate = isMonthDate && sameDate(date, startDate);
      isEndDate = isMonthDate && sameDate(date, endDate);

      if (!isMonthDate) {
        isActive = dayShouldBeActive(
          date,
          startDate,
          endDate,
          firstMonthDay,
          lastMonthDay
        );
      } else {
        isActive = date >= startDate && date <= endDate;
      }
    } else if (isMonthDate && startDate && sameDate(date, startDate)) {
      isStartDate = true;
      isEndDate = true;
      isActive = true;
    }

    const today = new Date();
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push({
      id: `${month}-${id}`,
      date,
      isToday,
      isMonthDate,
      isActive,
      isStartDate,
      isEndDate,
      isOutOfRange,
      isVisible:
        isOnSelectableRange &&
        isMonthDate &&
        !disabledDays[`${year}-${fullMonth}-${day}`],
      isHidden: disableOffsetDays && !isMonthDate,
    });
  }

  return days;
}

export function areEqual(prevProps: MonthProps, nextProps: MonthProps) {
  return (
    prevProps.month === nextProps.month &&
    prevProps.year === nextProps.year &&
    prevProps.locale === nextProps.locale &&
    Array.isArray(prevProps.dayNames) === Array.isArray(nextProps.dayNames) &&
    prevProps.showWeekdays === nextProps.showWeekdays &&
    prevProps.disableRange === nextProps.disableRange &&
    prevProps.disableOffsetDays === nextProps.disableOffsetDays &&
    prevProps.firstDayMonday === nextProps.firstDayMonday &&
    !changedDate(prevProps.startDate, nextProps.startDate) &&
    !changedDate(prevProps.endDate, nextProps.endDate) &&
    !changedDate(prevProps.minDate, nextProps.minDate) &&
    !changedDate(prevProps.maxDate, nextProps.maxDate)
  );
}
