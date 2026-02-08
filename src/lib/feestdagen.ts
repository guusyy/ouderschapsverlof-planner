/**
 * Dutch national holidays 2025-2030 (weekday occurrences only).
 *
 * Included holidays:
 * - Nieuwjaarsdag (1 jan)
 * - Goede Vrijdag (variable)
 * - 2e Paasdag (variable, Monday)
 * - Koningsdag (27 apr, moved to 26 apr if Sunday)
 * - Bevrijdingsdag (5 mei, once every 5 years national holiday — included every year here as most employers grant it)
 * - Hemelvaartsdag (variable, Thursday)
 * - 2e Pinksterdag (variable, Monday)
 * - 1e Kerstdag (25 dec)
 * - 2e Kerstdag (26 dec)
 *
 * Weekend occurrences are excluded since they don't affect work days.
 */

export const FEESTDAGEN: Map<string, string> = new Map([
	// 2025
	["2025-01-01", "Nieuwjaarsdag"],
	["2025-04-18", "Goede Vrijdag"],
	["2025-04-21", "2e Paasdag"],
	// Koningsdag 27 apr 2025 = Sunday → observed Saturday, skip (weekend)
	["2025-05-05", "Bevrijdingsdag"],
	["2025-05-29", "Hemelvaartsdag"],
	["2025-06-09", "2e Pinksterdag"],
	["2025-12-25", "1e Kerstdag"],
	["2025-12-26", "2e Kerstdag"],

	// 2026
	["2026-01-01", "Nieuwjaarsdag"],
	["2026-04-03", "Goede Vrijdag"],
	["2026-04-06", "2e Paasdag"],
	["2026-04-27", "Koningsdag"],
	["2026-05-05", "Bevrijdingsdag"],
	["2026-05-14", "Hemelvaartsdag"],
	["2026-05-25", "2e Pinksterdag"],
	["2026-12-25", "1e Kerstdag"],
	// 2e Kerstdag 26 dec 2026 = Saturday → skip

	// 2027
	["2027-01-01", "Nieuwjaarsdag"],
	["2027-03-26", "Goede Vrijdag"],
	["2027-03-29", "2e Paasdag"],
	["2027-04-27", "Koningsdag"],
	["2027-05-05", "Bevrijdingsdag"],
	["2027-05-06", "Hemelvaartsdag"],
	["2027-05-17", "2e Pinksterdag"],
	// 1e Kerstdag 25 dec 2027 = Saturday → skip
	// 2e Kerstdag 26 dec 2027 = Sunday → skip

	// 2028
	// Nieuwjaarsdag 1 jan 2028 = Saturday → skip
	["2028-04-14", "Goede Vrijdag"],
	["2028-04-17", "2e Paasdag"],
	["2028-04-27", "Koningsdag"],
	["2028-05-25", "Hemelvaartsdag"],
	["2028-06-05", "2e Pinksterdag"],
	["2028-12-25", "1e Kerstdag"],
	["2028-12-26", "2e Kerstdag"],

	// 2029
	["2029-01-01", "Nieuwjaarsdag"],
	["2029-03-30", "Goede Vrijdag"],
	["2029-04-02", "2e Paasdag"],
	["2029-04-27", "Koningsdag"],
	["2029-05-10", "Hemelvaartsdag"],
	["2029-05-21", "2e Pinksterdag"],
	["2029-12-25", "1e Kerstdag"],
	["2029-12-26", "2e Kerstdag"],

	// 2030
	["2030-01-01", "Nieuwjaarsdag"],
	["2030-04-19", "Goede Vrijdag"],
	["2030-04-22", "2e Paasdag"],
	// Koningsdag 27 apr 2030 = Saturday → skip
	// Bevrijdingsdag 5 mei 2030 = Sunday → skip
	["2030-05-30", "Hemelvaartsdag"],
	["2030-06-10", "2e Pinksterdag"],
	["2030-12-25", "1e Kerstdag"],
	["2030-12-26", "2e Kerstdag"],
]);

export function isFeestdag(date: Date): string | null {
	const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	return FEESTDAGEN.get(key) ?? null;
}
