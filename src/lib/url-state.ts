import { format, parseISO } from "date-fns";
import type { LeavePeriod, LeaveType, WorkWeekPattern } from "./constants";

// Compact leave type codes
const LEAVE_TYPE_TO_CODE: Record<LeaveType, string> = {
	geboorteverlof: "g",
	aanvullend: "a",
	betaaldOuderschapsverlof: "b",
	onbetaaldOuderschapsverlof: "o",
	vakantiedagen: "v",
};

const CODE_TO_LEAVE_TYPE: Record<string, LeaveType> = {
	g: "geboorteverlof",
	a: "aanvullend",
	b: "betaaldOuderschapsverlof",
	o: "onbetaaldOuderschapsverlof",
	v: "vakantiedagen",
};

function boolArrayToBitmask(arr: boolean[]): number {
	let mask = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i]) mask |= 1 << i;
	}
	return mask;
}

function bitmaskToBoolArray(mask: number, length: number): boolean[] {
	const arr: boolean[] = [];
	for (let i = 0; i < length; i++) {
		arr.push((mask & (1 << i)) !== 0);
	}
	return arr;
}

interface CompactPeriod {
	t: string[];
	s: string;
	e: string;
	d: number;
	w: number;
	f?: string;
}

interface CompactState {
	b: string;
	w: { e: number; u: number; h: number };
	v: number;
	p: CompactPeriod[];
}

export interface UrlPlannerState {
	birthDate: Date;
	workWeek: WorkWeekPattern;
	vakantiedagenBudget: number;
	leavePeriods: LeavePeriod[];
}

function serializeState(state: UrlPlannerState): CompactState {
	return {
		b: format(state.birthDate, "yyyy-MM-dd"),
		w: {
			e: boolArrayToBitmask(state.workWeek.evenWeek),
			u: boolArrayToBitmask(state.workWeek.unevenWeek),
			h: state.workWeek.hoursPerWeek,
		},
		v: state.vakantiedagenBudget,
		p: state.leavePeriods.map((p) => {
			const compact: CompactPeriod = {
				t: p.leaveTypes.map((lt) => LEAVE_TYPE_TO_CODE[lt]),
				s: format(p.startDate, "yyyy-MM-dd"),
				e: format(p.endDate, "yyyy-MM-dd"),
				d: boolArrayToBitmask(p.days),
				w: p.everyWeek ? 1 : 0,
			};
			if (!p.everyWeek && p.weekFilter) {
				compact.f = p.weekFilter === "even" ? "e" : "u";
			}
			return compact;
		}),
	};
}

function deserializeState(data: CompactState): UrlPlannerState | null {
	try {
		const birthDate = parseISO(data.b);
		if (Number.isNaN(birthDate.getTime())) return null;

		const workWeek: WorkWeekPattern = {
			evenWeek: bitmaskToBoolArray(data.w.e, 5),
			unevenWeek: bitmaskToBoolArray(data.w.u, 5),
			hoursPerWeek: data.w.h,
		};

		let nextId = 1;
		const leavePeriods: LeavePeriod[] = data.p.map((p) => ({
			id: String(nextId++),
			leaveTypes: p.t
				.map((c) => CODE_TO_LEAVE_TYPE[c])
				.filter(Boolean) as LeaveType[],
			startDate: parseISO(p.s),
			endDate: parseISO(p.e),
			days: bitmaskToBoolArray(p.d, 5),
			everyWeek: p.w === 1,
			weekFilter:
				p.f === "e" ? "even" : p.f === "u" ? "uneven" : undefined,
		}));

		return {
			birthDate,
			workWeek,
			vakantiedagenBudget: data.v,
			leavePeriods,
		};
	} catch {
		return null;
	}
}

export function serializeToUrl(state: UrlPlannerState): void {
	const compact = serializeState(state);
	const json = JSON.stringify(compact);
	const encoded = btoa(json);
	const url = new URL(window.location.href);
	url.searchParams.set("s", encoded);
	window.history.replaceState(null, "", url.toString());
}

export function deserializeFromUrl(): UrlPlannerState | null {
	try {
		const url = new URL(window.location.href);
		const encoded = url.searchParams.get("s");
		if (!encoded) return null;
		const json = atob(encoded);
		const data: CompactState = JSON.parse(json);
		return deserializeState(data);
	} catch {
		return null;
	}
}
