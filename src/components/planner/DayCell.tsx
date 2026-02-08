import { isWeekend } from "date-fns";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { LEAVE_COLORS, LEAVE_RULES, type LeaveType, type WorkWeekPattern } from "@/lib/constants";
import { dateKey } from "@/lib/calendar-utils";
import { isWorkDay } from "@/lib/leave-calculations";
import { isFeestdag } from "@/lib/feestdagen";
import { cn } from "@/lib/utils";

interface DayCellProps {
	date: Date | null;
	dayMap: Map<string, LeaveType>;
	workWeek: WorkWeekPattern;
}

export function DayCell({ date, dayMap, workWeek }: DayCellProps) {
	if (!date) {
		return <div className="h-7 w-7" />;
	}

	const weekend = isWeekend(date);
	const key = dateKey(date);
	const leaveType = dayMap.get(key);
	const feestdagName = isFeestdag(date);
	const workDay = !weekend && isWorkDay(date, workWeek);

	const day = date.getDate();

	// Feestdag (not weekend): distinct visual with tooltip
	if (feestdagName && !weekend) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className="h-7 w-7 flex items-center justify-center rounded-sm text-xs font-medium bg-gradient-to-br from-red-100 to-orange-100 text-red-600 border border-red-200 transition-transform hover:scale-110"
					>
						{day}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="font-medium">{feestdagName}</p>
					<p className="text-xs text-muted-foreground">
						{date.toLocaleDateString("nl-NL", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	// Leave day on a work day
	if (leaveType && !weekend) {
		const rule = LEAVE_RULES[leaveType];
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn(
							"h-7 w-7 flex items-center justify-center rounded-sm text-xs font-medium transition-transform hover:scale-110",
							LEAVE_COLORS[leaveType].bg,
							"text-white",
						)}
					>
						{day}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p className="font-medium">{rule.label}</p>
					<p className="text-xs text-muted-foreground">
						{date.toLocaleDateString("nl-NL", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	// Non-work day (not weekend, not feestdag, but not in work pattern)
	const isNonWorkDay = !weekend && !workDay && !feestdagName;

	return (
		<div
			className={cn(
				"h-7 w-7 flex items-center justify-center rounded-sm text-xs",
				weekend && "bg-transparent text-slate-300",
				isNonWorkDay && "bg-slate-50 text-slate-300",
				workDay && "bg-slate-100 text-slate-500",
			)}
		>
			{day}
		</div>
	);
}
