import ms from "ms";

export function parseTime(input?: string): number | undefined {
  if (!input) return;
  return ms(input);
}
