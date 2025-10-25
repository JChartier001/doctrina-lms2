'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
	label: string;
	value: string;
}

interface MultiSelectProps {
	value: string[];
	onChange: (values: string[]) => void;
	options: MultiSelectOption[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function MultiSelect({
	value,
	onChange,
	options,
	placeholder = 'Select...',
	className,
	disabled,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState('');

	const toggleValue = (val: string) => {
		if (value.includes(val)) {
			onChange(value.filter(v => v !== val));
		} else {
			onChange([...value, val]);
		}
	};

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn('w-full justify-between items-center min-h-10 h-auto px-3 py-2', className)}
					disabled={disabled}
				>
					<div className="flex flex-wrap gap-1 items-center text-left grow">
						{selectedLabels.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
						{selectedLabels.map(label => (
							<Badge key={label} variant="secondary" className="mr-1">
								{label}
								<button
									type="button"
									onClick={e => {
										e.stopPropagation();
										onChange(value.filter(v => v !== options.find(o => o.label === label)?.value));
									}}
									className="ml-1 rounded-full hover:bg-muted px-1"
									aria-label={`Remove ${label}`}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
					<div className="flex items-center gap-2">
						{value.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="px-2 h-7 text-muted-foreground hover:text-foreground"
								onClick={clearAll}
							>
								Clear
							</Button>
						)}
						<ChevronDown className="h-4 w-4 opacity-60" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
				<Command shouldFilter={false}>
					<CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup className="max-h-56 overflow-auto">
						{options
							.filter(
								o =>
									o.label.toLowerCase().includes(search.toLowerCase()) ||
									o.value.toLowerCase().includes(search.toLowerCase()),
							)
							.map(option => {
								const checked = value.includes(option.value);
								return (
									<CommandItem key={option.value} onSelect={() => toggleValue(option.value)} className="cursor-pointer">
										<Check className={cn('mr-2 h-4 w-4', checked ? 'opacity-100' : 'opacity-0')} />
										{option.label}
									</CommandItem>
								);
							})}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
