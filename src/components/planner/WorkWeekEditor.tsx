import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkWeekPattern } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["ma", "di", "wo", "do", "vr"];

interface WorkWeekEditorProps {
	workWeek: WorkWeekPattern;
	onChange: (workWeek: WorkWeekPattern) => void;
}

export function WorkWeekEditor({ workWeek, onChange }: WorkWeekEditorProps) {
	const isSamePattern = workWeek.evenWeek.every(
		(v, i) => v === workWeek.unevenWeek[i],
	);
	const [showAlternating, setShowAlternating] = useState(!isSamePattern);

	const toggleDay = (
		week: "evenWeek" | "unevenWeek",
		dayIndex: number,
	) => {
		const updated = { ...workWeek };
		const newArr = [...updated[week]];
		newArr[dayIndex] = !newArr[dayIndex];
		updated[week] = newArr;

		// If not in alternating mode, keep both weeks in sync
		if (!showAlternating) {
			updated.evenWeek = newArr;
			updated.unevenWeek = [...newArr];
		}

		onChange(updated);
	};

	const handleToggleAlternating = () => {
		if (showAlternating) {
			// Collapsing: sync uneven to even
			onChange({
				...workWeek,
				unevenWeek: [...workWeek.evenWeek],
			});
		}
		setShowAlternating(!showAlternating);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-slate-700">
					Werkweek
				</h3>
				<button
					type="button"
					onClick={handleToggleAlternating}
					className={cn(
						"text-xs px-2 py-0.5 rounded-full border transition-colors",
						showAlternating
							? "bg-slate-100 border-slate-300 text-slate-700"
							: "border-slate-200 text-slate-400 hover:text-slate-600",
					)}
				>
					Wisselend rooster
				</button>
			</div>

			<div className="space-y-2">
				<Label className="text-xs text-slate-500">
					Uren per week
				</Label>
				<Input
					type="number"
					value={workWeek.hoursPerWeek}
					onChange={(e) =>
						onChange({
							...workWeek,
							hoursPerWeek: Number(e.target.value) || 0,
						})
					}
					min={0}
					max={40}
					step={1}
					className="h-8 text-sm"
				/>
			</div>

			<div className="space-y-2">
				{/* Day header row */}
				<div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1">
					<div />
					{DAY_LABELS.map((day) => (
						<div
							key={day}
							className="text-center text-xs font-medium text-slate-400 uppercase"
						>
							{day}
						</div>
					))}
				</div>

				{/* Even week row (or single row when not alternating) */}
				<div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 items-center">
					<span className="text-xs text-slate-500">
						{showAlternating ? "Even wk" : "Werkdagen"}
					</span>
					{workWeek.evenWeek.map((active, i) => (
						<button
							key={i}
							type="button"
							onClick={() => toggleDay("evenWeek", i)}
							className={cn(
								"h-7 rounded text-xs font-medium transition-colors",
								active
									? "bg-slate-700 text-white"
									: "bg-slate-100 text-slate-400 hover:bg-slate-200",
							)}
						>
							{DAY_LABELS[i]}
						</button>
					))}
				</div>

				{/* Uneven week row */}
				{showAlternating && (
					<div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 items-center">
						<span className="text-xs text-slate-500">
							Oneven wk
						</span>
						{workWeek.unevenWeek.map((active, i) => (
							<button
								key={i}
								type="button"
								onClick={() => toggleDay("unevenWeek", i)}
								className={cn(
									"h-7 rounded text-xs font-medium transition-colors",
									active
										? "bg-slate-700 text-white"
										: "bg-slate-100 text-slate-400 hover:bg-slate-200",
								)}
							>
								{DAY_LABELS[i]}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
