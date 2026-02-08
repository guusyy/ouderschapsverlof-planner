import { format, addWeeks, addDays } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import type { WorkWeekPattern, LeavePeriod } from "@/lib/constants";
import type { LeaveBudget } from "@/lib/leave-calculations";
import type { CustomMaxWeeks } from "@/lib/url-state";
import { cn } from "@/lib/utils";
import { WorkWeekEditor } from "./WorkWeekEditor";
import { LeaveBudgetSummary } from "./LeaveBudgetSummary";
import { LeavePeriodCard } from "./LeavePeriodCard";

interface PlannerSidebarProps {
	birthDate: Date | null;
	onBirthDateChange: (date: Date | null) => void;
	monthlySalary: number;
	onMonthlySalaryChange: (salary: number) => void;
	workWeek: WorkWeekPattern;
	onWorkWeekChange: (workWeek: WorkWeekPattern) => void;
	leavePeriods: LeavePeriod[];
	onAddPeriod: (period: Omit<LeavePeriod, "id">) => void;
	onRemovePeriod: (id: string) => void;
	onUpdatePeriod: (id: string, updates: Partial<LeavePeriod>) => void;
	vakantiedagenBudget: number;
	onVakantiedagenBudgetChange: (budget: number) => void;
	customMaxWeeks: CustomMaxWeeks;
	onCustomMaxWeeksChange: (value: CustomMaxWeeks) => void;
	leaveBudgets: LeaveBudget[];
}

export function PlannerSidebar({
	birthDate,
	onBirthDateChange,
	monthlySalary,
	onMonthlySalaryChange,
	workWeek,
	onWorkWeekChange,
	leavePeriods,
	onAddPeriod,
	onRemovePeriod,
	onUpdatePeriod,
	vakantiedagenBudget,
	onVakantiedagenBudgetChange,
	customMaxWeeks,
	onCustomMaxWeeksChange,
	leaveBudgets,
}: PlannerSidebarProps) {
	const handleAddPeriod = () => {
		const startDate = birthDate
			? addWeeks(birthDate, leavePeriods.length > 0 ? 6 : 0)
			: new Date();
		const endDate = addDays(addWeeks(startDate, 4), -1);

		onAddPeriod({
			leaveTypes: ["betaaldOuderschapsverlof"],
			startDate,
			endDate,
			days: [true, true, true, true, true],
			everyWeek: true,
		});
	};

	return (
		<div className="space-y-5">
			{/* Birth date picker */}
			<div className="space-y-2">
				<Label className="text-sm font-medium text-slate-700">
					Uitgerekende datum
				</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!birthDate && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{birthDate
								? format(birthDate, "d MMMM yyyy", {
										locale: nl,
									})
								: "Kies een datum"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={birthDate ?? undefined}
							onSelect={(date) =>
								onBirthDateChange(date ?? null)
							}
							locale={nl}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Salary */}
			<div className="space-y-2">
				<Label className="text-sm font-medium text-slate-700">
					Bruto maandsalaris (fulltime)
				</Label>
				<div className="relative">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
						&euro;
					</span>
					<Input
						type="number"
						value={monthlySalary}
						onChange={(e) =>
							onMonthlySalaryChange(
								Number(e.target.value) || 0,
							)
						}
						className="pl-7"
						min={0}
						step={100}
					/>
				</div>
			</div>

			<Separator />

			{/* Work week editor */}
			<WorkWeekEditor
				workWeek={workWeek}
				onChange={onWorkWeekChange}
			/>

			{/* Leave budget summary */}
			<LeaveBudgetSummary
				budgets={leaveBudgets}
				customMaxWeeks={customMaxWeeks}
				onCustomMaxWeeksChange={onCustomMaxWeeksChange}
				vakantiedagenBudget={vakantiedagenBudget}
				onVakantiedagenBudgetChange={onVakantiedagenBudgetChange}
			/>

			<Separator />

			{/* Leave periods */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-slate-700">
						Verlofperiodes
					</h3>
					<button
						type="button"
						onClick={handleAddPeriod}
						className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
					>
						<Plus className="h-3.5 w-3.5" />
						Toevoegen
					</button>
				</div>

				{leavePeriods.length === 0 && (
					<p className="text-xs text-slate-400 py-2">
						Nog geen verlofperiodes.{" "}
						{!birthDate && "Kies eerst een uitgerekende datum."}
					</p>
				)}

				{leavePeriods.map((period, index) => (
					<LeavePeriodCard
						key={period.id}
						period={period}
						index={index}
						onUpdate={(updates) =>
							onUpdatePeriod(period.id, updates)
						}
						onRemove={() => onRemovePeriod(period.id)}
					/>
				))}
			</div>
		</div>
	);
}
