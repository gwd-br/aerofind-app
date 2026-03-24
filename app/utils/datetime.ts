// ~/utils/datetime.ts
/**
 * Converte ISO (UTC/Z ou com timezone) para o formato aceito por <input type="datetime-local">
 * Ex.: '2025-03-10T23:59:00.000Z' -> '2025-03-10T20:59' (ajustado ao local, depende do fuso do cliente)
 */
export function toDatetimeLocal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const tzOffsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

/**
 * Converte o valor do <input type="datetime-local"> (sem timezone) para ISO (UTC)
 * Ex.: '2025-03-10T20:59' -> '2025-03-10T23:59:00.000Z' (depende do fuso do cliente)
 */
export function fromDatetimeLocal(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
