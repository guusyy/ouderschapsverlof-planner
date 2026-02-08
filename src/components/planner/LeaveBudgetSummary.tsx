import { LEAVE_COLORS } from "@/lib/constants";
import type { LeaveBudget } from "@/lib/leave-calculations";
import { cn } from "@/lib/utils";

interface LeaveBudgetSummaryProps {
	budgets: LeaveBudget[];
}

export function LeaveBudgetSummary({ budgets }: LeaveBudgetSummaryProps) {
	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold text-slate-700">
				Verlofbudget
			</h3>
			{budgets.map((budget) => {
				const overBudget = budget.used > budget.max && budget.max !== Infinity;
				const percentage =
					budget.max === Infinity || budget.max === 0
						? 0
						: Math.min((budget.used / budget.max) * 100, 100);

				return (
					<div key={budget.type} className="space-y-1">
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center gap-1.5">
								<div
									className={cn(
										"h-2.5 w-2.5 rounded-sm",
										LEAVE_COLORS[budget.type].dot,
									)}
								/>
								<span className="text-slate-600">
									{budget.label}
								</span>
							</div>
							<span
								className={cn(
									"font-medium tabular-nums",
									overBudget
										? "text-red-600"
										: "text-slate-700",
								)}
							>
								{budget.used}/{budget.max === Infinity ? "\u221E" : budget.max} dagen
							</span>
						</div>
						{budget.max !== Infinity && (
							<div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full transition-all",
										overBudget
											? "bg-red-500"
											: LEAVE_COLORS[budget.type].dot,
									)}
									style={{ width: `${percentage}%` }}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
