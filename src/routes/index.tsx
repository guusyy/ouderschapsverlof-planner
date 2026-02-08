import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { usePlannerState } from "@/hooks/use-planner-state";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { CalendarLegend } from "@/components/planner/CalendarLegend";
import { YearCalendar } from "@/components/planner/YearCalendar";
import { FinancialSummary } from "@/components/planner/FinancialSummary";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const {
		birthDate,
		setBirthDate,
		workWeek,
		setWorkWeek,
		monthlySalary,
		setMonthlySalary,
		leavePeriods,
		addPeriod,
		removePeriod,
		updatePeriod,
		vakantiedagenBudget,
		setVakantiedagenBudget,
		dayMap,
		leaveBudgets,
		financialSummary,
		validationErrors,
	} = usePlannerState();

	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
				{/* Sidebar */}
				<aside className="w-full lg:w-[360px] shrink-0 border-b lg:border-b-0 lg:border-r bg-white p-6 overflow-y-auto">
					<PlannerSidebar
						birthDate={birthDate}
						onBirthDateChange={setBirthDate}
						monthlySalary={monthlySalary}
						onMonthlySalaryChange={setMonthlySalary}
						workWeek={workWeek}
						onWorkWeekChange={setWorkWeek}
						leavePeriods={leavePeriods}
						onAddPeriod={addPeriod}
						onRemovePeriod={removePeriod}
						onUpdatePeriod={updatePeriod}
						vakantiedagenBudget={vakantiedagenBudget}
						onVakantiedagenBudgetChange={setVakantiedagenBudget}
						leaveBudgets={leaveBudgets}
					/>
				</aside>

				{/* Main content */}
				<main className="flex-1 p-6 space-y-6 overflow-y-auto">
					{/* Validation warnings */}
					{validationErrors.length > 0 && (
						<div className="space-y-2">
							{validationErrors.map((error) => (
								<div
									key={error}
									className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2"
								>
									<AlertTriangle className="h-4 w-4 shrink-0" />
									{error}
								</div>
							))}
						</div>
					)}

					{/* Calendar section */}
					{birthDate ? (
						<>
							<CalendarLegend dayMap={dayMap} />
							<YearCalendar
								birthDate={birthDate}
								dayMap={dayMap}
								workWeek={workWeek}
							/>
							<FinancialSummary summary={financialSummary} />
						</>
					) : (
						<div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
							<CalendarDays className="h-16 w-16 mb-4" />
							<p className="text-lg font-medium">
								Kies een uitgerekende datum
							</p>
							<p className="text-sm">
								om je verlofplanning te bekijken
							</p>
						</div>
					)}
				</main>
			</div>
		</TooltipProvider>
	);
}
