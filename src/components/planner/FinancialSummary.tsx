import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { FinancialSummary as FinancialSummaryType } from "@/lib/leave-calculations";
import type { NetFinancialSummary } from "@/lib/tax-calculations";
import { LEAVE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FinancialSummaryProps {
	summary: FinancialSummaryType;
	netSummary: NetFinancialSummary | null;
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("nl-NL", {
		style: "currency",
		currency: "EUR",
	}).format(amount);
}

export function FinancialSummary({
	summary,
	netSummary,
}: FinancialSummaryProps) {
	if (summary.perType.length === 0 && summary.monthly.length === 0) {
		return null;
	}

	const hasNetto = netSummary !== null;

	return (
		<div className="space-y-6">
			{/* Per leave type */}
			{summary.perType.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Overzicht per verloftype
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b text-left text-slate-500">
										<th className="pb-2 pr-4 font-medium">
											Type
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											Dagen
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											Normaal
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											Werkelijk
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											{hasNetto ? "Bruto verschil" : "Verschil"}
										</th>
										{hasNetto && (
											<th className="pb-2 font-medium text-right">
												Netto verschil
											</th>
										)}
									</tr>
								</thead>
								<tbody>
									{summary.perType.map((row, i) => {
										const netRow = netSummary?.perType[i];
										return (
											<tr
												key={row.type}
												className="border-b last:border-0"
											>
												<td className="py-2 pr-4">
													<div className="flex items-center gap-2">
														<div
															className={cn(
																"h-2.5 w-2.5 rounded-sm",
																LEAVE_COLORS[row.type].dot,
															)}
														/>
														<span className="text-slate-700">
															{row.label}
														</span>
													</div>
													<span className="text-xs text-slate-400 ml-5">
														{row.paidBy} &middot;{" "}
														{formatCurrency(row.dailyIncome)}/dag
													</span>
												</td>
												<td className="py-2 pr-4 text-right text-slate-700 align-top">
													{row.days}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700 align-top">
													{formatCurrency(row.normalIncome)}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700 align-top">
													{formatCurrency(row.totalIncome)}
												</td>
												<td
													className={cn(
														"py-2 pr-4 text-right align-top",
														hasNetto
															? row.difference < 0
																? "text-red-400"
																: row.difference > 0
																	? "text-green-400"
																	: "text-slate-400"
															: "font-medium",
														!hasNetto &&
															(row.difference < 0
																? "text-red-600"
																: row.difference > 0
																	? "text-green-600"
																	: "text-slate-500"),
													)}
												>
													{formatCurrency(row.difference)}
												</td>
												{hasNetto && netRow && (
													<td
														className={cn(
															"py-2 text-right font-medium align-top",
															netRow.netDifference < 0
																? "text-red-600"
																: netRow.netDifference > 0
																	? "text-green-600"
																	: "text-slate-500",
														)}
													>
														{formatCurrency(netRow.netDifference)}
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
								<tfoot>
									<tr className="border-t font-medium">
										<td className="pt-3 pr-4 text-slate-700">
											Totaal
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{summary.perType.reduce((sum, r) => sum + r.days, 0)}
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{formatCurrency(
												summary.perType.reduce((sum, r) => sum + r.normalIncome, 0),
											)}
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{formatCurrency(
												summary.perType.reduce((sum, r) => sum + r.totalIncome, 0),
											)}
										</td>
										<td
											className={cn(
												"pt-3 pr-4 text-right",
												hasNetto
													? summary.totalDifference < 0
														? "text-red-400"
														: "text-green-400"
													: summary.totalDifference < 0
														? "text-red-600"
														: "text-green-600",
											)}
										>
											{formatCurrency(summary.totalDifference)}
										</td>
										{hasNetto && (
											<td
												className={cn(
													"pt-3 text-right",
													netSummary.totalNetDifference < 0
														? "text-red-600"
														: "text-green-600",
												)}
											>
												{formatCurrency(netSummary.totalNetDifference)}
											</td>
										)}
									</tr>
								</tfoot>
							</table>
						</div>
						{hasNetto && (
							<p className="mt-3 text-xs text-slate-400">
								Het nettoverschil is kleiner doordat je minder
								belasting betaalt bij een lager inkomen. Indicatie
								o.b.v. tarieven {netSummary.taxYear}.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Monthly overview */}
			{summary.monthly.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Maandoverzicht
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b text-left text-slate-500">
										<th className="pb-2 pr-4 font-medium">
											Maand
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											Normaal
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											Werkelijk
										</th>
										<th className="pb-2 pr-4 font-medium text-right">
											{hasNetto ? "Bruto verschil" : "Verschil"}
										</th>
										{hasNetto && (
											<th className="pb-2 font-medium text-right">
												Netto verschil
											</th>
										)}
									</tr>
								</thead>
								<tbody>
									{summary.monthly.map((row, i) => {
										const netRow = netSummary?.monthly[i];
										return (
											<tr
												key={`${row.month}-${row.year}`}
												className="border-b last:border-0"
											>
												<td className="py-2 pr-4 capitalize text-slate-700">
													{row.month} {row.year}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700">
													{formatCurrency(row.normalIncome)}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700">
													{formatCurrency(row.actualIncome)}
												</td>
												<td
													className={cn(
														"py-2 pr-4 text-right",
														hasNetto
															? "text-slate-500"
															: "font-medium",
														!hasNetto &&
															(row.difference < 0
																? "text-red-600"
																: row.difference > 0
																	? "text-green-600"
																	: "text-slate-500"),
														hasNetto &&
															(row.difference < 0
																? "text-red-400"
																: row.difference > 0
																	? "text-green-400"
																	: "text-slate-400"),
													)}
												>
													{formatCurrency(row.difference)}
												</td>
												{hasNetto && netRow && (
													<td
														className={cn(
															"py-2 text-right font-medium",
															netRow.netDifference < 0
																? "text-red-600"
																: netRow.netDifference > 0
																	? "text-green-600"
																	: "text-slate-500",
														)}
													>
														{formatCurrency(netRow.netDifference)}
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
								<tfoot>
									<tr className="border-t font-medium">
										<td className="pt-3 pr-4 text-slate-700">
											Totaal
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{formatCurrency(summary.totalNormal)}
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{formatCurrency(summary.totalActual)}
										</td>
										<td
											className={cn(
												"pt-3 pr-4 text-right",
												hasNetto
													? "text-slate-500"
													: summary.totalDifference < 0
														? "text-red-600"
														: "text-green-600",
												hasNetto &&
													(summary.totalDifference < 0
														? "text-red-400"
														: "text-green-400"),
											)}
										>
											{formatCurrency(summary.totalDifference)}
										</td>
										{hasNetto && (
											<td
												className={cn(
													"pt-3 text-right",
													netSummary.totalNetDifference < 0
														? "text-red-600"
														: "text-green-600",
												)}
											>
												{formatCurrency(
													netSummary.totalNetDifference,
												)}
											</td>
										)}
									</tr>
								</tfoot>
							</table>
						</div>
						{hasNetto && (
							<p className="mt-3 text-xs text-slate-400">
								Het nettoverschil is kleiner doordat je minder
								belasting betaalt bij een lager inkomen. Indicatie
								o.b.v. tarieven {netSummary.taxYear}.
							</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
