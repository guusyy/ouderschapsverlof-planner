import { LEAVE_TYPES, LEAVE_COLORS, LEAVE_RULES, type LeaveType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrushBarProps {
	selectedBrush: LeaveType | null;
	onSelectBrush: (brush: LeaveType | null) => void;
}

export function BrushBar({ selectedBrush, onSelectBrush }: BrushBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-xs font-medium text-slate-500 mr-1">Verfkwast:</span>
			{LEAVE_TYPES.map((type) => {
				const active = selectedBrush === type;
				return (
					<button
						key={type}
						type="button"
						onClick={() => onSelectBrush(active ? null : type)}
						className={cn(
							"flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
							active
								? cn("ring-2 ring-offset-1", LEAVE_COLORS[type].bg, "text-white")
								: "bg-slate-100 text-slate-600 hover:bg-slate-200",
						)}
					>
						<div
							className={cn(
								"h-2.5 w-2.5 rounded-full",
								active ? "bg-white/80" : LEAVE_COLORS[type].dot,
							)}
						/>
						{LEAVE_RULES[type].shortLabel}
					</button>
				);
			})}
		</div>
	);
}
