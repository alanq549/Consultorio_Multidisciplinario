export function formatMinutesToHM(minutes: number): string {
  if (minutes <= 0) return "0 min";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  const hourPart = h > 0 ? `${h} hr${h !== 1 ? "s" : ""}` : "";
  const minutePart = m > 0 ? `${m} min` : "";

  // Espacios para que no se vea feo al juntar las cadenas
  return [hourPart, minutePart].filter(Boolean).join(" ");
}
