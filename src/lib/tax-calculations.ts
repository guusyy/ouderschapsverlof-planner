import type { LeaveType } from "./constants";
import type { FinancialSummary, MonthlyRow, FinancialRow } from "./leave-calculations";

// --- Types ---

interface TaxBracket {
	upperLimit: number; // Infinity for the last bracket
	rate: number; // e.g. 0.3575
}

interface ArbeidskortingStep {
	upperLimit: number;
	baseAmount: number;
	rate: number; // build-up or phase-out rate
	fromAmount: number; // income threshold for this step
}

interface TaxYearConfig {
	brackets: TaxBracket[];
	algemeneHeffingskorting: {
		max: number;
		phaseOutRate: number;
		phaseOutFrom: number;
	};
	arbeidskorting: ArbeidskortingStep[];
}

export interface NetFinancialSummary {
	monthly: {
		netNormalIncome: number;
		netActualIncome: number;
		netDifference: number;
	}[];
	perType: {
		type: LeaveType;
		netTotalIncome: number;
		netNormalIncome: number;
		netDifference: number;
	}[];
	totalNetNormal: number;
	totalNetActual: number;
	totalNetDifference: number;
	taxYear: number;
}

// --- 2026 Tax Constants ---

const TAX_2026: TaxYearConfig = {
	brackets: [
		{ upperLimit: 38_883, rate: 0.3575 },
		{ upperLimit: 78_426, rate: 0.3756 },
		{ upperLimit: Infinity, rate: 0.495 },
	],
	algemeneHeffingskorting: {
		max: 3_115,
		phaseOutRate: 0.06398,
		phaseOutFrom: 29_736,
	},
	arbeidskorting: [
		{ upperLimit: 11_965, baseAmount: 0, rate: 0.08324, fromAmount: 0 },
		{ upperLimit: 25_845, baseAmount: 996, rate: 0.31009, fromAmount: 11_965 },
		{ upperLimit: 45_592, baseAmount: 5_300, rate: 0.0195, fromAmount: 25_845 },
		{ upperLimit: 132_920, baseAmount: 5_685, rate: -0.0651, fromAmount: 45_592 },
		{ upperLimit: Infinity, baseAmount: 0, rate: 0, fromAmount: 132_920 },
	],
};

const TAX_CONFIGS: Record<number, TaxYearConfig> = {
	2026: TAX_2026,
};

// --- Core Tax Functions ---

export function getTaxConfig(year: number): TaxYearConfig {
	return TAX_CONFIGS[year] ?? TAX_2026;
}

export function calculateAnnualLoonheffing(
	annualGross: number,
	config: TaxYearConfig,
): number {
	let tax = 0;
	let remaining = annualGross;
	let prevLimit = 0;

	for (const bracket of config.brackets) {
		const taxableInBracket = Math.min(remaining, bracket.upperLimit - prevLimit);
		if (taxableInBracket <= 0) break;
		tax += taxableInBracket * bracket.rate;
		remaining -= taxableInBracket;
		prevLimit = bracket.upperLimit;
	}

	return tax;
}

export function calculateAlgemeneHeffingskorting(
	annualGross: number,
	config: TaxYearConfig,
): number {
	const { max, phaseOutRate, phaseOutFrom } = config.algemeneHeffingskorting;
	if (annualGross <= phaseOutFrom) return max;
	const reduction = (annualGross - phaseOutFrom) * phaseOutRate;
	return Math.max(0, max - reduction);
}

export function calculateArbeidskorting(
	arbeidsinkomen: number,
	config: TaxYearConfig,
): number {
	// Find the applicable step
	for (const step of config.arbeidskorting) {
		if (arbeidsinkomen <= step.upperLimit) {
			const amount = step.baseAmount + step.rate * (arbeidsinkomen - step.fromAmount);
			return Math.max(0, amount);
		}
	}
	return 0;
}

export function calculateAnnualNet(
	annualGross: number,
	config: TaxYearConfig,
): number {
	if (annualGross <= 0) return 0;
	const loonheffing = calculateAnnualLoonheffing(annualGross, config);
	const ahk = calculateAlgemeneHeffingskorting(annualGross, config);
	const ak = calculateArbeidskorting(annualGross, config);
	const totalTax = Math.max(0, loonheffing - ahk - ak);
	return annualGross - totalTax;
}

// --- Net Financial Summary ---

export function calculateNetFinancialSummary(
	grossSummary: FinancialSummary,
	scaledMonthlySalary: number,
	taxYear: number,
): NetFinancialSummary | null {
	if (scaledMonthlySalary <= 0 || grossSummary.monthly.length === 0) {
		return null;
	}

	const config = getTaxConfig(taxYear);

	// Annual gross for "normal" scenario (no leave)
	const annualGrossNormal = scaledMonthlySalary * 12;

	// Annual gross for "actual" scenario (with leave)
	const annualGrossActual = grossSummary.monthly.reduce(
		(sum, m) => sum + m.actualIncome,
		0,
	);

	// Calculate annual net for both
	const annualNetNormal = calculateAnnualNet(annualGrossNormal, config);
	const annualNetActual = calculateAnnualNet(annualGrossActual, config);

	// Net ratios
	const netRatioNormal =
		annualGrossNormal > 0 ? annualNetNormal / annualGrossNormal : 0;
	const netRatioActual =
		annualGrossActual > 0 ? annualNetActual / annualGrossActual : 0;

	const totalNetDifference =
		Math.round((annualNetActual - annualNetNormal) * 100) / 100;
	const totalBrutoDifference = grossSummary.monthly.reduce(
		(sum, m) => sum + m.difference,
		0,
	);

	// Apply ratios to monthly amounts
	// Distribute the total netto difference proportionally based on each month's
	// share of the bruto difference. This avoids months with small bruto losses
	// showing a phantom positive netto difference due to the higher net ratio.
	const monthly = grossSummary.monthly.map((m: MonthlyRow) => {
		const netNormal = Math.round(m.normalIncome * netRatioNormal * 100) / 100;
		const netActual = Math.round(m.actualIncome * netRatioActual * 100) / 100;
		const netDifference =
			totalBrutoDifference !== 0 && m.difference !== 0
				? Math.round(
						(m.difference / totalBrutoDifference) *
							totalNetDifference *
							100,
					) / 100
				: 0;
		return {
			netNormalIncome: netNormal,
			netActualIncome: netActual,
			netDifference,
		};
	});

	// Apply ratios to per-type amounts
	// Same proportional distribution for per-type breakdown.

	const perType = grossSummary.perType.map((row: FinancialRow) => {
		const netTotal = Math.round(row.totalIncome * netRatioActual * 100) / 100;
		const netNormal = Math.round(row.normalIncome * netRatioNormal * 100) / 100;
		// Attribute netto difference proportionally to types that cause bruto loss
		const netDifference =
			totalBrutoDifference !== 0 && row.difference !== 0
				? Math.round(
						(row.difference / totalBrutoDifference) *
							totalNetDifference *
							100,
					) / 100
				: 0;
		return {
			type: row.type,
			netTotalIncome: netTotal,
			netNormalIncome: netNormal,
			netDifference,
		};
	});

	const totalNetNormal = monthly.reduce((sum, m) => sum + m.netNormalIncome, 0);
	const totalNetActual = monthly.reduce((sum, m) => sum + m.netActualIncome, 0);

	return {
		monthly,
		perType,
		totalNetNormal: Math.round(totalNetNormal * 100) / 100,
		totalNetActual: Math.round(totalNetActual * 100) / 100,
		totalNetDifference: Math.round((totalNetActual - totalNetNormal) * 100) / 100,
		taxYear,
	};
}
