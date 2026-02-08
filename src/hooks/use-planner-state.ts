import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { addWeeks, addDays } from "date-fns";
import {
	type LeavePeriod,
	type LeaveType,
	type PlannerInput,
	type WorkWeekPattern,
} from "@/lib/constants";
import {
	generateDayMapFromPeriods,
	calculateLeaveBudgets,
	calculateFinancialSummary,
	validateLeaveConfig,
} from "@/lib/leave-calculations";
import { serializeToUrl, deserializeFromUrl } from "@/lib/url-state";

const DEFAULT_WORK_WEEK: WorkWeekPattern = {
	evenWeek: [true, true, true, true, false],
	unevenWeek: [true, true, true, true, false],
	hoursPerWeek: 36,
};

let nextId = 1;
function generateId(): string {
	return String(nextId++);
}

function createDefaultPeriods(birthDate: Date | null): LeavePeriod[] {
	if (!birthDate) return [];

	const start = birthDate;
	const end = addDays(addWeeks(birthDate, 6), -1);

	return [
		{
			id: generateId(),
			leaveTypes: ["geboorteverlof", "aanvullend"],
			startDate: start,
			endDate: end,
			days: [true, true, true, true, true],
			everyWeek: true,
		},
	];
}

export function usePlannerState() {
	// Try to restore state from URL on initial render
	const urlState = useRef(deserializeFromUrl());
	const initializedFromUrl = urlState.current !== null;

	const [birthDate, setBirthDateRaw] = useState<Date | null>(
		urlState.current?.birthDate ?? null,
	);
	const [workWeek, setWorkWeek] = useState<WorkWeekPattern>(
		urlState.current?.workWeek ?? DEFAULT_WORK_WEEK,
	);
	const [monthlySalary, setMonthlySalary] = useState(0);
	const [leavePeriods, setLeavePeriods] = useState<LeavePeriod[]>(
		urlState.current?.leavePeriods ?? [],
	);
	const [vakantiedagenBudget, setVakantiedagenBudget] = useState(
		urlState.current?.vakantiedagenBudget ?? 20,
	);
	const [manualDays, setManualDays] = useState<Record<string, LeaveType>>(
		urlState.current?.manualDays ?? {},
	);
	const [selectedBrush, setSelectedBrush] = useState<LeaveType | null>(null);
	const [hasInitialized, setHasInitialized] = useState(initializedFromUrl);

	// Sync nextId to avoid collisions with restored periods
	if (initializedFromUrl && urlState.current) {
		const maxId = Math.max(
			0,
			...urlState.current.leavePeriods.map((p) => Number(p.id) || 0),
		);
		if (maxId >= nextId) nextId = maxId + 1;
		// Clear ref so this only runs once
		urlState.current = null;
	}

	const setBirthDate = useCallback(
		(date: Date | null) => {
			setBirthDateRaw(date);
			if (date && !hasInitialized) {
				setLeavePeriods(createDefaultPeriods(date));
				setHasInitialized(true);
			}
		},
		[hasInitialized],
	);

	// Sync state to URL on changes
	useEffect(() => {
		if (!birthDate) return;
		serializeToUrl({
			birthDate,
			workWeek,
			vakantiedagenBudget,
			leavePeriods,
			manualDays,
		});
	}, [birthDate, workWeek, vakantiedagenBudget, leavePeriods, manualDays]);

	const input: PlannerInput = useMemo(
		() => ({
			birthDate,
			workWeek,
			monthlySalary,
			leavePeriods,
			vakantiedagenBudget,
		}),
		[birthDate, workWeek, monthlySalary, leavePeriods, vakantiedagenBudget],
	);

	const { dayMap: periodDayMap, overlaps } = useMemo(() => {
		if (!birthDate) return { dayMap: new Map(), overlaps: new Set<string>() };
		return generateDayMapFromPeriods(leavePeriods, workWeek, vakantiedagenBudget);
	}, [birthDate, leavePeriods, workWeek, vakantiedagenBudget]);

	// Merge manual days into dayMap (only for keys NOT already covered by periods)
	const dayMap = useMemo(() => {
		const merged = new Map(periodDayMap);
		for (const [key, type] of Object.entries(manualDays)) {
			if (!merged.has(key)) {
				merged.set(key, type);
			}
		}
		return merged;
	}, [periodDayMap, manualDays]);

	const leaveBudgets = useMemo(
		() => calculateLeaveBudgets(dayMap, workWeek, vakantiedagenBudget),
		[dayMap, workWeek, vakantiedagenBudget],
	);

	const financialSummary = useMemo(
		() => calculateFinancialSummary(input, dayMap),
		[input, dayMap],
	);

	const validationErrors = useMemo(
		() => validateLeaveConfig(input, dayMap, overlaps, leaveBudgets),
		[input, dayMap, overlaps, leaveBudgets],
	);

	const addPeriod = useCallback((period: Omit<LeavePeriod, "id">) => {
		setLeavePeriods((prev) => [...prev, { ...period, id: generateId() }]);
	}, []);

	const removePeriod = useCallback((id: string) => {
		setLeavePeriods((prev) => prev.filter((p) => p.id !== id));
	}, []);

	const updatePeriod = useCallback((id: string, updates: Partial<LeavePeriod>) => {
		setLeavePeriods((prev) =>
			prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
		);
	}, []);

	const toggleManualDay = useCallback(
		(dateKey: string) => {
			setManualDays((prev) => {
				if (prev[dateKey]) {
					const { [dateKey]: _, ...rest } = prev;
					return rest;
				}
				if (selectedBrush) {
					return { ...prev, [dateKey]: selectedBrush };
				}
				return prev;
			});
		},
		[selectedBrush],
	);

	return {
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
		manualDays,
		selectedBrush,
		setSelectedBrush,
		toggleManualDay,
	};
}
