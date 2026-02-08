import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAVE_RULES, LEAVE_TYPES, type LeaveType } from "@/lib/constants";
import type { CustomMaxWeeks } from "@/lib/url-state";

interface BudgetEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customMaxWeeks: CustomMaxWeeks;
	onCustomMaxWeeksChange: (value: CustomMaxWeeks) => void;
	vakantiedagenBudget: number;
	onVakantiedagenBudgetChange: (budget: number) => void;
}

const EDITABLE_LEAVE_TYPES = LEAVE_TYPES.filter(
	(t) => t !== "vakantiedagen" && t !== "onbetaaldOuderschapsverlof",
) as LeaveType[];

export function BudgetEditDialog({
	open,
	onOpenChange,
	customMaxWeeks,
	onCustomMaxWeeksChange,
	vakantiedagenBudget,
	onVakantiedagenBudgetChange,
}: BudgetEditDialogProps) {
	const [localOverrides, setLocalOverrides] = useState<CustomMaxWeeks>({});
	const [localVakantiedagen, setLocalVakantiedagen] = useState(0);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			// Initialize local state from current values
			setLocalOverrides({ ...customMaxWeeks });
			setLocalVakantiedagen(vakantiedagenBudget);
		}
		onOpenChange(nextOpen);
	};

	const getEffectiveValue = (type: LeaveType): number => {
		return localOverrides[type] ?? LEAVE_RULES[type].maxWeeks;
	};

	const handleWeeksChange = (type: LeaveType, value: string) => {
		const num = Number(value);
		if (Number.isNaN(num) || num < 0) return;

		if (num === LEAVE_RULES[type].maxWeeks) {
			// If set back to default, remove override
			const next = { ...localOverrides };
			delete next[type];
			setLocalOverrides(next);
		} else {
			setLocalOverrides({ ...localOverrides, [type]: num });
		}
	};

	const handleReset = () => {
		setLocalOverrides({});
		setLocalVakantiedagen(20);
	};

	const handleSave = () => {
		onCustomMaxWeeksChange(localOverrides);
		onVakantiedagenBudgetChange(localVakantiedagen);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Verlofbudget aanpassen</DialogTitle>
					<DialogDescription>
						Pas de maximale verlofweken aan als je werkgever meer biedt dan de wettelijke standaard.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{EDITABLE_LEAVE_TYPES.map((type) => {
						const rule = LEAVE_RULES[type];
						const value = getEffectiveValue(type);
						const isCustom = localOverrides[type] !== undefined;

						return (
							<div key={type} className="space-y-1">
								<Label className="text-sm text-slate-700">
									{rule.label}
									<span className="text-xs text-slate-400 ml-1">
										(standaard: {rule.maxWeeks} {rule.maxWeeks === 1 ? "week" : "weken"})
									</span>
								</Label>
								<div className="flex items-center gap-2">
									<Input
										type="number"
										value={value}
										onChange={(e) => handleWeeksChange(type, e.target.value)}
										min={0}
										max={52}
										step={1}
										className={`h-8 text-sm w-24 ${isCustom ? "border-blue-400" : ""}`}
									/>
									<span className="text-xs text-slate-500">weken</span>
								</div>
							</div>
						);
					})}

					<div className="space-y-1">
						<Label className="text-sm text-slate-700">
							Vakantiedagen
							<span className="text-xs text-slate-400 ml-1">
								(standaard: 20 dagen)
							</span>
						</Label>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								value={localVakantiedagen}
								onChange={(e) =>
									setLocalVakantiedagen(
										Math.max(0, Number(e.target.value) || 0),
									)
								}
								min={0}
								max={50}
								step={1}
								className={`h-8 text-sm w-24 ${localVakantiedagen !== 20 ? "border-blue-400" : ""}`}
							/>
							<span className="text-xs text-slate-500">dagen per jaar</span>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleReset}
						className="mr-auto text-slate-500"
					>
						Reset naar standaard
					</Button>
					<Button size="sm" onClick={handleSave}>
						Opslaan
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
