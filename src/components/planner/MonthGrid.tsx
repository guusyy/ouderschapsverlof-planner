import {
	getMonthGrid,
	getDutchMonthName,
	getDutchDayAbbreviations,
} from "@/lib/calendar-utils";
import type { LeaveType, WorkWeekPattern } from "@/lib/constants";
import { DayCell } from "./DayCell";

interface MonthGridProps {
	year: number;
	month: number;
	dayMap: Map<string, LeaveType>;
	workWeek: WorkWeekPattern;
	selectedBrush: LeaveType | null;
	onDayClick: (dateKey: string) => void;
	isManualDay: (dateKey: string) => boolean;
}

export function MonthGrid({ year, month, dayMap, workWeek, selectedBrush, onDayClick, isManualDay }: MonthGridProps) {
	const grid = getMonthGrid(year, month);
	const dayNames = getDutchDayAbbreviations();
	const monthName = getDutchMonthName(month);

	return (
		<div>
			<h3 className="text-sm font-semibold text-slate-700 mb-2 capitalize">
				{monthName} {year}
			</h3>
			<div className="grid grid-cols-7 gap-0.5">
				{dayNames.map((name) => (
					<div
						key={name}
						className="h-5 w-7 flex items-center justify-center text-[10px] font-medium text-slate-400 uppercase"
					>
						{name}
					</div>
				))}
				{grid.map((date, i) => (
					<DayCell
						key={i}
						date={date}
						dayMap={dayMap}
						workWeek={workWeek}
						selectedBrush={selectedBrush}
						onDayClick={onDayClick}
						isManualDay={isManualDay}
					/>
				))}
			</div>
		</div>
	);
}
