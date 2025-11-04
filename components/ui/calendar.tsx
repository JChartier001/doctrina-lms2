'use client';

import dayjs, { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import classNames from 'react-day-picker/style.module.css';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarProps extends Omit<React.ComponentProps<typeof DayPicker>, 'mode' | 'selected' | 'onSelect'> {
	selected: Dayjs | undefined;
	onSelect: (date: Dayjs | undefined) => void;
}

export function Calendar({ selected, onSelect, ...props }: CalendarProps) {
	const handleSelect = (date: Date | undefined) => {
		onSelect(date ? dayjs(date) : undefined);
	};

	return (
		<DayPicker
			mode="single"
			endMonth={dayjs().add(5, 'years').endOf('month').toDate()}
			selected={selected ? selected.toDate() : undefined}
			onSelect={handleSelect}
			required={false}
			{...props}
			classNames={{
				...classNames,
				months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 min-w-[310px] p-2',
				month: 'space-y-4',
				month_caption: 'flex justify-center pt-1 relative items-center p-4',
				caption_label: 'text-sm font-medium',
				dropdowns: 'flex justify-center pt-1 relative items-center p-4 bg-background',
				nav: 'space-x-4 flex items-center',
				button_previous: cn(
					buttonVariants({ variant: 'outline' }),
					'h-7 w-7 bg-transparent p-0  opacity-50 hover:opacity-100 absolute left-1 ',
				),
				button_next: cn(
					buttonVariants({ variant: 'outline' }),
					'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 ',
				),
				month_grid: 'w-full border-collapse space-y-1',
				weekdays: 'flex justify-between  px-3',
				week: 'flex w-full mt-2',
				day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
				selected:
					'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
				today: 'bg-accent text-accent-foreground rounded-md',
				outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
				disabled: 'text-muted-foreground opacity-50',
				range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
				hidden: 'invisible',
			}}
			components={{
				Chevron: p => (p.orientation === 'left' ? <ChevronLeft className="mr-2" {...p} /> : <ChevronRight {...p} />),
			}}
		/>
	);
}
