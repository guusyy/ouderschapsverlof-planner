import { addDays, isWeekend, format, getISOWeek, differenceInCalendarDays } from "date-fns";
import {
	type LeaveType,
	type LeavePeriod,
	type PlannerInput,
	type WorkWeekPattern,
	LEAVE_RULES,
	LEAVE_TYPES,
	LEAVE_TYPE_PRIORITY,
	FULLTIME_HOURS,
} from "./constants";
import { isFeestdag } from "./feestdagen";

/**
 * Check if a date is a work day based on the work week pattern.
 * Excludes weekends, feestdagen, and non-work days per the even/uneven pattern.
 */
export function isWorkDay(date: Date, workWeek: WorkWeekPattern): boolean {
	if (isWeekend(date)) return false;
	if (isFeestdag(date) !== null) return false;

	// getDay: 0=Sun, 1=Mon ... 6=Sat → convert to 0=Mon ... 4=Fri
	const dayIndex = (date.getDay() + 6) % 7; // 0=ma, 1=di, 2=wo, 3=do, 4=vr
	if (dayIndex > 4) return false; // shouldn't happen after weekend check

	const isoWeek = getISOWeek(date);
	const isEvenWeek = isoWeek % 2 === 0;
	const pattern = isEvenWeek ? workWeek.evenWeek : workWeek.unevenWeek;

	return pattern[dayIndex] ?? false;
}

/**
 * Count work days per week based on the work week pattern.
 * Returns the average across even and uneven weeks.
 */
export function avgWorkDaysPerWeek(workWeek: WorkWeekPattern): number {
	const evenDays = workWeek.evenWeek.filter(Boolean).length;
	const unevenDays = workWeek.unevenWeek.filter(Boolean).length;
	return (evenDays + unevenDays) / 2;
}

/**
 * Generate the day map from leave periods with budget-aware auto-fill.
 * For each period, days are filled with the best available leave type
 * (by LEAVE_TYPE_PRIORITY), cascading to the next type as budgets run out.
 */
export function generateDayMapFromPeriods(
	periods: LeavePeriod[],
	workWeek: WorkWeekPattern,
	vakantiedagenBudget: number,
): { dayMap: Map<string, LeaveType>; overlaps: Set<string> } {
	const dayMap = new Map<string, LeaveType>();
	const overlaps = new Set<string>();

	// Compute max budgets per leave type
	const avgDays = avgWorkDaysPerWeek(workWeek);
	const maxBudget = new Map<LeaveType, number>();
	for (const type of LEAVE_TYPES) {
		if (type === "vakantiedagen") {
			maxBudget.set(type, vakantiedagenBudget);
		} else {
			const rule = LEAVE_RULES[type];
			maxBudget.set(type, rule.maxWeeks === Infinity ? Infinity : Math.round(rule.maxWeeks * avgDays));
		}
	}

	// Track remaining budget per type (mutable)
	const remaining = new Map<LeaveType, number>();
	for (const [type, max] of maxBudget) {
		if (type !== "vakantiedagen") {
			remaining.set(type, max);
		}
	}

	// Vakantiedagen budget resets per calendar year
	const vakantiedagenPerYear = new Map<number, number>();
	function getVakantiedagenRemaining(year: number): number {
		if (!vakantiedagenPerYear.has(year)) {
			vakantiedagenPerYear.set(year, vakantiedagenBudget);
		}
		return vakantiedagenPerYear.get(year)!;
	}

	for (const period of periods) {
		const totalDays = differenceInCalendarDays(period.endDate, period.startDate);
		if (totalDays < 0) continue;

		// Sort this period's leave types by priority
		const sortedTypes = [...period.leaveTypes].sort(
			(a, b) => LEAVE_TYPE_PRIORITY.indexOf(a) - LEAVE_TYPE_PRIORITY.indexOf(b),
		);

		for (let d = 0; d <= totalDays; d++) {
			const date = addDays(period.startDate, d);
			if (isWeekend(date)) continue;
			if (isFeestdag(date) !== null) continue;

			const dayIndex = (date.getDay() + 6) % 7;
			if (dayIndex > 4) continue;
			if (!period.days[dayIndex]) continue;

			if (!period.everyWeek && period.weekFilter) {
				const isoWeek = getISOWeek(date);
				const isEvenWeek = isoWeek % 2 === 0;
				if (period.weekFilter === "even" && !isEvenWeek) continue;
				if (period.weekFilter === "uneven" && isEvenWeek) continue;
			}

			if (!isWorkDay(date, workWeek)) continue;

			const key = format(date, "yyyy-MM-dd");
			if (dayMap.has(key)) {
				overlaps.add(key);
			}

			// Pick the first type with remaining budget
			let assigned = false;
			for (const type of sortedTypes) {
				if (type === "vakantiedagen") {
					const year = date.getFullYear();
					const rem = getVakantiedagenRemaining(year);
					if (rem > 0) {
						dayMap.set(key, type);
						vakantiedagenPerYear.set(year, rem - 1);
						assigned = true;
						break;
					}
				} else {
					const rem = remaining.get(type) ?? 0;
					if (rem > 0) {
						dayMap.set(key, type);
						remaining.set(type, rem - 1);
						assigned = true;
						break;
					}
				}
			}

			// If no type has budget left, day gets no leave (remove overlap entry if any)
			if (!assigned) {
				dayMap.delete(key);
			}
		}
	}

	return { dayMap, overlaps };
}

/**
 * Calculate leave budgets: consumed days and max days per leave type.
 */
export interface LeaveBudget {
	type: LeaveType;
	label: string;
	used: number;
	max: number;
	year?: number;
}

export function calculateLeaveBudgets(
	dayMap: Map<string, LeaveType>,
	workWeek: WorkWeekPattern,
	vakantiedagenBudget: number,
): LeaveBudget[] {
	const avgDaysPerWeek = avgWorkDaysPerWeek(workWeek);

	// Count used days per type directly from dayMap
	const usedDays = new Map<LeaveType, number>();
	// Track vakantiedagen per year
	const vakantiedagenPerYear = new Map<number, number>();
	for (const [key, type] of dayMap) {
		usedDays.set(type, (usedDays.get(type) ?? 0) + 1);
		if (type === "vakantiedagen") {
			const year = Number.parseInt(key.substring(0, 4), 10);
			vakantiedagenPerYear.set(year, (vakantiedagenPerYear.get(year) ?? 0) + 1);
		}
	}

	const budgets: LeaveBudget[] = [];

	for (const type of LEAVE_TYPES) {
		if (type === "vakantiedagen") continue;
		const rule = LEAVE_RULES[type];
		const used = usedDays.get(type) ?? 0;
		const max = rule.maxWeeks === Infinity ? Infinity : Math.round(rule.maxWeeks * avgDaysPerWeek);
		budgets.push({ type, label: rule.shortLabel, used, max });
	}

	// Add per-year vakantiedagen budgets
	const years = Array.from(vakantiedagenPerYear.keys()).sort();
	if (years.length === 0) {
		budgets.push({
			type: "vakantiedagen",
			label: LEAVE_RULES.vakantiedagen.shortLabel,
			used: 0,
			max: vakantiedagenBudget,
		});
	} else {
		for (const year of years) {
			budgets.push({
				type: "vakantiedagen",
				label: `${LEAVE_RULES.vakantiedagen.shortLabel} ${year}`,
				used: vakantiedagenPerYear.get(year) ?? 0,
				max: vakantiedagenBudget,
				year,
			});
		}
	}

	return budgets;
}

export interface FinancialRow {
	type: LeaveType;
	label: string;
	days: number;
	dailyIncome: number;
	totalIncome: number;
	paidBy: string;
	normalIncome: number;
	difference: number;
}

export interface MonthlyRow {
	month: string;
	year: number;
	normalIncome: number;
	actualIncome: number;
	difference: number;
}

export interface FinancialSummary {
	perType: FinancialRow[];
	monthly: MonthlyRow[];
	totalNormal: number;
	totalActual: number;
	totalDifference: number;
}

export function calculateDailyGross(
	monthlySalary: number,
	workWeek: WorkWeekPattern,
): number {
	const workRatio = workWeek.hoursPerWeek / FULLTIME_HOURS;
	// Use standard 21.75 work days per month for daily gross calculation
	return (monthlySalary * workRatio) / 21.75;
}

export function calculateLeaveIncome(
	dailyGross: number,
	salaryPercentage: number,
	uwvDayCap: number | null,
): number {
	const uncapped = dailyGross * (salaryPercentage / 100);
	if (uwvDayCap !== null) {
		return Math.min(uncapped, uwvDayCap);
	}
	return uncapped;
}

export function calculateFinancialSummary(
	input: PlannerInput,
	dayMap: Map<string, LeaveType>,
): FinancialSummary {
	if (!input.birthDate) {
		return {
			perType: [],
			monthly: [],
			totalNormal: 0,
			totalActual: 0,
			totalDifference: 0,
		};
	}

	const workRatio = input.workWeek.hoursPerWeek / FULLTIME_HOURS;
	const dailyGross = calculateDailyGross(input.monthlySalary, input.workWeek);
	const scaledMonthlySalary = input.monthlySalary * workRatio;

	// Count leave days per type from dayMap
	const daysByType = new Map<LeaveType, number>();
	for (const [, leaveType] of dayMap) {
		daysByType.set(leaveType, (daysByType.get(leaveType) ?? 0) + 1);
	}

	// Per-type financial breakdown
	const perType: FinancialRow[] = [];
	for (const [type, days] of daysByType) {
		const rule = LEAVE_RULES[type];
		// Fully employer-paid leave has no income impact
		const isFullPay = rule.salaryPercentage === 100 && rule.uwvDayCap === null;
		const dailyIncome = isFullPay ? dailyGross : calculateLeaveIncome(
			dailyGross,
			rule.salaryPercentage,
			rule.uwvDayCap,
		);
		const totalIncome = dailyIncome * days;
		const normalIncome = dailyGross * days;

		perType.push({
			type,
			label: rule.label,
			days,
			dailyIncome: Math.round(dailyIncome * 100) / 100,
			totalIncome: Math.round(totalIncome * 100) / 100,
			paidBy: rule.paidBy,
			normalIncome: Math.round(normalIncome * 100) / 100,
			difference: Math.round((totalIncome - normalIncome) * 100) / 100,
		});
	}

	// Monthly breakdown for 12 months from birth
	const DUTCH_MONTHS = [
		"januari", "februari", "maart", "april", "mei", "juni",
		"juli", "augustus", "september", "oktober", "november", "december",
	];

	const monthly: MonthlyRow[] = [];
	const startMonth = input.birthDate.getMonth();
	const startYear = input.birthDate.getFullYear();

	for (let i = 0; i < 12; i++) {
		const monthIndex = (startMonth + i) % 12;
		const year = startYear + Math.floor((startMonth + i) / 12);

		// Count actual work days and leave days in this month
		const leaveDaysInMonth = new Map<LeaveType, number>();
		let totalWorkDaysInMonth = 0;

		const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
		for (let d = 1; d <= daysInMonth; d++) {
			const date = new Date(year, monthIndex, d);
			if (isWorkDay(date, input.workWeek)) {
				totalWorkDaysInMonth++;
				const key = format(date, "yyyy-MM-dd");
				const leaveType = dayMap.get(key);
				if (leaveType) {
					leaveDaysInMonth.set(
						leaveType,
						(leaveDaysInMonth.get(leaveType) ?? 0) + 1,
					);
				}
			}
		}

		const normalIncome = scaledMonthlySalary;
		const dailyNormal = totalWorkDaysInMonth > 0 ? scaledMonthlySalary / totalWorkDaysInMonth : 0;

		let actualIncome = normalIncome;

		for (const [leaveType, days] of leaveDaysInMonth) {
			// Fully employer-paid leave has no income impact
			const rule = LEAVE_RULES[leaveType];
			if (rule.salaryPercentage === 100 && rule.uwvDayCap === null) continue;

			const dailyLeave = calculateLeaveIncome(
				dailyGross,
				rule.salaryPercentage,
				rule.uwvDayCap,
			);
			// Replace normal pay with leave pay for those days
			actualIncome -= dailyNormal * days;
			actualIncome += dailyLeave * days;
		}

		monthly.push({
			month: DUTCH_MONTHS[monthIndex],
			year,
			normalIncome: Math.round(normalIncome * 100) / 100,
			actualIncome: Math.round(actualIncome * 100) / 100,
			difference: Math.round((actualIncome - normalIncome) * 100) / 100,
		});
	}

	const totalNormal = monthly.reduce((sum, m) => sum + m.normalIncome, 0);
	const totalActual = monthly.reduce((sum, m) => sum + m.actualIncome, 0);

	return {
		perType,
		monthly,
		totalNormal: Math.round(totalNormal * 100) / 100,
		totalActual: Math.round(totalActual * 100) / 100,
		totalDifference: Math.round((totalActual - totalNormal) * 100) / 100,
	};
}

export function validateLeaveConfig(
	input: PlannerInput,
	dayMap: Map<string, LeaveType>,
	overlaps: Set<string>,
	budgets: LeaveBudget[],
): string[] {
	const warnings: string[] = [];
	if (!input.birthDate) return warnings;

	// Check budget overflows
	for (const budget of budgets) {
		if (budget.used > budget.max && budget.max !== Infinity) {
			const label = budget.year
				? `${LEAVE_RULES[budget.type].label} ${budget.year}`
				: LEAVE_RULES[budget.type].label;
			warnings.push(
				`${label}: ${budget.used} dagen gebruikt, maar budget is ${budget.max} dagen.`,
			);
		}
	}

	// Check deadline violations: find last leave day per type
	const lastDayPerType = new Map<LeaveType, Date>();
	for (const [key, leaveType] of dayMap) {
		const [y, m, d] = key.split("-").map(Number);
		const date = new Date(y, m - 1, d);
		const current = lastDayPerType.get(leaveType);
		if (!current || date > current) {
			lastDayPerType.set(leaveType, date);
		}
	}

	for (const [type, lastDay] of lastDayPerType) {
		const rule = LEAVE_RULES[type];
		if (rule.deadlineWeeks === Infinity) continue;
		const deadlineDate = addDays(input.birthDate, rule.deadlineWeeks * 7);
		if (lastDay >= deadlineDate) {
			warnings.push(
				`${rule.label}: verlof loopt voorbij de deadline van ${rule.deadlineWeeks} weken na geboorte.`,
			);
		}
	}

	// Check overlaps
	if (overlaps.size > 0) {
		warnings.push(
			`${overlaps.size} dag(en) zijn aan meerdere verlofperiodes toegewezen. Alleen het laatste type telt.`,
		);
	}

	return warnings;
}
