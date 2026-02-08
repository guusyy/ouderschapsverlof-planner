import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { FinancialSummary as FinancialSummaryType } from "@/lib/leave-calculations";
import type { NetFinancialSummary } from "@/lib/tax-calculations";
import { LEAVE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FinancialSummaryProps {
	summary: FinancialSummaryType;
	netSummary: NetFinancialSummary | null;
	showNetto: boolean;
	onShowNettoChange: (value: boolean) => void;
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
	showNetto,
	onShowNettoChange,
}: FinancialSummaryProps) {
	if (summary.perType.length === 0 && summary.monthly.length === 0) {
		return null;
	}

	const isNetto = showNetto && netSummary !== null;

	return (
		<div className="space-y-6">
			{/* Per leave type */}
			{summary.perType.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">
								Overzicht per verloftype
							</CardTitle>
							<div className="flex items-center gap-2">
								<Label
									htmlFor="netto-toggle-type"
									className="text-xs text-slate-500 font-normal"
								>
									Netto
								</Label>
								<Switch
									id="netto-toggle-type"
									size="sm"
									checked={showNetto}
									onCheckedChange={onShowNettoChange}
								/>
							</div>
						</div>
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
										{!isNetto && (
											<th className="pb-2 pr-4 font-medium text-right">
												Daginkomen
											</th>
										)}
										<th className="pb-2 pr-4 font-medium text-right">
											Totaal
										</th>
										{!isNetto && (
											<th className="pb-2 font-medium">
												Betaald door
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
																LEAVE_COLORS[
																	row.type
																].dot,
															)}
														/>
														<span className="text-slate-700">
															{row.label}
														</span>
													</div>
												</td>
												<td className="py-2 pr-4 text-right text-slate-700">
													{row.days}
												</td>
												{!isNetto && (
													<td className="py-2 pr-4 text-right text-slate-700">
														{formatCurrency(
															row.dailyIncome,
														)}
													</td>
												)}
												<td className="py-2 pr-4 text-right font-medium text-slate-800">
													{formatCurrency(
														isNetto && netRow
															? netRow.netTotalIncome
															: row.totalIncome,
													)}
												</td>
												{!isNetto && (
													<td className="py-2 text-slate-500">
														{row.paidBy}
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
						<div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
							<span className="text-slate-500">
								Totaal verschil t.o.v. normaal salaris
							</span>
							<span
								className={cn(
									"font-semibold",
									(isNetto
										? netSummary!.totalNetDifference
										: summary.totalDifference) < 0
										? "text-red-600"
										: "text-green-600",
								)}
							>
								{formatCurrency(
									isNetto
										? netSummary!.totalNetDifference
										: summary.totalDifference,
								)}
							</span>
						</div>
						{isNetto && (
							<p className="mt-2 text-xs text-slate-400">
								Indicatie op basis van belastingtarieven{" "}
								{netSummary!.taxYear}. Werkelijke bedragen
								kunnen afwijken door aftrekposten, toeslagen,
								partnersituatie of andere inkomsten.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Monthly overview */}
			{summary.monthly.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base">
								Maandoverzicht
							</CardTitle>
							<div className="flex items-center gap-2">
								<Label
									htmlFor="netto-toggle-month"
									className="text-xs text-slate-500 font-normal"
								>
									Netto
								</Label>
								<Switch
									id="netto-toggle-month"
									size="sm"
									checked={showNetto}
									onCheckedChange={onShowNettoChange}
								/>
							</div>
						</div>
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
										<th className="pb-2 font-medium text-right">
											Verschil
										</th>
									</tr>
								</thead>
								<tbody>
									{summary.monthly.map((row, i) => {
										const netRow = netSummary?.monthly[i];
										const normalVal = isNetto && netRow ? netRow.netNormalIncome : row.normalIncome;
										const actualVal = isNetto && netRow ? netRow.netActualIncome : row.actualIncome;
										const diffVal = isNetto && netRow ? netRow.netDifference : row.difference;
										return (
											<tr
												key={`${row.month}-${row.year}`}
												className="border-b last:border-0"
											>
												<td className="py-2 pr-4 capitalize text-slate-700">
													{row.month} {row.year}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700">
													{formatCurrency(normalVal)}
												</td>
												<td className="py-2 pr-4 text-right text-slate-700">
													{formatCurrency(actualVal)}
												</td>
												<td
													className={cn(
														"py-2 text-right font-medium",
														diffVal < 0
															? "text-red-600"
															: diffVal > 0
																? "text-green-600"
																: "text-slate-500",
													)}
												>
													{formatCurrency(diffVal)}
												</td>
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
											{formatCurrency(
												isNetto
													? netSummary!.totalNetNormal
													: summary.totalNormal,
											)}
										</td>
										<td className="pt-3 pr-4 text-right text-slate-700">
											{formatCurrency(
												isNetto
													? netSummary!.totalNetActual
													: summary.totalActual,
											)}
										</td>
										<td
											className={cn(
												"pt-3 text-right",
												(isNetto
													? netSummary!.totalNetDifference
													: summary.totalDifference) < 0
													? "text-red-600"
													: "text-green-600",
											)}
										>
											{formatCurrency(
												isNetto
													? netSummary!.totalNetDifference
													: summary.totalDifference,
											)}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
						{isNetto && (
							<p className="mt-3 text-xs text-slate-400">
								Indicatie op basis van belastingtarieven{" "}
								{netSummary!.taxYear}. Werkelijke bedragen
								kunnen afwijken door aftrekposten, toeslagen,
								partnersituatie of andere inkomsten.
							</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
