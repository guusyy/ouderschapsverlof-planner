import { getMonthsInScope } from "@/lib/calendar-utils";
import type { LeaveType, WorkWeekPattern } from "@/lib/constants";
import { MonthGrid } from "./MonthGrid";

interface YearCalendarProps {
	birthDate: Date;
	dayMap: Map<string, LeaveType>;
	workWeek: WorkWeekPattern;
}

export function YearCalendar({ birthDate, dayMap, workWeek }: YearCalendarProps) {
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
				/>
			))}
		</div>
	);
}
