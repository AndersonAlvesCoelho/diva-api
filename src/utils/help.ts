//  calcula tempo de voo
export function calcFlightTime(
  start: string,
  end: string,
): { hhmm: string; decimal: string } {
  if (!start || !end) return { hhmm: "--:--", decimal: "0,00" };
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return {
    hhmm: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    decimal: (diff / 60).toFixed(2).replace(".", ","),
  };
}

// Parse de data dd/mm/yyyy → Date
export function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
}

export const normalizeCnuc = (codes: string[]): string =>
  codes.map((v) => (v.startsWith("na_") ? "n/a" : v)).join("; ");
