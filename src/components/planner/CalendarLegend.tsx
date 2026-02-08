import {
	LEAVE_COLORS,
	LEAVE_RULES,
	type LeaveType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CalendarLegendProps {
	dayMap: Map<string, LeaveType>;
}

export function CalendarLegend({ dayMap }: CalendarLegendProps) {
	// Derive active leave types from dayMap
	const activeTypes = new Set<LeaveType>();
	for (const [, type] of dayMap) {
		activeTypes.add(type);
	}

	return (
		<div className="flex flex-wrap gap-4 text-sm">
			{Array.from(activeTypes).map((type) => (
				<div key={type} className="flex items-center gap-1.5">
					<div
						className={cn(
							"h-3 w-3 rounded-sm",
							LEAVE_COLORS[type].dot,
						)}
					/>
					<span className="text-slate-600">
						{LEAVE_RULES[type].shortLabel}
					</span>
				</div>
			))}
			<div className="flex items-center gap-1.5">
				<div className="h-3 w-3 rounded-sm bg-slate-100" />
				<span className="text-slate-600">Werkdag</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="h-3 w-3 rounded-sm bg-slate-50 border border-slate-200" />
				<span className="text-slate-600">Vrije dag</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="h-3 w-3 rounded-sm border border-slate-200" />
				<span className="text-slate-600">Weekend</span>
			</div>
			<div className="flex items-center gap-1.5">
				<div className="h-3 w-3 rounded-sm bg-gradient-to-br from-red-100 to-orange-100 border border-red-200" />
				<span className="text-slate-600">Feestdag</span>
			</div>
		</div>
	);
}
