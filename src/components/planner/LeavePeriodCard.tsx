import { format, differenceInCalendarWeeks } from "date-fns";
import { nl } from "date-fns/locale";
import { X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
	LEAVE_COLORS,
	LEAVE_RULES,
	LEAVE_TYPES,
	type LeavePeriod,
	type LeaveType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["ma", "di", "wo", "do", "vr"];

interface LeavePeriodCardProps {
	period: LeavePeriod;
	index: number;
	onUpdate: (updates: Partial<LeavePeriod>) => void;
	onRemove: () => void;
}

export function LeavePeriodCard({
	period,
	index,
	onUpdate,
	onRemove,
}: LeavePeriodCardProps) {
	// Use the first selected type's color for the border
	const primaryType = period.leaveTypes[0];
	const borderColor = primaryType ? LEAVE_COLORS[primaryType].border : "border-slate-300";

	// Calculate summary
	const activeDays = period.days.filter(Boolean).length;
	const weeks = differenceInCalendarWeeks(period.endDate, period.startDate, {
		weekStartsOn: 1,
	}) + 1;

	const toggleLeaveType = (type: LeaveType) => {
		const isActive = period.leaveTypes.includes(type);
		if (isActive) {
			// Don't allow removing the last type
			if (period.leaveTypes.length <= 1) return;
			onUpdate({ leaveTypes: period.leaveTypes.filter((t) => t !== type) });
		} else {
			onUpdate({ leaveTypes: [...period.leaveTypes, type] });
		}
	};

	return (
		<div
			className={cn(
				"rounded-lg border-l-4 bg-white p-3 space-y-2.5",
				borderColor,
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<span className="text-xs font-medium text-slate-400">
					Periode {index + 1}
				</span>
				<button
					type="button"
					onClick={onRemove}
					className="text-slate-300 hover:text-slate-500 transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Leave type toggle buttons */}
			<div className="space-y-1.5">
				<span className="text-xs text-slate-400">Verloftypes</span>
				<div className="flex flex-wrap gap-1">
					{LEAVE_TYPES.map((type) => {
						const isActive = period.leaveTypes.includes(type);
						const colors = LEAVE_COLORS[type];
						return (
							<button
								key={type}
								type="button"
								onClick={() => toggleLeaveType(type)}
								className={cn(
									"px-2 h-6 rounded text-[10px] font-medium transition-colors border",
									isActive
										? `${colors.bg} text-white ${colors.border}`
										: `bg-white ${colors.text} ${colors.border} hover:bg-slate-50`,
								)}
							>
								{LEAVE_RULES[type].shortLabel}
							</button>
						);
					})}
				</div>
			</div>

			{/* Date range */}
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<span className="text-xs text-slate-400">Van</span>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full h-8 justify-start text-left text-xs font-normal"
							>
								<CalendarIcon className="mr-1.5 h-3 w-3" />
								{format(period.startDate, "d MMM yy", {
									locale: nl,
								})}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={period.startDate}
								onSelect={(date) =>
									date && onUpdate({ startDate: date })
								}
								locale={nl}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-1">
					<span className="text-xs text-slate-400">Tot</span>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full h-8 justify-start text-left text-xs font-normal"
							>
								<CalendarIcon className="mr-1.5 h-3 w-3" />
								{format(period.endDate, "d MMM yy", {
									locale: nl,
								})}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={period.endDate}
								onSelect={(date) =>
									date && onUpdate({ endDate: date })
								}
								locale={nl}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Day checkboxes */}
			<div className="space-y-1.5">
				<span className="text-xs text-slate-400">Dagen</span>
				<div className="flex gap-1">
					{DAY_LABELS.map((label, i) => (
						<button
							key={label}
							type="button"
							onClick={() => {
								const newDays = [...period.days];
								newDays[i] = !newDays[i];
								onUpdate({ days: newDays });
							}}
							className={cn(
								"flex-1 h-7 rounded text-xs font-medium transition-colors",
								period.days[i]
									? "bg-slate-700 text-white"
									: "bg-slate-100 text-slate-400 hover:bg-slate-200",
							)}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Week filter */}
			<div className="flex gap-1">
				{(
					[
						{ value: "every", label: "Elke week" },
						{ value: "even", label: "Even weken" },
						{ value: "uneven", label: "Oneven weken" },
					] as const
				).map((option) => {
					const isActive =
						option.value === "every"
							? period.everyWeek
							: !period.everyWeek &&
								period.weekFilter === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => {
								if (option.value === "every") {
									onUpdate({
										everyWeek: true,
										weekFilter: undefined,
									});
								} else {
									onUpdate({
										everyWeek: false,
										weekFilter: option.value,
									});
								}
							}}
							className={cn(
								"flex-1 h-6 rounded text-[10px] font-medium transition-colors",
								isActive
									? "bg-slate-600 text-white"
									: "bg-slate-50 text-slate-400 hover:bg-slate-100",
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>

			{/* Summary line */}
			<div className="text-xs text-slate-400">
				{activeDays > 0
					? `${activeDays} dag${activeDays !== 1 ? "en" : ""}/week, ${weeks} ${weeks === 1 ? "week" : "weken"}`
					: "Geen dagen geselecteerd"}
				{!period.everyWeek && period.weekFilter
					? ` (${period.weekFilter === "even" ? "even" : "oneven"} weken)`
					: ""}
			</div>

			{/* Salary info per selected type */}
			<div className="text-[10px] text-slate-400 space-y-0.5">
				{period.leaveTypes.map((type) => {
					const rule = LEAVE_RULES[type];
					return (
						<div key={type}>
							<span className={LEAVE_COLORS[type].text}>{rule.shortLabel}</span>
							{": "}
							{rule.salaryPercentage}%
							{rule.uwvDayCap && ` (max \u20AC${rule.uwvDayCap}/dag)`}
							{" \u00B7 "}
							{rule.paidBy}
						</div>
					);
				})}
			</div>
		</div>
	);
}
