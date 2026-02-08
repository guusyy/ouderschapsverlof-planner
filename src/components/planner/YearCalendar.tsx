import { getMonthsInScope } from "@/lib/calendar-utils";
import type { LeaveType, WorkWeekPattern } from "@/lib/constants";
import { MonthGrid } from "./MonthGrid";

interface YearCalendarProps {
	birthDate: Date;
	dayMap: Map<string, LeaveType>;
	workWeek: WorkWeekPattern;
	selectedBrush: LeaveType | null;
	onDayClick: (dateKey: string) => void;
	isManualDay: (dateKey: string) => boolean;
}

export function YearCalendar({ birthDate, dayMap, workWeek, selectedBrush, onDayClick, isManualDay }: YearCalendarProps) {
	const months = getMonthsInScope(birthDate);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{months.map(({ year, month }) => (
				<MonthGrid
					key={`${year}-${month}`}
					year={year}
					month={month}
					dayMap={dayMap}
					workWeek={workWeek}
					selectedBrush={selectedBrush}
					onDayClick={onDayClick}
					isManualDay={isManualDay}
				/>
			))}
		</div>
	);
}
