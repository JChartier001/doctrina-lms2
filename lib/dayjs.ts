import dayjs, { type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// extend Day.js with the necessary plugins

export type { Dayjs };

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault('America/New_York');

export { dayjs };

export const isDateBetween = (date: string, start: string, end: string) => {
	const startDate = dayjs(start);
	const endDate = dayjs(end);
	const dateToCheck = dayjs(date);

	return dateToCheck.isAfter(startDate) && dateToCheck.isBefore(endDate);
};

export const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
