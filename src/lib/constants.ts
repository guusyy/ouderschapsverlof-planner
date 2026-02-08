export const LEAVE_TYPES = [
	"geboorteverlof",
	"aanvullend",
	"betaaldOuderschapsverlof",
	"onbetaaldOuderschapsverlof",
	"vakantiedagen",
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];

export interface LeaveRule {
	label: string;
	shortLabel: string;
	maxWeeks: number;
	salaryPercentage: number;
	paidBy: string;
	deadlineWeeks: number;
	uwvDayCap: number | null;
	fixedDuration: boolean;
	description: string;
}

export const LEAVE_RULES: Record<LeaveType, LeaveRule> = {
	geboorteverlof: {
		label: "Geboorteverlof",
		shortLabel: "Geboorte",
		maxWeeks: 1,
		salaryPercentage: 100,
		paidBy: "Werkgever",
		deadlineWeeks: 4,
		uwvDayCap: null,
		fixedDuration: true,
		description:
			"1 werkweek volledig doorbetaald door je werkgever. Op te nemen binnen 4 weken na de geboorte.",
	},
	aanvullend: {
		label: "Aanvullend geboorteverlof",
		shortLabel: "Aanvullend",
		maxWeeks: 5,
		salaryPercentage: 70,
		paidBy: "UWV",
		deadlineWeeks: 26,
		uwvDayCap: 290.67,
		fixedDuration: false,
		description:
			"Maximaal 5 werkweken tegen 70% van je salaris, betaald door het UWV. Op te nemen binnen 6 maanden.",
	},
	betaaldOuderschapsverlof: {
		label: "Betaald ouderschapsverlof",
		shortLabel: "Betaald ouderschap",
		maxWeeks: 9,
		salaryPercentage: 70,
		paidBy: "UWV",
		deadlineWeeks: 52,
		uwvDayCap: 212.97,
		fixedDuration: false,
		description:
			"9 weken tegen 70% van je salaris, betaald door het UWV. Op te nemen in het eerste levensjaar.",
	},
	onbetaaldOuderschapsverlof: {
		label: "Onbetaald ouderschapsverlof",
		shortLabel: "Onbetaald",
		maxWeeks: 17,
		salaryPercentage: 0,
		paidBy: "Niemand",
		deadlineWeeks: 416, // until child is 8 years
		uwvDayCap: null,
		fixedDuration: false,
		description:
			"Maximaal 17 weken onbetaald verlof. Op te nemen tot het kind 8 jaar is.",
	},
	vakantiedagen: {
		label: "Vakantiedagen",
		shortLabel: "Vakantie",
		maxWeeks: Infinity,
		salaryPercentage: 100,
		paidBy: "Werkgever",
		deadlineWeeks: Infinity,
		uwvDayCap: null,
		fixedDuration: false,
		description:
			"Reguliere vakantiedagen, volledig doorbetaald.",
	},
};

export const LEAVE_COLORS: Record<
	LeaveType,
	{ bg: string; text: string; border: string; dot: string }
> = {
	geboorteverlof: {
		bg: "bg-blue-500",
		text: "text-blue-700",
		border: "border-blue-500",
		dot: "bg-blue-500",
	},
	aanvullend: {
		bg: "bg-emerald-500",
		text: "text-emerald-700",
		border: "border-emerald-500",
		dot: "bg-emerald-500",
	},
	betaaldOuderschapsverlof: {
		bg: "bg-amber-500",
		text: "text-amber-700",
		border: "border-amber-500",
		dot: "bg-amber-500",
	},
	onbetaaldOuderschapsverlof: {
		bg: "bg-rose-500",
		text: "text-rose-700",
		border: "border-rose-500",
		dot: "bg-rose-500",
	},
	vakantiedagen: {
		bg: "bg-purple-500",
		text: "text-purple-700",
		border: "border-purple-500",
		dot: "bg-purple-500",
	},
};

// Priority order: best (highest salary %) to worst
export const LEAVE_TYPE_PRIORITY: LeaveType[] = [
	"geboorteverlof",
	"vakantiedagen",
	"aanvullend",
	"betaaldOuderschapsverlof",
	"onbetaaldOuderschapsverlof",
];

export const FULLTIME_HOURS = 40;
export const AVG_WORK_DAYS_PER_MONTH = 21.75;
export const WORK_DAYS_PER_WEEK = 5;

// 0=ma, 1=di, 2=wo, 3=do, 4=vr
export interface WorkWeekPattern {
	evenWeek: boolean[]; // [true,true,true,true,false] = ma-do
	unevenWeek: boolean[]; // [true,true,false,true,false] = ma,di,do
	hoursPerWeek: number;
}

export interface LeavePeriod {
	id: string;
	leaveTypes: LeaveType[];
	startDate: Date;
	endDate: Date;
	days: boolean[]; // [ma, di, wo, do, vr] — which days within the range
	everyWeek: boolean; // true = every week, false = only specific weeks
	weekFilter?: "even" | "uneven"; // when everyWeek=false
}

export interface PlannerInput {
	birthDate: Date | null;
	workWeek: WorkWeekPattern;
	monthlySalary: number;
	leavePeriods: LeavePeriod[];
	vakantiedagenBudget: number;
}
